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

const ROLE_COLORS: Record<string, string> = {
  FARMER: '#2E7D32',
  MERCHANT: '#1565C0',
  DELIVERY: '#00695C',
  ADMIN: '#4A148C',
  MANAGER: '#4A148C',
  AGENT: '#4A148C',
};

const ROLE_LABELS: Record<string, string> = {
  FARMER: 'Farmer',
  MERCHANT: 'Merchant',
  DELIVERY: 'Delivery Agent',
  ADMIN: 'Administrator',
  MANAGER: 'Manager',
  AGENT: 'Agent',
};

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const roleColor = ROLE_COLORS[user?.role ?? ''] ?? '#424242';
  const roleLabel = ROLE_LABELS[user?.role ?? ''] ?? user?.role ?? 'User';

  // Avatar initials
  const initials = (user?.name ?? 'U')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Avatar + Name */}
        <View style={[styles.hero, { backgroundColor: roleColor }]}>
          <View style={styles.avatar}>
            <Text style={[styles.avatarText, { color: roleColor }]}>{initials}</Text>
          </View>
          <Text style={styles.heroName}>{user?.name ?? 'User'}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>{roleLabel}</Text>
          </View>
        </View>

        {/* Info Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Info</Text>
          <InfoRow label="Email" value={user?.email ?? '—'} />
          <InfoRow label="Role" value={roleLabel} />
          {user?.system_user_id && (
            <InfoRow label="User ID" value={user.system_user_id} />
          )}
          <InfoRow label="Keycloak ID" value={user?.keycloak_id ? `${user.keycloak_id.slice(0, 16)}…` : '—'} />
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <TouchableOpacity style={styles.actionRow} onPress={logout}>
            <Text style={styles.actionIcon}>🚪</Text>
            <Text style={styles.actionLabel}>Sign Out</Text>
            <Text style={styles.actionChevron}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue} numberOfLines={1}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FAFAFA' },

  // Hero
  hero: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 28,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 3,
  },
  avatarText: { fontSize: 28, fontWeight: '800' },
  heroName: { fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 8 },
  roleBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 20,
  },
  roleBadgeText: { color: '#fff', fontSize: 13, fontWeight: '600' },

  // Section
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 16,
    paddingHorizontal: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9E9E9E',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    paddingTop: 14,
    paddingBottom: 6,
  },

  // Info Row
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 13,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  infoLabel: { fontSize: 14, color: '#757575', fontWeight: '500' },
  infoValue: { fontSize: 14, color: '#212121', fontWeight: '600', maxWidth: '60%', textAlign: 'right' },

  // Action Row
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  actionIcon: { fontSize: 18, marginRight: 12 },
  actionLabel: { flex: 1, fontSize: 15, color: '#B71C1C', fontWeight: '600' },
  actionChevron: { fontSize: 20, color: '#BDBDBD' },
});
