import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrator',
  MANAGER: 'Manager',
  AGENT: 'Agent',
};

export default function AdminDashboardScreen() {
  const { user, logout } = useAuth();
  const roleLabel = ROLE_LABELS[user?.role ?? ''] ?? user?.role ?? 'Admin';

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{roleLabel}</Text>
            <Text style={styles.name}>{user?.name ?? 'Admin'}</Text>
            {user?.system_user_id && <Text style={styles.userId}>{user.system_user_id}</Text>}
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Coming Soon Banner */}
        <View style={styles.banner}>
          <Text style={styles.bannerEmoji}>🛠️</Text>
          <Text style={styles.bannerTitle}>Admin Panel</Text>
          <Text style={styles.bannerSub}>
            Full admin controls are coming soon. You currently have elevated access to the marketplace.
          </Text>
        </View>

        {/* Quick Access */}
        <Text style={styles.sectionTitle}>Quick Access</Text>
        <View style={styles.grid}>
          <AdminCard emoji="🌾" label="Products" sub="Browse catalog" />
          <AdminCard emoji="📦" label="Orders" sub="View all orders" />
          <AdminCard emoji="🚚" label="Deliveries" sub="Track shipments" />
          <AdminCard emoji="👥" label="Users" sub="Coming soon" disabled />
          <AdminCard emoji="📊" label="Reports" sub="Coming soon" disabled />
          <AdminCard emoji="⚙️" label="Settings" sub="Coming soon" disabled />
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function AdminCard({
  emoji,
  label,
  sub,
  disabled = false,
}: {
  emoji: string;
  label: string;
  sub: string;
  disabled?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[styles.card, disabled && styles.cardDisabled]}
      activeOpacity={disabled ? 1 : 0.75}
      disabled={disabled}
    >
      <Text style={styles.cardEmoji}>{emoji}</Text>
      <Text style={[styles.cardLabel, disabled && styles.cardLabelDisabled]}>{label}</Text>
      <Text style={styles.cardSub}>{sub}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F3E5F5' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    backgroundColor: '#4A148C', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 24,
  },
  greeting: { fontSize: 13, color: '#CE93D8', fontWeight: '500' },
  name: { fontSize: 22, fontWeight: '800', color: '#fff', marginTop: 2 },
  userId: { fontSize: 12, color: '#BA68C8', marginTop: 2 },
  logoutBtn: { backgroundColor: '#38006B', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, marginTop: 4 },
  logoutText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  banner: {
    backgroundColor: '#fff', borderRadius: 14, margin: 16, padding: 24,
    alignItems: 'center', elevation: 2,
  },
  bannerEmoji: { fontSize: 40, marginBottom: 10 },
  bannerTitle: { fontSize: 20, fontWeight: '800', color: '#4A148C', marginBottom: 8 },
  bannerSub: { fontSize: 14, color: '#757575', textAlign: 'center', lineHeight: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#4A148C', marginHorizontal: 16, marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: 12, gap: 10 },
  card: {
    width: '30%', backgroundColor: '#fff', borderRadius: 12, padding: 14,
    alignItems: 'center', elevation: 1, flexGrow: 1,
  },
  cardDisabled: { backgroundColor: '#F5F5F5', opacity: 0.6 },
  cardEmoji: { fontSize: 28, marginBottom: 6 },
  cardLabel: { fontSize: 13, fontWeight: '700', color: '#4A148C', textAlign: 'center' },
  cardLabelDisabled: { color: '#9E9E9E' },
  cardSub: { fontSize: 11, color: '#9E9E9E', marginTop: 2, textAlign: 'center' },
});
