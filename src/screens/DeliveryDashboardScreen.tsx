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
import { useDeliveries } from '../hooks/useDeliveries';
import { DELIVERY_STATUS_LABELS } from '../utils/enumLabels';
import type { DeliveryTabParamList } from '../navigation/types';
import type { DeliveryResponse, DeliveryStatus } from '../types';

type DashNavProp = BottomTabNavigationProp<DeliveryTabParamList>;

const STATUS_COLORS: Record<DeliveryStatus, string> = {
  ASSIGNED: '#1565C0',
  PICKED_UP: '#6A1B9A',
  IN_TRANSIT: '#00838F',
  DELIVERED: '#2E7D32',
  FAILED: '#B71C1C',
  CANCELLED: '#757575',
};

export default function DeliveryDashboardScreen() {
  const navigation = useNavigation<DashNavProp>();
  const { user, logout } = useAuth();
  const { deliveries, loading, error, refetch } = useDeliveries();

  const stats = useMemo(() => ({
    total: deliveries.length,
    active: deliveries.filter((d) => ['ASSIGNED', 'PICKED_UP', 'IN_TRANSIT'].includes(d.status)).length,
    delivered: deliveries.filter((d) => d.status === 'DELIVERED').length,
    failed: deliveries.filter((d) => d.status === 'FAILED').length,
  }), [deliveries]);

  const recent = deliveries.slice(0, 4);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>On the road,</Text>
            <Text style={styles.name}>{user?.name ?? 'Agent'}</Text>
            {user?.system_user_id && <Text style={styles.userId}>{user.system_user_id}</Text>}
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <StatCard label="Total" value={stats.total} color="#00838F" loading={loading} />
          <StatCard label="Active" value={stats.active} color="#1565C0" loading={loading} />
          <StatCard label="Delivered" value={stats.delivered} color="#2E7D32" loading={loading} />
          <StatCard label="Failed" value={stats.failed} color="#B71C1C" loading={loading} />
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsRow}>
          <QuickAction emoji="📋" label="All Assignments" onPress={() => navigation.navigate('DeliveryAssignments')} />
          <QuickAction emoji="🗺️" label="Active Routes" onPress={() => navigation.navigate('DeliveryAssignments')} />
          <QuickAction emoji="🛒" label="Marketplace" onPress={() => navigation.navigate('HomeStack')} />
        </View>

        {/* Recent Assignments */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Assignments</Text>
          <TouchableOpacity onPress={() => navigation.navigate('DeliveryAssignments')}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color="#00838F" style={styles.loader} />
        ) : error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={refetch} style={styles.retryBtn}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : recent.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>🚚</Text>
            <Text style={styles.emptyText}>No assignments yet.</Text>
          </View>
        ) : (
          recent.map((d) => <DeliveryMiniCard key={d.id} item={d} />)
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ label, value, color, loading }: { label: string; value: number; color: string; loading: boolean }) {
  return (
    <View style={[styles.statCard, { borderTopColor: color }]}>
      {loading ? <ActivityIndicator size="small" color={color} /> : <Text style={[styles.statValue, { color }]}>{value}</Text>}
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function QuickAction({ emoji, label, onPress }: { emoji: string; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.actionCard} onPress={onPress} activeOpacity={0.75}>
      <Text style={styles.actionEmoji}>{emoji}</Text>
      <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function DeliveryMiniCard({ item }: { item: DeliveryResponse }) {
  const color = STATUS_COLORS[item.status];
  return (
    <View style={styles.miniCard}>
      <View style={{ flex: 1, marginRight: 12 }}>
        <Text style={styles.miniCardId}>Delivery #{item.id.slice(-8).toUpperCase()}</Text>
        <Text style={styles.miniCardSub}>Order: {item.order_id.slice(-8).toUpperCase()}</Text>
        {item.pickup_time && <Text style={styles.miniCardSub}>Pickup: {new Date(item.pickup_time).toLocaleDateString()}</Text>}
      </View>
      <View style={[styles.statusBadge, { backgroundColor: color + '18' }]}>
        <Text style={[styles.statusBadgeText, { color }]}>{DELIVERY_STATUS_LABELS[item.status]}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#E0F7FA' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    backgroundColor: '#00695C', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 24,
  },
  greeting: { fontSize: 13, color: '#80CBC4', fontWeight: '500' },
  name: { fontSize: 22, fontWeight: '800', color: '#fff', marginTop: 2 },
  userId: { fontSize: 12, color: '#4DB6AC', marginTop: 2 },
  logoutBtn: { backgroundColor: '#004D40', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, marginTop: 4 },
  logoutText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  statsRow: { flexDirection: 'row', marginHorizontal: 16, marginTop: 16, gap: 8 },
  statCard: {
    flex: 1, backgroundColor: '#fff', borderRadius: 10, paddingVertical: 12,
    alignItems: 'center', borderTopWidth: 3, elevation: 2,
  },
  statValue: { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 11, color: '#757575', marginTop: 2, fontWeight: '500' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#004D40', marginHorizontal: 16, marginTop: 24, marginBottom: 10 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 16, marginTop: 24, marginBottom: 10 },
  seeAll: { fontSize: 13, color: '#00695C', fontWeight: '600' },
  actionsRow: { flexDirection: 'row', marginHorizontal: 16, gap: 10 },
  actionCard: {
    flex: 1, backgroundColor: '#fff', borderRadius: 12, paddingVertical: 16,
    alignItems: 'center', elevation: 1,
  },
  actionEmoji: { fontSize: 26, marginBottom: 6 },
  actionLabel: { fontSize: 12, fontWeight: '600', color: '#00695C', textAlign: 'center' },
  miniCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 10, padding: 14, marginHorizontal: 16, marginBottom: 8, elevation: 1,
  },
  miniCardId: { fontSize: 14, fontWeight: '700', color: '#004D40' },
  miniCardSub: { fontSize: 12, color: '#757575', marginTop: 2 },
  statusBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  statusBadgeText: { fontSize: 11, fontWeight: '600' },
  emptyCard: { backgroundColor: '#fff', borderRadius: 10, padding: 24, marginHorizontal: 16, alignItems: 'center' },
  emptyEmoji: { fontSize: 36, marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#9E9E9E' },
  errorCard: { backgroundColor: '#fff', borderRadius: 10, padding: 20, marginHorizontal: 16, alignItems: 'center' },
  errorText: { fontSize: 13, color: '#B71C1C', marginBottom: 10 },
  retryBtn: { backgroundColor: '#FFEBEE', paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20 },
  retryText: { fontSize: 13, color: '#B71C1C', fontWeight: '600' },
  loader: { marginVertical: 16 },
});
