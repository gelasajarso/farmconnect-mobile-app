import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TextInput,
  StyleSheet, SafeAreaView, RefreshControl,
} from 'react-native';
import { getAllProducts } from '../services/admin.service';
import { extractApiError } from '../utils/errorHandling';
import { CATEGORY_LABELS, PRODUCT_STATUS_LABELS } from '../utils/enumLabels';
import LoadingIndicator from '../components/LoadingIndicator';
import ErrorView from '../components/ErrorView';
import EmptyState from '../components/EmptyState';
import type { ProductPublicDTO, ProductStatus } from '../types';
import { useFocusEffect } from '@react-navigation/native';

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

export default function AdminProductsScreen() {
  const [products, setProducts] = useState<ProductPublicDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      const data = await getAllProducts();
      setProducts(data);
    } catch (err) {
      setError(extractApiError(err).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const filtered = query.trim()
    ? products.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.farmer_id.toLowerCase().includes(query.toLowerCase())
      )
    : products;

  if (loading) return <LoadingIndicator />;
  if (error) return <ErrorView message={error} onRetry={load} />;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.searchWrap}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder="Search by name or farmer ID…"
          placeholderTextColor="#9E9E9E"
          clearButtonMode="while-editing"
        />
      </View>
      <Text style={styles.count}>{filtered.length} product{filtered.length !== 1 ? 's' : ''}</Text>

      <FlatList<ProductPublicDTO>
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <ProductCard item={item} />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1A7A35" />}
        ListEmptyComponent={<EmptyState message="No products found." emoji="🌾" />}
        contentContainerStyle={filtered.length === 0 ? styles.emptyFlex : styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

function ProductCard({ item }: { item: ProductPublicDTO }) {
  const sc = item.status ? STATUS_COLORS[item.status] : STATUS_COLORS.AVAILABLE;
  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.iconWrap}>
          <Text style={styles.icon}>{CATEGORY_EMOJI[item.category] ?? '📦'}</Text>
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.meta}>{CATEGORY_LABELS[item.category]} · {item.farmer_id}</Text>
        </View>
        <View style={styles.cardRight}>
          <Text style={styles.price}>{item.currency} {item.base_price.toFixed(2)}</Text>
          <Text style={styles.qty}>Qty: {item.total_quantity}</Text>
        </View>
      </View>
      {item.status && (
        <View style={styles.footer}>
          <View style={[styles.badge, { backgroundColor: sc.bg }]}>
            <Text style={[styles.badgeText, { color: sc.text }]}>{PRODUCT_STATUS_LABELS[item.status]}</Text>
          </View>
          <Text style={styles.footerMeta}>
            {item.is_active ? '✅ Active' : '⛔ Inactive'}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F7F9F7' },
  list: { paddingTop: 4, paddingBottom: 24 },
  emptyFlex: { flex: 1 },

  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 12,
    marginHorizontal: 16, marginTop: 12, marginBottom: 4,
    paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1.5, borderColor: '#E8F5E9',
  },
  searchIcon: { fontSize: 15, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15, color: '#0D1B0F' },

  count: {
    fontSize: 12, color: '#9E9E9E', fontWeight: '600',
    marginHorizontal: 20, marginBottom: 4,
    textTransform: 'uppercase', letterSpacing: 0.5,
  },

  card: {
    backgroundColor: '#fff', borderRadius: 14,
    marginHorizontal: 16, marginVertical: 5,
    padding: 14, borderWidth: 1, borderColor: '#F0F0F0',
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 5, shadowOffset: { width: 0, height: 2 }, elevation: 1,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center' },
  iconWrap: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#F0FBF3', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  icon: { fontSize: 22 },
  cardBody: { flex: 1 },
  name: { fontSize: 15, fontWeight: '700', color: '#0D1B0F', marginBottom: 2 },
  meta: { fontSize: 12, color: '#9E9E9E' },
  cardRight: { alignItems: 'flex-end' },
  price: { fontSize: 14, fontWeight: '800', color: '#1A7A35' },
  qty: { fontSize: 12, color: '#9E9E9E', marginTop: 2 },
  footer: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F5F5F5',
  },
  badge: { borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  footerMeta: { fontSize: 12, color: '#9E9E9E' },
});
