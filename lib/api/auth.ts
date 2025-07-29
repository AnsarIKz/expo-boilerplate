import { apiClient } from "./config";
import type {
  ApiResponse,
  DeleteAccountResponse,
  LoginRequest,
  LoginResponse,
  LogoutRequest,
  LogoutResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  SendVerificationRequest,
  SendVerificationResponse,
  SessionResponse,
  VerifyAndRegisterRequest,
  VerifyAndRegisterResponse,
} from "./types";

export const authApi = {
  // Send verification code
  sendVerification: async (
    data: SendVerificationRequest
  ): Promise<ApiResponse<SendVerificationResponse>> => {
    console.log("📱 Starting sendVerification API call:", {
      phoneNumber: data.phoneNumber,
      timestamp: new Date().toISOString(),
    });

    try {
      const response = await apiClient.post(
        "/api/v1/auth/send-verification",
        data
      );

      console.log("📱 sendVerification SUCCESS:", {
        status: response.status,
        data: response.data,
        timestamp: new Date().toISOString(),
      });

      return response.data;
    } catch (error) {
      console.error("📱 sendVerification FAILED:", {
        error: error,
        phoneNumber: data.phoneNumber,
        timestamp: new Date().toISOString(),
      });
      throw error;
    }
  },

  // Login with password
  login: async (data: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    console.log("🔐 Starting login API call:", {
      phoneNumber: data.phoneNumber,
      timestamp: new Date().toISOString(),
    });

    try {
      const response = await apiClient.post("/api/v1/auth/login", data);

      console.log("🔐 login SUCCESS:", {
        status: response.status,
        user: response.data.data?.user || response.data.user,
        hasToken: !!(
          response.data.data?.access_token || response.data.access_token
        ),
        timestamp: new Date().toISOString(),
      });

      return response.data;
    } catch (error) {
      console.error("🔐 login FAILED:", {
        error: error,
        phoneNumber: data.phoneNumber,
        timestamp: new Date().toISOString(),
      });
      throw error;
    }
  },

  // Verify code and register
  verifyAndRegister: async (
    data: VerifyAndRegisterRequest
  ): Promise<ApiResponse<VerifyAndRegisterResponse>> => {
    console.log("👤 Starting verifyAndRegister API call:", {
      phoneNumber: data.phoneNumber,
      code: data.code,
      firstName: data.firstName,
      lastName: data.lastName,
      timestamp: new Date().toISOString(),
    });

    try {
      const response = await apiClient.post(
        "/api/v1/auth/verify-and-register",
        data
      );

      console.log("👤 verifyAndRegister SUCCESS:", {
        status: response.status,
        user: response.data.data.user,
        hasToken: !!response.data.data.access_token,
        timestamp: new Date().toISOString(),
      });

      return response.data;
    } catch (error) {
      console.error("👤 verifyAndRegister FAILED:", {
        error: error,
        phoneNumber: data.phoneNumber,
        timestamp: new Date().toISOString(),
      });
      throw error;
    }
  },

  // Get current session
  getSession: async (): Promise<ApiResponse<SessionResponse>> => {
    console.log("👤 Starting getSession API call:", {
      timestamp: new Date().toISOString(),
    });

    try {
      const response = await apiClient.get("/api/v1/auth/session");

      console.log("👤 getSession SUCCESS:", {
        status: response.status,
        user: response.data.data.user,
        timestamp: new Date().toISOString(),
      });

      return response.data;
    } catch (error: any) {
      // Check if it's a network error
      const isNetworkError =
        error?.code === "ECONNABORTED" ||
        error?.code === "ERR_NETWORK" ||
        error?.message === "Network Error" ||
        error?.message?.includes("timeout");

      if (isNetworkError) {
        // Log network errors silently
        console.log("👤 getSession NETWORK ERROR (silent):", {
          timestamp: new Date().toISOString(),
        });
      } else {
        // Log non-network errors normally
        console.error("👤 getSession FAILED:", {
          error: error,
          timestamp: new Date().toISOString(),
        });
      }

      throw error;
    }
  },

  // Refresh access token
  refreshToken: async (
    data: RefreshTokenRequest
  ): Promise<ApiResponse<RefreshTokenResponse>> => {
    console.log("🔄 Starting refreshToken API call:", {
      timestamp: new Date().toISOString(),
    });

    try {
      const response = await apiClient.post("/api/v1/auth/refresh-token", data);

      console.log("🔄 refreshToken SUCCESS:", {
        status: response.status,
        hasNewToken: !!response.data.data.access_token,
        timestamp: new Date().toISOString(),
      });

      return response.data;
    } catch (error) {
      console.error("🔄 refreshToken FAILED:", {
        error: error,
        timestamp: new Date().toISOString(),
      });
      throw error;
    }
  },

  // Logout
  logout: async (data: LogoutRequest): Promise<ApiResponse<LogoutResponse>> => {
    console.log("🚪 Starting logout API call:", {
      timestamp: new Date().toISOString(),
    });

    try {
      const response = await apiClient.post("/api/v1/auth/logout", data);

      console.log("🚪 logout SUCCESS:", {
        status: response.status,
        message: response.data.data.message,
        timestamp: new Date().toISOString(),
      });

      return response.data;
    } catch (error) {
      console.error("🚪 logout FAILED:", {
        error: error,
        timestamp: new Date().toISOString(),
      });
      throw error;
    }
  },

  // Delete account
  deleteAccount: async (): Promise<ApiResponse<DeleteAccountResponse>> => {
    console.log("🗑️ Starting deleteAccount API call:", {
      timestamp: new Date().toISOString(),
    });

    try {
      const response = await apiClient.delete("/api/v1/auth/delete-account");

      console.log("🗑️ deleteAccount SUCCESS:", {
        status: response.status,
        message: response.data.data?.message || response.data.message,
        timestamp: new Date().toISOString(),
      });

      return response.data;
    } catch (error) {
      console.error("🗑️ deleteAccount FAILED:", {
        error: error,
        timestamp: new Date().toISOString(),
      });
      throw error;
    }
  },
};
