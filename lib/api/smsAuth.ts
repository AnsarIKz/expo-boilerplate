import { adaptAuthUserToUser } from "./adapters";
import { apiClient } from "./config";
import type {
  ApiResponse,
  SendLoginCodeRequest,
  SendLoginCodeResponse,
  VerifyLoginCodeRequest,
  VerifyLoginCodeResponse,
} from "./types";

export const smsAuthApi = {
  // Отправка SMS кода для входа
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

  // Верификация SMS кода для входа
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
};
