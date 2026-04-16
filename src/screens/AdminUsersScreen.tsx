import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, SafeAreaView, Alert, RefreshControl,
} from 'react-native';
import { getAllUsers, toggleUserActive } from '../services/admin.service';
import { extractApiError } from '../utils/errorHandling';
import LoadingIndicator from '../components/LoadingIndicator';
import ErrorView from '../components/ErrorView';
import EmptyState from '../components/EmptyState';
import type { AdminUser } from '../types';
import { useFocusEffect } from '@react-navigation/native';

const ROLE_COLORS: Record<string, string> = {
  FARMER: '#1A7A35', MERCHANT: '#1565C0', DELIVERY: '#00838F',
  ADMIN: '#6A1B9A', MANAGER: '#6A1B9A', AGENT: '#6A1B9A',
};

const ROLE_EMOJI: Record<string, string> = {
  FARMER: '🌾', MERCHANT: '🛒', DELIVERY: '🚚',
  ADMIN: '🛠️', MANAGER: '📋', AGENT: '👤',
};

type FilterType = 'ALL' | 'ACTIVE' | 'INACTIVE';

export default function AdminUsersScreen() {
  const [users, setUsers]       = useState<AdminUser[]>([]);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError]       = useState('');
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [filter, setFilter]     = useState<FilterType>('ALL');

  const load = useCallback(async () => {
    setError('');
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (err) {
      setError(extractApiError(err).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  async function handleToggle(user: AdminUser) {
    const action = user.is_active ? 'Deactivate' : 'Activate';
    Alert.alert(
      `${action} User`,
      `${action} "${user.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: action,
          style: user.is_active ? 'destructive' : 'default',
          onPress: async () => {
            setTogglingId(user.id);
            try {
              const updated = await toggleUserActive(user.id);
              setUsers(prev => prev.map(u => u.id === user.id ? updated : u));
            } catch (err) {
              Alert.alert('Error', extractApiError(err).message);
            } finally {
              setTogglingId(null);
            }
          },
        },
      ],
    );
  }

  if (loading) return <LoadingIndicator />;
  if (error)   return <ErrorView message={error} onRetry={load} />;

  const active   = users.filter(u => u.is_active).length;
  const inactive = users.filter(u => !u.is_active).length;

  const displayed =
    filter === 'ACTIVE'   ? users.filter(u => u.is_active) :
    filter === 'INACTIVE' ? users.filter(u => !u.is_active) :
    users;

  return (
    <SafeAreaView style={styles.safe}>

      {/* ── Summary header — each pill is tappable ── */}
      <View style={styles.summary}>
        <SummaryPill
          label="Total"    value={users.length} active={filter === 'ALL'}
          onPress={() => setFilter('ALL')}
        />
        <SummaryPill
          label="Active"   value={active}        active={filter === 'ACTIVE'}
          onPress={() => setFilter('ACTIVE')}
          valueColor="#A8FFB8"
        />
        <SummaryPill
          label="Inactive" value={inactive}      active={filter === 'INACTIVE'}
          onPress={() => setFilter('INACTIVE')}
          valueColor="#FFAAAA"
        />
      </View>

      <FlatList<AdminUser>
        data={displayed}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <UserCard
            user={item}
            toggling={togglingId === item.id}
            onToggle={() => handleToggle(item)}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1A7A35" />
        }
        ListEmptyComponent={
          <EmptyState
            message={filter === 'ALL' ? 'No users found.' : `No ${filter.toLowerCase()} users.`}
            emoji="👥"
          />
        }
        contentContainerStyle={displayed.length === 0 ? styles.emptyFlex : styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

// ─── Summary pill ─────────────────────────────────────────────────────────────

function SummaryPill({
  label, value, active, onPress, valueColor = '#fff',
}: {
  label: string; value: number; active: boolean;
  onPress: () => void; valueColor?: string;
}) {
  return (
    <TouchableOpacity
      style={[styles.summaryPill, active && styles.summaryPillActive]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Text style={[styles.summaryValue, { color: valueColor }]}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
      {active && <View style={styles.summaryUnderline} />}
    </TouchableOpacity>
  );
}

// ─── User card ────────────────────────────────────────────────────────────────

function UserCard({
  user, toggling, onToggle,
}: {
  user: AdminUser; toggling: boolean; onToggle: () => void;
}) {
  const roleColor = ROLE_COLORS[user.role] ?? '#757575';
  const emoji     = ROLE_EMOJI[user.role]  ?? '👤';

  return (
    <View style={styles.card}>

      {/* Top row: avatar + info + role badge + status dot */}
      <View style={styles.cardTop}>
        <View style={[styles.avatar, { backgroundColor: roleColor + '18' }]}>
          <Text style={styles.avatarEmoji}>{emoji}</Text>
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail} numberOfLines={1}>{user.email}</Text>
          {user.system_user_id && (
            <Text style={styles.userId}>{user.system_user_id}</Text>
          )}
        </View>

        <View style={styles.cardRight}>
          <View style={[styles.roleBadge, { backgroundColor: roleColor + '18' }]}>
            <Text style={[styles.roleText, { color: roleColor }]}>{user.role}</Text>
          </View>
          {/* Status indicator */}
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: user.is_active ? '#1A7A35' : '#B71C1C' }]} />
            <Text style={[styles.statusText, { color: user.is_active ? '#1A7A35' : '#B71C1C' }]}>
              {user.is_active ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>
      </View>

      {/* Footer row: join date + action button */}
      <View style={styles.cardFooter}>
        <Text style={styles.joinDate}>
          Joined {new Date(user.created_at).toLocaleDateString()}
        </Text>

        <TouchableOpacity
          style={[
            styles.toggleBtn,
            user.is_active ? styles.toggleBtnDeactivate : styles.toggleBtnActivate,
            toggling && styles.toggleBtnDisabled,
          ]}
          onPress={onToggle}
          disabled={toggling}
          activeOpacity={0.75}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <Text style={[
            styles.toggleBtnText,
            user.is_active ? styles.toggleBtnTextDeactivate : styles.toggleBtnTextActivate,
          ]}>
            {toggling ? 'Updating…' : user.is_active ? 'Deactivate' : 'Activate'}
          </Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: '#F7F9F7' },
  list:      { paddingTop: 8, paddingBottom: 24 },
  emptyFlex: { flex: 1 },

  // ── Summary header ──────────────────────────────────────────────────────────
  summary: {
    flexDirection: 'row',
    backgroundColor: '#1A7A35',
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  summaryPill: {
    flex: 1, alignItems: 'center',
    paddingVertical: 6, borderRadius: 10,
    position: 'relative',
  },
  summaryPillActive: {
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  summaryValue: {
    fontSize: 22, fontWeight: '800', color: '#fff',
  },
  summaryLabel: {
    fontSize: 11, color: 'rgba(255,255,255,0.7)',
    marginTop: 2, fontWeight: '600', textTransform: 'uppercase',
  },
  summaryUnderline: {
    position: 'absolute', bottom: 0, left: '20%', right: '20%',
    height: 2, backgroundColor: '#fff', borderRadius: 1,
  },

  // ── Card ────────────────────────────────────────────────────────────────────
  card: {
    backgroundColor: '#fff', borderRadius: 14,
    marginHorizontal: 16, marginVertical: 5,
    padding: 14,
    borderWidth: 1, borderColor: '#F0F0F0',
    shadowColor: '#000', shadowOpacity: 0.04,
    shadowRadius: 5, shadowOffset: { width: 0, height: 2 }, elevation: 1,
  },

  cardTop: { flexDirection: 'row', alignItems: 'flex-start' },

  avatar: {
    width: 46, height: 46, borderRadius: 23,
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  avatarEmoji: { fontSize: 20 },

  cardBody: { flex: 1, marginRight: 8 },
  userName:  { fontSize: 15, fontWeight: '700', color: '#0D1B0F' },
  userEmail: { fontSize: 12, color: '#9E9E9E', marginTop: 2 },
  userId:    { fontSize: 11, color: '#6B8F71', marginTop: 1 },

  cardRight: { alignItems: 'flex-end', gap: 6 },
  roleBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  roleText:  { fontSize: 11, fontWeight: '700' },

  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusText:{ fontSize: 11, fontWeight: '600' },

  // ── Footer ──────────────────────────────────────────────────────────────────
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  joinDate: { fontSize: 12, color: '#BDBDBD', flex: 1 },

  toggleBtn: {
    paddingHorizontal: 16, paddingVertical: 7,
    borderRadius: 20, borderWidth: 1.5,
    minWidth: 100, alignItems: 'center',
  },
  toggleBtnActivate:   { backgroundColor: '#F0FBF3', borderColor: '#A5D6A7' },
  toggleBtnDeactivate: { backgroundColor: '#FFF0F0', borderColor: '#FFCDD2' },
  toggleBtnDisabled:   { opacity: 0.45 },

  toggleBtnText:           { fontSize: 13, fontWeight: '700' },
  toggleBtnTextActivate:   { color: '#1A7A35' },
  toggleBtnTextDeactivate: { color: '#B71C1C' },
});
