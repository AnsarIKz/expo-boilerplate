import { deviceTokenApi } from "@/lib/api/deviceToken";
import { useDeviceTokenStore } from "@/stores/deviceTokenStore";

/**
 * Hook for linking device token to user account
 * Should be called after successful user authentication
 */
export const useDeviceTokenLink = () => {
  const { deviceId, isRegistered } = useDeviceTokenStore();

  const linkDeviceToUser = async (): Promise<void> => {
    if (!isRegistered || !deviceId) {
      console.log("📱 Device not registered, skipping link");
      return;
    }

    try {
      console.log("📱 Linking device to user account:", deviceId);
      await deviceTokenApi.linkDevice({ device_id: deviceId });
      console.log("✅ Device linked to user account successfully");
    } catch (error) {
      console.error("❌ Failed to link device to user:", error);
      // Don't throw error - this is not critical for user experience
    }
  };

  return {
    linkDeviceToUser,
  };
};
