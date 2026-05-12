import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { DeliveryStackParamList } from '../navigation/types';
import { getActionableOrders, type ActionableOrder } from '../services/delivery.service';

type NavProp = StackNavigationProp<DeliveryStackParamList, 'AvailableOrders'>;

export default function AvailableOrdersScreen() {
  const navigation = useNavigation<NavProp>();

  const [orders, setOrders] = useState<ActionableOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getActionableOrders();
      setOrders(data);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filtered = orders.filter(o => {
    const q = search.toLowerCase();
    if (!q) return true;
    return (
      (o.product_name ?? '').toLowerCase().includes(q) ||
      o.id.toLowerCase().includes(q)
    );
  });

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Available Orders</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by product or order ID…"
          placeholderTextColor="#9E9E9E"
          value={search}
          onChangeText={setSearch}
          autoCorrect={false}
          autoCapitalize="none"
          clearButtonMode="while-editing"
        />
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#1A7A35" />
          <Text style={styles.loadingText}>Loading orders…</Text>
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={fetchOrders}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          contentContainerStyle={filtered.length === 0 ? styles.emptyContainer : styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <Text style={styles.emptyEmoji}>📦</Text>
              <Text style={styles.emptyTitle}>No orders found</Text>
              <Text style={styles.emptySubtitle}>
                {search ? 'Try a different search term.' : 'There are no orders available right now.'}
              </Text>
            </View>
          }
          renderItem={({ item }) => <OrderRow order={item} />}
        />
      )}
    </SafeAreaView>
  );
}

function OrderRow({ order }: { order: ActionableOrder }) {
  return (
    <View style={styles.row}>
      <View style={styles.rowTop}>
        <Text style={styles.productName} numberOfLines={1}>
          {order.product_name ?? 'Unknown Product'}
        </Text>
        <StatusBadge status={order.status} />
      </View>

      <View style={styles.rowMeta}>
        <MetaItem label="Qty" value={String(order.quantity)} />
        <MetaItem
          label="Price"
          value={`${order.currency} ${order.total_price.toFixed(2)}`}
        />
        <MetaItem
          label="Date"
          value={new Date(order.created_at).toLocaleDateString()}
        />
      </View>

      <View style={styles.addressRow}>
        <Text style={styles.addressLabel}>📍 </Text>
        <Text style={styles.addressText} numberOfLines={2}>
          {order.delivery_address ?? 'N/A'}
        </Text>
      </View>

      <Text style={styles.orderId}>Order #{order.id.slice(-8).toUpperCase()}</Text>
    </View>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metaItem}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
  );
}

function StatusBadge({ status }: { status: string }) {
  const { bg, color, label } = getStatusStyle(status);
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

function getStatusStyle(status: string): { bg: string; color: string; label: string } {
  switch (status) {
    case 'READY_FOR_PICKUP':
      return { bg: '#E8F5E9', color: '#1A7A35', label: 'Ready' };
    case 'PENDING':
      return { bg: '#FFF8E1', color: '#F57F17', label: 'Pending' };
    case 'PROCESSING':
      return { bg: '#E3F2FD', color: '#1565C0', label: 'Processing' };
    default:
      return { bg: '#F5F5F5', color: '#757575', label: status };
  }
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F7F9F7' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A7A35',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 20 : 16,
    paddingBottom: 18,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: { fontSize: 20, color: '#fff', lineHeight: 22 },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.3,
  },
  headerRight: { width: 36 },

  searchWrap: {
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 6,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    fontSize: 14,
    color: '#0D1B0F',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },

  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  loadingText: { marginTop: 12, fontSize: 14, color: '#9E9E9E' },

  errorCard: {
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    width: '100%',
  },
  errorText: { fontSize: 14, color: '#B71C1C', textAlign: 'center', marginBottom: 14 },
  retryBtn: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#B71C1C',
  },
  retryText: { fontSize: 13, color: '#B71C1C', fontWeight: '600' },

  listContent: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 40 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyCard: { alignItems: 'center', paddingVertical: 40 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#0D1B0F', marginBottom: 6 },
  emptySubtitle: { fontSize: 14, color: '#9E9E9E', textAlign: 'center' },

  row: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  productName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#0D1B0F',
    marginRight: 10,
  },
  badge: { borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { fontSize: 11, fontWeight: '600' },

  rowMeta: { flexDirection: 'row', gap: 16, marginBottom: 10 },
  metaItem: {},
  metaLabel: { fontSize: 10, color: '#9E9E9E', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.3 },
  metaValue: { fontSize: 13, fontWeight: '700', color: '#0D1B0F', marginTop: 2 },

  addressRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  addressLabel: { fontSize: 13, color: '#9E9E9E' },
  addressText: { flex: 1, fontSize: 13, color: '#555', lineHeight: 18 },

  orderId: { fontSize: 11, color: '#BDBDBD', fontWeight: '500' },
});
