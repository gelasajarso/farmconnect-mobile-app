import React, {
  createContext, useContext, useState, useCallback, ReactNode,
} from 'react';
import type { Conversation, Message, ChatContextValue } from '../types/chat';
import { MOCK_CONVERSATIONS, MOCK_MESSAGES, AUTO_REPLIES } from '../mock/chatData';
import { useAuth } from './AuthContext';

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

function uuid(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function formatNow(): string {
  return new Date().toISOString();
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  // Seed conversations for the current role
  const role = user?.role ?? 'FARMER';
  const seedConvs = MOCK_CONVERSATIONS[role] ?? [];

  const [conversations, setConversations] = useState<Conversation[]>(seedConvs);
  const [messages, setMessages] = useState<Record<string, Message[]>>(MOCK_MESSAGES);

  const getMessages = useCallback(
    (conversationId: string): Message[] => messages[conversationId] ?? [],
    [messages],
  );

  const sendMessage = useCallback(
    (conversationId: string, text: string) => {
      if (!user || !text.trim()) return;

      const newMsg: Message = {
        id:             uuid(),
        conversationId,
        senderId:       user.keycloak_id,
        text:           text.trim(),
        timestamp:      formatNow(),
        isRead:         true,
      };

      // Append message
      setMessages(prev => ({
        ...prev,
        [conversationId]: [...(prev[conversationId] ?? []), newMsg],
      }));

      // Update conversation preview
      setConversations(prev =>
        prev.map(c =>
          c.id === conversationId
            ? { ...c, lastMessage: text.trim(), lastMessageTime: formatNow() }
            : c,
        ),
      );

      // Simulate auto-reply after 1–2 s
      const conv = conversations.find(c => c.id === conversationId);
      if (!conv) return;

      const replyPool = AUTO_REPLIES[conv.participantRole] ?? AUTO_REPLIES.ADMIN;
      const replyText = replyPool[Math.floor(Math.random() * replyPool.length)];
      const delay = 1000 + Math.random() * 1000;

      setTimeout(() => {
        const reply: Message = {
          id:             uuid(),
          conversationId,
          senderId:       conv.participantId,
          text:           replyText,
          timestamp:      formatNow(),
          isRead:         false,
        };

        setMessages(prev => ({
          ...prev,
          [conversationId]: [...(prev[conversationId] ?? []), reply],
        }));

        setConversations(prev =>
          prev.map(c =>
            c.id === conversationId
              ? {
                  ...c,
                  lastMessage:     replyText,
                  lastMessageTime: formatNow(),
                  unreadCount:     c.unreadCount + 1,
                }
              : c,
          ),
        );
      }, delay);
    },
    [user, conversations],
  );

  const markAsRead = useCallback((conversationId: string) => {
    setConversations(prev =>
      prev.map(c => c.id === conversationId ? { ...c, unreadCount: 0 } : c),
    );
    setMessages(prev => ({
      ...prev,
      [conversationId]: (prev[conversationId] ?? []).map(m => ({ ...m, isRead: true })),
    }));
  }, []);

  return (
    <ChatContext.Provider value={{ conversations, getMessages, sendMessage, markAsRead }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat(): ChatContextValue {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within a ChatProvider');
  return ctx;
}
