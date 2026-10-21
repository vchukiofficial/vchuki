import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
import { api, setAuthToken, setUnauthorizedHandler } from '@/lib/api';
import type { User } from '@/lib/types';
import { useSecurity } from './security';

const TOKEN_KEY = 'vchuki_token';

interface AuthState {
  token: string | null;
  user: User | null;
  ready: boolean;
  hydrate: () => Promise<void>;
  signIn: (token: string, user: User) => Promise<void>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
  setUser: (user: User) => void;
}

export const useAuth = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  ready: false,

  hydrate: async () => {
    setUnauthorizedHandler(() => get().signOut());
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      if (token) {
        setAuthToken(token);
        set({ token });
        await get().refresh();
      }
    } catch {
      /* first launch / keychain unavailable */
    }
    set({ ready: true });
  },

  signIn: async (token, user) => {
    setAuthToken(token);
    await SecureStore.setItemAsync(TOKEN_KEY, token).catch(() => {});
    set({ token, user });
  },

  signOut: async () => {
    setAuthToken(null);
    await SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => {});
    // The MPIN/biometric lock belongs to this session — drop it with the session
    await useSecurity.getState().clear();
    set({ token: null, user: null });
  },

  refresh: async () => {
    if (!get().token) return;
    try {
      const { user } = await api<{ user: User }>('/api/mobile/me');
      set({ user });
    } catch {
      /* 401 handled by the api layer; offline keeps the cached token */
    }
  },

  setUser: (user) => set({ user }),
}));
