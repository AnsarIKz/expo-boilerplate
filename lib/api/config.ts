import axios from "axios";

// Flag to prevent multiple concurrent refresh attempts
let isRefreshing = false;
let failedRequestsQueue: any[] = [];

// Base URLs for Django Restaurant API
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  "https://api-production-4ce8.up.railway.app"; // Django API URL
export const API_PREFIX = "/api"; // API prefix

// Debug logging
console.log("🔧 API Configuration Debug:");
console.log("Normalized API_BASE_URL:", API_BASE_URL);
console.log("Final baseURL:", `${API_BASE_URL}${API_PREFIX}`);

// Create axios instance
export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}${API_PREFIX}`,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Function to set auth tokens for the API client
export const setAuthTokens = (
  accessToken: string | null,
  deviceToken: string | null,
  refreshToken?: string | null
) => {
  // Store tokens for use in interceptors
  (apiClient as any)._accessToken = accessToken;
  (apiClient as any)._deviceToken = deviceToken;
  if (refreshToken !== undefined) {
    (apiClient as any)._refreshToken = refreshToken;
  }
};

// Callback functions for token management
let onTokenRefresh:
  | ((tokens: { accessToken: string; refreshToken: string }) => void)
  | null = null;
let onLogout: (() => void) | null = null;

export const setTokenCallbacks = (
  refreshCallback: (tokens: {
    accessToken: string;
    refreshToken: string;
  }) => void,
  logoutCallback: () => void
) => {
  onTokenRefresh = refreshCallback;
  onLogout = logoutCallback;
};

// Request interceptor to add auth token and logging
apiClient.interceptors.request.use(
  (config) => {
    const fullUrl = `${config.baseURL}${config.url}`;
    console.log("🚀 API Request:", {
      method: config.method?.toUpperCase(),
      baseURL: config.baseURL,
      endpoint: config.url,
      fullURL: fullUrl,
      headers: config.headers,
      data: config.data,
      timeout: config.timeout,
    });

    const accessToken = (apiClient as any)._accessToken;
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
      console.log("🔑 Added Authorization token");
    } else {
      // If no auth token, try to use device token
      const deviceToken = (apiClient as any)._deviceToken;
      if (deviceToken) {
        config.headers["X-Device-Token"] = deviceToken;
        console.log("📱 Added Device Token");
      }
    }
    return config;
  },
  (error) => {
    console.error("❌ Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and logging
apiClient.interceptors.response.use(
  (response) => {
    console.log("✅ API Response:", {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: response.data,
      url: response.config.url,
    });
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Check for network errors (server unreachable) FIRST
    const isNetworkError =
      error.code === "ECONNABORTED" ||
      error.code === "ERR_NETWORK" ||
      error.message === "Network Error" ||
      error.message?.includes("timeout");

    if (isNetworkError) {
      // Log network errors silently (less verbose)
      console.log("🌐 Network Error (silent):", {
        isConnected:
          typeof navigator !== "undefined" ? navigator.onLine : "unknown",
        requestURL: `${error.config?.baseURL}${error.config?.url}`,
        timeout: error.config?.timeout,
        method: error.config?.method?.toUpperCase(),
        timestamp: new Date().toISOString(),
        errorType: "NETWORK_UNREACHABLE",
      });

      // Don't attempt token refresh for network errors
      return Promise.reject(error);
    }

    // Log non-network errors normally
    console.error("❌ API Response Error:", {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      baseURL: error.config?.baseURL,
      data: error.response?.data,
      headers: error.response?.headers,
      fullURL: `${error.config?.baseURL}${error.config?.url}`,
    });

    // Enhanced error logging by status code
    if (error.response?.status) {
      const status = error.response.status;
      console.log(`🚨 HTTP ${status} Error:`, {
        endpoint: error.config?.url,
        method: error.config?.method?.toUpperCase(),
        message: error.response?.data?.message || error.message,
        details: error.response?.data,
      });
    }

    // Handle 401 Unauthorized - try to refresh token (only if not a network error)
    // BUT exclude refresh token endpoint to prevent infinite loops
    const isRefreshTokenEndpoint = originalRequest.url?.includes(
      "/auth/refresh-token/"
    );

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isRefreshTokenEndpoint
    ) {
      originalRequest._retry = true;

      // Get refresh token from stored tokens
      const refreshToken = (apiClient as any)._refreshToken;

      if (refreshToken) {
        // If already refreshing, queue this request
        if (isRefreshing) {
          console.log("🔄 Token refresh already in progress, queueing request");
          return new Promise((resolve, reject) => {
            failedRequestsQueue.push({
              resolve,
              reject,
              config: originalRequest,
            });
          });
        }

        isRefreshing = true;

        try {
          console.log("🔄 Attempting token refresh due to 401 error");

          const response = await apiClient.post("/auth/refresh-token/", {
            refresh_token: refreshToken,
          });

          const newTokens = response.data.data;

          // Update tokens using callback
          if (onTokenRefresh) {
            onTokenRefresh({
              accessToken: newTokens.access_token,
              refreshToken: newTokens.refresh_token,
            });
          }

          // Update stored tokens
          (apiClient as any)._accessToken = newTokens.access_token;
          (apiClient as any)._refreshToken = newTokens.refresh_token;

          // Update the original request with new token
          originalRequest.headers.Authorization = `Bearer ${newTokens.access_token}`;

          console.log(
            "✅ Token refreshed successfully, retrying original request"
          );

          // Process queued requests with new token
          failedRequestsQueue.forEach(({ resolve, config }) => {
            config.headers.Authorization = `Bearer ${newTokens.access_token}`;
            resolve(apiClient(config));
          });
          failedRequestsQueue = [];

          // Retry the original request
          return apiClient(originalRequest);
        } catch (refreshError) {
          console.error("❌ Token refresh failed:", refreshError);
          console.log("🔓 Auto logout due to refresh failure");

          // Reject all queued requests
          failedRequestsQueue.forEach(({ reject }) => {
            reject(refreshError);
          });
          failedRequestsQueue = [];

          if (onLogout) {
            onLogout();
          }
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else {
        console.log("🔓 No refresh token available - Auto logout");
        if (onLogout) {
          onLogout();
        }
      }
    }

    // Handle 401 on refresh token endpoint specifically - logout immediately
    if (error.response?.status === 401 && isRefreshTokenEndpoint) {
      console.log("🔓 Refresh token is invalid - Auto logout");

      // Reset refresh flags to prevent stuck states
      isRefreshing = false;
      failedRequestsQueue = [];

      if (onLogout) {
        onLogout();
      }
    }

    return Promise.reject(error);
  }
);

// Health check function for testing connectivity
export const checkApiHealth = async (): Promise<boolean> => {
  const endpointsToTry = [
    "/health/", // Django health endpoint
    "/", // API root
  ];

  for (const endpoint of endpointsToTry) {
    try {
      console.log(`🌐 Trying health check on: ${endpoint}`);

      // Make a simple HEAD request
      const response = await apiClient.head(endpoint, {
        timeout: 5000,
        validateStatus: () => true, // Accept any HTTP status as "server reachable"
      });

      console.log(
        `🌐 API Health Check SUCCESS: Server is reachable via ${endpoint}`
      );
      return true;
    } catch (error: any) {
      console.log(`🌐 Health check failed for ${endpoint}:`, error.message);

      // Check if it's a network connectivity issue
      const isNetworkError =
        error?.code === "ECONNABORTED" ||
        error?.code === "ERR_NETWORK" ||
        error?.message === "Network Error" ||
        error?.message?.includes("timeout") ||
        error?.message?.includes("ECONNREFUSED");

      if (!isNetworkError) {
        // Server responded with some error, but it's reachable
        console.log(
          `🌐 API Health Check: Server reachable via ${endpoint} (with error)`
        );
        return true;
      }

      // Continue to next endpoint if this one failed with network error
    }
  }

  console.log("🌐 API Health Check FAILED: All endpoints unreachable");
  return false;
};
