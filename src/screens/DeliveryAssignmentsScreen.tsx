import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, SafeAreaView, Alert, RefreshControl,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useDeliveries } from '../hooks/useDeliveries';
import { updateDeliveryStatus } from '../services/delivery.service';
import { extractApiError } from '../utils/errorHandling';
import { DELIVERY_STATUS_LABELS } from '../utils/enumLabels';
import LoadingIndicator from '../components/LoadingIndicator';
import ErrorView from '../components/ErrorView';
import EmptyState from '../components/EmptyState';
import type { DeliveryResponse, DeliveryStatus } from '../types';

const STATUS_COLORS: Record<DeliveryStatus, string> = {
  ASSIGNED: '#1565C0', PICKED_UP: '#6A1B9A', IN_TRANSIT: '#E65100',
  DELIVERED: '#1A7A35', FAILED: '#B71C1C', CANCELLED: '#757575',
};

// Valid transitions per status
const NEXT_ACTIONS: Partial<Record<DeliveryStatus, { label: string; next: DeliveryStatus }[]>> = {
  ASSIGNED:   [{ label: 'Mark Picked Up',  next: 'PICKED_UP' }],
  PICKED_UP:  [{ label: 'Mark In Transit', next: 'IN_TRANSIT' }],
  IN_TRANSIT: [
    { label: 'Mark Delivered', next: 'DELIVERED' },
    { label: 'Mark Failed',    next: 'FAILED' },
  ],
};

export default function DeliveryAssignmentsScreen() {
  const { user } = useAuth();
  const { deliveries, loading, error, refetch } = useDeliveries();
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  async function handleStatusUpdate(delivery: DeliveryResponse, next: DeliveryStatus) {
    if (!user?.system_user_id) return;
    Alert.alert(
      'Update Status',
      `Set delivery #${delivery.id.slice(-8).toUpperCase()} to "${DELIVERY_STATUS_LABELS[next]}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            setUpdatingId(delivery.id);
            try {
              await updateDeliveryStatus(delivery.id, user.system_user_id!, { status: next });
              await refetch();
            } catch (err) {
              Alert.alert('Error', extractApiError(err).message);
            } finally {
              setUpdatingId(null);
            }
          },
        },
      ],
    );
  }

  if (loading) return <LoadingIndicator />;
  if (error) return <ErrorView message={error} onRetry={refetch} />;

  return (
    <SafeAreaView style={styles.safe}>
      {deliveries.length > 0 && (
        <Text style={styles.count}>{deliveries.length} assignment{deliveries.length !== 1 ? 's' : ''}</Text>
      )}
      <FlatList<DeliveryResponse>
        data={deliveries}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <DeliveryCard
            item={item}
            updating={updatingId === item.id}
            onAction={(next) => handleStatusUpdate(item, next)}
          />
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1A7A35" />}
        initialNumToRender={10}
        windowSize={5}
        removeClippedSubviews
        ListEmptyComponent={<EmptyState message="No deliveries assigned to you." emoji="🚚" />}
        contentContainerStyle={deliveries.length === 0 ? styles.emptyFlex : styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

function DeliveryCard({
  item,
  updating,
  onAction,
}: {
  item: DeliveryResponse;
  updating: boolean;
  onAction: (next: DeliveryStatus) => void;
}) {
  const color = STATUS_COLORS[item.status];
  const actions = NEXT_ACTIONS[item.status] ?? [];

  return (
    <View style={styles.card}>
      {/* Header row */}
      <View style={styles.cardTop}>
        <View style={styles.cardLeft}>
          <Text style={styles.deliveryId}>Delivery #{item.id.slice(-8).toUpperCase()}</Text>
          <Text style={styles.meta}>Order: {item.order_id.slice(-8).toUpperCase()}</Text>
          {item.pickup_time && (
            <Text style={styles.meta}>Pickup: {new Date(item.pickup_time).toLocaleDateString()}</Text>
          )}
          {item.delivered_time && (
            <Text style={styles.meta}>Delivered: {new Date(item.delivered_time).toLocaleDateString()}</Text>
          )}
          {item.notes && <Text style={styles.notes}>{item.notes}</Text>}
        </View>
        <View style={[styles.badge, { backgroundColor: color + '18' }]}>
          <Text style={[styles.badgeText, { color }]}>{DELIVERY_STATUS_LABELS[item.status]}</Text>
        </View>
      </View>

      {/* Action buttons */}
      {actions.length > 0 && (
        <View style={styles.actionsRow}>
          {actions.map(a => (
            <TouchableOpacity
              key={a.next}
              style={[
                styles.actionBtn,
                a.next === 'FAILED' && styles.actionBtnDanger,
                updating && styles.actionBtnDisabled,
              ]}
              onPress={() => onAction(a.next)}
              disabled={updating}
              activeOpacity={0.75}
            >
              <Text style={[
                styles.actionBtnText,
                a.next === 'FAILED' && styles.actionBtnTextDanger,
              ]}>
                {updating ? 'Updating…' : a.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F7F9F7' },
  count: {
    fontSize: 12, color: '#9E9E9E', fontWeight: '600',
    marginHorizontal: 20, marginTop: 14, marginBottom: 4,
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  list: { paddingTop: 8, paddingBottom: 24 },
  emptyFlex: { flex: 1 },

  card: {
    backgroundColor: '#fff', borderRadius: 14,
    marginHorizontal: 16, marginVertical: 5,
    padding: 14, borderWidth: 1, borderColor: '#F0F0F0',
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 }, elevation: 1,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardLeft: { flex: 1, marginRight: 12 },
  deliveryId: { fontSize: 14, fontWeight: '700', color: '#0D1B0F', marginBottom: 4 },
  meta: { fontSize: 12, color: '#9E9E9E', marginTop: 2 },
  notes: { fontSize: 12, color: '#6B8F71', marginTop: 4, fontStyle: 'italic' },
  badge: { borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start' },
  badgeText: { fontSize: 11, fontWeight: '700' },

  actionsRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  actionBtn: {
    flex: 1, paddingVertical: 9, borderRadius: 10,
    backgroundColor: '#F0FBF3', borderWidth: 1, borderColor: '#C8E6C9',
    alignItems: 'center',
  },
  actionBtnDanger: { backgroundColor: '#FFF0F0', borderColor: '#FFCDD2' },
  actionBtnDisabled: { opacity: 0.5 },
  actionBtnText: { fontSize: 13, color: '#1A7A35', fontWeight: '700' },
  actionBtnTextDanger: { color: '#B71C1C' },
});
