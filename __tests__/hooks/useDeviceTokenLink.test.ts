import { useDeviceTokenLink } from "@/hooks/useDeviceTokenLink";
import { deviceTokenApi } from "@/lib/api/deviceToken";
import { useDeviceTokenStore } from "@/stores/deviceTokenStore";
import { renderHook } from "@testing-library/react-native";

// Mock the dependencies
jest.mock("@/stores/deviceTokenStore", () => ({
  useDeviceTokenStore: jest.fn(),
}));

jest.mock("@/lib/api/deviceToken", () => ({
  deviceTokenApi: {
    linkDevice: jest.fn(),
  },
}));

describe("useDeviceTokenLink", () => {
  const mockLinkDevice = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (deviceTokenApi.linkDevice as jest.Mock).mockImplementation(mockLinkDevice);
  });

  it("should return linkDeviceToUser function", () => {
    (useDeviceTokenStore as jest.Mock).mockReturnValue({
      deviceId: "device-id-123",
      isRegistered: true,
    });

    const { result } = renderHook(() => useDeviceTokenLink());

    expect(typeof result.current.linkDeviceToUser).toBe("function");
  });

  it("should link device to user when device is registered", async () => {
    const mockDeviceId = "device-id-123";
    (useDeviceTokenStore as jest.Mock).mockReturnValue({
      deviceId: mockDeviceId,
      isRegistered: true,
    });

    mockLinkDevice.mockResolvedValue({ message: "Device linked successfully" });

    const { result } = renderHook(() => useDeviceTokenLink());

    await result.current.linkDeviceToUser();

    expect(mockLinkDevice).toHaveBeenCalledWith({ device_id: mockDeviceId });
  });

  it("should not link device when device is not registered", async () => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation();

    (useDeviceTokenStore as jest.Mock).mockReturnValue({
      deviceId: null,
      isRegistered: false,
    });

    const { result } = renderHook(() => useDeviceTokenLink());

    await result.current.linkDeviceToUser();

    expect(mockLinkDevice).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith(
      "📱 Device not registered, skipping link"
    );

    consoleSpy.mockRestore();
  });

  it("should not link device when device ID is missing", async () => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation();

    (useDeviceTokenStore as jest.Mock).mockReturnValue({
      deviceId: null,
      isRegistered: true,
    });

    const { result } = renderHook(() => useDeviceTokenLink());

    await result.current.linkDeviceToUser();

    expect(mockLinkDevice).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith(
      "📱 Device not registered, skipping link"
    );

    consoleSpy.mockRestore();
  });

  it("should handle linking errors gracefully", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();

    (useDeviceTokenStore as jest.Mock).mockReturnValue({
      deviceId: "device-id-123",
      isRegistered: true,
    });

    mockLinkDevice.mockRejectedValue(new Error("Linking failed"));

    const { result } = renderHook(() => useDeviceTokenLink());

    // Should not throw
    await expect(result.current.linkDeviceToUser()).resolves.toBeUndefined();

    expect(consoleSpy).toHaveBeenCalledWith(
      "❌ Failed to link device to user:",
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });

  it("should log successful linking", async () => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation();

    (useDeviceTokenStore as jest.Mock).mockReturnValue({
      deviceId: "device-id-123",
      isRegistered: true,
    });

    mockLinkDevice.mockResolvedValue({ message: "Device linked successfully" });

    const { result } = renderHook(() => useDeviceTokenLink());

    await result.current.linkDeviceToUser();

    expect(consoleSpy).toHaveBeenCalledWith(
      "📱 Linking device to user account:",
      "device-id-123"
    );
    expect(consoleSpy).toHaveBeenCalledWith(
      "✅ Device linked to user account successfully"
    );

    consoleSpy.mockRestore();
  });
});
