import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../hooks/useOrders';
import { ORDER_STATUS_LABELS } from '../utils/enumLabels';
import type { MerchantTabParamList } from '../navigation/types';
import type { OrderDTO, OrderStatus } from '../types';

type DashNavProp = BottomTabNavigationProp<MerchantTabParamList>;

// Status badge colors
const ORDER_STATUS_COLORS: Partial<Record<OrderStatus, string>> = {
  CREATED: '#1565C0',
  PENDING_PAYMENT: '#F57F17',
  FUNDED: '#6A1B9A',
  CONFIRMED: '#2E7D32',
  IN_DELIVERY: '#00838F',
  DELIVERED: '#558B2F',
  COMPLETED: '#1B5E20',
  CANCELLED: '#B71C1C',
  EXPIRED: '#757575',
};

export default function MerchantDashboardScreen() {
  const navigation = useNavigation<DashNavProp>();
  const { user, logout } = useAuth();
  const { orders, loading, error, refetch } = useOrders();

  // Derived stats
  const stats = useMemo(() => {
    const total = orders.length;
    const active = orders.filter((o) =>
      ['CREATED', 'PENDING_PAYMENT', 'FUNDED', 'CONFIRMED', 'IN_DELIVERY'].includes(o.status)
    ).length;
    const completed = orders.filter((o) => o.status === 'COMPLETED').length;
    const totalSpent = orders
      .filter((o) => ['COMPLETED', 'DELIVERED'].includes(o.status))
      .reduce((sum, o) => sum + o.total_price, 0);
    return { total, active, completed, totalSpent };
  }, [orders]);

  const recentOrders = orders.slice(0, 4);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.name}>{user?.name ?? 'Merchant'}</Text>
            {user?.system_user_id && (
              <Text style={styles.userId}>{user.system_user_id}</Text>
            )}
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* ── Spending Banner ── */}
        <View style={styles.spendBanner}>
          <Text style={styles.spendLabel}>Total Spent</Text>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.spendValue}>
              ${stats.totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Text>
          )}
          <Text style={styles.spendSub}>on completed orders</Text>
        </View>

        {/* ── Stats Row ── */}
        <View style={styles.statsRow}>
          <StatCard label="Total Orders" value={stats.total} color="#1565C0" loading={loading} />
          <StatCard label="Active" value={stats.active} color="#F57F17" loading={loading} />
          <StatCard label="Completed" value={stats.completed} color="#2E7D32" loading={loading} />
        </View>

        {/* ── Quick Actions ── */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsRow}>
          <QuickAction emoji="🛒" label="Browse Market" onPress={() => navigation.navigate('HomeStack')} />
          <QuickAction emoji="📦" label="My Orders" onPress={() => navigation.navigate('MerchantStack')} />
        </View>

        {/* ── Recent Orders ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Orders</Text>
          <TouchableOpacity onPress={() => navigation.navigate('MerchantStack')}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color="#1565C0" style={styles.loader} />
        ) : error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={refetch} style={styles.retryBtn}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : recentOrders.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>🛒</Text>
            <Text style={styles.emptyText}>No orders yet.</Text>
            <TouchableOpacity
              style={styles.emptyBtn}
              onPress={() => navigation.navigate('HomeStack')}
            >
              <Text style={styles.emptyBtnText}>Browse the marketplace →</Text>
            </TouchableOpacity>
          </View>
        ) : (
          recentOrders.map((o) => <OrderMiniCard key={o.id} order={o} />)
        )}

        <View style={styles.bottomPad} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  color,
  loading,
}: {
  label: string;
  value: number;
  color: string;
  loading: boolean;
}) {
  return (
    <View style={[styles.statCard, { borderTopColor: color }]}>
      {loading ? (
        <ActivityIndicator size="small" color={color} />
      ) : (
        <Text style={[styles.statValue, { color }]}>{value}</Text>
      )}
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function QuickAction({
  emoji,
  label,
  onPress,
}: {
  emoji: string;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.actionCard} onPress={onPress} activeOpacity={0.75}>
      <Text style={styles.actionEmoji}>{emoji}</Text>
      <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function OrderMiniCard({ order }: { order: OrderDTO }) {
  const statusColor = ORDER_STATUS_COLORS[order.status] ?? '#757575';
  return (
    <View style={styles.miniCard}>
      <View style={styles.miniCardLeft}>
        <Text style={styles.miniCardId} numberOfLines={1}>
          Order #{order.id.slice(-8).toUpperCase()}
        </Text>
        <Text style={styles.miniCardSub}>
          {new Date(order.created_at).toLocaleDateString()} · Qty {order.quantity}
        </Text>
      </View>
      <View style={styles.miniCardRight}>
        <Text style={styles.miniCardPrice}>
          ${order.total_price.toFixed(2)}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + '18' }]}>
          <Text style={[styles.statusBadgeText, { color: statusColor }]}>
            {ORDER_STATUS_LABELS[order.status]}
          </Text>
        </View>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#E3F2FD' },
  scroll: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: '#1565C0',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 28,
  },
  greeting: { fontSize: 13, color: '#90CAF9', fontWeight: '500' },
  name: { fontSize: 22, fontWeight: '800', color: '#fff', marginTop: 2 },
  userId: { fontSize: 12, color: '#64B5F6', marginTop: 2 },
  logoutBtn: {
    backgroundColor: '#0D47A1',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    marginTop: 4,
  },
  logoutText: { color: '#fff', fontSize: 13, fontWeight: '600' },

  // Spending Banner
  spendBanner: {
    backgroundColor: '#1976D2',
    marginHorizontal: 16,
    marginTop: -14,
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#1565C0',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  spendLabel: { fontSize: 13, color: '#BBDEFB', fontWeight: '500' },
  spendValue: { fontSize: 32, fontWeight: '800', color: '#fff', marginVertical: 4 },
  spendSub: { fontSize: 12, color: '#90CAF9' },

  // Stats
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    borderTopWidth: 3,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  statValue: { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 11, color: '#757575', marginTop: 2, fontWeight: '500' },

  // Section
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0D47A1',
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 10,
  },
  seeAll: { fontSize: 13, color: '#1565C0', fontWeight: '600' },

  // Quick Actions
  actionsRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  actionEmoji: { fontSize: 28, marginBottom: 6 },
  actionLabel: { fontSize: 13, fontWeight: '600', color: '#1565C0', textAlign: 'center' },

  // Mini Cards
  miniCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  miniCardLeft: { flex: 1, marginRight: 12 },
  miniCardId: { fontSize: 14, fontWeight: '700', color: '#0D47A1' },
  miniCardSub: { fontSize: 12, color: '#757575', marginTop: 2 },
  miniCardRight: { alignItems: 'flex-end' },
  miniCardPrice: { fontSize: 15, fontWeight: '800', color: '#1565C0' },
  statusBadge: {
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 4,
  },
  statusBadgeText: { fontSize: 11, fontWeight: '600' },

  // Empty / Error
  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 24,
    marginHorizontal: 16,
    alignItems: 'center',
    elevation: 1,
  },
  emptyEmoji: { fontSize: 36, marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#9E9E9E', marginBottom: 12 },
  emptyBtn: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  emptyBtnText: { fontSize: 13, color: '#1565C0', fontWeight: '600' },
  errorCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginHorizontal: 16,
    alignItems: 'center',
  },
  errorText: { fontSize: 13, color: '#B71C1C', marginBottom: 10 },
  retryBtn: {
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
  },
  retryText: { fontSize: 13, color: '#B71C1C', fontWeight: '600' },

  loader: { marginVertical: 16 },
  bottomPad: { height: 32 },
});
