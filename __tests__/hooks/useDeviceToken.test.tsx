import { useDeviceToken } from "@/hooks/useDeviceToken";
import { useDeviceTokenStore } from "@/stores/deviceTokenStore";
import { act, renderHook } from "@testing-library/react-native";

// Mock the store
jest.mock("@/stores/deviceTokenStore", () => ({
  useDeviceTokenStore: jest.fn(),
}));

describe("useDeviceToken", () => {
  const mockRegisterDevice = jest.fn();
  const mockStore = {
    deviceToken: null,
    isRegistered: false,
    isLoading: false,
    error: null,
    registerDevice: mockRegisterDevice,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useDeviceTokenStore as jest.Mock).mockReturnValue(mockStore);
  });

  it("should return store values", () => {
    const { result } = renderHook(() => useDeviceToken());

    expect(result.current.deviceToken).toBe(null);
    expect(result.current.isRegistered).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.registerDevice).toBe(mockRegisterDevice);
  });

  it("should auto-register device when not registered", async () => {
    mockRegisterDevice.mockResolvedValue(undefined);

    renderHook(() => useDeviceToken());

    // Wait for useEffect to run
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(mockRegisterDevice).toHaveBeenCalled();
  });

  it("should not auto-register if already registered", async () => {
    (useDeviceTokenStore as jest.Mock).mockReturnValue({
      ...mockStore,
      isRegistered: true,
    });

    renderHook(() => useDeviceToken());

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(mockRegisterDevice).not.toHaveBeenCalled();
  });

  it("should not auto-register if loading", async () => {
    (useDeviceTokenStore as jest.Mock).mockReturnValue({
      ...mockStore,
      isLoading: true,
    });

    renderHook(() => useDeviceToken());

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(mockRegisterDevice).not.toHaveBeenCalled();
  });

  it("should not auto-register if there's an error", async () => {
    (useDeviceTokenStore as jest.Mock).mockReturnValue({
      ...mockStore,
      error: "Some error",
    });

    renderHook(() => useDeviceToken());

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(mockRegisterDevice).not.toHaveBeenCalled();
  });

  it("should handle registration errors gracefully", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();
    mockRegisterDevice.mockRejectedValue(new Error("Registration failed"));

    renderHook(() => useDeviceToken());

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      "❌ Auto device registration failed:",
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });
});
