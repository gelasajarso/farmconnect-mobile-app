import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, SafeAreaView, RefreshControl,
} from 'react-native';
import { getAllOrders } from '../services/admin.service';
import { extractApiError } from '../utils/errorHandling';
import { ORDER_STATUS_LABELS } from '../utils/enumLabels';
import LoadingIndicator from '../components/LoadingIndicator';
import ErrorView from '../components/ErrorView';
import EmptyState from '../components/EmptyState';
import type { OrderDTO, OrderStatus } from '../types';
import { useFocusEffect } from '@react-navigation/native';

const STATUS_COLORS: Partial<Record<OrderStatus, string>> = {
  CREATED: '#1565C0', PENDING_PAYMENT: '#E65100', FUNDED: '#6A1B9A',
  CONFIRMED: '#1A7A35', IN_DELIVERY: '#00838F', DELIVERED: '#1A7A35',
  COMPLETED: '#1A7A35', CANCELLED: '#B71C1C', EXPIRED: '#757575',
};

const FILTER_OPTIONS: { label: string; value: OrderStatus | 'ALL' }[] = [
  { label: 'All',       value: 'ALL' },
  { label: 'Active',    value: 'CONFIRMED' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Cancelled', value: 'CANCELLED' },
];

export default function AdminOrdersScreen() {
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<OrderStatus | 'ALL'>('ALL');

  const load = useCallback(async () => {
    setError('');
    try {
      const data = await getAllOrders();
      setOrders(data);
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

  const filtered = filter === 'ALL' ? orders : orders.filter(o => o.status === filter);
  const totalRevenue = orders
    .filter(o => ['COMPLETED', 'DELIVERED'].includes(o.status))
    .reduce((s, o) => s + o.total_price, 0);

  if (loading) return <LoadingIndicator />;
  if (error) return <ErrorView message={error} onRetry={load} />;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Revenue summary */}
      <View style={styles.summary}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{orders.length}</Text>
          <Text style={styles.summaryLabel}>Total</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>${totalRevenue.toFixed(0)}</Text>
          <Text style={styles.summaryLabel}>Revenue</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{orders.filter(o => o.status === 'CANCELLED').length}</Text>
          <Text style={styles.summaryLabel}>Cancelled</Text>
        </View>
      </View>

      {/* Filter chips */}
      <View style={styles.filterRow}>
        {FILTER_OPTIONS.map(f => (
          <TouchableOpacity
            key={f.value}
            style={[styles.chip, filter === f.value && styles.chipActive]}
            onPress={() => setFilter(f.value)}
          >
            <Text style={[styles.chipText, filter === f.value && styles.chipTextActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList<OrderDTO>
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <OrderCard order={item} />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1A7A35" />}
        ListEmptyComponent={<EmptyState message="No orders found." emoji="📦" />}
        contentContainerStyle={filtered.length === 0 ? styles.emptyFlex : styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

function OrderCard({ order }: { order: OrderDTO }) {
  const color = STATUS_COLORS[order.status] ?? '#757575';
  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.cardLeft}>
          <Text style={styles.orderId}>Order #{order.id.slice(-8).toUpperCase()}</Text>
          <Text style={styles.meta}>{new Date(order.created_at).toLocaleDateString()} · Qty {order.quantity}</Text>
          <Text style={styles.parties}>🌾 {order.farmer_id} → 🛒 {order.merchant_id}</Text>
        </View>
        <View style={styles.cardRight}>
          <Text style={styles.price}>${order.total_price.toFixed(2)}</Text>
          <View style={[styles.badge, { backgroundColor: color + '18' }]}>
            <Text style={[styles.badgeText, { color }]}>{ORDER_STATUS_LABELS[order.status]}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F7F9F7' },
  list: { paddingTop: 4, paddingBottom: 24 },
  emptyFlex: { flex: 1 },

  summary: {
    flexDirection: 'row', backgroundColor: '#1A7A35',
    paddingVertical: 16, paddingHorizontal: 20,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryValue: { fontSize: 20, fontWeight: '800', color: '#fff' },
  summaryLabel: { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 2, fontWeight: '600', textTransform: 'uppercase' },
  summaryDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.3)', marginHorizontal: 8 },

  filterRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E0E0E0' },
  chipActive: { backgroundColor: '#1A7A35', borderColor: '#1A7A35' },
  chipText: { fontSize: 13, color: '#666', fontWeight: '500' },
  chipTextActive: { color: '#fff', fontWeight: '700' },

  card: {
    backgroundColor: '#fff', borderRadius: 14,
    marginHorizontal: 16, marginVertical: 5,
    padding: 14, borderWidth: 1, borderColor: '#F0F0F0',
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 5, shadowOffset: { width: 0, height: 2 }, elevation: 1,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardLeft: { flex: 1, marginRight: 12 },
  orderId: { fontSize: 14, fontWeight: '700', color: '#0D1B0F' },
  meta: { fontSize: 12, color: '#9E9E9E', marginTop: 3 },
  parties: { fontSize: 11, color: '#6B8F71', marginTop: 3 },
  cardRight: { alignItems: 'flex-end' },
  price: { fontSize: 15, fontWeight: '800', color: '#1A7A35' },
  badge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, marginTop: 4 },
  badgeText: { fontSize: 11, fontWeight: '600' },
});
