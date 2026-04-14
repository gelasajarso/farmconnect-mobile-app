import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, ActivityIndicator, Platform, RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import { useFarmerProducts } from '../hooks/useProducts';
import { getOrders } from '../services/order.service';
import { extractApiError } from '../utils/errorHandling';
import { PRODUCT_STATUS_LABELS, CATEGORY_LABELS, ORDER_STATUS_LABELS } from '../utils/enumLabels';
import type { FarmerStackParamList } from '../navigation/types';
import type { ProductPublicDTO, OrderDTO, ProductStatus } from '../types';

type DashNavProp = StackNavigationProp<FarmerStackParamList, 'FarmerDashboard'>;

const STATUS_COLORS: Record<ProductStatus, string> = {
  AVAILABLE: '#1A7A35', LOW_STOCK: '#E65100',
  SOLD_OUT: '#B71C1C', EXPIRED: '#757575', DISCONTINUED: '#424242',
};

export default function FarmerDashboardScreen() {
  const navigation = useNavigation<DashNavProp>();
  const { user, logout } = useAuth();
  const farmerId = user?.system_user_id ?? null;
  const { products, loading: productsLoading, refetch: refetchProducts } = useFarmerProducts(farmerId);
  const [recentOrders, setRecentOrders] = useState<OrderDTO[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = useCallback(async () => {
    setOrdersLoading(true);
    setOrdersError('');
    try {
      const data = await getOrders();
      // Filter to only this farmer's orders
      const mine = farmerId
        ? data.filter(o => o.farmer_id === farmerId)
        : data;
      setRecentOrders(mine.slice(0, 3));
    } catch (err) {
      setOrdersError(extractApiError(err).message);
    } finally {
      setOrdersLoading(false);
    }
  }, [farmerId]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchProducts(), fetchOrders()]);
    setRefreshing(false);
  }, [refetchProducts, fetchOrders]);

  const stats = useMemo(() => ({
    total:   products.length,
    active:  products.filter(p => p.is_active).length,
    lowStock: products.filter(p => p.status === 'LOW_STOCK').length,
    soldOut:  products.filter(p => p.status === 'SOLD_OUT').length,
  }), [products]);

  const initials = (user?.name ?? 'F').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1A7A35" />}
      >

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>Good day 👋</Text>
            <Text style={styles.name}>{user?.name ?? 'Farmer'}</Text>
            {user?.system_user_id && <Text style={styles.userId}>{user.system_user_id}</Text>}
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.8}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsGrid}>
          <StatCard label="Total"     value={stats.total}    color="#1A7A35" bg="#F0FBF3" loading={productsLoading} />
          <StatCard label="Active"    value={stats.active}   color="#1A7A35" bg="#F0FBF3" loading={productsLoading} />
          <StatCard label="Low Stock" value={stats.lowStock} color="#E65100" bg="#FFF3E0" loading={productsLoading} />
          <StatCard label="Sold Out"  value={stats.soldOut}  color="#B71C1C" bg="#FFEBEE" loading={productsLoading} />
        </View>

        {/* Quick Actions */}
        <SectionHeader title="Quick Actions" />
        <View style={styles.actionsRow}>
          <ActionCard label="My Products" emoji="🌾" onPress={() => navigation.navigate('FarmerProductsList')} />
          <ActionCard label="Add Product" emoji="➕"  onPress={() => navigation.navigate('AddProduct')} />
          <ActionCard label="Marketplace" emoji="🛒"  onPress={() => navigation.getParent()?.navigate('HomeStack')} />
        </View>

        {/* Recent Listings */}
        <SectionHeader title="Recent Listings" onSeeAll={() => navigation.navigate('FarmerProductsList')} />
        {productsLoading ? (
          <ActivityIndicator color="#1A7A35" style={styles.loader} />
        ) : products.length === 0 ? (
          <EmptyCard message="No products yet." cta="Add your first product →" onCta={() => navigation.navigate('AddProduct')} />
        ) : (
          products.slice(0, 3).map(p => <ProductRow key={p.id} product={p} />)
        )}

        {/* Recent Orders */}
        <SectionHeader
          title="Recent Orders"
          onSeeAll={ordersError ? undefined : undefined}
        />
        {ordersLoading ? (
          <ActivityIndicator color="#1A7A35" style={styles.loader} />
        ) : ordersError ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{ordersError}</Text>
            <TouchableOpacity onPress={fetchOrders} style={styles.retryBtn}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : recentOrders.length === 0 ? (
          <EmptyCard message="No orders received yet." />
        ) : (
          recentOrders.map(o => <OrderRow key={o.id} order={o} />)
        )}

        <View style={styles.bottomPad} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({ title, onSeeAll }: { title: string; onSeeAll?: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {onSeeAll && <TouchableOpacity onPress={onSeeAll}><Text style={styles.seeAll}>See all →</Text></TouchableOpacity>}
    </View>
  );
}

function StatCard({ label, value, color, bg, loading }: { label: string; value: number; color: string; bg: string; loading: boolean }) {
  return (
    <View style={[styles.statCard, { backgroundColor: bg }]}>
      {loading ? <ActivityIndicator size="small" color={color} /> : <Text style={[styles.statValue, { color }]}>{value}</Text>}
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function ActionCard({ label, emoji, onPress }: { label: string; emoji: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.actionCard} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.actionIconWrap}><Text style={styles.actionEmoji}>{emoji}</Text></View>
      <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function ProductRow({ product }: { product: ProductPublicDTO }) {
  const color = product.status ? STATUS_COLORS[product.status] : '#1A7A35';
  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <Text style={styles.rowTitle} numberOfLines={1}>{product.name}</Text>
        <Text style={styles.rowSub}>{CATEGORY_LABELS[product.category]}</Text>
      </View>
      <View style={styles.rowRight}>
        <Text style={styles.rowPrice}>{product.currency} {product.base_price.toFixed(2)}</Text>
        {product.status && (
          <View style={[styles.badge, { backgroundColor: color + '18' }]}>
            <Text style={[styles.badgeText, { color }]}>{PRODUCT_STATUS_LABELS[product.status]}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

function OrderRow({ order }: { order: OrderDTO }) {
  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <Text style={styles.rowTitle}>Order #{order.id.slice(-8).toUpperCase()}</Text>
        <Text style={styles.rowSub}>{new Date(order.created_at).toLocaleDateString()}</Text>
      </View>
      <View style={styles.rowRight}>
        <Text style={styles.rowPrice}>${order.total_price.toFixed(2)}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{ORDER_STATUS_LABELS[order.status]}</Text>
        </View>
      </View>
    </View>
  );
}

function EmptyCard({ message, cta, onCta }: { message: string; cta?: string; onCta?: () => void }) {
  return (
    <View style={styles.emptyCard}>
      <Text style={styles.emptyText}>{message}</Text>
      {cta && onCta && (
        <TouchableOpacity onPress={onCta} style={styles.emptyBtn}>
          <Text style={styles.emptyBtnText}>{cta}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

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

  statsGrid: { flexDirection: 'row', marginHorizontal: 16, marginTop: 16, gap: 8 },
  statCard: {
    flex: 1, borderRadius: 12, paddingVertical: 14,
    alignItems: 'center', borderWidth: 1, borderColor: 'transparent',
  },
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
  actionIconWrap: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: '#F0FBF3', justifyContent: 'center', alignItems: 'center', marginBottom: 8,
  },
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
  badge: {
    backgroundColor: '#E8F5E9', borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 3, marginTop: 4,
  },
  badgeText: { fontSize: 11, fontWeight: '600', color: '#1A7A35' },

  emptyCard: {
    backgroundColor: '#fff', borderRadius: 12, padding: 20,
    marginHorizontal: 16, alignItems: 'center',
    borderWidth: 1, borderColor: '#F0F0F0',
  },
  emptyText: { fontSize: 14, color: '#9E9E9E', marginBottom: 10 },
  emptyBtn: { backgroundColor: '#F0FBF3', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  emptyBtnText: { fontSize: 13, color: '#1A7A35', fontWeight: '600' },

  errorCard: { backgroundColor: '#FFEBEE', borderRadius: 12, padding: 16, marginHorizontal: 16, alignItems: 'center' },
  errorText: { fontSize: 13, color: '#B71C1C', textAlign: 'center', marginBottom: 10 },
  retryBtn: { backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20 },
  retryText: { fontSize: 13, color: '#B71C1C', fontWeight: '600' },

  loader: { marginVertical: 20 },
  bottomPad: { height: 40 },
});
