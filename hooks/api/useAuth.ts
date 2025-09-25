import { useDeviceTokenLink } from "@/hooks/useDeviceTokenLink";
import {
  adaptAuthUserToUser,
  adaptSessionUserToUser,
} from "@/lib/api/adapters";
import { authApi } from "@/lib/api/auth";
import {
  ApiError,
  ApiResponse,
  ChangePasswordRequest,
  ConfirmForgotPasswordRequest,
  DeleteAccountResponse,
  ForgotPasswordRequest,
  LoginRequest,
  SendLoginCodeRequest,
  SendVerificationRequest,
  VerifyAndRegisterRequest,
  VerifyLoginCodeRequest,
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
        phoneNumber: data.phone_number,
        timestamp: new Date().toISOString(),
      });
      return authApi.sendVerification(data);
    },
    retry: false, // Disable automatic retries
    onSuccess: (data, variables) => {
      console.log("✅ useSendVerification SUCCESS:", {
        phoneNumber: variables.phone_number,
        response: data,
        timestamp: new Date().toISOString(),
      });

      showSuccess(
        "Код отправлен",
        data.data?.message || data.message || "SMS код успешно отправлен"
      );
    },
    onError: (error: any, variables) => {
      console.error("❌ useSendVerification ERROR:", {
        phoneNumber: variables.phone_number,
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
        phoneNumber: variables.phone_number,
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
  const { linkDeviceToUser } = useDeviceTokenLink();

  return useMutation({
    mutationFn: (data: LoginRequest) => {
      console.log("🔄 useLogin mutation started:", {
        phoneNumber: data.phoneNumber,
        timestamp: new Date().toISOString(),
      });
      return authApi.login(data);
    },
    retry: false, // Disable automatic retries
    onSuccess: (data, variables) => {
      const responseData = data.data;

      console.log("✅ useLogin SUCCESS:", {
        phoneNumber: variables.phoneNumber,
        user: adaptAuthUserToUser(responseData.user),
        hasToken: !!responseData.access_token,
        timestamp: new Date().toISOString(),
      });

      showSuccess(
        "Вход выполнен",
        `Добро пожаловать, ${responseData.user.first_name}!`
      );

      // Auto login after successful authentication
      login({
        accessToken: responseData.access_token,
        refreshToken: responseData.refresh_token,
        user: adaptAuthUserToUser(responseData.user),
      });

      // Link device token to user account after successful login
      linkDeviceToUser().catch((error) => {
        console.error("❌ Failed to link device after login:", error);
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
        phoneNumber: data.phone_number,
        code: data.code,
        firstName: data.first_name,
        lastName: data.last_name,
        timestamp: new Date().toISOString(),
      });
      return authApi.verifyAndRegister(data);
    },
    retry: false, // Disable automatic retries
    onSuccess: (data, variables) => {
      const responseData = data.data;

      console.log("✅ useVerifyAndRegister SUCCESS:", {
        phoneNumber: variables.phone_number,
        user: adaptAuthUserToUser(responseData.user),
        hasToken: !!responseData.access_token,
        timestamp: new Date().toISOString(),
      });

      showSuccess(
        "Регистрация успешна",
        `Добро пожаловать, ${responseData.user.first_name}!`
      );

      // Auto login after successful registration
      login({
        accessToken: responseData.access_token,
        refreshToken: responseData.refresh_token,
        user: adaptAuthUserToUser(responseData.user),
      });

      // Invalidate session query to trigger fresh data fetch
      queryClient.invalidateQueries({ queryKey: ["session"] });
    },
    onError: (error: any, variables) => {
      console.error("❌ useVerifyAndRegister ERROR:", {
        phoneNumber: variables.phone_number,
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
        phoneNumber: variables.phone_number,
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
  const { isAuthenticated, updateUserProfile, logout, setOffline, isOffline } =
    useAuthStore();

  const query = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      console.log("🔄 useSession query started:", {
        timestamp: new Date().toISOString(),
      });

      const response = await authApi.getSession();

      // If we successfully got response, we're back online
      setOffline(false);

      return response.data;
    },
    enabled: isAuthenticated && !isOffline, // Don't fetch if offline or not authenticated
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error: any) => {
      // Don't retry if user is no longer authenticated
      if (!isAuthenticated) return false;

      // Check for network errors
      const isNetworkError =
        error?.code === "ECONNABORTED" ||
        error?.code === "ERR_NETWORK" ||
        error?.message === "Network Error" ||
        error?.message?.includes("timeout");

      if (isNetworkError) {
        console.log(
          "🌐 Network error detected - setting offline mode (silent)"
        );
        setOffline(true);
        return false; // Don't retry network errors
      }

      // Don't retry 401 errors - handle them immediately
      if (error?.response?.status === 401) return false;

      // For other errors, retry once
      return failureCount < 1;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    meta: {
      // Prevent React Query from logging errors to console for network issues
      errorPolicy: "silent",
    },
  });

  // Auto-retry when coming back online
  React.useEffect(() => {
    if (!isOffline && isAuthenticated && query.error) {
      // Check if the previous error was a network error
      const error = query.error as any;
      const wasNetworkError =
        error?.code === "ECONNABORTED" ||
        error?.code === "ERR_NETWORK" ||
        error?.message === "Network Error" ||
        error?.message?.includes("timeout");

      if (wasNetworkError) {
        console.log("🔄 Connection restored - retrying session query");
        query.refetch();
      }
    }
  }, [isOffline, isAuthenticated, query]);

  // Handle success/error with useEffect
  React.useEffect(() => {
    if (query.data) {
      console.log("✅ useSession SUCCESS:", {
        user: query.data.user,
        timestamp: new Date().toISOString(),
      });

      // Update user profile in store
      updateUserProfile(adaptSessionUserToUser(query.data.user));
    }
  }, [query.data, updateUserProfile]);

  React.useEffect(() => {
    if (query.error && isAuthenticated) {
      const error = query.error as any;

      // Check for network errors FIRST - handle silently
      const isNetworkError =
        error?.code === "ECONNABORTED" ||
        error?.code === "ERR_NETWORK" ||
        error?.message === "Network Error" ||
        error?.message?.includes("timeout");

      if (isNetworkError) {
        console.log("🌐 Network error - entering offline mode (silent)");
        setOffline(true);
        // Don't log error or show notification for network issues
        return;
      }

      // Only log non-network errors
      console.error("❌ useSession ERROR:", {
        error: query.error,
        timestamp: new Date().toISOString(),
      });

      // If session is invalid (401), logout
      if (error?.response?.status === 401) {
        console.log("🔓 Invalid session - Auto logout");
        logout();
        return;
      }

      // For other errors, show generic error
      showError("Ошибка", "Не удалось загрузить профиль");
    }
  }, [query.error, logout, showError, isAuthenticated, setOffline]);

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

// SMS Login hooks
export function useSendLoginCode() {
  const { showError, showSuccess } = useToast();

  return useMutation({
    mutationFn: (data: SendLoginCodeRequest) => {
      console.log("🔄 useSendLoginCode mutation started:", {
        phoneNumber: data.phone_number,
        timestamp: new Date().toISOString(),
      });
      return authApi.sendLoginCode(data);
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
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      showError("Ошибка", errorMessage);
    },
  });
}

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
      return authApi.verifyLoginCode(data);
    },
    retry: false,
    onSuccess: (data, variables) => {
      const responseData = data.data;

      console.log("✅ useVerifyLoginCode SUCCESS:", {
        phoneNumber: variables.phone_number,
        user: adaptAuthUserToUser(responseData.user),
        hasToken: !!responseData.access_token,
        timestamp: new Date().toISOString(),
      });

      showSuccess(
        "Вход выполнен",
        `Добро пожаловать, ${responseData.user.first_name}!`
      );

      // Auto login after successful authentication
      login({
        accessToken: responseData.access_token,
        refreshToken: responseData.refresh_token,
        user: adaptAuthUserToUser(responseData.user),
      });

      // Invalidate session query to trigger fresh data fetch
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
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      showError("Ошибка входа", errorMessage);
    },
  });
}

// Password management hooks
export function useChangePassword() {
  const { showError, showSuccess } = useToast();

  return useMutation({
    mutationFn: (data: ChangePasswordRequest) => {
      console.log("🔄 useChangePassword mutation started:", {
        timestamp: new Date().toISOString(),
      });
      return authApi.changePassword(data);
    },
    retry: false,
    onSuccess: (data) => {
      console.log("✅ useChangePassword SUCCESS:", {
        message: data.data?.message || data.message,
        timestamp: new Date().toISOString(),
      });

      showSuccess("Пароль изменен", "Ваш пароль успешно изменен");
    },
    onError: (error: any) => {
      console.error("❌ useChangePassword ERROR:", {
        error: error,
        timestamp: new Date().toISOString(),
      });

      let errorMessage = "Ошибка изменения пароля";

      if (error.response?.status === 400) {
        errorMessage =
          error.response?.data?.message || "Неверный старый пароль";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      showError("Ошибка", errorMessage);
    },
  });
}

export function useForgotPassword() {
  const { showError, showSuccess } = useToast();

  return useMutation({
    mutationFn: (data: ForgotPasswordRequest) => {
      console.log("🔄 useForgotPassword mutation started:", {
        phoneNumber: data.phone_number,
        timestamp: new Date().toISOString(),
      });
      return authApi.forgotPassword(data);
    },
    retry: false,
    onSuccess: (data, variables) => {
      console.log("✅ useForgotPassword SUCCESS:", {
        phoneNumber: variables.phone_number,
        message: data.data?.message || data.message,
        timestamp: new Date().toISOString(),
      });

      showSuccess(
        "Код отправлен",
        "Если номер существует, код сброса был отправлен"
      );
    },
    onError: (error: any, variables) => {
      console.error("❌ useForgotPassword ERROR:", {
        phoneNumber: variables.phone_number,
        error: error,
        timestamp: new Date().toISOString(),
      });

      let errorMessage = "Ошибка отправки кода сброса";

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      showError("Ошибка", errorMessage);
    },
  });
}

export function useConfirmForgotPassword() {
  const { showError, showSuccess } = useToast();

  return useMutation({
    mutationFn: (data: ConfirmForgotPasswordRequest) => {
      console.log("🔄 useConfirmForgotPassword mutation started:", {
        phoneNumber: data.phone_number,
        timestamp: new Date().toISOString(),
      });
      return authApi.confirmForgotPassword(data);
    },
    retry: false,
    onSuccess: (data, variables) => {
      console.log("✅ useConfirmForgotPassword SUCCESS:", {
        phoneNumber: variables.phone_number,
        message: data.data?.message || data.message,
        timestamp: new Date().toISOString(),
      });

      showSuccess("Пароль сброшен", "Ваш пароль успешно изменен");
    },
    onError: (error: any, variables) => {
      console.error("❌ useConfirmForgotPassword ERROR:", {
        phoneNumber: variables.phone_number,
        error: error,
        timestamp: new Date().toISOString(),
      });

      let errorMessage = "Ошибка сброса пароля";

      if (error.response?.status === 400) {
        errorMessage = error.response?.data?.message || "Неверный код";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      showError("Ошибка", errorMessage);
    },
  });
}

export const useDeleteAccount = () => {
  const queryClient = useQueryClient();
  const { logout } = useAuthStore();
  const { showSuccess, showError } = useToast();

  return useMutation<ApiResponse<DeleteAccountResponse>, ApiError>({
    mutationFn: authApi.deleteAccount,
    retry: false, // Disable automatic retries
    onSuccess: (data) => {
      console.log("✅ useDeleteAccount SUCCESS:", {
        message: data.data?.message || data.message,
        timestamp: new Date().toISOString(),
      });

      logout();
      queryClient.clear();
      showSuccess("Аккаунт удален", "Ваш аккаунт был успешно удален");
    },
    onError: (error) => {
      console.error("❌ useDeleteAccount ERROR:", {
        error: error,
        timestamp: new Date().toISOString(),
      });

      showError("Ошибка", "Не удалось удалить аккаунт");
    },
  });
};
