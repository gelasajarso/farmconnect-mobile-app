import React from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useChat } from '../../context/ChatContext';
import type { Conversation } from '../../types/chat';

// Generic param — each role stack has ChatList + ChatDetail
export type ChatStackParamList = {
  ChatList:   undefined;
  ChatDetail: { conversationId: string; participantName: string; participantRole: string };
};

type NavProp = StackNavigationProp<ChatStackParamList, 'ChatList'>;

const ROLE_COLORS: Record<string, string> = {
  FARMER:   '#1A7A35',
  MERCHANT: '#1565C0',
  DELIVERY: '#00695C',
  ADMIN:    '#6A1B9A',
};

function formatTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays === 0) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (diffDays === 1) return 'Yesterday';
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export default function ChatListScreen() {
  const navigation = useNavigation<NavProp>();
  const { conversations } = useChat();

  const totalUnread = conversations.reduce((s, c) => s + c.unreadCount, 0);

  return (
    <SafeAreaView style={styles.safe}>
      {totalUnread > 0 && (
        <View style={styles.unreadBanner}>
          <Text style={styles.unreadBannerText}>
            {totalUnread} unread message{totalUnread !== 1 ? 's' : ''}
          </Text>
        </View>
      )}

      <FlatList<Conversation>
        data={conversations}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <ConversationRow
            conv={item}
            onPress={() =>
              navigation.navigate('ChatDetail', {
                conversationId:   item.id,
                participantName:  item.participantName,
                participantRole:  item.participantRole,
              })
            }
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>💬</Text>
            <Text style={styles.emptyText}>No conversations yet.</Text>
          </View>
        }
        contentContainerStyle={conversations.length === 0 ? styles.emptyFlex : styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

function ConversationRow({ conv, onPress }: { conv: Conversation; onPress: () => void }) {
  const roleColor = ROLE_COLORS[conv.participantRole] ?? '#757575';
  const initials  = conv.participantName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.75}>
      {/* Avatar */}
      <View style={[styles.avatar, { backgroundColor: roleColor + '20' }]}>
        <Text style={[styles.avatarText, { color: roleColor }]}>{initials}</Text>
        {conv.isOnline && <View style={styles.onlineDot} />}
      </View>

      {/* Body */}
      <View style={styles.rowBody}>
        <View style={styles.rowTop}>
          <Text style={styles.name} numberOfLines={1}>{conv.participantName}</Text>
          <Text style={styles.time}>{formatTime(conv.lastMessageTime)}</Text>
        </View>
        <View style={styles.rowBottom}>
          <Text style={[styles.preview, conv.unreadCount > 0 && styles.previewUnread]} numberOfLines={1}>
            {conv.lastMessage}
          </Text>
          {conv.unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{conv.unreadCount > 9 ? '9+' : conv.unreadCount}</Text>
            </View>
          )}
        </View>
        <View style={[styles.rolePill, { backgroundColor: roleColor + '15' }]}>
          <Text style={[styles.roleText, { color: roleColor }]}>{conv.participantRole}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: '#F7F9F7' },
  list:      { paddingVertical: 8 },
  emptyFlex: { flex: 1 },

  unreadBanner: {
    backgroundColor: '#1A7A35', paddingVertical: 8, paddingHorizontal: 16,
  },
  unreadBannerText: { color: '#fff', fontSize: 13, fontWeight: '600', textAlign: 'center' },

  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 80 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyText:  { fontSize: 15, color: '#9E9E9E', fontWeight: '500' },

  row: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#F5F5F5',
  },

  avatar: {
    width: 50, height: 50, borderRadius: 25,
    justifyContent: 'center', alignItems: 'center',
    marginRight: 14, position: 'relative',
  },
  avatarText: { fontSize: 18, fontWeight: '800' },
  onlineDot: {
    position: 'absolute', bottom: 1, right: 1,
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: '#25D366', borderWidth: 2, borderColor: '#fff',
  },

  rowBody: { flex: 1 },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 },
  name:   { fontSize: 15, fontWeight: '700', color: '#0D1B0F', flex: 1, marginRight: 8 },
  time:   { fontSize: 12, color: '#9E9E9E' },

  rowBottom: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  preview:       { flex: 1, fontSize: 13, color: '#9E9E9E', marginRight: 8 },
  previewUnread: { color: '#0D1B0F', fontWeight: '600' },

  badge: {
    backgroundColor: '#1A7A35', borderRadius: 10,
    minWidth: 20, height: 20, paddingHorizontal: 5,
    justifyContent: 'center', alignItems: 'center',
  },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },

  rolePill: { alignSelf: 'flex-start', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  roleText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 },
});
