import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, SafeAreaView, Platform, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { AdminStackParamList } from '../navigation/types';
import {
  getPendingApprovals,
  approveUser,
  rejectUser,
  type PendingApprovalUser,
} from '../services/admin.service';
import { extractApiError } from '../utils/errorHandling';

type NavProp = StackNavigationProp<AdminStackParamList, 'AdminApprovalQueue'>;

interface RowState {
  loading: boolean;
  error: string;
  success: string;
}

export default function AdminApprovalQueueScreen() {
  const navigation = useNavigation<NavProp>();

  const [users, setUsers] = useState<PendingApprovalUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [rowStates, setRowStates] = useState<Record<string, RowState>>({});

  const loadPending = useCallback(async () => {
    setLoading(true);
    setFetchError('');
    try {
      const data = await getPendingApprovals();
      setUsers(data);
    } catch (err) {
      setFetchError(extractApiError(err).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPending(); }, [loadPending]);

  const setRowState = (userId: string, state: Partial<RowState>) => {
    setRowStates(prev => {
      const existing = prev[userId] ?? { loading: false, error: '', success: '' };
      return {
        ...prev,
        [userId]: { ...existing, ...state },
      };
    });
  };

  const handleApprove = async (userId: string) => {
    setRowState(userId, { loading: true, error: '', success: '' });
    try {
      await approveUser(userId);
      setUsers(prev => prev.filter(u => u.user_id !== userId));
      setRowState(userId, { loading: false, success: 'Approved!' });
    } catch (err) {
      setRowState(userId, { loading: false, error: extractApiError(err).message });
    }
  };

  const handleReject = async (userId: string) => {
    setRowState(userId, { loading: true, error: '', success: '' });
    try {
      await rejectUser(userId);
      setUsers(prev => prev.filter(u => u.user_id !== userId));
      setRowState(userId, { loading: false, success: 'Rejected.' });
    } catch (err) {
      setRowState(userId, { loading: false, error: extractApiError(err).message });
    }
  };

  const formatDate = (iso: string | null) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const renderItem = ({ item }: { item: PendingApprovalUser }) => {
    const rs = rowStates[item.user_id] ?? { loading: false, error: '', success: '' };
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {(item.name ?? item.email ?? '?')[0].toUpperCase()}
            </Text>
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardName}>{item.name ?? 'Unknown'}</Text>
            <Text style={styles.cardEmail}>{item.email ?? '—'}</Text>
            <View style={styles.cardMeta}>
              <View style={styles.roleBadge}>
                <Text style={styles.roleBadgeText}>{item.role ?? '—'}</Text>
              </View>
              <Text style={styles.cardDate}>Registered {formatDate(item.created_at)}</Text>
            </View>
          </View>
        </View>

        {rs.error ? (
          <Text style={styles.rowError}>{rs.error}</Text>
        ) : null}

        {rs.loading ? (
          <ActivityIndicator size="small" color="#1A7A35" style={{ marginTop: 10 }} />
        ) : (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.approveBtn]}
              onPress={() => handleApprove(item.user_id)}
              activeOpacity={0.8}
            >
              <Text style={styles.approveBtnText}>✓ Approve</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.rejectBtn]}
              onPress={() => handleReject(item.user_id)}
              activeOpacity={0.8}
            >
              <Text style={styles.rejectBtnText}>✕ Reject</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Approval Queue</Text>
        <View style={styles.backBtn} />
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#1A7A35" />
          <Text style={styles.loadingText}>Loading pending approvals…</Text>
        </View>
      ) : fetchError ? (
        <View style={styles.centered}>
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{fetchError}</Text>
            <TouchableOpacity onPress={loadPending} style={styles.retryBtn}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={item => item.user_id}
          renderItem={renderItem}
          contentContainerStyle={users.length === 0 ? styles.emptyContainer : styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>✅</Text>
              <Text style={styles.emptyTitle}>All caught up!</Text>
              <Text style={styles.emptySub}>No pending registrations to review.</Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F7F9F7' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1A7A35',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 20 : 16,
    paddingBottom: 18,
  },
  backBtn: { width: 40, alignItems: 'center' },
  backArrow: { fontSize: 32, color: '#fff', lineHeight: 36, fontWeight: '300' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#fff', letterSpacing: -0.3 },

  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  loadingText: { marginTop: 12, fontSize: 14, color: '#666' },

  errorCard: {
    backgroundColor: '#FFEBEE', borderRadius: 12, padding: 20,
    alignItems: 'center', width: '100%',
  },
  errorText: { fontSize: 14, color: '#B71C1C', textAlign: 'center', marginBottom: 12 },
  retryBtn: { backgroundColor: '#fff', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20 },
  retryText: { fontSize: 13, color: '#B71C1C', fontWeight: '600' },

  listContent: { padding: 16, gap: 12 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  emptyState: { alignItems: 'center', padding: 40 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#0D1B0F', marginBottom: 6 },
  emptySub: { fontSize: 14, color: '#9E9E9E', textAlign: 'center' },

  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  avatarCircle: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center',
    marginRight: 12,
  },
  avatarText: { fontSize: 18, fontWeight: '700', color: '#1A7A35' },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 15, fontWeight: '700', color: '#0D1B0F' },
  cardEmail: { fontSize: 13, color: '#666', marginTop: 2 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 8 },
  roleBadge: {
    backgroundColor: '#E3F2FD', borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 2,
  },
  roleBadgeText: { fontSize: 11, fontWeight: '700', color: '#1565C0', textTransform: 'uppercase', letterSpacing: 0.3 },
  cardDate: { fontSize: 11, color: '#9E9E9E' },

  rowError: { fontSize: 12, color: '#B71C1C', marginTop: 8, backgroundColor: '#FFEBEE', padding: 8, borderRadius: 6 },

  actionRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  actionBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  approveBtn: { backgroundColor: '#E8F5E9', borderWidth: 1.5, borderColor: '#1A7A35' },
  approveBtnText: { fontSize: 14, fontWeight: '700', color: '#1A7A35' },
  rejectBtn: { backgroundColor: '#FFEBEE', borderWidth: 1.5, borderColor: '#C62828' },
  rejectBtnText: { fontSize: 14, fontWeight: '700', color: '#C62828' },
});
