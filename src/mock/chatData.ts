import type { Conversation, Message } from '../types/chat';

// ─── Seed conversations per role ──────────────────────────────────────────────
// Each entry represents one side of a conversation.
// participant = the OTHER person the logged-in user is talking to.

export const MOCK_CONVERSATIONS: Record<string, Conversation[]> = {

  // ── Farmer sees: Merchant + Admin ──────────────────────────────────────────
  FARMER: [
    {
      id: 'conv-farmer-merchant',
      participantId: 'kc-merchant-001',
      participantName: 'Amina Osei',
      participantRole: 'MERCHANT',
      isOnline: true,
      lastMessage: 'Can you confirm the tomato order?',
      lastMessageTime: '2026-04-17T09:45:00Z',
      unreadCount: 2,
    },
    {
      id: 'conv-farmer-admin',
      participantId: 'kc-admin-001',
      participantName: 'Admin User',
      participantRole: 'ADMIN',
      isOnline: false,
      lastMessage: 'Your listing has been approved.',
      lastMessageTime: '2026-04-16T14:20:00Z',
      unreadCount: 0,
    },
  ],

  // ── Merchant sees: Farmer + Delivery + Admin ────────────────────────────────
  MERCHANT: [
    {
      id: 'conv-farmer-merchant',
      participantId: 'kc-farmer-001',
      participantName: 'John Mwangi',
      participantRole: 'FARMER',
      isOnline: true,
      lastMessage: 'Can you confirm the tomato order?',
      lastMessageTime: '2026-04-17T09:45:00Z',
      unreadCount: 0,
    },
    {
      id: 'conv-merchant-delivery',
      participantId: 'kc-delivery-001',
      participantName: 'Kwame Asante',
      participantRole: 'DELIVERY',
      isOnline: true,
      lastMessage: 'Package picked up, en route.',
      lastMessageTime: '2026-04-17T08:10:00Z',
      unreadCount: 1,
    },
    {
      id: 'conv-merchant-admin',
      participantId: 'kc-admin-001',
      participantName: 'Admin User',
      participantRole: 'ADMIN',
      isOnline: false,
      lastMessage: 'Your account has been verified.',
      lastMessageTime: '2026-04-15T11:00:00Z',
      unreadCount: 0,
    },
  ],

  // ── Delivery sees: Merchant + Admin ────────────────────────────────────────
  DELIVERY: [
    {
      id: 'conv-merchant-delivery',
      participantId: 'kc-merchant-001',
      participantName: 'Amina Osei',
      participantRole: 'MERCHANT',
      isOnline: true,
      lastMessage: 'Package picked up, en route.',
      lastMessageTime: '2026-04-17T08:10:00Z',
      unreadCount: 0,
    },
    {
      id: 'conv-delivery-admin',
      participantId: 'kc-admin-001',
      participantName: 'Admin User',
      participantRole: 'ADMIN',
      isOnline: false,
      lastMessage: 'Please confirm delivery by 5 PM.',
      lastMessageTime: '2026-04-17T07:00:00Z',
      unreadCount: 1,
    },
  ],

  // ── Admin sees: Farmer + Merchant + Delivery ───────────────────────────────
  ADMIN: [
    {
      id: 'conv-farmer-admin',
      participantId: 'kc-farmer-001',
      participantName: 'John Mwangi',
      participantRole: 'FARMER',
      isOnline: true,
      lastMessage: 'Your listing has been approved.',
      lastMessageTime: '2026-04-16T14:20:00Z',
      unreadCount: 0,
    },
    {
      id: 'conv-merchant-admin',
      participantId: 'kc-merchant-001',
      participantName: 'Amina Osei',
      participantRole: 'MERCHANT',
      isOnline: true,
      lastMessage: 'Your account has been verified.',
      lastMessageTime: '2026-04-15T11:00:00Z',
      unreadCount: 0,
    },
    {
      id: 'conv-delivery-admin',
      participantId: 'kc-delivery-001',
      participantName: 'Kwame Asante',
      participantRole: 'DELIVERY',
      isOnline: false,
      lastMessage: 'Please confirm delivery by 5 PM.',
      lastMessageTime: '2026-04-17T07:00:00Z',
      unreadCount: 2,
    },
  ],

  // MANAGER / AGENT same as ADMIN
  MANAGER: [],
  AGENT:   [],
};

// ─── Seed messages per conversation ──────────────────────────────────────────

export const MOCK_MESSAGES: Record<string, Message[]> = {

  'conv-farmer-merchant': [
    { id: 'm1', conversationId: 'conv-farmer-merchant', senderId: 'kc-farmer-001',   text: 'Hello Amina, I have fresh tomatoes ready for pickup.', timestamp: '2026-04-17T09:30:00Z', isRead: true },
    { id: 'm2', conversationId: 'conv-farmer-merchant', senderId: 'kc-merchant-001', text: 'Great! How many kg are available?', timestamp: '2026-04-17T09:32:00Z', isRead: true },
    { id: 'm3', conversationId: 'conv-farmer-merchant', senderId: 'kc-farmer-001',   text: 'About 450 kg, Grade A quality.', timestamp: '2026-04-17T09:35:00Z', isRead: true },
    { id: 'm4', conversationId: 'conv-farmer-merchant', senderId: 'kc-merchant-001', text: 'Perfect. I will place an order today.', timestamp: '2026-04-17T09:40:00Z', isRead: true },
    { id: 'm5', conversationId: 'conv-farmer-merchant', senderId: 'kc-merchant-001', text: 'Can you confirm the tomato order?', timestamp: '2026-04-17T09:45:00Z', isRead: false },
  ],

  'conv-farmer-admin': [
    { id: 'm6', conversationId: 'conv-farmer-admin', senderId: 'kc-admin-001',  text: 'Hi John, we reviewed your new product listing.', timestamp: '2026-04-16T14:10:00Z', isRead: true },
    { id: 'm7', conversationId: 'conv-farmer-admin', senderId: 'kc-farmer-001', text: 'Thank you! Is everything okay?', timestamp: '2026-04-16T14:15:00Z', isRead: true },
    { id: 'm8', conversationId: 'conv-farmer-admin', senderId: 'kc-admin-001',  text: 'Your listing has been approved.', timestamp: '2026-04-16T14:20:00Z', isRead: true },
  ],

  'conv-merchant-delivery': [
    { id: 'm9',  conversationId: 'conv-merchant-delivery', senderId: 'kc-merchant-001', text: 'Kwame, order #ORD-0002 is ready for pickup.', timestamp: '2026-04-17T07:50:00Z', isRead: true },
    { id: 'm10', conversationId: 'conv-merchant-delivery', senderId: 'kc-delivery-001', text: 'On my way. ETA 30 minutes.', timestamp: '2026-04-17T07:55:00Z', isRead: true },
    { id: 'm11', conversationId: 'conv-merchant-delivery', senderId: 'kc-delivery-001', text: 'Package picked up, en route.', timestamp: '2026-04-17T08:10:00Z', isRead: false },
  ],

  'conv-merchant-admin': [
    { id: 'm12', conversationId: 'conv-merchant-admin', senderId: 'kc-admin-001',  text: 'Hello Amina, your merchant account has been reviewed.', timestamp: '2026-04-15T10:50:00Z', isRead: true },
    { id: 'm13', conversationId: 'conv-merchant-admin', senderId: 'kc-merchant-001', text: 'Thank you! Any issues?', timestamp: '2026-04-15T10:55:00Z', isRead: true },
    { id: 'm14', conversationId: 'conv-merchant-admin', senderId: 'kc-admin-001',  text: 'Your account has been verified.', timestamp: '2026-04-15T11:00:00Z', isRead: true },
  ],

  'conv-delivery-admin': [
    { id: 'm15', conversationId: 'conv-delivery-admin', senderId: 'kc-admin-001',  text: 'Kwame, you have 3 deliveries scheduled today.', timestamp: '2026-04-17T06:50:00Z', isRead: true },
    { id: 'm16', conversationId: 'conv-delivery-admin', senderId: 'kc-delivery-001', text: 'Understood. I will start at 8 AM.', timestamp: '2026-04-17T06:55:00Z', isRead: true },
    { id: 'm17', conversationId: 'conv-delivery-admin', senderId: 'kc-admin-001',  text: 'Please confirm delivery by 5 PM.', timestamp: '2026-04-17T07:00:00Z', isRead: false },
  ],
};

// ─── Auto-reply pool per role ─────────────────────────────────────────────────

export const AUTO_REPLIES: Record<string, string[]> = {
  FARMER: [
    'Sure, I can arrange that.',
    'The harvest is fresh, picked this morning.',
    'I will check and get back to you.',
    'Yes, that quantity is available.',
    'Thank you for your interest!',
  ],
  MERCHANT: [
    'I will place the order shortly.',
    'Can you offer a bulk discount?',
    'When can you deliver?',
    'That works for me.',
    'Please confirm the price.',
  ],
  DELIVERY: [
    'On my way now.',
    'Package received and secured.',
    'Estimated delivery in 1 hour.',
    'Delivered successfully.',
    'Any special instructions?',
  ],
  ADMIN: [
    'Your request has been processed.',
    'Please allow 24 hours for review.',
    'Account updated successfully.',
    'Thank you for contacting support.',
    'Issue has been escalated.',
  ],
};
