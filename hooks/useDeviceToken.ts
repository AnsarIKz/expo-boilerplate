import { useDeviceTokenStore } from "@/stores/deviceTokenStore";
import { useEffect } from "react";

/**
 * Hook for automatic device token initialization
 * Registers device on first app launch if not already registered
 */
export const useDeviceToken = () => {
  const { deviceToken, isLoading, error, registerDevice, setLoading } =
    useDeviceTokenStore();

  // Device is registered if we have a token
  const isRegistered = !!deviceToken;

  // Reset loading state on mount to handle persisted loading state
  useEffect(() => {
    if (isLoading) {
      console.log("📱 Resetting persisted loading state");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Auto-register device if no token exists
    if (!deviceToken && !isLoading && !error) {
      console.log("📱 Auto-registering device on first launch");
      registerDevice().catch((error) => {
        console.error("❌ Auto device registration failed:", error);
      });
    }
  }, [deviceToken, isLoading, error, registerDevice]);

  return {
    deviceToken,
    isRegistered,
    isLoading,
    error,
    registerDevice,
  };
};
