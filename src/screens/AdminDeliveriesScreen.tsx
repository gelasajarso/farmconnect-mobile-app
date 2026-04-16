import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, SafeAreaView, RefreshControl,
} from 'react-native';
import { getAllDeliveries } from '../services/admin.service';
import { extractApiError } from '../utils/errorHandling';
import { DELIVERY_STATUS_LABELS } from '../utils/enumLabels';
import LoadingIndicator from '../components/LoadingIndicator';
import ErrorView from '../components/ErrorView';
import EmptyState from '../components/EmptyState';
import type { DeliveryResponse, DeliveryStatus } from '../types';
import { useFocusEffect } from '@react-navigation/native';

const STATUS_COLORS: Record<DeliveryStatus, string> = {
  ASSIGNED: '#1565C0', PICKED_UP: '#6A1B9A', IN_TRANSIT: '#E65100',
  DELIVERED: '#1A7A35', FAILED: '#B71C1C', CANCELLED: '#757575',
};

const FILTER_OPTIONS: { label: string; value: DeliveryStatus | 'ALL' }[] = [
  { label: 'All',       value: 'ALL' },
  { label: 'Active',    value: 'IN_TRANSIT' },
  { label: 'Delivered', value: 'DELIVERED' },
  { label: 'Failed',    value: 'FAILED' },
];

export default function AdminDeliveriesScreen() {
  const [deliveries, setDeliveries] = useState<DeliveryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<DeliveryStatus | 'ALL'>('ALL');

  const load = useCallback(async () => {
    setError('');
    try {
      const data = await getAllDeliveries();
      setDeliveries(data);
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

  const filtered = filter === 'ALL' ? deliveries : deliveries.filter(d => d.status === filter);
  const active    = deliveries.filter(d => ['ASSIGNED','PICKED_UP','IN_TRANSIT'].includes(d.status)).length;
  const delivered = deliveries.filter(d => d.status === 'DELIVERED').length;
  const failed    = deliveries.filter(d => d.status === 'FAILED').length;

  if (loading) return <LoadingIndicator />;
  if (error) return <ErrorView message={error} onRetry={load} />;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Stats */}
      <View style={styles.summary}>
        <SummaryItem label="Total"     value={deliveries.length} />
        <SummaryItem label="Active"    value={active} />
        <SummaryItem label="Delivered" value={delivered} />
        <SummaryItem label="Failed"    value={failed} />
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

      <FlatList<DeliveryResponse>
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <DeliveryCard item={item} />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1A7A35" />}
        ListEmptyComponent={<EmptyState message="No deliveries found." emoji="🚚" />}
        contentContainerStyle={filtered.length === 0 ? styles.emptyFlex : styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

function SummaryItem({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.summaryItem}>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

function DeliveryCard({ item }: { item: DeliveryResponse }) {
  const color = STATUS_COLORS[item.status];
  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.cardLeft}>
          <Text style={styles.deliveryId}>Delivery #{item.id.slice(-8).toUpperCase()}</Text>
          <Text style={styles.meta}>Order: {item.order_id.slice(-8).toUpperCase()}</Text>
          <Text style={styles.meta}>Carrier: {item.carrier_id}</Text>
          {item.pickup_time && (
            <Text style={styles.meta}>Pickup: {new Date(item.pickup_time).toLocaleDateString()}</Text>
          )}
          {item.delivered_time && (
            <Text style={styles.meta}>Delivered: {new Date(item.delivered_time).toLocaleDateString()}</Text>
          )}
          {item.notes && <Text style={styles.notes}>{item.notes}</Text>}
        </View>
        <View style={[styles.badge, { backgroundColor: color + '18' }]}>
          <Text style={[styles.badgeText, { color }]}>{DELIVERY_STATUS_LABELS[item.status]}</Text>
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
    paddingVertical: 14, paddingHorizontal: 12,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryValue: { fontSize: 20, fontWeight: '800', color: '#fff' },
  summaryLabel: { fontSize: 10, color: 'rgba(255,255,255,0.7)', marginTop: 2, fontWeight: '600', textTransform: 'uppercase' },

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
  deliveryId: { fontSize: 14, fontWeight: '700', color: '#0D1B0F', marginBottom: 4 },
  meta: { fontSize: 12, color: '#9E9E9E', marginTop: 2 },
  notes: { fontSize: 12, color: '#6B8F71', marginTop: 4, fontStyle: 'italic' },
  badge: { borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start' },
  badgeText: { fontSize: 11, fontWeight: '700' },
});
