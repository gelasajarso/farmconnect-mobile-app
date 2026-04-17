import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, SafeAreaView, Alert, RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../hooks/useOrders';
import { cancelOrder } from '../services/order.service';
import { getPaymentByOrderId } from '../services/payment.service';
import { extractApiError } from '../utils/errorHandling';
import { ORDER_STATUS_LABELS } from '../utils/enumLabels';
import LoadingIndicator from '../components/LoadingIndicator';
import ErrorView from '../components/ErrorView';
import EmptyState from '../components/EmptyState';
import type { OrderDTO, OrderStatus } from '../types';
import type { MerchantStackParamList } from '../navigation/types';
import type { PaymentStatus } from '../types/payment';

type NavProp = StackNavigationProp<MerchantStackParamList, 'MerchantOrdersList'>;

const STATUS_COLORS: Partial<Record<OrderStatus, string>> = {
  CREATED: '#1565C0', PENDING_PAYMENT: '#E65100', FUNDED: '#6A1B9A',
  CONFIRMED: '#1A7A35', IN_DELIVERY: '#00838F', DELIVERED: '#1A7A35',
  COMPLETED: '#1A7A35', CANCELLED: '#B71C1C', EXPIRED: '#757575',
};

// Any order that hasn't been paid yet can trigger payment
const PAYABLE: OrderStatus[]     = ['CREATED', 'PENDING_PAYMENT'];
const CANCELLABLE: OrderStatus[] = ['CREATED', 'PENDING_PAYMENT'];

const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  PENDING:               '#E65100',
  PROCESSING:            '#1565C0',
  SUCCESS:               '#1A7A35',
  FAILED:                '#B71C1C',
  AWAITING_VERIFICATION: '#6A1B9A',
};
const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING:               'Payment Pending',
  PROCESSING:            'Processing',
  SUCCESS:               'Paid ✓',
  FAILED:                'Payment Failed',
  AWAITING_VERIFICATION: 'Awaiting Verification',
};

export default function MerchantOrdersScreen() {
  const navigation = useNavigation<NavProp>();
  const { user } = useAuth();

  const { orders, loading, error, refetch } = useOrders({
    filterField: 'merchant_id',
    filterById: user?.system_user_id ?? null,
  });
  const [refreshing, setRefreshing]   = useState(false);
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

  function handlePay(order: OrderDTO) {
    navigation.navigate('SelectPayment', {
      paymentParams: {
        order_id:       order.id,
        amount:         order.total_price,
        currency:       'ETB',
        product_name:   `Order #${order.id.slice(-8).toUpperCase()}`,
        merchant_name:  user?.name ?? '',
        merchant_email: user?.email ?? '',
      },
    });
  }

  if (loading) return <LoadingIndicator />;
  if (error)   return <ErrorView message={error} onRetry={refetch} />;

  return (
    <SafeAreaView style={styles.safe}>
      {orders.length > 0 && (
        <Text style={styles.count}>
          {orders.length} order{orders.length !== 1 ? 's' : ''}
        </Text>
      )}
      <FlatList<OrderDTO>
        data={orders}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <OrderCard
            order={item}
            cancelling={cancellingId === item.id}
            onCancel={CANCELLABLE.includes(item.status) ? () => handleCancel(item) : undefined}
            onPay={PAYABLE.includes(item.status) ? () => handlePay(item) : undefined}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1A7A35" />
        }
        initialNumToRender={10}
        windowSize={5}
        removeClippedSubviews
        ListEmptyComponent={
          <EmptyState message="No orders yet. Browse the marketplace to place one." emoji="📦" />
        }
        contentContainerStyle={orders.length === 0 ? styles.emptyFlex : styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

// ─── Order Card ───────────────────────────────────────────────────────────────

function OrderCard({
  order, cancelling, onCancel, onPay,
}: {
  order: OrderDTO;
  cancelling: boolean;
  onCancel?: () => void;
  onPay?: () => void;
}) {
  const orderColor  = STATUS_COLORS[order.status] ?? '#757575';
  const payment     = getPaymentByOrderId(order.id);
  const hasActions  = onPay || onCancel;

  return (
    <View style={styles.card}>
      {/* Top row */}
      <View style={styles.cardTop}>
        <View style={styles.cardLeft}>
          <Text style={styles.orderId}>Order #{order.id.slice(-8).toUpperCase()}</Text>
          <Text style={styles.orderMeta}>
            {new Date(order.created_at).toLocaleDateString()} · Qty {order.quantity}
          </Text>
        </View>
        <View style={styles.cardRight}>
          <Text style={styles.price}>ETB {order.total_price.toFixed(2)}</Text>
          {/* Order status badge */}
          <View style={[styles.badge, { backgroundColor: orderColor + '18' }]}>
            <Text style={[styles.badgeText, { color: orderColor }]}>
              {ORDER_STATUS_LABELS[order.status]}
            </Text>
          </View>
          {/* Payment status badge */}
          {payment && (
            <View style={[styles.badge, {
              backgroundColor: PAYMENT_STATUS_COLORS[payment.status] + '18',
              marginTop: 3,
            }]}>
              <Text style={[styles.badgeText, { color: PAYMENT_STATUS_COLORS[payment.status] }]}>
                {PAYMENT_STATUS_LABELS[payment.status]}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Action buttons */}
      {hasActions && (
        <View style={styles.actionRow}>
          {onPay && (
            <TouchableOpacity
              style={styles.payBtn}
              onPress={onPay}
              activeOpacity={0.85}
            >
              <Text style={styles.payBtnText}>💳  Pay Now</Text>
            </TouchableOpacity>
          )}
          {onCancel && (
            <TouchableOpacity
              style={[
                styles.cancelBtn,
                onPay && styles.cancelBtnNarrow,
                cancelling && styles.btnDisabled,
              ]}
              onPress={onCancel}
              disabled={cancelling}
              activeOpacity={0.75}
            >
              <Text style={styles.cancelBtnText}>
                {cancelling ? 'Cancelling…' : 'Cancel'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: '#F7F9F7' },
  list:      { paddingTop: 8, paddingBottom: 24 },
  emptyFlex: { flex: 1 },

  count: {
    fontSize: 12, color: '#9E9E9E', fontWeight: '600',
    marginHorizontal: 20, marginTop: 14, marginBottom: 4,
    textTransform: 'uppercase', letterSpacing: 0.5,
  },

  card: {
    backgroundColor: '#fff', borderRadius: 14,
    marginHorizontal: 16, marginVertical: 5,
    padding: 14, borderWidth: 1, borderColor: '#F0F0F0',
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 }, elevation: 1,
  },
  cardTop: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
  },
  cardLeft:  { flex: 1, marginRight: 12 },
  orderId:   { fontSize: 14, fontWeight: '700', color: '#0D1B0F' },
  orderMeta: { fontSize: 12, color: '#9E9E9E', marginTop: 3 },
  cardRight: { alignItems: 'flex-end' },
  price:     { fontSize: 15, fontWeight: '800', color: '#1A7A35' },
  badge: {
    borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, marginTop: 4,
  },
  badgeText: { fontSize: 11, fontWeight: '600' },

  actionRow: {
    flexDirection: 'row', gap: 8, marginTop: 12,
  },

  payBtn: {
    flex: 1, paddingVertical: 11, borderRadius: 10,
    backgroundColor: '#1A7A35', alignItems: 'center',
    shadowColor: '#1A7A35', shadowOpacity: 0.3, shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 }, elevation: 3,
  },
  payBtnText: { fontSize: 14, color: '#fff', fontWeight: '700' },

  cancelBtn: {
    flex: 1, paddingVertical: 11, borderRadius: 10,
    backgroundColor: '#FFF0F0', borderWidth: 1, borderColor: '#FFCDD2',
    alignItems: 'center',
  },
  cancelBtnNarrow: { flex: 0, paddingHorizontal: 20 },
  btnDisabled:     { opacity: 0.5 },
  cancelBtnText:   { fontSize: 13, color: '#B71C1C', fontWeight: '700' },
});
