import { apiClient } from "./config";

// Device Token API types
export interface DeviceRegistrationRequest {
  device_id: string;
  device_type: "ios" | "android" | "web" | "mobile";
  device_name: string;
}

export interface DeviceRegistrationResponse {
  device_id: string;
  created_at: string;
  message: string;
}

export interface DeviceLinkRequest {
  device_id: string;
}

export interface DeviceInfoResponse {
  device_id: string;
  device_token: string;
  device_type: string;
  device_name: string;
  is_linked: boolean;
  linked_user_id?: string;
  created_at: string;
  last_used_at: string;
}

export const deviceTokenApi = {
  // Register new device
  registerDevice: async (
    data: DeviceRegistrationRequest
  ): Promise<DeviceRegistrationResponse> => {
    console.log("📱 Registering device:", data);
    const response = await apiClient.post("/auth/device/register/", data);

    // Handle nested response structure from Django API
    // Response structure: { data: { data: { device_token: "...", device_id: "..." } } }
    if (response.data && response.data.data) {
      return response.data.data;
    }

    // Fallback to direct response.data if structure is different
    return response.data;
  },

  // Link device to user account
  linkDevice: async (data: DeviceLinkRequest): Promise<{ message: string }> => {
    console.log("📱 Linking device to user:", data);
    const response = await apiClient.post("/auth/device/link/", data);
    return response.data;
  },

  // Get device information
  getDeviceInfo: async (): Promise<DeviceInfoResponse> => {
    console.log("📱 Getting device info");
    const response = await apiClient.get("/auth/device/info/");
    return response.data;
  },

  // Check if device token exists
  checkDeviceToken: async (deviceId: string): Promise<boolean> => {
    console.log("📱 Checking device token:", deviceId);
    try {
      const response = await apiClient.get(
        `/api/restaurant/device-tokens/${deviceId}/check/`
      );
      return response.status === 200;
    } catch (error: any) {
      if (error.response?.status === 422) {
        return false; // Token doesn't exist
      }
      throw error; // Re-throw other errors
    }
  },
};
