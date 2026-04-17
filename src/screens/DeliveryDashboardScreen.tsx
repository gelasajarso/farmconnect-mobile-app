import React, { useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, ActivityIndicator, Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import { useDeliveries } from '../hooks/useDeliveries';
import { DELIVERY_STATUS_LABELS } from '../utils/enumLabels';
import type { DeliveryStackParamList } from '../navigation/types';
import type { DeliveryResponse, DeliveryStatus } from '../types';

type DashNavProp = StackNavigationProp<DeliveryStackParamList, 'DeliveryDashboard'>;

const STATUS_COLORS: Record<DeliveryStatus, string> = {
  ASSIGNED: '#1565C0', PICKED_UP: '#6A1B9A', IN_TRANSIT: '#E65100',
  DELIVERED: '#1A7A35', FAILED: '#B71C1C', CANCELLED: '#757575',
};

export default function DeliveryDashboardScreen() {
  const navigation = useNavigation<DashNavProp>();
  const { user, logout } = useAuth();
  const { deliveries, loading, error, refetch } = useDeliveries();

  const stats = useMemo(() => ({
    total:     deliveries.length,
    active:    deliveries.filter(d => ['ASSIGNED','PICKED_UP','IN_TRANSIT'].includes(d.status)).length,
    delivered: deliveries.filter(d => d.status === 'DELIVERED').length,
    failed:    deliveries.filter(d => d.status === 'FAILED').length,
  }), [deliveries]);

  const initials = (user?.name ?? 'D').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>On the road 🚚</Text>
            <Text style={styles.name}>{user?.name ?? 'Agent'}</Text>
            {user?.system_user_id && <Text style={styles.userId}>{user.system_user_id}</Text>}
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.8}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsGrid}>
          <StatCard label="Total"     value={stats.total}     color="#1A7A35" bg="#F0FBF3" loading={loading} />
          <StatCard label="Active"    value={stats.active}    color="#1565C0" bg="#E3F2FD" loading={loading} />
          <StatCard label="Delivered" value={stats.delivered} color="#1A7A35" bg="#F0FBF3" loading={loading} />
          <StatCard label="Failed"    value={stats.failed}    color="#B71C1C" bg="#FFEBEE" loading={loading} />
        </View>

        {/* Quick Actions */}
        <SectionHeader title="Quick Actions" />
        <View style={styles.actionsRow}>
          <ActionCard emoji="📋" label="Assignments"  onPress={() => navigation.navigate('DeliveryAssignmentsList')} />
          <ActionCard emoji="🗺️" label="Active Routes" onPress={() => navigation.navigate('DeliveryAssignmentsList')} />
          <ActionCard emoji="🛒" label="Marketplace"  onPress={() => navigation.getParent()?.navigate('HomeStack')} />
          <ActionCard emoji="👤" label="Profile"      onPress={() => navigation.navigate('Profile')} />
        </View>

        {/* Recent Assignments */}
        <SectionHeader title="Recent Assignments" onSeeAll={() => navigation.navigate('DeliveryAssignmentsList')} />
        {loading ? (
          <ActivityIndicator color="#1A7A35" style={styles.loader} />
        ) : error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={refetch} style={styles.retryBtn}><Text style={styles.retryText}>Retry</Text></TouchableOpacity>
          </View>
        ) : deliveries.length === 0 ? (
          <View style={styles.emptyCard}><Text style={styles.emptyText}>No assignments yet.</Text></View>
        ) : (
          deliveries.slice(0, 4).map(d => <DeliveryRow key={d.id} item={d} />)
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

function StatCard({ label, value, color, bg, loading }: { label: string; value: number; color: string; bg: string; loading: boolean }) {
  return (
    <View style={[styles.statCard, { backgroundColor: bg }]}>
      {loading ? <ActivityIndicator size="small" color={color} /> : <Text style={[styles.statValue, { color }]}>{value}</Text>}
      <Text style={styles.statLabel}>{label}</Text>
    </View>
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

function DeliveryRow({ item }: { item: DeliveryResponse }) {
  const color = STATUS_COLORS[item.status];
  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <Text style={styles.rowTitle}>Delivery #{item.id.slice(-8).toUpperCase()}</Text>
        <Text style={styles.rowSub}>Order: {item.order_id.slice(-8).toUpperCase()}</Text>
        {item.pickup_time && <Text style={styles.rowSub}>Pickup: {new Date(item.pickup_time).toLocaleDateString()}</Text>}
      </View>
      <View style={[styles.badge, { backgroundColor: color + '18' }]}>
        <Text style={[styles.badgeText, { color }]}>{DELIVERY_STATUS_LABELS[item.status]}</Text>
      </View>
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

  statsGrid: { flexDirection: 'row', marginHorizontal: 16, marginTop: 16, gap: 8 },
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
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 12, padding: 14, marginHorizontal: 16, marginBottom: 8,
    borderWidth: 1, borderColor: '#F0F0F0',
    shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 3, shadowOffset: { width: 0, height: 1 }, elevation: 1,
  },
  rowLeft: { flex: 1, marginRight: 12 },
  rowTitle: { fontSize: 14, fontWeight: '700', color: '#0D1B0F' },
  rowSub: { fontSize: 12, color: '#9E9E9E', marginTop: 2 },
  badge: { borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { fontSize: 11, fontWeight: '600' },

  emptyCard: { backgroundColor: '#fff', borderRadius: 12, padding: 20, marginHorizontal: 16, alignItems: 'center', borderWidth: 1, borderColor: '#F0F0F0' },
  emptyText: { fontSize: 14, color: '#9E9E9E' },

  errorCard: { backgroundColor: '#FFEBEE', borderRadius: 12, padding: 16, marginHorizontal: 16, alignItems: 'center' },
  errorText: { fontSize: 13, color: '#B71C1C', marginBottom: 10 },
  retryBtn: { backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20 },
  retryText: { fontSize: 13, color: '#B71C1C', fontWeight: '600' },

  loader: { marginVertical: 20 },
  bottomPad: { height: 40 },
});
