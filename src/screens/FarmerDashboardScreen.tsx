import React, { useEffect, useState } from 'react';
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
import { useFarmerProducts } from '../hooks/useProducts';
import { getOrders } from '../services/order.service';
import { extractApiError } from '../utils/errorHandling';
import { PRODUCT_STATUS_LABELS, CATEGORY_LABELS } from '../utils/enumLabels';
import type { FarmerTabParamList } from '../navigation/types';
import type { ProductPublicDTO, OrderDTO, ProductStatus } from '../types';

type DashNavProp = BottomTabNavigationProp<FarmerTabParamList>;

// Status badge color map
const STATUS_COLORS: Record<ProductStatus, string> = {
  AVAILABLE: '#2E7D32',
  LOW_STOCK: '#F57F17',
  SOLD_OUT: '#B71C1C',
  EXPIRED: '#757575',
  DISCONTINUED: '#424242',
};

export default function FarmerDashboardScreen() {
  const navigation = useNavigation<DashNavProp>();
  const { user, logout } = useAuth();

  const farmerId = user?.system_user_id ?? null;
  const { products, loading: productsLoading } = useFarmerProducts(farmerId);

  const [recentOrders, setRecentOrders] = useState<OrderDTO[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState('');

  useEffect(() => {
    async function fetchOrders() {
      setOrdersLoading(true);
      setOrdersError('');
      try {
        const data = await getOrders();
        // Show only the 3 most recent
        setRecentOrders(data.slice(0, 3));
      } catch (err) {
        setOrdersError(extractApiError(err).message);
      } finally {
        setOrdersLoading(false);
      }
    }
    fetchOrders();
  }, []);

  // Derived stats
  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p.is_active).length;
  const lowStockProducts = products.filter((p) => p.status === 'LOW_STOCK').length;
  const soldOutProducts = products.filter((p) => p.status === 'SOLD_OUT').length;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good day,</Text>
            <Text style={styles.name}>{user?.name ?? 'Farmer'}</Text>
            {user?.system_user_id && (
              <Text style={styles.userId}>{user.system_user_id}</Text>
            )}
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* ── Stats Row ── */}
        <View style={styles.statsRow}>
          <StatCard label="Total" value={totalProducts} color="#1B5E20" loading={productsLoading} />
          <StatCard label="Active" value={activeProducts} color="#2E7D32" loading={productsLoading} />
          <StatCard label="Low Stock" value={lowStockProducts} color="#F57F17" loading={productsLoading} />
          <StatCard label="Sold Out" value={soldOutProducts} color="#B71C1C" loading={productsLoading} />
        </View>

        {/* ── Quick Actions ── */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsRow}>
          <QuickAction
            label="My Products"
            emoji="🌾"
            onPress={() => navigation.navigate('FarmerProductsStack')}
          />
          <QuickAction
            label="Add Product"
            emoji="➕"
            onPress={() => navigation.navigate('FarmerProductsStack')}
          />
          <QuickAction
            label="Marketplace"
            emoji="🛒"
            onPress={() => navigation.navigate('HomeStack')}
          />
        </View>

        {/* ── Recent Listings ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Listings</Text>
          <TouchableOpacity onPress={() => navigation.navigate('FarmerProductsStack')}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        {productsLoading ? (
          <ActivityIndicator color="#2E7D32" style={styles.loader} />
        ) : products.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No products yet.</Text>
            <TouchableOpacity
              style={styles.emptyBtn}
              onPress={() => navigation.navigate('FarmerProductsStack')}
            >
              <Text style={styles.emptyBtnText}>Add your first product →</Text>
            </TouchableOpacity>
          </View>
        ) : (
          products.slice(0, 3).map((p) => <ProductMiniCard key={p.id} product={p} />)
        )}

        {/* ── Recent Orders ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Orders</Text>
        </View>

        {ordersLoading ? (
          <ActivityIndicator color="#2E7D32" style={styles.loader} />
        ) : ordersError ? (
          <View style={styles.emptyCard}>
            <Text style={styles.errorText}>{ordersError}</Text>
          </View>
        ) : recentOrders.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No orders received yet.</Text>
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
  label,
  emoji,
  onPress,
}: {
  label: string;
  emoji: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.actionCard} onPress={onPress} activeOpacity={0.75}>
      <Text style={styles.actionEmoji}>{emoji}</Text>
      <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function ProductMiniCard({ product }: { product: ProductPublicDTO }) {
  const statusColor = product.status ? STATUS_COLORS[product.status] : '#2E7D32';
  return (
    <View style={styles.miniCard}>
      <View style={styles.miniCardLeft}>
        <Text style={styles.miniCardName} numberOfLines={1}>{product.name}</Text>
        <Text style={styles.miniCardSub}>{CATEGORY_LABELS[product.category]}</Text>
      </View>
      <View style={styles.miniCardRight}>
        <Text style={styles.miniCardPrice}>
          {product.currency} {product.base_price.toFixed(2)}
        </Text>
        {product.status && (
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '22' }]}>
            <Text style={[styles.statusBadgeText, { color: statusColor }]}>
              {PRODUCT_STATUS_LABELS[product.status]}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

function OrderMiniCard({ order }: { order: OrderDTO }) {
  return (
    <View style={styles.miniCard}>
      <View style={styles.miniCardLeft}>
        <Text style={styles.miniCardName} numberOfLines={1}>Order #{order.id.slice(-8)}</Text>
        <Text style={styles.miniCardSub}>{new Date(order.created_at).toLocaleDateString()}</Text>
      </View>
      <View style={styles.miniCardRight}>
        <Text style={styles.miniCardPrice}>
          {order.total_price.toFixed(2)}
        </Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusBadgeText}>{order.status}</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F1F8E9' },
  scroll: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: '#2E7D32',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  greeting: { fontSize: 13, color: '#C8E6C9', fontWeight: '500' },
  name: { fontSize: 22, fontWeight: '800', color: '#fff', marginTop: 2 },
  userId: { fontSize: 12, color: '#A5D6A7', marginTop: 2 },
  logoutBtn: {
    backgroundColor: '#1B5E20',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    marginTop: 4,
  },
  logoutText: { color: '#fff', fontSize: 13, fontWeight: '600' },

  // Stats
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: -12,
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
    color: '#1B5E20',
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
  seeAll: { fontSize: 13, color: '#2E7D32', fontWeight: '600' },

  // Quick Actions
  actionsRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    gap: 10,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  actionEmoji: { fontSize: 26, marginBottom: 6 },
  actionLabel: { fontSize: 12, fontWeight: '600', color: '#33691E', textAlign: 'center' },

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
  miniCardName: { fontSize: 14, fontWeight: '700', color: '#1B5E20' },
  miniCardSub: { fontSize: 12, color: '#757575', marginTop: 2 },
  miniCardRight: { alignItems: 'flex-end' },
  miniCardPrice: { fontSize: 14, fontWeight: '700', color: '#2E7D32' },

  // Status Badge
  statusBadge: {
    backgroundColor: '#E8F5E9',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 4,
  },
  statusBadgeText: { fontSize: 11, fontWeight: '600', color: '#2E7D32' },

  // Empty / Error
  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginHorizontal: 16,
    alignItems: 'center',
    elevation: 1,
  },
  emptyText: { fontSize: 14, color: '#9E9E9E', marginBottom: 10 },
  emptyBtn: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  emptyBtnText: { fontSize: 13, color: '#2E7D32', fontWeight: '600' },
  errorText: { fontSize: 13, color: '#B71C1C' },

  loader: { marginVertical: 16 },
  bottomPad: { height: 32 },
});
