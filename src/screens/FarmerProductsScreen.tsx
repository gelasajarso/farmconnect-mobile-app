import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, SafeAreaView, Platform, RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import { useFarmerProducts } from '../hooks/useProducts';
import { getOrders } from '../services/order.service';
import { extractApiError } from '../utils/errorHandling';
import { CATEGORY_LABELS, PRODUCT_STATUS_LABELS } from '../utils/enumLabels';
import LoadingIndicator from '../components/LoadingIndicator';
import ErrorView from '../components/ErrorView';
import EmptyState from '../components/EmptyState';
import type { FarmerStackParamList } from '../navigation/types';
import type { ProductPublicDTO, ProductStatus } from '../types';

type NavProp = StackNavigationProp<FarmerStackParamList, 'FarmerProductsList'>;

const STATUS_COLORS: Record<ProductStatus, { text: string; bg: string }> = {
  AVAILABLE:    { text: '#1A7A35', bg: '#F0FBF3' },
  LOW_STOCK:    { text: '#E65100', bg: '#FFF3E0' },
  SOLD_OUT:     { text: '#B71C1C', bg: '#FFEBEE' },
  EXPIRED:      { text: '#757575', bg: '#F5F5F5' },
  DISCONTINUED: { text: '#424242', bg: '#EEEEEE' },
};

const CATEGORY_EMOJI: Record<string, string> = {
  GRAINS: '🌾', VEGETABLES: '🥦', FRUITS: '🍎',
  DAIRY: '🥛', MEAT: '🥩', SPICES: '🌶️', OTHER: '📦',
};

export default function FarmerProductsScreen() {
  const navigation = useNavigation<NavProp>();
  const { user, resolveSystemUserId } = useAuth();
  const [resolving, setResolving] = useState(false);
  const [resolveError, setResolveError] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (user?.system_user_id) return;
    (async () => {
      setResolving(true);
      setResolveError('');
      try {
        const orders = await getOrders();
        const match = orders.find(o => o.farmer_id);
        if (match?.farmer_id) await resolveSystemUserId(match.farmer_id);
      } catch (err) {
        setResolveError(extractApiError(err).message);
      } finally {
        setResolving(false);
      }
    })();
  }, [user?.system_user_id, resolveSystemUserId, retryCount]);

  const farmerId = user?.system_user_id ?? null;
  const { products, loading, error, refetch } = useFarmerProducts(farmerId);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  if (resolving || (loading && !farmerId)) return <LoadingIndicator />;
  if (resolveError) return <ErrorView message={resolveError} onRetry={() => setRetryCount(c => c + 1)} />;
  if (error) return <ErrorView message={error} onRetry={refetch} />;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Products</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('AddProduct')} activeOpacity={0.8}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* Count */}
      {products.length > 0 && (
        <Text style={styles.count}>{products.length} listing{products.length !== 1 ? 's' : ''}</Text>
      )}

      <FlatList<ProductPublicDTO>
        data={products}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <ProductItem item={item} />}
        initialNumToRender={10}
        windowSize={5}
        maxToRenderPerBatch={10}
        removeClippedSubviews
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1A7A35" />}
        ListEmptyComponent={<EmptyState message="No products yet. Tap '+ Add' to create one." emoji="🌾" />}
        contentContainerStyle={products.length === 0 ? styles.emptyFlex : styles.listPad}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

function ProductItem({ item }: { item: ProductPublicDTO }) {
  const sc = item.status ? STATUS_COLORS[item.status] : STATUS_COLORS.AVAILABLE;
  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.iconWrap}>
          <Text style={styles.icon}>{CATEGORY_EMOJI[item.category] ?? '📦'}</Text>
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.category}>{CATEGORY_LABELS[item.category]}</Text>
        </View>
        <View style={styles.cardRight}>
          <Text style={styles.price}>{item.currency} {item.base_price.toFixed(2)}</Text>
          <Text style={styles.qty}>Qty: {item.total_quantity}</Text>
        </View>
      </View>
      {item.status && (
        <View style={styles.cardFooter}>
          <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
            <Text style={[styles.statusText, { color: sc.text }]}>{PRODUCT_STATUS_LABELS[item.status]}</Text>
          </View>
          {item.harvest_date && <Text style={styles.date}>Harvested: {item.harvest_date}</Text>}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F7F9F7' },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#1A7A35',
    paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? 16 : 12, paddingBottom: 16,
  },
  title: { fontSize: 18, fontWeight: '800', color: '#fff', letterSpacing: -0.3 },
  addBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 7,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)',
  },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },

  count: {
    fontSize: 12, color: '#9E9E9E', fontWeight: '600',
    marginHorizontal: 20, marginTop: 14, marginBottom: 4,
    textTransform: 'uppercase', letterSpacing: 0.5,
  },

  listPad: { paddingTop: 8, paddingBottom: 24 },
  emptyFlex: { flex: 1 },

  card: {
    backgroundColor: '#fff', borderRadius: 14,
    marginHorizontal: 16, marginVertical: 5,
    padding: 14, borderWidth: 1, borderColor: '#F0F0F0',
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 5, shadowOffset: { width: 0, height: 2 }, elevation: 1,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center' },
  iconWrap: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: '#F0FBF3', justifyContent: 'center',
    alignItems: 'center', marginRight: 12,
  },
  icon: { fontSize: 22 },
  cardBody: { flex: 1 },
  name: { fontSize: 15, fontWeight: '700', color: '#0D1B0F', marginBottom: 2 },
  category: { fontSize: 12, color: '#6B8F71', fontWeight: '500' },
  cardRight: { alignItems: 'flex-end' },
  price: { fontSize: 15, fontWeight: '800', color: '#1A7A35' },
  qty: { fontSize: 12, color: '#9E9E9E', marginTop: 2 },
  cardFooter: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F5F5F5',
  },
  statusBadge: { borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 12, fontWeight: '700' },
  date: { fontSize: 11, color: '#9E9E9E' },
});
