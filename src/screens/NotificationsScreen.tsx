import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';

interface Notification {
  id: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
  type: 'order' | 'delivery' | 'product' | 'system';
}

const TYPE_ICONS: Record<Notification['type'], string> = {
  order: '📦',
  delivery: '🚚',
  product: '🌾',
  system: '🔔',
};

const TYPE_COLORS: Record<Notification['type'], string> = {
  order: '#1565C0',
  delivery: '#00695C',
  product: '#2E7D32',
  system: '#6A1B9A',
};

// Mock data — replace with real API when available
const MOCK: Notification[] = [
  { id: '1', title: 'Order Confirmed', body: 'Your order #A3F2 has been confirmed and is being processed.', time: '2 min ago', read: false, type: 'order' },
  { id: '2', title: 'Delivery Assigned', body: 'A delivery agent has been assigned to your order #A3F2.', time: '1 hr ago', read: false, type: 'delivery' },
  { id: '3', title: 'New Product Listed', body: 'Organic Tomatoes are now available in the marketplace.', time: '3 hrs ago', read: true, type: 'product' },
  { id: '4', title: 'Payment Received', body: 'Escrow payment for order #B7C1 has been funded.', time: 'Yesterday', read: true, type: 'order' },
  { id: '5', title: 'Low Stock Alert', body: 'Your product "Maize Grain" is running low on stock.', time: 'Yesterday', read: true, type: 'product' },
  { id: '6', title: 'System Update', body: 'FarmConnect has been updated to version 1.0.1.', time: '2 days ago', read: true, type: 'system' },
];

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>(MOCK);

  const unreadCount = notifications.filter((n) => !n.read).length;

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  function markRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Notifications</Text>
          {unreadCount > 0 && (
            <Text style={styles.unreadCount}>{unreadCount} unread</Text>
          )}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllRead} style={styles.markAllBtn}>
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NotificationCard item={item} onPress={() => markRead(item.id)} />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🔔</Text>
            <Text style={styles.emptyText}>No notifications yet.</Text>
          </View>
        }
        contentContainerStyle={notifications.length === 0 ? styles.emptyContainer : styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

function NotificationCard({
  item,
  onPress,
}: {
  item: Notification;
  onPress: () => void;
}) {
  const color = TYPE_COLORS[item.type];
  return (
    <TouchableOpacity
      style={[styles.card, !item.read && styles.cardUnread]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={[styles.iconWrap, { backgroundColor: color + '18' }]}>
        <Text style={styles.icon}>{TYPE_ICONS[item.type]}</Text>
      </View>
      <View style={styles.cardBody}>
        <View style={styles.cardTop}>
          <Text style={[styles.cardTitle, !item.read && styles.cardTitleUnread]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.cardTime}>{item.time}</Text>
        </View>
        <Text style={styles.cardText} numberOfLines={2}>{item.body}</Text>
      </View>
      {!item.read && <View style={[styles.dot, { backgroundColor: color }]} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FAFAFA' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingHorizontal: 16, paddingTop: 20, paddingBottom: 12,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  title: { fontSize: 24, fontWeight: '800', color: '#1B5E20' },
  unreadCount: { fontSize: 13, color: '#757575', marginTop: 2 },
  markAllBtn: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#E8F5E9', borderRadius: 20, marginTop: 4 },
  markAllText: { fontSize: 13, color: '#2E7D32', fontWeight: '600' },
  list: { paddingVertical: 8 },
  emptyContainer: { flex: 1 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 80 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, color: '#9E9E9E' },
  card: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#F5F5F5',
  },
  cardUnread: { backgroundColor: '#F9FBE7' },
  iconWrap: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  icon: { fontSize: 20 },
  cardBody: { flex: 1 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  cardTitle: { fontSize: 14, fontWeight: '500', color: '#424242', flex: 1, marginRight: 8 },
  cardTitleUnread: { fontWeight: '700', color: '#1B5E20' },
  cardTime: { fontSize: 12, color: '#9E9E9E' },
  cardText: { fontSize: 13, color: '#757575', lineHeight: 18 },
  dot: { width: 8, height: 8, borderRadius: 4, marginTop: 4, marginLeft: 8 },
});
