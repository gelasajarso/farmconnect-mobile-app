import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNotifications } from '../context/NotificationContext';
import NotificationModal from './NotificationModal';

// ─── Component ────────────────────────────────────────────────────────────────

export default function NotificationBell() {
  const { unreadCount } = useNotifications();
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        style={styles.touchable}
        accessibilityRole="button"
        accessibilityLabel={
          unreadCount > 0
            ? `Notifications, ${unreadCount} unread`
            : 'Notifications'
        }
      >
        <Text style={styles.bellEmoji}>🔔</Text>

        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {unreadCount > 99 ? '99+' : String(unreadCount)}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      <NotificationModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    marginRight: 8,
  },
  touchable: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellEmoji: {
    fontSize: 22,
    color: '#1B5E20',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 2,
    backgroundColor: '#D32F2F',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 14,
  },
});
