import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, SafeAreaView, Alert, RefreshControl, Platform,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../hooks/useOrders';
import { cancelOrder } from '../services/order.service';
import { extractApiError } from '../utils/errorHandling';
import { ORDER_STATUS_LABELS } from '../utils/enumLabels';
import LoadingIndicator from '../components/LoadingIndicator';
import ErrorView from '../components/ErrorView';
import EmptyState from '../components/EmptyState';
import type { OrderDTO, OrderStatus } from '../types';

const STATUS_COLORS: Partial<Record<OrderStatus, string>> = {
  CREATED: '#1565C0', PENDING_PAYMENT: '#E65100', FUNDED: '#6A1B9A',
  CONFIRMED: '#1A7A35', IN_DELIVERY: '#00838F', DELIVERED: '#1A7A35',
  COMPLETED: '#1A7A35', CANCELLED: '#B71C1C', EXPIRED: '#757575',
};

const CANCELLABLE: OrderStatus[] = ['CREATED', 'PENDING_PAYMENT'];

export default function MerchantOrdersScreen() {
  const { user } = useAuth();
  // Filter orders to this merchant only
  const { orders, loading, error, refetch } = useOrders({
    filterField: 'merchant_id',
    filterById: user?.system_user_id ?? null,
  });
  const [refreshing, setRefreshing] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  async function handleCancel(order: OrderDTO) {
    if (!user?.system_user_id) return;
    Alert.alert(
      'Cancel Order',
      `Cancel order #${order.id.slice(-8).toUpperCase()}? This cannot be undone.`,
      [
        { text: 'Keep Order', style: 'cancel' },
        {
          text: 'Cancel Order',
          style: 'destructive',
          onPress: async () => {
            setCancellingId(order.id);
            try {
              await cancelOrder(order.id, user.system_user_id!);
              await refetch();
            } catch (err) {
              Alert.alert('Error', extractApiError(err).message);
            } finally {
              setCancellingId(null);
            }
          },
        },
      ],
    );
  }

  if (loading) return <LoadingIndicator />;
  if (error) return <ErrorView message={error} onRetry={refetch} />;

  return (
    <SafeAreaView style={styles.safe}>
      {orders.length > 0 && (
        <Text style={styles.count}>{orders.length} order{orders.length !== 1 ? 's' : ''}</Text>
      )}
      <FlatList<OrderDTO>
        data={orders}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <OrderCard
            order={item}
            cancelling={cancellingId === item.id}
            onCancel={CANCELLABLE.includes(item.status) ? () => handleCancel(item) : undefined}
          />
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1A7A35" />}
        initialNumToRender={10}
        windowSize={5}
        removeClippedSubviews
        ListEmptyComponent={<EmptyState message="No orders yet. Browse the marketplace to place one." emoji="📦" />}
        contentContainerStyle={orders.length === 0 ? styles.emptyFlex : styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

function OrderCard({
  order,
  cancelling,
  onCancel,
}: {
  order: OrderDTO;
  cancelling: boolean;
  onCancel?: () => void;
}) {
  const color = STATUS_COLORS[order.status] ?? '#757575';
  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.cardLeft}>
          <Text style={styles.orderId}>Order #{order.id.slice(-8).toUpperCase()}</Text>
          <Text style={styles.orderMeta}>
            {new Date(order.created_at).toLocaleDateString()} · Qty {order.quantity}
          </Text>
        </View>
        <View style={styles.cardRight}>
          <Text style={styles.price}>${order.total_price.toFixed(2)}</Text>
          <View style={[styles.badge, { backgroundColor: color + '18' }]}>
            <Text style={[styles.badgeText, { color }]}>{ORDER_STATUS_LABELS[order.status]}</Text>
          </View>
        </View>
      </View>

      {onCancel && (
        <TouchableOpacity
          style={[styles.cancelBtn, cancelling && styles.cancelBtnDisabled]}
          onPress={onCancel}
          disabled={cancelling}
          activeOpacity={0.75}
        >
          <Text style={styles.cancelBtnText}>{cancelling ? 'Cancelling…' : 'Cancel Order'}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F7F9F7' },
  count: {
    fontSize: 12, color: '#9E9E9E', fontWeight: '600',
    marginHorizontal: 20, marginTop: 14, marginBottom: 4,
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  list: { paddingTop: 8, paddingBottom: 24 },
  emptyFlex: { flex: 1 },

  card: {
    backgroundColor: '#fff', borderRadius: 14,
    marginHorizontal: 16, marginVertical: 5,
    padding: 14, borderWidth: 1, borderColor: '#F0F0F0',
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 }, elevation: 1,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardLeft: { flex: 1, marginRight: 12 },
  orderId: { fontSize: 14, fontWeight: '700', color: '#0D1B0F' },
  orderMeta: { fontSize: 12, color: '#9E9E9E', marginTop: 3 },
  cardRight: { alignItems: 'flex-end' },
  price: { fontSize: 15, fontWeight: '800', color: '#1A7A35' },
  badge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, marginTop: 4 },
  badgeText: { fontSize: 11, fontWeight: '600' },

  cancelBtn: {
    marginTop: 12, paddingVertical: 9, borderRadius: 10,
    backgroundColor: '#FFF0F0', borderWidth: 1, borderColor: '#FFCDD2',
    alignItems: 'center',
  },
  cancelBtnDisabled: { opacity: 0.5 },
  cancelBtnText: { fontSize: 13, color: '#B71C1C', fontWeight: '700' },
});
