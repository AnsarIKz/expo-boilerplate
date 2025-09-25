import { deviceTokenApi } from "@/lib/api/deviceToken";
import { useDeviceTokenStore } from "@/stores/deviceTokenStore";

// Mock the API
jest.mock("@/lib/api/deviceToken", () => ({
  deviceTokenApi: {
    registerDevice: jest.fn(),
  },
}));

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe("DeviceTokenStore", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Reset store state
    useDeviceTokenStore.setState({
      deviceToken: null,
      deviceId: null,
      isRegistered: false,
      isLoading: false,
      error: null,
    });
  });

  describe("generateDeviceId", () => {
    it("should generate a valid UUID format", () => {
      const store = useDeviceTokenStore.getState();
      const deviceId = store.generateDeviceId();

      // Check UUID v4 format
      expect(deviceId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );
    });

    it("should generate unique IDs", () => {
      const store = useDeviceTokenStore.getState();
      const id1 = store.generateDeviceId();
      const id2 = store.generateDeviceId();

      expect(id1).not.toBe(id2);
    });
  });

  describe("registerDevice", () => {
    it("should register device successfully", async () => {
      const mockDeviceToken = "device-token-123";
      const mockDeviceId = "device-id-123";

      (deviceTokenApi.registerDevice as jest.Mock).mockResolvedValue({
        device_token: mockDeviceToken,
        device_id: mockDeviceId,
        created_at: "2024-01-01T00:00:00Z",
      });

      const store = useDeviceTokenStore.getState();

      // Set device ID first
      store.generateDeviceId();

      await store.registerDevice();

      expect(deviceTokenApi.registerDevice).toHaveBeenCalledWith({
        device_id: expect.any(String),
        device_type: "mobile",
        device_name: "React Native App",
      });

      expect(store.isRegistered).toBe(true);
      expect(store.deviceToken).toBe(mockDeviceToken);
      expect(store.isLoading).toBe(false);
      expect(store.error).toBe(null);
    });

    it("should handle registration failure", async () => {
      const errorMessage = "Network error";
      (deviceTokenApi.registerDevice as jest.Mock).mockRejectedValue(
        new Error(errorMessage)
      );

      const store = useDeviceTokenStore.getState();
      store.generateDeviceId();

      await expect(store.registerDevice()).rejects.toThrow(errorMessage);

      expect(store.isRegistered).toBe(false);
      expect(store.deviceToken).toBe(null);
      expect(store.isLoading).toBe(false);
      expect(store.error).toBe(errorMessage);
    });

    it("should not register if already registered", async () => {
      const store = useDeviceTokenStore.getState();

      // Set as already registered
      useDeviceTokenStore.setState({
        isRegistered: true,
        deviceToken: "existing-token",
      });

      await store.registerDevice();

      expect(deviceTokenApi.registerDevice).not.toHaveBeenCalled();
    });

    it("should set loading state during registration", async () => {
      let resolvePromise: (value: any) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      (deviceTokenApi.registerDevice as jest.Mock).mockReturnValue(promise);

      const store = useDeviceTokenStore.getState();
      store.generateDeviceId();

      const registrationPromise = store.registerDevice();

      // Check loading state
      expect(store.isLoading).toBe(true);

      // Resolve the promise
      resolvePromise!({
        device_token: "token",
        device_id: "id",
        created_at: "2024-01-01T00:00:00Z",
      });

      await registrationPromise;

      expect(store.isLoading).toBe(false);
    });
  });

  describe("getDeviceToken", () => {
    it("should return device token when registered", () => {
      const mockToken = "device-token-123";
      useDeviceTokenStore.setState({
        deviceToken: mockToken,
        isRegistered: true,
      });

      const store = useDeviceTokenStore.getState();
      expect(store.getDeviceToken()).toBe(mockToken);
    });

    it("should return null when not registered", () => {
      const store = useDeviceTokenStore.getState();
      expect(store.getDeviceToken()).toBe(null);
    });
  });

  describe("clearDeviceToken", () => {
    it("should clear all device token data", () => {
      useDeviceTokenStore.setState({
        deviceToken: "token",
        deviceId: "id",
        isRegistered: true,
        error: "some error",
      });

      const store = useDeviceTokenStore.getState();
      store.clearDeviceToken();

      expect(store.deviceToken).toBe(null);
      expect(store.deviceId).toBe(null);
      expect(store.isRegistered).toBe(false);
      expect(store.error).toBe(null);
    });
  });

  describe("setLoading", () => {
    it("should set loading state", () => {
      const store = useDeviceTokenStore.getState();
      store.setLoading(true);
      expect(store.isLoading).toBe(true);

      store.setLoading(false);
      expect(store.isLoading).toBe(false);
    });
  });

  describe("setError", () => {
    it("should set error state", () => {
      const store = useDeviceTokenStore.getState();
      const errorMessage = "Test error";

      store.setError(errorMessage);
      expect(store.error).toBe(errorMessage);

      store.setError(null);
      expect(store.error).toBe(null);
    });
  });
});
