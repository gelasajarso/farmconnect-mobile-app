import React, { useState, useMemo } from 'react';
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
import { useOrders } from '../hooks/useOrders';
import { ORDER_STATUS_LABELS } from '../utils/enumLabels';
import LoadingIndicator from '../components/LoadingIndicator';
import ErrorView from '../components/ErrorView';
import EmptyState from '../components/EmptyState';
import type { MerchantStackParamList } from '../navigation/types';
import type { OrderDTO, OrderStatus } from '../types';

type NavProp = StackNavigationProp<MerchantStackParamList, 'TransactionHistory'>;

const STATUS_COLORS: Partial<Record<OrderStatus, string>> = {
  COMPLETED: '#2E7D32',
  DELIVERED: '#558B2F',
  CANCELLED: '#B71C1C',
  EXPIRED: '#757575',
  IN_DELIVERY: '#00838F',
  CONFIRMED: '#1565C0',
  FUNDED: '#6A1B9A',
  PENDING_PAYMENT: '#F57F17',
  CREATED: '#424242',
};

const FILTERS: { label: string; value: OrderStatus | 'ALL' }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Active', value: 'CONFIRMED' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Cancelled', value: 'CANCELLED' },
];

export default function TransactionHistoryScreen() {
  const navigation = useNavigation<NavProp>();
  const { orders, loading, error, refetch } = useOrders();
  const [filter, setFilter] = useState<OrderStatus | 'ALL'>('ALL');

  const filtered = useMemo(() => {
    if (filter === 'ALL') return orders;
    return orders.filter((o) => o.status === filter);
  }, [orders, filter]);

  const totalSpent = useMemo(
    () => orders.filter((o) => ['COMPLETED', 'DELIVERED'].includes(o.status)).reduce((s, o) => s + o.total_price, 0),
    [orders]
  );

  if (loading) return <LoadingIndicator />;
  if (error) return <ErrorView message={error} onRetry={refetch} />;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Summary */}
      <View style={styles.summary}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{orders.length}</Text>
          <Text style={styles.summaryLabel}>Total Orders</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>${totalSpent.toFixed(2)}</Text>
          <Text style={styles.summaryLabel}>Total Spent</Text>
        </View>
      </View>

      {/* Filter Chips */}
      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.value}
            style={[styles.chip, filter === f.value && styles.chipActive]}
            onPress={() => setFilter(f.value)}
          >
            <Text style={[styles.chipText, filter === f.value && styles.chipTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TransactionRow
            item={item}
            onPress={() => navigation.navigate('TransactionDetail', { orderId: item.id })}
          />
        )}
        ListEmptyComponent={<EmptyState message="No transactions found." />}
        contentContainerStyle={filtered.length === 0 ? styles.emptyFlex : styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

function TransactionRow({ item, onPress }: { item: OrderDTO; onPress: () => void }) {
  const color = STATUS_COLORS[item.status] ?? '#757575';
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.75}>
      <View style={[styles.rowIcon, { backgroundColor: color + '18' }]}>
        <Text style={styles.rowIconText}>💳</Text>
      </View>
      <View style={styles.rowBody}>
        <Text style={styles.rowId}>Order #{item.id.slice(-8).toUpperCase()}</Text>
        <Text style={styles.rowDate}>{new Date(item.created_at).toLocaleDateString()} · Qty {item.quantity}</Text>
      </View>
      <View style={styles.rowRight}>
        <Text style={styles.rowPrice}>${item.total_price.toFixed(2)}</Text>
        <View style={[styles.badge, { backgroundColor: color + '18' }]}>
          <Text style={[styles.badgeText, { color }]}>{ORDER_STATUS_LABELS[item.status]}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F5F5' },
  summary: {
    flexDirection: 'row', backgroundColor: '#1565C0',
    paddingVertical: 20, paddingHorizontal: 32, justifyContent: 'center',
  },
  summaryItem: { alignItems: 'center', flex: 1 },
  summaryValue: { fontSize: 22, fontWeight: '800', color: '#fff' },
  summaryLabel: { fontSize: 12, color: '#90CAF9', marginTop: 2 },
  divider: { width: 1, backgroundColor: 'rgba(255,255,255,0.3)', marginHorizontal: 16 },
  filterRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#E0E0E0',
  },
  chipActive: { backgroundColor: '#1565C0', borderColor: '#1565C0' },
  chipText: { fontSize: 13, color: '#616161', fontWeight: '500' },
  chipTextActive: { color: '#fff', fontWeight: '700' },
  list: { paddingBottom: 16 },
  emptyFlex: { flex: 1 },
  row: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#F5F5F5',
  },
  rowIcon: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  rowIconText: { fontSize: 20 },
  rowBody: { flex: 1 },
  rowId: { fontSize: 14, fontWeight: '700', color: '#212121' },
  rowDate: { fontSize: 12, color: '#9E9E9E', marginTop: 2 },
  rowRight: { alignItems: 'flex-end' },
  rowPrice: { fontSize: 15, fontWeight: '800', color: '#1565C0' },
  badge: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3, marginTop: 4 },
  badgeText: { fontSize: 11, fontWeight: '600' },
});
