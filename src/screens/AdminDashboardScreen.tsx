import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, Platform,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrator', MANAGER: 'Manager', AGENT: 'Agent',
};

const GRID_ITEMS = [
  { emoji: '🌾', label: 'Products',   sub: 'Browse catalog',   disabled: false },
  { emoji: '📦', label: 'Orders',     sub: 'View all orders',  disabled: false },
  { emoji: '🚚', label: 'Deliveries', sub: 'Track shipments',  disabled: false },
  { emoji: '👥', label: 'Users',      sub: 'Coming soon',      disabled: true  },
  { emoji: '📊', label: 'Reports',    sub: 'Coming soon',      disabled: true  },
  { emoji: '⚙️', label: 'Settings',   sub: 'Coming soon',      disabled: true  },
];

export default function AdminDashboardScreen() {
  const { user, logout } = useAuth();
  const roleLabel = ROLE_LABELS[user?.role ?? ''] ?? user?.role ?? 'Admin';
  const initials = (user?.name ?? 'A').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>{roleLabel}</Text>
            <Text style={styles.name}>{user?.name ?? 'Admin'}</Text>
            {user?.system_user_id && <Text style={styles.userId}>{user.system_user_id}</Text>}
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.8}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Status banner */}
        <View style={styles.banner}>
          <View style={styles.bannerIconWrap}>
            <Text style={styles.bannerIcon}>🛠️</Text>
          </View>
          <View style={styles.bannerBody}>
            <Text style={styles.bannerTitle}>Admin Panel</Text>
            <Text style={styles.bannerSub}>
              Full controls coming soon. You have elevated marketplace access.
            </Text>
          </View>
        </View>

        {/* Grid */}
        <Text style={styles.sectionTitle}>Quick Access</Text>
        <View style={styles.grid}>
          {GRID_ITEMS.map(item => (
            <TouchableOpacity
              key={item.label}
              style={[styles.gridCard, item.disabled && styles.gridCardDisabled]}
              activeOpacity={item.disabled ? 1 : 0.75}
              disabled={item.disabled}
            >
              <View style={[styles.gridIconWrap, item.disabled && styles.gridIconWrapDisabled]}>
                <Text style={styles.gridEmoji}>{item.emoji}</Text>
              </View>
              <Text style={[styles.gridLabel, item.disabled && styles.gridLabelDisabled]}>{item.label}</Text>
              <Text style={styles.gridSub}>{item.sub}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
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

  banner: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 14,
    margin: 16, padding: 16,
    borderWidth: 1, borderColor: '#E8F5E9',
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 1,
  },
  bannerIconWrap: {
    width: 52, height: 52, borderRadius: 14,
    backgroundColor: '#F0FBF3', justifyContent: 'center',
    alignItems: 'center', marginRight: 14,
  },
  bannerIcon: { fontSize: 26 },
  bannerBody: { flex: 1 },
  bannerTitle: { fontSize: 16, fontWeight: '700', color: '#0D1B0F', marginBottom: 4 },
  bannerSub: { fontSize: 13, color: '#888', lineHeight: 18 },

  sectionTitle: {
    fontSize: 15, fontWeight: '700', color: '#0D1B0F',
    marginHorizontal: 20, marginBottom: 12, letterSpacing: -0.2,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: 12, gap: 10 },
  gridCard: {
    width: '30%', flexGrow: 1, backgroundColor: '#fff',
    borderRadius: 14, padding: 14, alignItems: 'center',
    borderWidth: 1, borderColor: '#F0F0F0',
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 1,
  },
  gridCardDisabled: { backgroundColor: '#FAFAFA', opacity: 0.55 },
  gridIconWrap: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: '#F0FBF3', justifyContent: 'center',
    alignItems: 'center', marginBottom: 8,
  },
  gridIconWrapDisabled: { backgroundColor: '#F5F5F5' },
  gridEmoji: { fontSize: 22 },
  gridLabel: { fontSize: 13, fontWeight: '700', color: '#0D1B0F', textAlign: 'center' },
  gridLabelDisabled: { color: '#BDBDBD' },
  gridSub: { fontSize: 11, color: '#9E9E9E', marginTop: 3, textAlign: 'center' },
});
