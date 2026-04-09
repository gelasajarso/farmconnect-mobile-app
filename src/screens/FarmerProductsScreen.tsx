import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import { useFarmerProducts } from '../hooks/useProducts';
import { getOrders } from '../services/order.service';
import { extractApiError } from '../utils/errorHandling';
import {
  CATEGORY_LABELS,
  PRODUCT_STATUS_LABELS,
} from '../utils/enumLabels';
import LoadingIndicator from '../components/LoadingIndicator';
import ErrorView from '../components/ErrorView';
import EmptyState from '../components/EmptyState';
import type { FarmerStackParamList } from '../navigation/types';
import type { ProductPublicDTO } from '../types';

type FarmerNavProp = StackNavigationProp<FarmerStackParamList, 'FarmerProductsList'>;

export default function FarmerProductsScreen() {
  const navigation = useNavigation<FarmerNavProp>();
  const { user, resolveSystemUserId } = useAuth();
  const [resolving, setResolving] = useState(false);
  const [resolveError, setResolveError] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  // Attempt to resolve system_user_id via orders if not yet available
  useEffect(() => {
    if (user?.system_user_id) return;

    async function resolve() {
      setResolving(true);
      setResolveError('');
      try {
        const orders = await getOrders();
        const match = orders.find((o) => o.farmer_id);
        if (match?.farmer_id) {
          await resolveSystemUserId(match.farmer_id);
        }
      } catch (err) {
        setResolveError(extractApiError(err).message);
      } finally {
        setResolving(false);
      }
    }
    resolve();
  }, [user?.system_user_id, resolveSystemUserId, retryCount]);

  const farmerId = user?.system_user_id ?? null;
  const { products, loading, error, refetch } = useFarmerProducts(farmerId);

  if (resolving || (loading && !farmerId)) return <LoadingIndicator />;

  if (resolveError) {
    return (
      <ErrorView
        message={resolveError}
        onRetry={() => setRetryCount((c) => c + 1)}
      />
    );
  }

  if (error) return <ErrorView message={error} onRetry={refetch} />;

  return (
    <SafeAreaView style={styles.flex}>
      <View style={styles.header}>
        <Text style={styles.title}>My Products</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('AddProduct')}
        >
          <Text style={styles.addBtnText}>+ Add Product</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <LoadingIndicator />
      ) : (
        <FlatList<ProductPublicDTO>
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.category}>{CATEGORY_LABELS[item.category]}</Text>
              <Text style={styles.price}>{item.currency} {item.base_price.toFixed(2)}</Text>
              <Text style={styles.qty}>Qty: {item.total_quantity}</Text>
              {item.status && (
                <Text style={styles.status}>{PRODUCT_STATUS_LABELS[item.status]}</Text>
              )}
            </View>
          )}
          initialNumToRender={10}
          windowSize={5}
          maxToRenderPerBatch={10}
          removeClippedSubviews={true}
          ListEmptyComponent={
            <EmptyState message="You have no products yet. Tap 'Add Product' to create one." />
          }
          contentContainerStyle={products.length === 0 ? styles.flex : undefined}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#F1F8E9' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#2E7D32',
  },
  title: { fontSize: 18, fontWeight: '700', color: '#fff' },
  addBtn: { backgroundColor: '#1B5E20', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  addBtnText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 14,
    marginVertical: 5,
    marginHorizontal: 16,
    elevation: 1,
  },
  name: { fontSize: 16, fontWeight: '700', color: '#1B5E20', marginBottom: 2 },
  category: { fontSize: 13, color: '#558B2F', marginBottom: 2 },
  price: { fontSize: 14, fontWeight: '600', color: '#2E7D32', marginBottom: 2 },
  qty: { fontSize: 13, color: '#616161', marginBottom: 2 },
  status: { fontSize: 12, color: '#F57F17' },
});
