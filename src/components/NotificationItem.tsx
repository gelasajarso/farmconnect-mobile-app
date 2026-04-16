import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import type { Notification, NotifType } from '../types';

// ─── Type configuration ───────────────────────────────────────────────────────

const TYPE_CONFIG: Record<NotifType, { emoji: string; color: string }> = {
  order:    { emoji: '📦', color: '#1565C0' },
  delivery: { emoji: '🚚', color: '#00695C' },
  product:  { emoji: '🌾', color: '#F57F17' },
  system:   { emoji: '🔔', color: '#4A148C' },
};

// ─── Timestamp formatting ─────────────────────────────────────────────────────

function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) {
    return 'Just now';
  } else if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else if (diffDays < 7) {
    return `${diffDays}d ago`;
  } else {
    // Absolute format: "Apr 14, 2:30 PM"
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface NotificationItemProps {
  notification: Notification;
  onPress: (id: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function NotificationItem({ notification, onPress }: NotificationItemProps) {
  const { emoji, color } = TYPE_CONFIG[notification.type];
  const isUnread = notification.read === false;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => onPress(notification.id)}
      style={[
        styles.container,
        isUnread ? styles.containerUnread : styles.containerRead,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${notification.title}. ${isUnread ? 'Unread.' : ''} ${notification.body}`}
    >
      {/* Left accent strip */}
      <View style={[styles.accentStrip, { backgroundColor: color }]} />

      {/* Type emoji */}
      <View style={styles.emojiWrapper}>
        <Text style={styles.emoji}>{emoji}</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text
            style={[styles.title, isUnread && styles.titleUnread]}
            numberOfLines={1}
          >
            {notification.title}
          </Text>
          {isUnread && (
            <View style={[styles.unreadDot, { backgroundColor: color }]} />
          )}
        </View>

        <Text style={styles.body} numberOfLines={2}>
          {notification.body}
        </Text>

        <Text style={styles.timestamp}>
          {formatTimestamp(notification.timestamp)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'stretch',
    minHeight: 64,
    marginHorizontal: 0,
    marginVertical: 2,
    borderRadius: 8,
    overflow: 'hidden',
  },
  containerRead: {
    backgroundColor: '#FFFFFF',
  },
  containerUnread: {
    backgroundColor: '#F1F8E9',
  },
  accentStrip: {
    width: 4,
  },
  emojiWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  emoji: {
    fontSize: 24,
  },
  content: {
    flex: 1,
    paddingTop: 12,
    paddingBottom: 12,
    paddingRight: 12,
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#212121',
  },
  titleUnread: {
    fontWeight: '700',
    color: '#1B5E20',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  body: {
    fontSize: 13,
    color: '#616161',
    lineHeight: 18,
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 11,
    color: '#9E9E9E',
  },
});
