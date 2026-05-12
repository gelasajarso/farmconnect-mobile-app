import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
  TextInput,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { getFarmerOrders, confirmOrder, cancelFarmerOrder } from '../services/order.service';
import { extractApiError } from '../utils/errorHandling';
import { ORDER_STATUS_LABELS } from '../utils/enumLabels';
import type { FarmerStackParamList } from '../navigation/types';
import type { OrderDTO, OrderStatus } from '../types';

type NavProp = StackNavigationProp<FarmerStackParamList, 'FarmerOrders'>;

// ─── Constants ────────────────────────────────────────────────────────────────

type FilterTab = 'ALL' | OrderStatus;

const FILTER_TABS: FilterTab[] = [
  'ALL',
  'CREATED',
  'PENDING_PAYMENT',
  'FUNDED',
  'CONFIRMED',
  'CANCELLED',
  'DELIVERED',
];

const FILTER_LABELS: Record<FilterTab, string> = {
  ALL: 'All',
  CREATED: 'Created',
  PENDING_PAYMENT: 'Pending Payment',
  FUNDED: 'Funded',
  CONFIRMED: 'Confirmed',
  CANCELLED: 'Cancelled',
  DELIVERED: 'Delivered',
};

const STATUS_COLORS: Partial<Record<OrderStatus, string>> = {
  CREATED: '#1565C0',
  PENDING_PAYMENT: '#E65100',
  FUNDED: '#6A1B9A',
  CONFIRMED: '#1A7A35',
  IN_DELIVERY: '#00838F',
  DELIVERED: '#1A7A35',
  COMPLETED: '#1A7A35',
  CANCELLED: '#B71C1C',
  EXPIRED: '#757575',
};

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function FarmerOrdersScreen() {
  const navigation = useNavigation<NavProp>();

  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [activeFilter, setActiveFilter] = useState<FilterTab>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // Per-row action state: { [orderId]: { loading, error } }
  const [actionState, setActionState] = useState<
    Record<string, { loading: boolean; error: string }>
  >({});

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getFarmerOrders();
      setOrders(data);
    } catch (err) {
      setError(extractApiError(err).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // ─── Filtering & Search ───────────────────────────────────────────────────

  const filteredOrders = useMemo(() => {
    let result = orders;

    if (activeFilter !== 'ALL') {
      result = result.filter(o => o.status === activeFilter);
    }

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter(
        o =>
          o.id.slice(-8).toLowerCase().includes(q) ||
          o.product_id.toLowerCase().includes(q) ||
          o.merchant_id.toLowerCase().includes(q),
      );
    }

    return result;
  }, [orders, activeFilter, searchQuery]);

  // ─── Actions ──────────────────────────────────────────────────────────────

  const setRowAction = (orderId: string, loading: boolean, error = '') => {
    setActionState(prev => ({ ...prev, [orderId]: { loading, error } }));
  };

  const handleConfirm = useCallback(
    async (orderId: string) => {
      setRowAction(orderId, true);
      try {
        const updated = await confirmOrder(orderId);
        setOrders(prev =>
          prev.map(o => (o.id === orderId ? { ...o, status: updated.status } : o)),
        );
        setSelectedOrderId(null);
        setRowAction(orderId, false);
      } catch (err) {
        setRowAction(orderId, false, extractApiError(err).message);
      }
    },
    [],
  );

  const handleCancel = useCallback(
    async (orderId: string) => {
      setRowAction(orderId, true);
      try {
        const updated = await cancelFarmerOrder(orderId);
        setOrders(prev =>
          prev.map(o => (o.id === orderId ? { ...o, status: updated.status } : o)),
        );
        setSelectedOrderId(null);
        setRowAction(orderId, false);
      } catch (err) {
        setRowAction(orderId, false, extractApiError(err).message);
      }
    },
    [],
  );

  const handleRowPress = useCallback((orderId: string) => {
    setSelectedOrderId(prev => (prev === orderId ? null : orderId));
  }, []);

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Orders</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by order ID, product or merchant…"
          placeholderTextColor="#BDBDBD"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="while-editing"
        />
      </View>

      {/* Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsScroll}
        contentContainerStyle={styles.tabsContent}
      >
        {FILTER_TABS.map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeFilter === tab && styles.tabActive]}
            onPress={() => setActiveFilter(tab)}
            activeOpacity={0.75}
          >
            <Text style={[styles.tabText, activeFilter === tab && styles.tabTextActive]}>
              {FILTER_LABELS[tab]}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content */}
      {loading ? (
        <View style={styles.centerWrap}>
          <ActivityIndicator size="large" color="#1A7A35" />
        </View>
      ) : error ? (
        <View style={styles.centerWrap}>
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={fetchOrders}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <FlatList<OrderDTO>
          data={filteredOrders}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <OrderRow
              order={item}
              expanded={selectedOrderId === item.id}
              actionLoading={actionState[item.id]?.loading ?? false}
              actionError={actionState[item.id]?.error ?? ''}
              onPress={() => handleRowPress(item.id)}
              onConfirm={() => handleConfirm(item.id)}
              onCancel={() => handleCancel(item.id)}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No orders found.</Text>
            </View>
          }
          contentContainerStyle={
            filteredOrders.length === 0 ? styles.emptyFlex : styles.listContent
          }
          showsVerticalScrollIndicator={false}
          initialNumToRender={12}
          windowSize={5}
          removeClippedSubviews
        />
      )}
    </SafeAreaView>
  );
}

// ─── Order Row ────────────────────────────────────────────────────────────────

interface OrderRowProps {
  order: OrderDTO;
  expanded: boolean;
  actionLoading: boolean;
  actionError: string;
  onPress: () => void;
  onConfirm: () => void;
  onCancel: () => void;
}

function OrderRow({
  order,
  expanded,
  actionLoading,
  actionError,
  onPress,
  onConfirm,
  onCancel,
}: OrderRowProps) {
  const statusColor = STATUS_COLORS[order.status] ?? '#757575';
  const canConfirm = order.status === 'FUNDED';
  const canCancel = order.status === 'CREATED' || order.status === 'PENDING_PAYMENT';
  const hasAction = canConfirm || canCancel;

  return (
    <TouchableOpacity
      style={[styles.row, expanded && styles.rowExpanded]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Main info */}
      <View style={styles.rowTop}>
        <View style={styles.rowLeft}>
          <Text style={styles.rowTitle}>
            Order #{order.id.slice(-8).toUpperCase()}
          </Text>
          <Text style={styles.rowSub}>
            {new Date(order.created_at).toLocaleDateString()} · Qty {order.quantity}
          </Text>
        </View>
        <View style={styles.rowRight}>
          <Text style={styles.rowPrice}>ETB {order.total_price.toFixed(2)}</Text>
          <View style={[styles.badge, { backgroundColor: statusColor + '18' }]}>
            <Text style={[styles.badgeText, { color: statusColor }]}>
              {ORDER_STATUS_LABELS[order.status]}
            </Text>
          </View>
        </View>
      </View>

      {/* Expanded action area */}
      {expanded && hasAction && (
        <View style={styles.actionArea}>
          {actionError ? (
            <Text style={styles.actionError}>{actionError}</Text>
          ) : null}
          {canConfirm && (
            <TouchableOpacity
              style={[styles.confirmBtn, actionLoading && styles.btnDisabled]}
              onPress={onConfirm}
              disabled={actionLoading}
              activeOpacity={0.85}
            >
              {actionLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.confirmBtnText}>✓ Confirm Order</Text>
              )}
            </TouchableOpacity>
          )}
          {canCancel && (
            <TouchableOpacity
              style={[styles.cancelBtn, actionLoading && styles.btnDisabled]}
              onPress={onCancel}
              disabled={actionLoading}
              activeOpacity={0.75}
            >
              {actionLoading ? (
                <ActivityIndicator size="small" color="#B71C1C" />
              ) : (
                <Text style={styles.cancelBtnText}>✕ Cancel Order</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F7F9F7' },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A7A35',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 20 : 16,
    paddingBottom: 16,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  backArrow: { fontSize: 24, color: '#fff', lineHeight: 28, marginTop: -2 },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.3,
  },
  headerSpacer: { width: 36 },

  // Search
  searchWrap: {
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 4,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 11 : 9,
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

  // Filter tabs
  tabsScroll: { flexGrow: 0, marginTop: 10 },
  tabsContent: { paddingHorizontal: 16, gap: 8, paddingBottom: 4 },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  tabActive: {
    backgroundColor: '#1A7A35',
    borderColor: '#1A7A35',
  },
  tabText: { fontSize: 13, fontWeight: '600', color: '#757575' },
  tabTextActive: { color: '#fff' },

  // List
  listContent: { paddingTop: 12, paddingBottom: 32 },
  emptyFlex: { flex: 1, justifyContent: 'center' },

  // Row
  row: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  rowExpanded: {
    borderColor: '#1A7A35',
    borderWidth: 1.5,
  },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  rowLeft: { flex: 1, marginRight: 12 },
  rowTitle: { fontSize: 14, fontWeight: '700', color: '#0D1B0F' },
  rowSub: { fontSize: 12, color: '#9E9E9E', marginTop: 3 },
  rowRight: { alignItems: 'flex-end' },
  rowPrice: { fontSize: 15, fontWeight: '800', color: '#1A7A35' },
  badge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 4,
  },
  badgeText: { fontSize: 11, fontWeight: '600' },

  // Action area
  actionArea: { marginTop: 12, gap: 8 },
  actionError: {
    fontSize: 12,
    color: '#B71C1C',
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    padding: 8,
    textAlign: 'center',
  },
  confirmBtn: {
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: '#1A7A35',
    alignItems: 'center',
    shadowColor: '#1A7A35',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  confirmBtnText: { fontSize: 14, color: '#fff', fontWeight: '700' },
  cancelBtn: {
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: '#FFF0F0',
    borderWidth: 1,
    borderColor: '#FFCDD2',
    alignItems: 'center',
  },
  cancelBtnText: { fontSize: 13, color: '#B71C1C', fontWeight: '700' },
  btnDisabled: { opacity: 0.5 },

  // Empty / Error
  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    marginHorizontal: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  emptyText: { fontSize: 14, color: '#9E9E9E' },

  centerWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  errorCard: {
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    width: '100%',
  },
  errorText: { fontSize: 14, color: '#B71C1C', textAlign: 'center', marginBottom: 12 },
  retryBtn: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  retryText: { fontSize: 13, color: '#B71C1C', fontWeight: '600' },
});
