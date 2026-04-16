import type { Notification } from '../types';

/**
 * Returns a list of mock notifications covering all four NotifType values.
 * Structured so this function can later be made async
 * (`async getMockNotifications(): Promise<Notification[]>`) without changing callers.
 */
export function getMockNotifications(): Notification[] {
  return [
    // ── order ────────────────────────────────────────────────────────────────
    {
      id: 'notif-order-001',
      type: 'order',
      title: 'Order Confirmed',
      body: 'Your order #ORD-00123 for 50 kg of Maize has been confirmed by the farmer.',
      timestamp: '2026-04-14T09:15:00Z',
      read: true,
    },
    {
      id: 'notif-order-002',
      type: 'order',
      title: 'Payment Received',
      body: 'Escrow payment for order #ORD-00124 has been received. The farmer will prepare your goods.',
      timestamp: '2026-04-12T14:30:00Z',
      read: false,
    },
    {
      id: 'notif-order-003',
      type: 'order',
      title: 'Order Cancelled',
      body: 'Order #ORD-00119 has been cancelled. A refund will be processed within 3 business days.',
      timestamp: '2026-04-10T08:00:00Z',
      read: false,
    },

    // ── delivery ─────────────────────────────────────────────────────────────
    {
      id: 'notif-delivery-001',
      type: 'delivery',
      title: 'Out for Delivery',
      body: 'Your order #ORD-00120 is out for delivery. Expected arrival today between 2 PM and 5 PM.',
      timestamp: '2026-04-14T11:00:00Z',
      read: false,
    },
    {
      id: 'notif-delivery-002',
      type: 'delivery',
      title: 'Delivery Completed',
      body: 'Order #ORD-00118 has been successfully delivered. Please confirm receipt.',
      timestamp: '2026-04-11T16:45:00Z',
      read: true,
    },

    // ── product ──────────────────────────────────────────────────────────────
    {
      id: 'notif-product-001',
      type: 'product',
      title: 'New Harvest Available',
      body: 'Fresh Grade A Tomatoes from Green Valley Farm are now available. Limited stock — order soon!',
      timestamp: '2026-04-13T07:00:00Z',
      read: false,
    },
    {
      id: 'notif-product-002',
      type: 'product',
      title: 'Price Drop Alert',
      body: 'The price of Organic Rice has dropped by 15%. Check the latest listings in the marketplace.',
      timestamp: '2026-04-09T10:20:00Z',
      read: true,
    },

    // ── system ───────────────────────────────────────────────────────────────
    {
      id: 'notif-system-001',
      type: 'system',
      title: 'Scheduled Maintenance',
      body: 'FarmConnect will undergo scheduled maintenance on April 16 from 2 AM to 4 AM UTC. Services may be briefly unavailable.',
      timestamp: '2026-04-14T06:00:00Z',
      read: false,
    },
    {
      id: 'notif-system-002',
      type: 'system',
      title: 'Profile Updated',
      body: 'Your account profile has been updated successfully. If you did not make this change, contact support.',
      timestamp: '2026-04-08T13:55:00Z',
      read: true,
    },
  ];
}
