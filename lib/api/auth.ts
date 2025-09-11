import { adaptAuthUserToUser, adaptSessionUserToUser } from "./adapters";
import { apiClient } from "./config";
import type {
  ApiResponse,
  ChangePasswordRequest,
  ConfirmForgotPasswordRequest,
  DeleteAccountResponse,
  ForgotPasswordRequest,
  LoginRequest,
  LoginResponse,
  LogoutRequest,
  LogoutResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  SendLoginCodeRequest,
  SendLoginCodeResponse,
  SendVerificationRequest,
  SendVerificationResponse,
  SessionResponse,
  VerifyAndRegisterRequest,
  VerifyAndRegisterResponse,
  VerifyLoginCodeRequest,
  VerifyLoginCodeResponse,
} from "./types";

export const authApi = {
  // Send verification code for registration
  sendVerification: async (
    data: SendVerificationRequest
  ): Promise<ApiResponse<SendVerificationResponse>> => {
    console.log("📱 Starting sendVerification API call:", {
      phoneNumber: data.phone_number,
      timestamp: new Date().toISOString(),
    });

    try {
      const response = await apiClient.post(
        "/auth/send-verification-code/",
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
        phoneNumber: data.phone_number,
        timestamp: new Date().toISOString(),
      });
      throw error;
    }
  },

  // Send login code
  sendLoginCode: async (
    data: SendLoginCodeRequest
  ): Promise<ApiResponse<SendLoginCodeResponse>> => {
    console.log("📱 Starting sendLoginCode API call:", {
      phoneNumber: data.phone_number,
      timestamp: new Date().toISOString(),
    });

    try {
      const response = await apiClient.post("/auth/login/send-code/", data);

      console.log("📱 sendLoginCode SUCCESS:", {
        status: response.status,
        data: response.data,
        timestamp: new Date().toISOString(),
      });

      return response.data;
    } catch (error) {
      console.error("📱 sendLoginCode FAILED:", {
        error: error,
        phoneNumber: data.phone_number,
        timestamp: new Date().toISOString(),
      });
      throw error;
    }
  },

  // Verify login code
  verifyLoginCode: async (
    data: VerifyLoginCodeRequest
  ): Promise<ApiResponse<VerifyLoginCodeResponse>> => {
    console.log("🔐 Starting verifyLoginCode API call:", {
      phoneNumber: data.phone_number,
      timestamp: new Date().toISOString(),
    });

    try {
      const response = await apiClient.post("/auth/login/verify-code/", data);

      console.log("🔐 verifyLoginCode SUCCESS:", {
        status: response.status,
        user: response.data.data?.user,
        hasToken: !!response.data.data?.access_token,
        timestamp: new Date().toISOString(),
      });

      // Адаптируем ответ под наш формат
      const adaptedResponse = {
        ...response.data,
        data: {
          ...response.data.data,
          user: adaptAuthUserToUser(response.data.data.user),
        },
      };

      return adaptedResponse;
    } catch (error) {
      console.error("🔐 verifyLoginCode FAILED:", {
        error: error,
        phoneNumber: data.phone_number,
        timestamp: new Date().toISOString(),
      });
      throw error;
    }
  },

  // Legacy login with password (deprecated)
  login: async (data: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    console.log("🔐 [DEPRECATED] Starting legacy login API call:", {
      phoneNumber: data.phoneNumber,
      timestamp: new Date().toISOString(),
    });

    try {
      // Convert legacy format to new SMS login flow
      const response = await apiClient.post("/auth/login/verify-code/", {
        phone_number: data.phoneNumber,
        code: data.password, // Treat password as verification code
      });

      console.log("🔐 legacy login SUCCESS:", {
        status: response.status,
        user: response.data.data?.user,
        hasToken: !!response.data.data?.access_token,
        timestamp: new Date().toISOString(),
      });

      // Адаптируем ответ под наш формат
      const adaptedResponse = {
        ...response.data,
        data: {
          ...response.data.data,
          user: adaptAuthUserToUser(response.data.data.user),
        },
      };

      return adaptedResponse;
    } catch (error) {
      console.error("🔐 legacy login FAILED:", {
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
      phoneNumber: data.phone_number,
      code: data.code,
      firstName: data.first_name,
      lastName: data.last_name,
      timestamp: new Date().toISOString(),
    });

    try {
      const response = await apiClient.post("/auth/verify-phone/", data);

      console.log("👤 verifyAndRegister SUCCESS:", {
        status: response.status,
        user: response.data.data.user,
        hasToken: !!response.data.data.access_token,
        timestamp: new Date().toISOString(),
      });

      // Адаптируем ответ под наш формат
      const adaptedResponse = {
        ...response.data,
        data: {
          ...response.data.data,
          user: adaptAuthUserToUser(response.data.data.user),
        },
      };

      return adaptedResponse;
    } catch (error) {
      console.error("👤 verifyAndRegister FAILED:", {
        error: error,
        phoneNumber: data.phone_number,
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
      const response = await apiClient.get("/auth/profile/");

      console.log("👤 getSession SUCCESS:", {
        status: response.status,
        user: response.data.data,
        timestamp: new Date().toISOString(),
      });

      // Адаптируем ответ под наш формат (profile endpoint возвращает user данные напрямую)
      const adaptedResponse = {
        ...response.data,
        data: {
          user: adaptSessionUserToUser(response.data.data),
        },
      };

      return adaptedResponse;
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
      const response = await apiClient.post("/auth/refresh-token/", data);

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
      const response = await apiClient.post("/auth/logout/", data);

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

  // Change password
  changePassword: async (
    data: ChangePasswordRequest
  ): Promise<ApiResponse<{ message: string }>> => {
    console.log("🔑 Starting changePassword API call:", {
      timestamp: new Date().toISOString(),
    });

    try {
      const response = await apiClient.post("/auth/change-password/", data);

      console.log("🔑 changePassword SUCCESS:", {
        status: response.status,
        message: response.data.message,
        timestamp: new Date().toISOString(),
      });

      return response.data;
    } catch (error) {
      console.error("🔑 changePassword FAILED:", {
        error: error,
        timestamp: new Date().toISOString(),
      });
      throw error;
    }
  },

  // Forgot password - send reset code
  forgotPassword: async (
    data: ForgotPasswordRequest
  ): Promise<ApiResponse<{ message: string }>> => {
    console.log("🔐 Starting forgotPassword API call:", {
      phoneNumber: data.phone_number,
      timestamp: new Date().toISOString(),
    });

    try {
      const response = await apiClient.post("/auth/forgot-password/", data);

      console.log("🔐 forgotPassword SUCCESS:", {
        status: response.status,
        message: response.data.message,
        timestamp: new Date().toISOString(),
      });

      return response.data;
    } catch (error) {
      console.error("🔐 forgotPassword FAILED:", {
        error: error,
        phoneNumber: data.phone_number,
        timestamp: new Date().toISOString(),
      });
      throw error;
    }
  },

  // Confirm forgot password - reset with code
  confirmForgotPassword: async (
    data: ConfirmForgotPasswordRequest
  ): Promise<ApiResponse<{ message: string }>> => {
    console.log("🔐 Starting confirmForgotPassword API call:", {
      phoneNumber: data.phone_number,
      timestamp: new Date().toISOString(),
    });

    try {
      const response = await apiClient.post(
        "/auth/confirm-forgot-password/",
        data
      );

      console.log("🔐 confirmForgotPassword SUCCESS:", {
        status: response.status,
        message: response.data.message,
        timestamp: new Date().toISOString(),
      });

      return response.data;
    } catch (error) {
      console.error("🔐 confirmForgotPassword FAILED:", {
        error: error,
        phoneNumber: data.phone_number,
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
      const response = await apiClient.delete("/auth/delete-account/");

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
