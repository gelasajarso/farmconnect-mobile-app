import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import type { AuthUser, AuthContextValue, UserRole } from '../types';
import * as authService from '../services/auth.service';
import {
  storeTokens,
  clearTokens,
  getAccessToken,
  getRefreshToken,
  getSystemUserId,
  storeSystemUserId,
} from '../utils/tokenStorage';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Hydrate auth state from secure storage on app launch
  useEffect(() => {
    async function hydrate() {
      try {
        const accessToken = await getAccessToken();
        if (!accessToken) {
          setIsLoading(false);
          return;
        }

        // Restore system_user_id if previously cached
        const cachedSystemUserId = await getSystemUserId();

        // We can't fully reconstruct AuthUser from storage alone without
        // calling /auth/me, but we store minimal user info in a separate key.
        // For now, read the stored user profile.
        const storedProfile = await getStoredUserProfile();
        if (storedProfile) {
          setUser({
            ...storedProfile,
            system_user_id: cachedSystemUserId,
          });
        }
      } catch {
        // Storage read failed — treat as unauthenticated
      } finally {
        setIsLoading(false);
      }
    }
    hydrate();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await authService.login(email, password);

    // Store tokens
    await storeTokens(response.access_token, response.refresh_token);

    // Store user profile for hydration on next launch
    const profile: AuthUser = {
      keycloak_id: response.user.id,
      email: response.user.email,
      name: response.user.name,
      role: response.user.role as UserRole,
      system_user_id: null, // resolved lazily from domain responses
    };
    await storeUserProfile(profile);

    setUser(profile);
  }, []);

  const logout = useCallback(async () => {
    // Clear all tokens and stored profile — no server call needed
    await clearTokens();
    await clearUserProfile();
    setUser(null);
  }, []);

  const resolveSystemUserId = useCallback(async (id: string) => {
    if (!id) return;
    // Idempotent — only update if value differs
    setUser((prev) => {
      if (!prev || prev.system_user_id === id) return prev;
      return { ...prev, system_user_id: id };
    });
    await storeSystemUserId(id);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, resolveSystemUserId }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}

// ─── User Profile Storage Helpers ────────────────────────────────────────────
// Store minimal user profile (without tokens) for session hydration

import * as SecureStore from 'expo-secure-store';

const USER_PROFILE_KEY = 'user_profile';

async function storeUserProfile(profile: AuthUser): Promise<void> {
  const serialized = JSON.stringify({
    keycloak_id: profile.keycloak_id,
    email: profile.email,
    name: profile.name,
    role: profile.role,
  });
  await SecureStore.setItemAsync(USER_PROFILE_KEY, serialized);
}

async function getStoredUserProfile(): Promise<Omit<AuthUser, 'system_user_id'> | null> {
  const raw = await SecureStore.getItemAsync(USER_PROFILE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Omit<AuthUser, 'system_user_id'>;
  } catch {
    return null;
  }
}

async function clearUserProfile(): Promise<void> {
  await SecureStore.deleteItemAsync(USER_PROFILE_KEY);
}
