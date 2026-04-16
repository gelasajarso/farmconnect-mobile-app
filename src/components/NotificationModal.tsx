import React, { useEffect, useRef, useCallback } from 'react';
import {
  Animated,
  FlatList,
  Modal,
  PanResponder,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNotifications } from '../context/NotificationContext';
import NotificationItem from './NotificationItem';
import type { Notification } from '../types';

// ─── Props ────────────────────────────────────────────────────────────────────

interface NotificationModalProps {
  visible: boolean;
  onClose: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function NotificationModal({ visible, onClose }: NotificationModalProps) {
  const { notifications, unreadCount, markAllAsRead, markAsRead, clearAll } = useNotifications();
  const { height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  // Bottom padding: prefer safe area inset, fall back to StatusBar.currentHeight, then 24pt
  const bottomInset = Math.max(
    insets.bottom > 0 ? insets.bottom : (StatusBar.currentHeight ?? 0),
    24,
  );

  // Sheet height clamped between 60% and 90% of screen height
  const sheetHeight = Math.min(Math.max(screenHeight * 0.6, screenHeight * 0.6), screenHeight * 0.9);

  // Slide animation — starts off-screen (screenHeight = fully below viewport)
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;

  // Track whether a close animation is already in progress to avoid double-close
  const isClosing = useRef(false);

  const runCloseAnimation = useCallback(() => {
    if (isClosing.current) return;
    isClosing.current = true;
    Animated.timing(slideAnim, {
      toValue: screenHeight,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      isClosing.current = false;
      onClose();
    });
  }, [slideAnim, screenHeight, onClose]);

  // Open / close animation driven by `visible` prop
  useEffect(() => {
    if (visible) {
      isClosing.current = false;
      // Reset to off-screen before animating in (handles re-open after close)
      slideAnim.setValue(screenHeight);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      runCloseAnimation();
    }
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Swipe-to-close via PanResponder ───────────────────────────────────────

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 5,
      onPanResponderMove: (_, gestureState) => {
        // Only allow downward drag
        if (gestureState.dy > 0) {
          slideAnim.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 80) {
          // Threshold exceeded — close
          runCloseAnimation();
        } else {
          // Snap back to open position
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }).start();
        }
      },
    }),
  ).current;

  // ─── Sort notifications reverse-chronologically ────────────────────────────

  const sortedNotifications: Notification[] = [...notifications].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );

  // ─── Render helpers ────────────────────────────────────────────────────────

  const renderItem = ({ item }: { item: Notification }) => (
    <NotificationItem
      notification={item}
      onPress={(id) => markAsRead(id)}
    />
  );

  const keyExtractor = (item: Notification) => item.id;

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyEmoji}>🔔</Text>
      <Text style={styles.emptyTitle}>No notifications</Text>
      <Text style={styles.emptySubtitle}>You're all caught up! Check back later for updates.</Text>
    </View>
  );

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={runCloseAnimation}
      statusBarTranslucent
    >
      {/* Backdrop */}
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={runCloseAnimation}
        accessibilityLabel="Close notifications"
        accessibilityRole="button"
      />

      {/* Bottom sheet */}
      <Animated.View
        style={[
          styles.sheet,
          {
            height: sheetHeight,
            paddingBottom: bottomInset,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Drag handle */}
        <View {...panResponder.panHandlers} style={styles.handleArea}>
          <View style={styles.handle} />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Notifications</Text>
            {unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>
                  {unreadCount > 99 ? '99+' : unreadCount} unread
                </Text>
              </View>
            )}
          </View>
          <View style={styles.headerActions}>
            {unreadCount > 0 && (
              <TouchableOpacity
                onPress={markAllAsRead}
                style={styles.actionButton}
                accessibilityRole="button"
                accessibilityLabel="Mark all as read"
              >
                <Text style={styles.actionButtonText}>Mark all read</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={clearAll}
              style={[styles.actionButton, styles.clearButton]}
              accessibilityRole="button"
              accessibilityLabel="Clear all notifications"
            >
              <Text style={[styles.actionButtonText, styles.clearButtonText]}>Clear all</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Notification list */}
        <FlatList
          data={sortedNotifications}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={[
            styles.listContent,
            sortedNotifications.length === 0 && styles.listContentEmpty,
          ]}
          ListEmptyComponent={<EmptyState />}
          showsVerticalScrollIndicator={false}
          bounces={true}
        />
      </Animated.View>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  handleArea: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#BDBDBD',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1B5E20',
  },
  unreadBadge: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  unreadBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2E7D32',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2E7D32',
  },
  clearButton: {
    backgroundColor: '#FFF3E0',
  },
  clearButtonText: {
    color: '#E65100',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 0,
  },
  listContent: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 8,
  },
  listContentEmpty: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1B5E20',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
    lineHeight: 20,
  },
});
