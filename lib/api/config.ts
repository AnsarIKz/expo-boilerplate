import { useAuthStore } from "@/stores/authStore";
import axios from "axios";

// Base URL - you can put this in env variables later
export const API_BASE_URL = "http://192.168.100.34:7009"; // Replace with your actual API URL

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token and logging
apiClient.interceptors.request.use(
  (config) => {
    console.log("🚀 API Request:", {
      method: config.method?.toUpperCase(),
      url: `${config.baseURL}${config.url}`,
      headers: config.headers,
      data: config.data,
      timeout: config.timeout,
    });

    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("🔑 Added Authorization token");
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

    // Additional network debugging
    if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
      console.log("🔍 Network Error Details:", {
        isConnected:
          typeof navigator !== "undefined" ? navigator.onLine : "unknown",
        requestURL: `${error.config?.baseURL}${error.config?.url}`,
        timeout: error.config?.timeout,
        method: error.config?.method?.toUpperCase(),
        timestamp: new Date().toISOString(),
      });
    }

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

    // Handle 401 Unauthorized - try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const authStore = useAuthStore.getState();
      const refreshToken = authStore.refreshToken;

      if (refreshToken) {
        try {
          console.log("🔄 Attempting token refresh due to 401 error");

          const response = await apiClient.post("/api/v1/auth/refresh-token", {
            refresh_token: refreshToken,
          });

          const newTokens = response.data.data;

          // Update tokens in store
          authStore.updateTokens(
            newTokens.access_token,
            newTokens.refresh_token
          );

          // Update the original request with new token
          originalRequest.headers.Authorization = `Bearer ${newTokens.access_token}`;

          console.log(
            "✅ Token refreshed successfully, retrying original request"
          );

          // Retry the original request
          return apiClient(originalRequest);
        } catch (refreshError) {
          console.error("❌ Token refresh failed:", refreshError);
          console.log("🔓 Auto logout due to refresh failure");
          authStore.logout();
          return Promise.reject(refreshError);
        }
      } else {
        console.log("🔓 No refresh token available - Auto logout");
        authStore.logout();
      }
    }

    return Promise.reject(error);
  }
);
