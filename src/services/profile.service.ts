import api from './api';
import { USE_MOCK } from '../mock';

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface ProfileSettings {
  user_id: string;
  name: string | null;
  email: string | null;
  email_verified: boolean;
  phone: string | null;
  phone_verified: boolean;
  role: string | null;
  username: string | null;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  language_preference: string;
}

export interface ProfileUpdatePayload {
  display_name?: string;
  username?: string;
  bio?: string;
}

export interface PasswordChangePayload {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export type NotificationChannel = {
  email_enabled: boolean;
  sms_enabled: boolean;
  in_app_enabled: boolean;
};

export type NotificationPreference = {
  notification_type:
    | 'ORDER_UPDATES'
    | 'DELIVERY_UPDATES'
    | 'PAYMENT_NOTIFICATIONS'
    | 'SYSTEM_ANNOUNCEMENTS'
    | 'MARKETING_MESSAGES';
} & NotificationChannel;

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_PROFILE: ProfileSettings = {
  user_id: 'kc-farmer-001',
  name: 'John Mwangi',
  email: 'farmer@farmconnect.com',
  email_verified: true,
  phone: '+254712345678',
  phone_verified: false,
  role: 'FARMER',
  username: 'johnmwangi',
  display_name: 'John Mwangi',
  bio: 'Passionate farmer from the Central Region.',
  avatar_url: null,
  language_preference: 'en',
};

const NOTIFICATION_TYPES: NotificationPreference['notification_type'][] = [
  'ORDER_UPDATES',
  'DELIVERY_UPDATES',
  'PAYMENT_NOTIFICATIONS',
  'SYSTEM_ANNOUNCEMENTS',
  'MARKETING_MESSAGES',
];

function defaultNotificationPreferences(): NotificationPreference[] {
  return NOTIFICATION_TYPES.map((notification_type) => ({
    notification_type,
    email_enabled: true,
    sms_enabled: true,
    in_app_enabled: true,
  }));
}

// In-memory mock state so mutations persist within a session
let mockProfile = { ...MOCK_PROFILE };
let mockNotificationPreferences = defaultNotificationPreferences();

// ─── Profile functions ────────────────────────────────────────────────────────

// GET /profile/settings
export async function getProfileSettings(): Promise<ProfileSettings> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 400));
    return { ...mockProfile };
  }
  const { data } = await api.get<ProfileSettings>('/profile/settings');
  return data;
}

// PATCH /profile/settings
export async function updateProfileSettings(
  payload: ProfileUpdatePayload,
): Promise<ProfileSettings> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 500));
    mockProfile = { ...mockProfile, ...payload };
    return { ...mockProfile };
  }
  const { data } = await api.patch<ProfileSettings>('/profile/settings', payload);
  return data;
}

// POST /profile/change-password
export async function changePassword(
  payload: PasswordChangePayload,
): Promise<{ message: string }> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 600));
    return { message: 'Password changed successfully' };
  }
  const { data } = await api.post<{ message: string }>(
    '/profile/change-password',
    payload,
  );
  return data;
}

// ─── Notification preference functions ───────────────────────────────────────

// GET /profile/notification-preferences
export async function getNotificationPreferences(): Promise<NotificationPreference[]> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 400));
    return [...mockNotificationPreferences];
  }
  const { data } = await api.get<NotificationPreference[]>(
    '/profile/notification-preferences',
  );
  return data;
}

// PUT /profile/notification-preferences
export async function updateNotificationPreferences(
  preferences: NotificationPreference[],
): Promise<NotificationPreference[]> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 400));
    mockNotificationPreferences = [...preferences];
    return [...mockNotificationPreferences];
  }
  const { data } = await api.put<NotificationPreference[]>(
    '/profile/notification-preferences',
    preferences,
  );
  return data;
}
