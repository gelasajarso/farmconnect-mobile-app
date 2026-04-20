import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";
import type { ChatStackParamList } from "./ChatListScreen";
import type { Message } from "../../types/chat";

type NavProp = StackNavigationProp<ChatStackParamList, "ChatDetail">;
type RouteType = RouteProp<ChatStackParamList, "ChatDetail">;

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return d.toLocaleDateString([], {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

export default function ChatDetailScreen() {
  const navigation = useNavigation<NavProp>();
  const { params } = useRoute<RouteType>();
  const { conversationId, participantName, participantRole } = params;

  const { user } = useAuth();
  const { getMessages, sendMessage, markAsRead } = useChat();

  const messages = getMessages(conversationId);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const listRef =
    useRef<FlatList<Message | { type: "date"; label: string }>>(null);

  // Mark as read on open
  useEffect(() => {
    markAsRead(conversationId);
  }, [conversationId, markAsRead]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages.length]);

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setText("");
    sendMessage(conversationId, trimmed);
    setTimeout(() => setSending(false), 300);
  }, [text, sending, conversationId, sendMessage]);

  // Group messages by date
  const grouped = messages.reduce<{ date: string; msgs: Message[] }[]>(
    (acc, msg) => {
      const dateLabel = formatDate(msg.timestamp);
      const last = acc[acc.length - 1];
      if (last && last.date === dateLabel) {
        last.msgs.push(msg);
      } else {
        acc.push({ date: dateLabel, msgs: [msg] });
      }
      return acc;
    },
    [],
  );

  const flatItems: (Message | { type: "date"; label: string })[] = [];
  grouped.forEach((g) => {
    flatItems.push({ type: "date", label: g.date });
    g.msgs.forEach((m) => flatItems.push(m));
  });

  const myId = user?.keycloak_id ?? "";

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      {/* Participant status bar */}
      <View style={styles.statusBar}>
        <View style={styles.statusDot} />
        <Text style={styles.statusText}>{participantRole} · Online</Text>
      </View>

      {/* Messages */}
      <FlatList
        ref={listRef}
        data={flatItems}
        keyExtractor={(item, i) => ("id" in item ? item.id : `date-${i}`)}
        renderItem={({ item }) => {
          if ("type" in item) {
            return (
              <View style={styles.dateSep}>
                <Text style={styles.dateSepText}>{item.label}</Text>
              </View>
            );
          }
          const isMine = item.senderId === myId;
          return <MessageBubble message={item} isMine={isMine} />;
        }}
        contentContainerStyle={styles.messageList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() =>
          listRef.current?.scrollToEnd({ animated: false })
        }
      />

      {/* Input bar */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Type a message…"
          placeholderTextColor="#9E9E9E"
          multiline
          maxLength={500}
          editable={!sending}
        />
        <TouchableOpacity
          style={[
            styles.sendBtn,
            (!text.trim() || sending) && styles.sendBtnDisabled,
          ]}
          onPress={handleSend}
          disabled={!text.trim() || sending}
          activeOpacity={0.8}
        >
          {sending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.sendIcon}>➤</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

// ─── Message bubble ───────────────────────────────────────────────────────────

function MessageBubble({
  message,
  isMine,
}: {
  message: Message;
  isMine: boolean;
}) {
  return (
    <View
      style={[
        styles.bubbleWrap,
        isMine ? styles.bubbleWrapMine : styles.bubbleWrapTheirs,
      ]}
    >
      <View
        style={[
          styles.bubble,
          isMine ? styles.bubbleMine : styles.bubbleTheirs,
        ]}
      >
        <Text
          style={[
            styles.bubbleText,
            isMine ? styles.bubbleTextMine : styles.bubbleTextTheirs,
          ]}
        >
          {message.text}
        </Text>
      </View>
      <View
        style={[
          styles.bubbleMeta,
          isMine ? styles.bubbleMetaMine : styles.bubbleMetaTheirs,
        ]}
      >
        <Text style={styles.bubbleTime}>{formatTime(message.timestamp)}</Text>
        {isMine && (
          <Text
            style={[styles.readTick, message.isRead && styles.readTickRead]}
          >
            {message.isRead ? "✓✓" : "✓"}
          </Text>
        )}
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#ECE5DD" }, // WhatsApp-like bg

  statusBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#25D366",
    marginRight: 6,
  },
  statusText: { fontSize: 12, color: "#9E9E9E", fontWeight: "500" },

  messageList: { paddingHorizontal: 12, paddingVertical: 12 },

  dateSep: { alignItems: "center", marginVertical: 10 },
  dateSepText: {
    fontSize: 12,
    color: "#666",
    backgroundColor: "rgba(255,255,255,0.7)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },

  bubbleWrap: { marginBottom: 4, maxWidth: "80%" },
  bubbleWrapMine: { alignSelf: "flex-end", alignItems: "flex-end" },
  bubbleWrapTheirs: { alignSelf: "flex-start", alignItems: "flex-start" },

  bubble: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 9,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  bubbleMine: { backgroundColor: "#DCF8C6", borderBottomRightRadius: 4 },
  bubbleTheirs: { backgroundColor: "#fff", borderBottomLeftRadius: 4 },

  bubbleText: { fontSize: 15, lineHeight: 21 },
  bubbleTextMine: { color: "#0D1B0F" },
  bubbleTextTheirs: { color: "#0D1B0F" },

  bubbleMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
    gap: 4,
  },
  bubbleMetaMine: { justifyContent: "flex-end" },
  bubbleMetaTheirs: { justifyContent: "flex-start" },

  bubbleTime: { fontSize: 11, color: "#9E9E9E" },
  readTick: { fontSize: 12, color: "#9E9E9E" },
  readTickRead: { color: "#34B7F1" },

  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: "#F7F9F7",
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === "ios" ? 10 : 8,
    fontSize: 15,
    color: "#0D1B0F",
    maxHeight: 100,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#1A7A35",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#1A7A35",
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  sendBtnDisabled: {
    backgroundColor: "#A5D6A7",
    shadowOpacity: 0,
    elevation: 0,
  },
  sendIcon: { color: "#fff", fontSize: 16, marginLeft: 2 },
});
