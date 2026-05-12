import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, SafeAreaView, Platform, ActivityIndicator,
  Modal, ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { AdminStackParamList } from '../navigation/types';
import type { OrderDTO, OrderStatus } from '../types';
import {
  getAllOrders,
  getDeliveryCarriers,
  assignDelivery,
  type DeliveryCarrier,
} from '../services/admin.service';
import { extractApiError } from '../utils/errorHandling';

type NavProp = StackNavigationProp<AdminStackParamList, 'AdminDeliveryAssign'>;

const ASSIGNABLE_STATUSES: OrderStatus[] = ['CONFIRMED', 'FUNDED'];

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  CONFIRMED: { bg: '#E8F5E9', text: '#1A7A35' },
  FUNDED:    { bg: '#E3F2FD', text: '#1565C0' },
};

export default function AdminDeliveryAssignScreen() {
  const navigation = useNavigation<NavProp>();

  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  // Modal state
  const [selectedOrder, setSelectedOrder] = useState<OrderDTO | null>(null);
  const [carriers, setCarriers] = useState<DeliveryCarrier[]>([]);
  const [carriersLoading, setCarriersLoading] = useState(false);
  const [carriersError, setCarriersError] = useState('');
  const [assigningCarrierId, setAssigningCarrierId] = useState<string | null>(null);
  const [assignError, setAssignError] = useState('');
  const [assignSuccess, setAssignSuccess] = useState('');

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setFetchError('');
    try {
      const all = await getAllOrders();
      setOrders(all.filter(o => ASSIGNABLE_STATUSES.includes(o.status)));
    } catch (err) {
      setFetchError(extractApiError(err).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  const openModal = async (order: OrderDTO) => {
    setSelectedOrder(order);
    setCarriers([]);
    setCarriersError('');
    setAssignError('');
    setAssignSuccess('');
    setCarriersLoading(true);
    try {
      const data = await getDeliveryCarriers();
      setCarriers(data);
    } catch (err) {
      setCarriersError(extractApiError(err).message);
    } finally {
      setCarriersLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedOrder(null);
    setCarriers([]);
    setCarriersError('');
    setAssignError('');
    setAssignSuccess('');
    setAssigningCarrierId(null);
  };

  const handleAssign = async (carrier: DeliveryCarrier) => {
    if (!selectedOrder) return;
    setAssigningCarrierId(carrier.user_id);
    setAssignError('');
    setAssignSuccess('');
    try {
      await assignDelivery({ order_id: selectedOrder.id, carrier_id: carrier.user_id });
      // Update local state
      setOrders(prev =>
        prev.map(o =>
          o.id === selectedOrder.id ? { ...o, status: 'IN_DELIVERY' as OrderStatus } : o
        ).filter(o => ASSIGNABLE_STATUSES.includes(o.status))
      );
      setAssignSuccess(`Assigned to ${carrier.name}!`);
      setTimeout(() => closeModal(), 1200);
    } catch (err) {
      setAssignError(extractApiError(err).message);
      setAssigningCarrierId(null);
    }
  };

  const shortId = (id: string) => id.slice(-8).toUpperCase();

  const renderOrder = ({ item }: { item: OrderDTO }) => {
    const colors = STATUS_COLORS[item.status] ?? { bg: '#F5F5F5', text: '#666' };
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => openModal(item)}
        activeOpacity={0.8}
      >
        <View style={styles.cardRow}>
          <View style={styles.orderIconWrap}>
            <Text style={styles.orderIcon}>📦</Text>
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.orderId}>Order #{shortId(item.id)}</Text>
            <Text style={styles.orderPrice}>
              ${item.total_price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: colors.bg }]}>
            <Text style={[styles.statusText, { color: colors.text }]}>{item.status}</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Delivery Assignment</Text>
        <View style={styles.backBtn} />
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#1A7A35" />
          <Text style={styles.loadingText}>Loading assignable orders…</Text>
        </View>
      ) : fetchError ? (
        <View style={styles.centered}>
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{fetchError}</Text>
            <TouchableOpacity onPress={loadOrders} style={styles.retryBtn}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={item => item.id}
          renderItem={renderOrder}
          contentContainerStyle={orders.length === 0 ? styles.emptyContainer : styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🚛</Text>
              <Text style={styles.emptyTitle}>No assignable orders</Text>
              <Text style={styles.emptySub}>Orders with CONFIRMED or FUNDED status will appear here.</Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Carrier selection modal */}
      <Modal
        visible={selectedOrder !== null}
        transparent
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            {/* Modal header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Assign Carrier
              </Text>
              {selectedOrder && (
                <Text style={styles.modalSubtitle}>
                  Order #{shortId(selectedOrder.id)} · ${selectedOrder.total_price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </Text>
              )}
              <TouchableOpacity onPress={closeModal} style={styles.modalCloseBtn} activeOpacity={0.7}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            {assignSuccess ? (
              <View style={styles.successBanner}>
                <Text style={styles.successText}>✓ {assignSuccess}</Text>
              </View>
            ) : null}

            {assignError ? (
              <View style={styles.modalErrorBanner}>
                <Text style={styles.modalErrorText}>{assignError}</Text>
              </View>
            ) : null}

            {carriersLoading ? (
              <View style={styles.modalCentered}>
                <ActivityIndicator size="large" color="#1A7A35" />
                <Text style={styles.loadingText}>Loading carriers…</Text>
              </View>
            ) : carriersError ? (
              <View style={styles.modalCentered}>
                <Text style={styles.errorText}>{carriersError}</Text>
              </View>
            ) : (
              <ScrollView style={styles.carrierList} showsVerticalScrollIndicator={false}>
                {carriers.map(carrier => (
                  <TouchableOpacity
                    key={carrier.user_id}
                    style={styles.carrierRow}
                    onPress={() => handleAssign(carrier)}
                    activeOpacity={0.8}
                    disabled={assigningCarrierId !== null}
                  >
                    <View style={styles.carrierAvatar}>
                      <Text style={styles.carrierAvatarText}>
                        {carrier.name[0].toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.carrierInfo}>
                      <Text style={styles.carrierName}>{carrier.name}</Text>
                      <Text style={styles.carrierEmail}>{carrier.email}</Text>
                      <Text style={styles.carrierPhone}>{carrier.phone}</Text>
                    </View>
                    {assigningCarrierId === carrier.user_id ? (
                      <ActivityIndicator size="small" color="#1A7A35" />
                    ) : (
                      <Text style={styles.assignChevron}>›</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
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

  listContent: { padding: 16, gap: 10 },
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
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  orderIconWrap: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: '#FFF3E0', justifyContent: 'center', alignItems: 'center',
    marginRight: 12,
  },
  orderIcon: { fontSize: 20 },
  cardInfo: { flex: 1 },
  orderId: { fontSize: 15, fontWeight: '700', color: '#0D1B0F' },
  orderPrice: { fontSize: 13, color: '#666', marginTop: 2 },
  statusBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, marginRight: 8 },
  statusText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.3 },
  chevron: { fontSize: 22, color: '#BDBDBD', fontWeight: '300' },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '75%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  modalHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#0D1B0F', paddingRight: 32 },
  modalSubtitle: { fontSize: 13, color: '#666', marginTop: 4 },
  modalCloseBtn: {
    position: 'absolute', top: 16, right: 16,
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center',
  },
  modalCloseText: { fontSize: 14, color: '#666', fontWeight: '600' },

  successBanner: {
    backgroundColor: '#E8F5E9', padding: 12, marginHorizontal: 16, marginTop: 12,
    borderRadius: 8, alignItems: 'center',
  },
  successText: { fontSize: 14, fontWeight: '700', color: '#1A7A35' },

  modalErrorBanner: {
    backgroundColor: '#FFEBEE', padding: 12, marginHorizontal: 16, marginTop: 12,
    borderRadius: 8,
  },
  modalErrorText: { fontSize: 13, color: '#B71C1C' },

  modalCentered: { padding: 40, alignItems: 'center' },

  carrierList: { paddingHorizontal: 16, paddingTop: 8 },
  carrierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  carrierAvatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center',
    marginRight: 12,
  },
  carrierAvatarText: { fontSize: 18, fontWeight: '700', color: '#1A7A35' },
  carrierInfo: { flex: 1 },
  carrierName: { fontSize: 15, fontWeight: '700', color: '#0D1B0F' },
  carrierEmail: { fontSize: 12, color: '#666', marginTop: 2 },
  carrierPhone: { fontSize: 12, color: '#9E9E9E', marginTop: 1 },
  assignChevron: { fontSize: 22, color: '#BDBDBD', fontWeight: '300' },
});
