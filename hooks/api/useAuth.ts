import { authApi } from "@/lib/api/auth";
import {
  ApiError,
  DeleteAccountResponse,
  LoginRequest,
  SendVerificationRequest,
  VerifyAndRegisterRequest,
} from "@/lib/api/types";
import { useToast } from "@/providers/ToastProvider";
import { useAuthStore } from "@/stores/authStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React from "react";

// Send verification code hook
export function useSendVerification() {
  const { showError, showSuccess } = useToast();

  return useMutation({
    mutationFn: (data: SendVerificationRequest) => {
      console.log("🔄 useSendVerification mutation started:", {
        phoneNumber: data.phoneNumber,
        timestamp: new Date().toISOString(),
      });
      return authApi.sendVerification(data);
    },
    onSuccess: (data, variables) => {
      console.log("✅ useSendVerification SUCCESS:", {
        phoneNumber: variables.phoneNumber,
        response: data,
        timestamp: new Date().toISOString(),
      });

      showSuccess(
        "Код отправлен",
        data.data.message || "SMS код успешно отправлен"
      );
    },
    onError: (error: any, variables) => {
      console.error("❌ useSendVerification ERROR:", {
        phoneNumber: variables.phoneNumber,
        error: error,
        timestamp: new Date().toISOString(),
      });

      // Determine error message using new format
      let errorMessage = "Ошибка отправки кода";

      if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
        errorMessage = "Ошибка сети. Проверьте подключение к интернету";
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

      showError("Ошибка отправки", errorMessage);
    },
    onSettled: (data, error, variables) => {
      console.log("🏁 useSendVerification SETTLED:", {
        phoneNumber: variables.phoneNumber,
        success: !error,
        timestamp: new Date().toISOString(),
      });
    },
  });
}

// Login hook
export function useLogin() {
  const { showError, showSuccess } = useToast();
  const queryClient = useQueryClient();
  const { login } = useAuthStore();

  return useMutation({
    mutationFn: (data: LoginRequest) => {
      console.log("🔄 useLogin mutation started:", {
        phoneNumber: data.phoneNumber,
        timestamp: new Date().toISOString(),
      });
      return authApi.login(data);
    },
    onSuccess: (data, variables) => {
      const responseData = data.data;

      console.log("✅ useLogin SUCCESS:", {
        phoneNumber: variables.phoneNumber,
        user: responseData.user,
        hasToken: !!responseData.access_token,
        timestamp: new Date().toISOString(),
      });

      showSuccess(
        "Вход выполнен",
        `Добро пожаловать, ${responseData.user.firstName}!`
      );

      // Auto login after successful authentication
      login({
        accessToken: responseData.access_token,
        refreshToken: responseData.refresh_token,
        user: responseData.user,
      });

      // Invalidate session query to trigger fresh data fetch
      queryClient.invalidateQueries({ queryKey: ["session"] });
    },
    onError: (error: any, variables) => {
      console.error("❌ useLogin ERROR:", {
        phoneNumber: variables.phoneNumber,
        error: error,
        timestamp: new Date().toISOString(),
      });

      // Determine error message using new format
      let errorMessage = "Ошибка входа";

      if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
        errorMessage = "Ошибка сети. Проверьте подключение к интернету";
      } else if (error.response?.status === 401) {
        errorMessage = error.response?.data?.message || "Неверный пароль";
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
    onSettled: (data, error, variables) => {
      console.log("🏁 useLogin SETTLED:", {
        phoneNumber: variables.phoneNumber,
        success: !error,
        timestamp: new Date().toISOString(),
      });
    },
  });
}

// Verify and register hook
export function useVerifyAndRegister() {
  const { showError, showSuccess } = useToast();
  const queryClient = useQueryClient();
  const { login } = useAuthStore();

  return useMutation({
    mutationFn: (data: VerifyAndRegisterRequest) => {
      console.log("🔄 useVerifyAndRegister mutation started:", {
        phoneNumber: data.phoneNumber,
        code: data.code,
        firstName: data.firstName,
        lastName: data.lastName,
        timestamp: new Date().toISOString(),
      });
      return authApi.verifyAndRegister(data);
    },
    onSuccess: (data, variables) => {
      const responseData = data.data;

      console.log("✅ useVerifyAndRegister SUCCESS:", {
        phoneNumber: variables.phoneNumber,
        user: responseData.user,
        hasToken: !!responseData.access_token,
        timestamp: new Date().toISOString(),
      });

      showSuccess(
        "Регистрация успешна",
        `Добро пожаловать, ${responseData.user.firstName}!`
      );

      // Auto login after successful registration
      login({
        accessToken: responseData.access_token,
        refreshToken: responseData.refresh_token,
        user: responseData.user,
      });

      // Invalidate session query to trigger fresh data fetch
      queryClient.invalidateQueries({ queryKey: ["session"] });
    },
    onError: (error: any, variables) => {
      console.error("❌ useVerifyAndRegister ERROR:", {
        phoneNumber: variables.phoneNumber,
        error: error,
        timestamp: new Date().toISOString(),
      });

      // Determine error message
      let errorMessage = "Ошибка регистрации";

      if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
        errorMessage = "Ошибка сети. Проверьте подключение к интернету";
      } else if (error.response?.status === 400) {
        errorMessage =
          error.response?.data?.message || "Неверный код или данные";
      } else if (error.response?.status === 409) {
        errorMessage = "Пользователь уже существует";
      } else if (error.response?.status === 422) {
        errorMessage = "Неверный формат данных";
      } else if (error.response?.status === 500) {
        errorMessage = "Ошибка сервера. Попробуйте позже";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      showError("Ошибка регистрации", errorMessage);
    },
    onSettled: (data, error, variables) => {
      console.log("🏁 useVerifyAndRegister SETTLED:", {
        phoneNumber: variables.phoneNumber,
        success: !error,
        timestamp: new Date().toISOString(),
      });
    },
  });
}

// Refresh token hook
export function useRefreshToken() {
  const { showError } = useToast();
  const { updateTokens, logout } = useAuthStore();

  return useMutation({
    mutationFn: (refreshToken: string) => {
      console.log("🔄 useRefreshToken mutation started:", {
        timestamp: new Date().toISOString(),
      });
      return authApi.refreshToken({ refresh_token: refreshToken });
    },
    onSuccess: (data) => {
      const responseData = data.data;

      console.log("✅ useRefreshToken SUCCESS:", {
        hasNewToken: !!responseData.access_token,
        timestamp: new Date().toISOString(),
      });

      // Update tokens in store
      updateTokens({
        accessToken: responseData.access_token,
        refreshToken: responseData.refresh_token,
      });
    },
    onError: (error: any) => {
      console.error("❌ useRefreshToken ERROR:", {
        error: error,
        timestamp: new Date().toISOString(),
      });

      // Auto logout on refresh failure
      logout();

      showError("Сессия истекла", "Необходимо войти в систему заново");
    },
  });
}

// Logout hook
export function useLogout() {
  const { showSuccess, showError } = useToast();
  const queryClient = useQueryClient();
  const { refreshToken, logout } = useAuthStore();

  return useMutation({
    mutationFn: () => {
      console.log("🚪 useLogout mutation started:", {
        hasRefreshToken: !!refreshToken,
        timestamp: new Date().toISOString(),
      });

      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      return authApi.logout({ refresh_token: refreshToken });
    },
    onSuccess: (data) => {
      console.log("✅ useLogout SUCCESS:", {
        message: data.data.message,
        timestamp: new Date().toISOString(),
      });

      // Clear auth state
      logout();

      queryClient.clear();
      showSuccess("Выход выполнен", "До свидания!");
    },
    onError: (error: any) => {
      console.error("❌ useLogout ERROR:", {
        error: error,
        timestamp: new Date().toISOString(),
      });

      // Even if logout fails on server, clear local state and become guest
      logout();
      queryClient.clear();

      // Don't show error toast - silently logout to guest mode
      console.log("🔓 Logout failed on server, switched to guest mode");
    },
  });
}

// Get session hook
export function useSession() {
  const { showError } = useToast();
  const { isAuthenticated, updateUserProfile, logout } = useAuthStore();

  const query = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      console.log("🔄 useSession query started:", {
        timestamp: new Date().toISOString(),
      });

      const response = await authApi.getSession();
      return response.data;
    },
    enabled: isAuthenticated, // Only fetch if user is authenticated
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      // Don't retry if user is no longer authenticated
      if (!isAuthenticated) return false;
      // Only retry once for 401 errors, don't retry for other errors
      if ((error as any)?.response?.status === 401) return false;
      return failureCount < 1;
    },
  });

  // Handle success/error with useEffect
  React.useEffect(() => {
    if (query.data) {
      console.log("✅ useSession SUCCESS:", {
        user: query.data.user,
        timestamp: new Date().toISOString(),
      });

      // Update user profile in store
      updateUserProfile(query.data.user);
    }
  }, [query.data, updateUserProfile]);

  React.useEffect(() => {
    if (query.error && isAuthenticated) {
      console.error("❌ useSession ERROR:", {
        error: query.error,
        timestamp: new Date().toISOString(),
      });

      // If session is invalid, logout
      if ((query.error as any).response?.status === 401) {
        console.log("🔓 Invalid session - Auto logout");
        logout();
      } else {
        // Only show error if user is still authenticated (not after logout)
        showError("Ошибка", "Не удалось загрузить профиль");
      }
    }
  }, [query.error, logout, showError, isAuthenticated]);

  return query;
}

// Refresh session manually
export function useRefreshSession() {
  const { refetch } = useSession();

  return useMutation({
    mutationFn: () => {
      console.log("🔄 Manual session refresh triggered");
      return refetch();
    },
  });
}

export const useDeleteAccount = () => {
  const queryClient = useQueryClient();
  const { logout } = useAuthStore();

  return useMutation<DeleteAccountResponse, ApiError>({
    mutationFn: authApi.deleteAccount,
    onSuccess: () => {
      logout();
      queryClient.clear();
    },
    onError: (error) => {
      console.error("Delete account error:", error);
    },
  });
};
