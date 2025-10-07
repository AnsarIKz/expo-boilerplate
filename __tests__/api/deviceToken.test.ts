import { apiClient } from "@/lib/api/config";
import { deviceTokenApi } from "@/lib/api/deviceToken";

// Mock axios
jest.mock("@/lib/api/config", () => ({
  apiClient: {
    post: jest.fn(),
    get: jest.fn(),
  },
}));

describe("deviceTokenApi", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("registerDevice", () => {
    it("should register device with correct data", async () => {
      const mockResponse = {
        device_token: "device-token-123",
        device_id: "device-id-123",
        created_at: "2024-01-01T00:00:00Z",
      };

      (apiClient.post as jest.Mock).mockResolvedValue({
        data: mockResponse,
      });

      const registrationData = {
        device_id: "device-id-123",
        device_type: "mobile" as const,
        device_name: "React Native App",
      };

      const result = await deviceTokenApi.registerDevice(registrationData);

      expect(apiClient.post).toHaveBeenCalledWith(
        "/auth/device/register/",
        registrationData
      );
      expect(result).toEqual(mockResponse);
    });

    it("should handle registration errors", async () => {
      const error = new Error("Network error");
      (apiClient.post as jest.Mock).mockRejectedValue(error);

      const registrationData = {
        device_id: "device-id-123",
        device_type: "mobile" as const,
        device_name: "React Native App",
      };

      await expect(
        deviceTokenApi.registerDevice(registrationData)
      ).rejects.toThrow("Network error");
    });
  });

  describe("linkDevice", () => {
    it("should link device with correct data", async () => {
      const mockResponse = {
        message: "Device linked successfully",
      };

      (apiClient.post as jest.Mock).mockResolvedValue({
        data: mockResponse,
      });

      const linkData = {
        device_id: "device-id-123",
      };

      const result = await deviceTokenApi.linkDevice(linkData);

      expect(apiClient.post).toHaveBeenCalledWith(
        "/auth/device/link/",
        linkData
      );
      expect(result).toEqual(mockResponse);
    });

    it("should handle linking errors", async () => {
      const error = new Error("Linking failed");
      (apiClient.post as jest.Mock).mockRejectedValue(error);

      const linkData = {
        device_id: "device-id-123",
      };

      await expect(deviceTokenApi.linkDevice(linkData)).rejects.toThrow(
        "Linking failed"
      );
    });
  });

  describe("getDeviceInfo", () => {
    it("should get device info", async () => {
      const mockResponse = {
        device_id: "device-id-123",
        device_token: "device-token-123",
        device_type: "mobile",
        device_name: "React Native App",
        is_linked: false,
        created_at: "2024-01-01T00:00:00Z",
        last_used_at: "2024-01-01T00:00:00Z",
      };

      (apiClient.get as jest.Mock).mockResolvedValue({
        data: mockResponse,
      });

      const result = await deviceTokenApi.getDeviceInfo();

      expect(apiClient.get).toHaveBeenCalledWith("/auth/device/info/");
      expect(result).toEqual(mockResponse);
    });

    it("should handle get info errors", async () => {
      const error = new Error("Info retrieval failed");
      (apiClient.get as jest.Mock).mockRejectedValue(error);

      await expect(deviceTokenApi.getDeviceInfo()).rejects.toThrow(
        "Info retrieval failed"
      );
    });
  });

  describe("checkDeviceToken", () => {
    it("should return true when device token exists (status 200)", async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({
        status: 200,
        data: {},
      });

      const result = await deviceTokenApi.checkDeviceToken("device-id-123");

      expect(apiClient.get).toHaveBeenCalledWith(
        "/api/restaurant/device-tokens/device-id-123/check/"
      );
      expect(result).toBe(true);
    });

    it("should return false when device token doesn't exist (status 422)", async () => {
      const error = new Error("Token not found");
      (error as any).response = { status: 422 };
      (apiClient.get as jest.Mock).mockRejectedValue(error);

      const result = await deviceTokenApi.checkDeviceToken("device-id-123");

      expect(apiClient.get).toHaveBeenCalledWith(
        "/api/restaurant/device-tokens/device-id-123/check/"
      );
      expect(result).toBe(false);
    });

    it("should throw error for other status codes", async () => {
      const error = new Error("Server error");
      (error as any).response = { status: 500 };
      (apiClient.get as jest.Mock).mockRejectedValue(error);

      await expect(
        deviceTokenApi.checkDeviceToken("device-id-123")
      ).rejects.toThrow("Server error");
    });
  });
});
