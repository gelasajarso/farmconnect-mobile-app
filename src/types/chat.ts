import type { UserRole } from './index';

export interface Conversation {
  id: string;
  participantId: string;       // keycloak_id of the other person
  participantName: string;
  participantRole: UserRole;
  isOnline: boolean;
  lastMessage: string;
  lastMessageTime: string;     // ISO 8601
  unreadCount: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;            // keycloak_id
  text: string;
  timestamp: string;           // ISO 8601
  isRead: boolean;
}

export interface ChatContextValue {
  conversations: Conversation[];
  getMessages: (conversationId: string) => Message[];
  sendMessage: (conversationId: string, text: string) => void;
  markAsRead: (conversationId: string) => void;
}
