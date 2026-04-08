import * as SecureStore from 'expo-secure-store';

export const TOKEN_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  SYSTEM_USER_ID: 'system_user_id',
} as const;

export async function storeTokens(access: string, refresh: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEYS.ACCESS_TOKEN, access);
  await SecureStore.setItemAsync(TOKEN_KEYS.REFRESH_TOKEN, refresh);
}

export async function getAccessToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEYS.ACCESS_TOKEN);
}

export async function getRefreshToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEYS.REFRESH_TOKEN);
}

export async function clearTokens(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEYS.ACCESS_TOKEN);
  await SecureStore.deleteItemAsync(TOKEN_KEYS.REFRESH_TOKEN);
  await SecureStore.deleteItemAsync(TOKEN_KEYS.SYSTEM_USER_ID);
}

export async function storeSystemUserId(id: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEYS.SYSTEM_USER_ID, id);
}

export async function getSystemUserId(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEYS.SYSTEM_USER_ID);
}
