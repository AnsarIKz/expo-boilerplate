import { useAuthStore } from "@/stores/authStore";
import { useDeviceTokenStore } from "@/stores/deviceTokenStore";
import { setAuthTokens, setTokenCallbacks } from "./config";

/**
 * Initialize API client with store callbacks
 * This should be called once when the app starts
 */
export const initializeApiClient = () => {
  // Set up token callbacks
  setTokenCallbacks(
    // Token refresh callback
    (tokens) => {
      const authStore = useAuthStore.getState();
      authStore.updateTokens(tokens);
    },
    // Logout callback
    () => {
      const authStore = useAuthStore.getState();
      authStore.logout();
    }
  );

  // Set up token synchronization
  const syncTokens = () => {
    const authStore = useAuthStore.getState();
    const deviceTokenStore = useDeviceTokenStore.getState();

    setAuthTokens(
      authStore.accessToken,
      deviceTokenStore.deviceToken,
      authStore.refreshToken
    );
  };

  // Initial sync
  syncTokens();

  // Subscribe to store changes to keep tokens in sync
  const unsubscribeAuth = useAuthStore.subscribe((state) => {
    const deviceTokenStore = useDeviceTokenStore.getState();
    setAuthTokens(
      state.accessToken,
      deviceTokenStore.deviceToken,
      state.refreshToken
    );
  });

  const unsubscribeDevice = useDeviceTokenStore.subscribe((state) => {
    const authStore = useAuthStore.getState();
    setAuthTokens(
      authStore.accessToken,
      state.deviceToken,
      authStore.refreshToken
    );
  });

  // Return cleanup function
  return () => {
    unsubscribeAuth();
    unsubscribeDevice();
  };
};
