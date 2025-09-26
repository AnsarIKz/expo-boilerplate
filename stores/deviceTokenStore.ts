import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface DeviceTokenState {
  deviceToken: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  getDeviceToken: () => string | null;
  setDeviceToken: (token: string) => void;
  clearDeviceToken: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  initializeDeviceToken: () => Promise<void>;
}

export const useDeviceTokenStore = create<DeviceTokenState>()(
  persist(
    (set, get) => ({
      deviceToken: null,
      isLoading: false,
      error: null,

      getDeviceToken: () => {
        return get().deviceToken;
      },

      setDeviceToken: (token: string) => {
        set({ deviceToken: token, error: null });
      },

      clearDeviceToken: () => {
        set({
          deviceToken: null,
          error: null,
        });
      },

      setLoading: (isLoading) => {
        set({ isLoading });
      },

      setError: (error) => {
        set({ error });
      },

      initializeDeviceToken: async () => {
        const state = get();

        // If device token already exists, no need to initialize
        if (state.deviceToken) {
          console.log(
            "📱 Device token already exists, skipping initialization"
          );
          return;
        }

        // If already loading, don't start another initialization
        if (state.isLoading) {
          console.log("📱 Device token initialization already in progress");
          return;
        }

        console.log("📱 Starting device token initialization");
        set({ isLoading: true, error: null });

        try {
          // Import ensureDeviceToken dynamically to avoid circular dependency
          const { ensureDeviceToken } = await import("@/lib/api/config");
          await ensureDeviceToken();
        } catch (error) {
          console.error("Failed to initialize device token:", error);
          set({ error: "Failed to initialize device token" });
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: "device-token-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        deviceToken: state.deviceToken,
        error: state.error,
        // Exclude isLoading from persistence as it's a temporary state
      }),
    }
  )
);
