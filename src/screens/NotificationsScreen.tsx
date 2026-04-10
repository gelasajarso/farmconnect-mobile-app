import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';

type NotifType = 'order' | 'delivery' | 'product' | 'system';

interface Notification {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  time: string;
  read: boolean;
}

// Static placeholder data — replace with API when backend supports it
const MOCK_NOTIFICATIONS: Notification[] = [
  { id: '1', type: 'order', title: 'New Order Received', body: 'You have a new order for Organic Tomatoes.', time: '2 min ago', read: false },
  { id: '2', type: 'delivery', title: 'Delivery In Transit', body: 'Order #A3F9 is now in transit.', time: '1 hr ago', read: false },
  { id: '3', type: 'product', title: 'Low Stock Alert', body: 'Your product "Maize Grain" is running low.', time: '3 hr ago', read: true },
  { id: '4', type: 'order', title: 'Order Completed', body: 'Order #B2E1 has been completed successfully.', time: 'Yesterday', read: true },
  { id: '5', type: 'system', title: 'Welcome to FarmConnect', body: 'Your account is active. Start listing your products.', time: '2 days ago', read: true },
];

const TYPE_CONFIG: Record<NotifType, { emoji: string; color: string }> = {
  order: { emoji: '📦', color: '#1565C0' },
  delivery: { emoji: '🚚', color: '#00695C' },
  product: { emoji: '🌾', color: '#F57F17' },
  system: { emoji: '🔔', color: '#4A148C' },
};

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);

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
          <NotifCard item={item} onPress={() => markRead(item.id)} />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>�</Text>
            <Text style={styles.emptyText}>No notifications yet.</Text>
          </View>
        }
        contentContainerStyle={notifications.length === 0 ? styles.emptyContainer : styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

function NotifCard({ item, onPress }: { item: Notification; onPress: () => void }) {
  const { emoji, color } = TYPE_CONFIG[item.type];
  return (
    <TouchableOpacity
      style={[styles.card, !item.read && styles.cardUnread]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={[styles.iconWrap, { backgroundColor: color + '18' }]}>
        <Text style={styles.icon}>{emoji}</Text>
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
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
    paddingHorizontal: 16, paddingTop: 20, paddingBottom: 12,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  title: { fontSize: 24, fontWeight: '800', color: '#1B5E20' },
  unreadCount: { fontSize: 13, color: '#757575', marginTop: 2 },
  markAllBtn: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#E8F5E9', borderRadius: 20 },
  markAllText: { fontSize: 13, color: '#2E7D32', fontWeight: '600' },
  list: { paddingVertical: 8 },
  emptyContainer: { flex: 1 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 80 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, color: '#9E9E9E' },
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', marginHorizontal: 16, marginVertical: 4,
    borderRadius: 12, padding: 14, elevation: 1,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 3, shadowOffset: { width: 0, height: 1 },
  },
  cardUnread: { backgroundColor: '#F9FBE7', borderLeftWidth: 3, borderLeftColor: '#2E7D32' },
  iconWrap: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  icon: { fontSize: 20 },
  cardBody: { flex: 1 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  cardTitle: { fontSize: 14, fontWeight: '600', color: '#424242', flex: 1, marginRight: 8 },
  cardTitleUnread: { color: '#1B5E20', fontWeight: '700' },
  cardTime: { fontSize: 11, color: '#9E9E9E' },
  cardText: { fontSize: 13, color: '#757575', lineHeight: 18 },
  dot: { width: 8, height: 8, borderRadius: 4, marginLeft: 8 },
});
