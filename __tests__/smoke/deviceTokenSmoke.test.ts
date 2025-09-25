/**
 * Smoke tests for Device Token functionality
 * These tests verify basic functionality without mocking
 */

import { useDeviceTokenStore } from "@/stores/deviceTokenStore";

describe("Device Token Smoke Tests", () => {
  beforeEach(() => {
    // Reset store state
    useDeviceTokenStore.setState({
      deviceToken: null,
      deviceId: null,
      isRegistered: false,
      isLoading: false,
      error: null,
    });
  });

  describe("Store initialization", () => {
    it("should initialize with default values", () => {
      const store = useDeviceTokenStore.getState();

      expect(store.deviceToken).toBe(null);
      expect(store.deviceId).toBe(null);
      expect(store.isRegistered).toBe(false);
      expect(store.isLoading).toBe(false);
      expect(store.error).toBe(null);
    });

    it("should have all required methods", () => {
      const store = useDeviceTokenStore.getState();

      expect(typeof store.generateDeviceId).toBe("function");
      expect(typeof store.registerDevice).toBe("function");
      expect(typeof store.getDeviceToken).toBe("function");
      expect(typeof store.clearDeviceToken).toBe("function");
      expect(typeof store.setLoading).toBe("function");
      expect(typeof store.setError).toBe("function");
    });
  });

  describe("Device ID generation", () => {
    it("should generate valid UUID format", () => {
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

    it("should update deviceId in store", () => {
      const store = useDeviceTokenStore.getState();
      const deviceId = store.generateDeviceId();

      expect(store.deviceId).toBe(deviceId);
    });
  });

  describe("State management", () => {
    it("should set loading state", () => {
      const store = useDeviceTokenStore.getState();

      store.setLoading(true);
      expect(store.isLoading).toBe(true);

      store.setLoading(false);
      expect(store.isLoading).toBe(false);
    });

    it("should set error state", () => {
      const store = useDeviceTokenStore.getState();
      const errorMessage = "Test error";

      store.setError(errorMessage);
      expect(store.error).toBe(errorMessage);

      store.setError(null);
      expect(store.error).toBe(null);
    });

    it("should get device token", () => {
      const store = useDeviceTokenStore.getState();

      // Initially null
      expect(store.getDeviceToken()).toBe(null);

      // Set token and check
      useDeviceTokenStore.setState({ deviceToken: "test-token" });
      expect(store.getDeviceToken()).toBe("test-token");
    });

    it("should clear device token", () => {
      const store = useDeviceTokenStore.getState();

      // Set some state
      useDeviceTokenStore.setState({
        deviceToken: "test-token",
        deviceId: "test-id",
        isRegistered: true,
        error: "test-error",
      });

      // Clear and verify
      store.clearDeviceToken();

      expect(store.deviceToken).toBe(null);
      expect(store.deviceId).toBe(null);
      expect(store.isRegistered).toBe(false);
      expect(store.error).toBe(null);
    });
  });

  describe("Store persistence", () => {
    it("should maintain state across multiple calls", () => {
      const store = useDeviceTokenStore.getState();

      // Set some state
      store.generateDeviceId();
      store.setLoading(true);
      store.setError("test error");

      // Get fresh store instance
      const freshStore = useDeviceTokenStore.getState();

      expect(freshStore.deviceId).toBe(store.deviceId);
      expect(freshStore.isLoading).toBe(true);
      expect(freshStore.error).toBe("test error");
    });
  });
});
