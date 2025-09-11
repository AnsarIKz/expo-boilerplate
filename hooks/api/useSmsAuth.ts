import {
  SendLoginCodeRequest,
  smsAuthApi,
  VerifyLoginCodeRequest,
} from "@/lib/api/smsAuth";
import { useToast } from "@/providers/ToastProvider";
import { useAuthStore } from "@/stores/authStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";

// Хук для отправки SMS кода для входа
export function useSendLoginCode() {
  const { showError, showSuccess } = useToast();

  return useMutation({
    mutationFn: (data: SendLoginCodeRequest) => {
      console.log("🔄 useSendLoginCode mutation started:", {
        phoneNumber: data.phone_number,
        timestamp: new Date().toISOString(),
      });
      return smsAuthApi.sendLoginCode(data);
    },
    retry: false,
    onSuccess: (data, variables) => {
      console.log("✅ useSendLoginCode SUCCESS:", {
        phoneNumber: variables.phone_number,
        response: data,
        timestamp: new Date().toISOString(),
      });

      showSuccess(
        "Код отправлен",
        data.data?.message || data.message || "SMS код для входа отправлен"
      );
    },
    onError: (error: any, variables) => {
      console.error("❌ useSendLoginCode ERROR:", {
        phoneNumber: variables.phone_number,
        error: error,
        timestamp: new Date().toISOString(),
      });

      let errorMessage = "Ошибка отправки кода";

      if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
        errorMessage = "Ошибка сети. Проверьте подключение к интернету";
      } else if (error.response?.status === 404) {
        errorMessage = "Пользователь с таким номером не найден";
      } else if (error.response?.status === 429) {
        errorMessage = "Слишком много запросов. Попробуйте позже";
      } else if (error.response?.status === 400) {
        errorMessage =
          error.response?.data?.message || "Неверный номер телефона";
      } else if (error.response?.status === 500) {
        errorMessage = "Ошибка сервера. Попробуйте позже";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      showError("Ошибка", errorMessage);
    },
  });
}

// Хук для верификации SMS кода и входа
export function useVerifyLoginCode() {
  const { showError, showSuccess } = useToast();
  const queryClient = useQueryClient();
  const { login } = useAuthStore();

  return useMutation({
    mutationFn: (data: VerifyLoginCodeRequest) => {
      console.log("🔄 useVerifyLoginCode mutation started:", {
        phoneNumber: data.phone_number,
        timestamp: new Date().toISOString(),
      });
      return smsAuthApi.verifyLoginCode(data);
    },
    retry: false,
    onSuccess: (data, variables) => {
      const responseData = data.data;

      console.log("✅ useVerifyLoginCode SUCCESS:", {
        phoneNumber: variables.phone_number,
        user: responseData.user,
        hasToken: !!responseData.access_token,
        timestamp: new Date().toISOString(),
      });

      showSuccess(
        "Вход выполнен",
        `Добро пожаловать, ${
          responseData.user.firstName || responseData.user.first_name
        }!`
      );

      // Авто логин после успешной аутентификации
      login({
        accessToken: responseData.access_token,
        refreshToken: responseData.refresh_token,
        user: responseData.user,
      });

      // Инвалидируем запросы для обновления данных
      queryClient.invalidateQueries({ queryKey: ["session"] });
    },
    onError: (error: any, variables) => {
      console.error("❌ useVerifyLoginCode ERROR:", {
        phoneNumber: variables.phone_number,
        error: error,
        timestamp: new Date().toISOString(),
      });

      let errorMessage = "Ошибка входа";

      if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
        errorMessage = "Ошибка сети. Проверьте подключение к интернету";
      } else if (error.response?.status === 400) {
        errorMessage = error.response?.data?.message || "Неверный код";
      } else if (error.response?.status === 404) {
        errorMessage = "Пользователь не найден";
      } else if (error.response?.status === 429) {
        errorMessage = "Слишком много попыток. Попробуйте позже";
      } else if (error.response?.status === 500) {
        errorMessage = "Ошибка сервера. Попробуйте позже";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      showError("Ошибка входа", errorMessage);
    },
  });
}
