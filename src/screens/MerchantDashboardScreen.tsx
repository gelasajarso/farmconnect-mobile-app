import React, { useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, ActivityIndicator, Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../hooks/useOrders';
import { ORDER_STATUS_LABELS } from '../utils/enumLabels';
import type { MerchantTabParamList, MerchantStackParamList } from '../navigation/types';
import type { OrderDTO, OrderStatus } from '../types';

type DashNavProp = CompositeNavigationProp<
  BottomTabNavigationProp<MerchantTabParamList>,
  StackNavigationProp<MerchantStackParamList>
>;

const STATUS_COLORS: Partial<Record<OrderStatus, string>> = {
  CREATED: '#1565C0', PENDING_PAYMENT: '#E65100', FUNDED: '#6A1B9A',
  CONFIRMED: '#1A7A35', IN_DELIVERY: '#00838F', DELIVERED: '#1A7A35',
  COMPLETED: '#1A7A35', CANCELLED: '#B71C1C', EXPIRED: '#757575',
};

const PAYABLE: OrderStatus[] = ['CREATED', 'PENDING_PAYMENT'];

export default function MerchantDashboardScreen() {
  const navigation = useNavigation<DashNavProp>();
  const { user, logout } = useAuth();
  const { orders, loading, error, refetch } = useOrders({
    filterField: 'merchant_id',
    filterById: user?.system_user_id ?? null,
  });

  const stats = useMemo(() => {
    const total     = orders.length;
    const active    = orders.filter(o => ['CREATED','PENDING_PAYMENT','FUNDED','CONFIRMED','IN_DELIVERY'].includes(o.status)).length;
    const completed = orders.filter(o => o.status === 'COMPLETED').length;
    const spent     = orders.filter(o => ['COMPLETED','DELIVERED'].includes(o.status)).reduce((s, o) => s + o.total_price, 0);
    return { total, active, completed, spent };
  }, [orders]);

  const initials = (user?.name ?? 'M').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>Welcome back 👋</Text>
            <Text style={styles.name}>{user?.name ?? 'Merchant'}</Text>
            {user?.system_user_id && <Text style={styles.userId}>{user.system_user_id}</Text>}
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.8}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Spend banner */}
        <View style={styles.spendCard}>
          <Text style={styles.spendLabel}>Total Spent</Text>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.spendValue}>${stats.spent.toLocaleString('en-US', { minimumFractionDigits: 2 })}</Text>
          }
          <Text style={styles.spendSub}>on completed orders</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsGrid}>
          <StatCard label="Total"     value={stats.total}     color="#1A7A35" bg="#F0FBF3" loading={loading} onPress={() => navigation.navigate('MerchantOrdersList')} />
          <StatCard label="Active"    value={stats.active}    color="#E65100" bg="#FFF3E0" loading={loading} onPress={() => navigation.navigate('MerchantOrdersList')} />
          <StatCard label="Completed" value={stats.completed} color="#1A7A35" bg="#F0FBF3" loading={loading} onPress={() => navigation.navigate('TransactionHistory')} />
        </View>

        {/* Quick Actions */}
        <SectionHeader title="Quick Actions" />
        <View style={styles.actionsRow}>
          <ActionCard emoji="🛒" label="Browse Market"    onPress={() => navigation.navigate('HomeStack')} />
          <ActionCard emoji="📦" label="My Orders"        onPress={() => navigation.navigate('MerchantOrdersList')} />
          <ActionCard emoji="💳" label="Transactions"     onPress={() => navigation.navigate('TransactionHistory')} />
          <ActionCard emoji="👤" label="Profile"          onPress={() => navigation.navigate('Profile')} />
        </View>

        {/* Recent Orders */}
        <SectionHeader title="Recent Orders" onSeeAll={() => navigation.navigate('MerchantOrdersList')} />
        {loading ? (
          <ActivityIndicator color="#1A7A35" style={styles.loader} />
        ) : error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={refetch} style={styles.retryBtn}><Text style={styles.retryText}>Retry</Text></TouchableOpacity>
          </View>
        ) : orders.length === 0 ? (
          <EmptyCard message="No orders yet." cta="Browse the marketplace →" onCta={() => navigation.navigate('HomeStack')} />
        ) : (
          orders.slice(0, 4).map(o => (
            <OrderRow
              key={o.id}
              order={o}
              onPress={() => navigation.navigate('MerchantOrdersList')}
              onPay={PAYABLE.includes(o.status) ? () => navigation.navigate('SelectPayment', {
                paymentParams: {
                  order_id:       o.id,
                  amount:         o.total_price,
                  currency:       'ETB',
                  product_name:   `Order #${o.id.slice(-8).toUpperCase()}`,
                  merchant_name:  user?.name ?? '',
                  merchant_email: user?.email ?? '',
                },
              }) : undefined}
            />
          ))
        )}

        <View style={styles.bottomPad} />
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionHeader({ title, onSeeAll }: { title: string; onSeeAll?: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {onSeeAll && <TouchableOpacity onPress={onSeeAll}><Text style={styles.seeAll}>See all →</Text></TouchableOpacity>}
    </View>
  );
}

function StatCard({ label, value, color, bg, loading, onPress }: {
  label: string; value: number; color: string; bg: string; loading: boolean; onPress: () => void;
}) {
  return (
    <TouchableOpacity style={[styles.statCard, { backgroundColor: bg }]} onPress={onPress} activeOpacity={0.75}>
      {loading ? <ActivityIndicator size="small" color={color} /> : <Text style={[styles.statValue, { color }]}>{value}</Text>}
      <Text style={styles.statLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function ActionCard({ emoji, label, onPress }: { emoji: string; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.actionCard} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.actionIconWrap}><Text style={styles.actionEmoji}>{emoji}</Text></View>
      <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function OrderRow({ order, onPress, onPay }: {
  order: OrderDTO; onPress: () => void; onPay?: () => void;
}) {
  const color = STATUS_COLORS[order.status] ?? '#757575';
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.rowLeft}>
        <Text style={styles.rowTitle}>Order #{order.id.slice(-8).toUpperCase()}</Text>
        <Text style={styles.rowSub}>{new Date(order.created_at).toLocaleDateString()} · Qty {order.quantity}</Text>
      </View>
      <View style={styles.rowRight}>
        <Text style={styles.rowPrice}>ETB {order.total_price.toFixed(2)}</Text>
        <View style={[styles.badge, { backgroundColor: color + '18' }]}>
          <Text style={[styles.badgeText, { color }]}>{ORDER_STATUS_LABELS[order.status]}</Text>
        </View>
        {onPay ? (
          <TouchableOpacity
            style={styles.rowPayBtn}
            onPress={e => { e.stopPropagation?.(); onPay(); }}
            activeOpacity={0.85}
          >
            <Text style={styles.rowPayBtnText}>💳 Pay</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.rowChevron}>›</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

function EmptyCard({ message, cta, onCta }: { message: string; cta?: string; onCta?: () => void }) {
  return (
    <View style={styles.emptyCard}>
      <Text style={styles.emptyText}>{message}</Text>
      {cta && onCta && <TouchableOpacity onPress={onCta} style={styles.emptyBtn}><Text style={styles.emptyBtnText}>{cta}</Text></TouchableOpacity>}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F7F9F7' },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#1A7A35',
    paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? 20 : 16, paddingBottom: 22,
  },
  headerLeft: { flex: 1 },
  greeting: { fontSize: 13, color: '#A8D5B5', fontWeight: '500' },
  name: { fontSize: 22, fontWeight: '800', color: '#fff', marginTop: 2, letterSpacing: -0.3 },
  userId: { fontSize: 12, color: '#7DC49A', marginTop: 2 },
  logoutBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  logoutText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  spendCard: {
    backgroundColor: '#25A244', borderRadius: 16,
    marginHorizontal: 16, marginTop: 16, padding: 20, alignItems: 'center',
    shadowColor: '#1A7A35', shadowOpacity: 0.25, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },
  spendLabel: { fontSize: 12, color: 'rgba(255,255,255,0.75)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  spendValue: { fontSize: 34, fontWeight: '800', color: '#fff', marginVertical: 4, letterSpacing: -1 },
  spendSub: { fontSize: 12, color: 'rgba(255,255,255,0.65)' },

  statsGrid: { flexDirection: 'row', marginHorizontal: 16, marginTop: 14, gap: 8 },
  statCard: { flex: 1, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  statLabel: { fontSize: 11, color: '#888', marginTop: 3, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.3 },

  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginHorizontal: 20, marginTop: 28, marginBottom: 12,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#0D1B0F', letterSpacing: -0.2 },
  seeAll: { fontSize: 13, color: '#1A7A35', fontWeight: '600' },

  actionsRow: { flexDirection: 'row', marginHorizontal: 16, gap: 10 },
  actionCard: {
    flex: 1, backgroundColor: '#fff', borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', borderWidth: 1, borderColor: '#F0F0F0',
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 1,
  },
  actionIconWrap: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#F0FBF3', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  actionEmoji: { fontSize: 20 },
  actionLabel: { fontSize: 12, fontWeight: '600', color: '#0D1B0F', textAlign: 'center' },

  row: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 12, padding: 14,
    marginHorizontal: 16, marginBottom: 8,
    borderWidth: 1, borderColor: '#F0F0F0',
    shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 3, shadowOffset: { width: 0, height: 1 }, elevation: 1,
  },
  rowLeft: { flex: 1, marginRight: 12 },
  rowTitle: { fontSize: 14, fontWeight: '700', color: '#0D1B0F' },
  rowSub: { fontSize: 12, color: '#9E9E9E', marginTop: 2 },
  rowRight: { alignItems: 'flex-end' },
  rowPrice: { fontSize: 14, fontWeight: '800', color: '#1A7A35' },
  badge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, marginTop: 4 },
  badgeText: { fontSize: 11, fontWeight: '600' },
  rowChevron: { fontSize: 18, color: '#BDBDBD', marginTop: 4, alignSelf: 'flex-end' },
  rowPayBtn: {
    marginTop: 6, paddingHorizontal: 12, paddingVertical: 5,
    backgroundColor: '#1A7A35', borderRadius: 20,
  },
  rowPayBtnText: { fontSize: 12, color: '#fff', fontWeight: '700' },

  emptyCard: { backgroundColor: '#fff', borderRadius: 12, padding: 20, marginHorizontal: 16, alignItems: 'center', borderWidth: 1, borderColor: '#F0F0F0' },
  emptyText: { fontSize: 14, color: '#9E9E9E', marginBottom: 10 },
  emptyBtn: { backgroundColor: '#F0FBF3', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  emptyBtnText: { fontSize: 13, color: '#1A7A35', fontWeight: '600' },

  errorCard: { backgroundColor: '#FFEBEE', borderRadius: 12, padding: 16, marginHorizontal: 16, alignItems: 'center' },
  errorText: { fontSize: 13, color: '#B71C1C', marginBottom: 10 },
  retryBtn: { backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20 },
  retryText: { fontSize: 13, color: '#B71C1C', fontWeight: '600' },

  loader: { marginVertical: 20 },
  bottomPad: { height: 40 },
});
