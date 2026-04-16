import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, Platform, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import { getAllUsers, getAllProducts, getAllOrders, getAllDeliveries } from '../services/admin.service';
import { extractApiError } from '../utils/errorHandling';
import type { AdminStackParamList } from '../navigation/types';

type NavProp = StackNavigationProp<AdminStackParamList, 'AdminDashboard'>;

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrator', MANAGER: 'Manager', AGENT: 'Agent',
};

export default function AdminDashboardScreen() {
  const navigation = useNavigation<NavProp>();
  const { user, logout } = useAuth();
  const roleLabel = ROLE_LABELS[user?.role ?? ''] ?? user?.role ?? 'Admin';
  const initials = (user?.name ?? 'A').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  const [stats, setStats] = useState({ users: 0, products: 0, orders: 0, deliveries: 0, revenue: 0, activeDeliveries: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadStats = useCallback(async () => {
    setError('');
    try {
      const [users, products, orders, deliveries] = await Promise.all([
        getAllUsers(), getAllProducts(), getAllOrders(), getAllDeliveries(),
      ]);
      setStats({
        users:           users.length,
        products:        products.length,
        orders:          orders.length,
        deliveries:      deliveries.length,
        revenue:         orders.filter(o => ['COMPLETED','DELIVERED'].includes(o.status)).reduce((s, o) => s + o.total_price, 0),
        activeDeliveries: deliveries.filter(d => ['ASSIGNED','PICKED_UP','IN_TRANSIT'].includes(d.status)).length,
      });
    } catch (err) {
      setError(extractApiError(err).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  }, [loadStats]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1A7A35" />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>{roleLabel} 🛠️</Text>
            <Text style={styles.name}>{user?.name ?? 'Admin'}</Text>
            {user?.system_user_id && <Text style={styles.userId}>{user.system_user_id}</Text>}
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.8}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Revenue banner */}
        <View style={styles.revenueBanner}>
          <Text style={styles.revenueLabel}>Platform Revenue</Text>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.revenueValue}>${stats.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</Text>
          }
          <Text style={styles.revenueSub}>from completed orders</Text>
        </View>

        {/* Stats grid — tappable */}
        {error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={loadStats} style={styles.retryBtn}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.statsGrid}>
            <StatCard label="Users"      value={stats.users}            color="#1A7A35" bg="#F0FBF3" loading={loading} onPress={() => navigation.navigate('AdminUsers')} />
            <StatCard label="Products"   value={stats.products}         color="#1565C0" bg="#E3F2FD" loading={loading} onPress={() => navigation.navigate('AdminProducts')} />
            <StatCard label="Orders"     value={stats.orders}           color="#E65100" bg="#FFF3E0" loading={loading} onPress={() => navigation.navigate('AdminOrders')} />
            <StatCard label="Deliveries" value={stats.activeDeliveries} color="#6A1B9A" bg="#F3E5F5" loading={loading} onPress={() => navigation.navigate('AdminDeliveries')} />
          </View>
        )}

        {/* Management sections */}
        <SectionHeader title="Management" />
        <View style={styles.menuList}>
          <MenuRow
            emoji="👥" label="Users" sub={`${stats.users} registered accounts`}
            onPress={() => navigation.navigate('AdminUsers')}
          />
          <MenuRow
            emoji="🌾" label="Products" sub={`${stats.products} listings in catalog`}
            onPress={() => navigation.navigate('AdminProducts')}
          />
          <MenuRow
            emoji="📦" label="Orders" sub={`${stats.orders} total orders`}
            onPress={() => navigation.navigate('AdminOrders')}
          />
          <MenuRow
            emoji="🚚" label="Deliveries" sub={`${stats.activeDeliveries} active shipments`}
            onPress={() => navigation.navigate('AdminDeliveries')}
          />
          <MenuRow
            emoji="🔔" label="Notifications" sub="View system notifications"
            onPress={() => navigation.navigate('Notifications')}
          />
          <MenuRow
            emoji="👤" label="Profile" sub="View your admin profile"
            onPress={() => navigation.navigate('Profile')}
          />
          <MenuRow
            emoji="⚙️" label="Settings" sub="App preferences"
            onPress={() => navigation.navigate('Settings')}
            last
          />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({ title }: { title: string }) {
  return (
    <Text style={styles.sectionTitle}>{title}</Text>
  );
}

function StatCard({ label, value, color, bg, loading, onPress }: {
  label: string; value: number; color: string; bg: string; loading: boolean; onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.statCard, { backgroundColor: bg }]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      {loading
        ? <ActivityIndicator size="small" color={color} />
        : <Text style={[styles.statValue, { color }]}>{value}</Text>
      }
      <Text style={styles.statLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function MenuRow({ emoji, label, sub, onPress, last = false }: {
  emoji: string; label: string; sub: string; onPress: () => void; last?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[styles.menuRow, last && styles.menuRowLast]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={styles.menuIconWrap}>
        <Text style={styles.menuEmoji}>{emoji}</Text>
      </View>
      <View style={styles.menuBody}>
        <Text style={styles.menuLabel}>{label}</Text>
        <Text style={styles.menuSub}>{sub}</Text>
      </View>
      <Text style={styles.menuChevron}>›</Text>
    </TouchableOpacity>
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
    backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 8,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.35)',
  },
  logoutText: { color: '#fff', fontSize: 13, fontWeight: '700', letterSpacing: 0.3 },

  revenueBanner: {
    backgroundColor: '#25A244', borderRadius: 16,
    marginHorizontal: 16, marginTop: 16, padding: 20, alignItems: 'center',
    shadowColor: '#1A7A35', shadowOpacity: 0.25, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },
  revenueLabel: { fontSize: 12, color: 'rgba(255,255,255,0.75)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  revenueValue: { fontSize: 34, fontWeight: '800', color: '#fff', marginVertical: 4, letterSpacing: -1 },
  revenueSub: { fontSize: 12, color: 'rgba(255,255,255,0.65)' },

  statsGrid: { flexDirection: 'row', marginHorizontal: 16, marginTop: 14, gap: 8 },
  statCard: { flex: 1, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  statLabel: { fontSize: 11, color: '#888', marginTop: 3, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.3 },

  sectionTitle: {
    fontSize: 15, fontWeight: '700', color: '#0D1B0F',
    marginHorizontal: 20, marginTop: 28, marginBottom: 12, letterSpacing: -0.2,
  },

  menuList: {
    backgroundColor: '#fff', borderRadius: 16,
    marginHorizontal: 16, overflow: 'hidden',
    borderWidth: 1, borderColor: '#F0F0F0',
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 1,
  },
  menuRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#F5F5F5',
  },
  menuRowLast: { borderBottomWidth: 0 },
  menuIconWrap: {
    width: 42, height: 42, borderRadius: 12,
    backgroundColor: '#F0FBF3', justifyContent: 'center',
    alignItems: 'center', marginRight: 14,
  },
  menuEmoji: { fontSize: 20 },
  menuBody: { flex: 1 },
  menuLabel: { fontSize: 15, fontWeight: '700', color: '#0D1B0F' },
  menuSub: { fontSize: 12, color: '#9E9E9E', marginTop: 2 },
  menuChevron: { fontSize: 22, color: '#BDBDBD', fontWeight: '300' },

  errorCard: { backgroundColor: '#FFEBEE', borderRadius: 12, padding: 16, marginHorizontal: 16, marginTop: 14, alignItems: 'center' },
  errorText: { fontSize: 13, color: '#B71C1C', marginBottom: 10 },
  retryBtn: { backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20 },
  retryText: { fontSize: 13, color: '#B71C1C', fontWeight: '600' },
});
