import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import type { Notification, NotificationContextValue } from '../types';
import { getMockNotifications } from '../services/notification.service';

const NotificationContext = createContext<NotificationContextValue | undefined>(
  undefined,
);

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    try {
      const data = getMockNotifications();
      setNotifications(data);
    } catch {
      setNotifications([]);
    }
  }, []);

  // Derived on every render
  const unreadCount = notifications.filter((n) => !n.read).length;

  function markAsRead(id: string): void {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  }

  function markAllAsRead(): void {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  function clearAll(): void {
    setNotifications([]);
  }

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, markAsRead, markAllAsRead, clearAll }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications(): NotificationContextValue {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error(
      'useNotifications must be used within a NotificationProvider',
    );
  }
  return ctx;
}
