import { User } from "@/lib/api/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  anonymousUserId: string;
  isLoading: boolean;
  isOffline: boolean;

  generateAnonymousUserId: () => string;
  login: (tokens: {
    accessToken: string;
    refreshToken: string;
    user: User;
  }) => void;
  logout: () => void;
  updateTokens: (tokens: { accessToken: string; refreshToken: string }) => void;
  updateUserProfile: (user: User) => void;
  setLoading: (loading: boolean) => void;
  setOffline: (offline: boolean) => void;
}

const generateUserId = (): string => {
  return `anonymous_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      accessToken: null,
      refreshToken: null,
      user: null,
      anonymousUserId: generateUserId(),
      isLoading: false,
      isOffline: false,

      generateAnonymousUserId: () => {
        const newId = generateUserId();
        set({ anonymousUserId: newId });
        return newId;
      },

      login: ({ accessToken, refreshToken, user }) => {
        set({
          isAuthenticated: true,
          accessToken,
          refreshToken,
          user,
          isLoading: false,
        });
      },

      logout: () => {
        set({
          isAuthenticated: false,
          accessToken: null,
          refreshToken: null,
          user: null,
          isLoading: false,
        });
      },

      updateTokens: ({ accessToken, refreshToken }) => {
        set({ accessToken, refreshToken });
      },

      updateUserProfile: (user) => {
        set({ user });
      },

      setLoading: (isLoading) => {
        set({ isLoading });
      },

      setOffline: (isOffline) => {
        set({ isOffline });
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
