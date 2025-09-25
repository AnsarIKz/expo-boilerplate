import { deviceTokenApi } from "@/lib/api/deviceToken";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface DeviceTokenState {
  deviceToken: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  generateDeviceToken: () => string;
  registerDevice: () => Promise<void>;
  getDeviceToken: () => string | null;
  clearDeviceToken: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

// Generate unique device token
const generateDeviceToken = (): string => {
  // Use crypto.randomUUID() if available, fallback to custom implementation
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback for environments without crypto.randomUUID
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// Register device with backend
const registerDeviceAPI = async (deviceToken: string): Promise<string> => {
  console.log("📱 Registering device:", deviceToken);

  try {
    const response = await deviceTokenApi.registerDevice({
      device_id: deviceToken,
      device_type: "mobile", // React Native app
      device_name: "React Native App",
    });

    console.log("✅ Device registered successfully:", response);

    // API returns device_id in response, which is our device token
    return response.device_id;
  } catch (error) {
    console.error("❌ Device registration failed:", error);
    throw error;
  }
};

export const useDeviceTokenStore = create<DeviceTokenState>()(
  persist(
    (set, get) => ({
      deviceToken: null,
      isLoading: false,
      error: null,

      generateDeviceToken: () => {
        const deviceToken = generateDeviceToken();
        set({ deviceToken });
        return deviceToken;
      },

      registerDevice: async () => {
        const state = get();

        // If already registered with valid token, return
        if (state.deviceToken) {
          console.log("📱 Device already registered");
          return;
        }

        set({ isLoading: true, error: null });

        try {
          // Generate device token if not exists
          let deviceToken = state.deviceToken;
          if (!deviceToken) {
            deviceToken = state.generateDeviceToken();
          }

          // Register device with backend
          const registeredToken = await registerDeviceAPI(deviceToken);

          set({
            deviceToken: registeredToken,
            isLoading: false,
            error: null,
          });

          console.log("✅ Device token stored successfully");
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Device registration failed";
          set({
            isLoading: false,
            error: errorMessage,
          });
          console.error("❌ Device registration error:", errorMessage);
          throw error;
        }
      },

      getDeviceToken: () => {
        return get().deviceToken;
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
