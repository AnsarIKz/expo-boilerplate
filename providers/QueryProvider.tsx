import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";

// Helper function to check if error is a network error
const isNetworkError = (error: any): boolean => {
  return (
    error?.code === "ECONNABORTED" ||
    error?.code === "ERR_NETWORK" ||
    error?.message === "Network Error" ||
    error?.message?.includes("timeout")
  );
};

// Создаем QueryClient с настройками по умолчанию
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Время хранения данных в кэше (5 минут)
      staleTime: 5 * 60 * 1000,
      // Время хранения неактивных данных (10 минут)
      gcTime: 10 * 60 * 1000,
      // Повторные запросы при ошибках
      retry: (failureCount, error) => {
        // Don't retry network errors
        if (isNetworkError(error)) return false;
        return failureCount < 3;
      },
      // Интервал между повторными запросами
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Автоматическое обновление при фокусе окна
      refetchOnWindowFocus: false,
      // Автоматическое обновление при переходе в онлайн
      refetchOnReconnect: true,
    },
    mutations: {
      // Повторные запросы для мутаций
      retry: (failureCount, error) => {
        // Don't retry network errors for mutations
        if (isNetworkError(error)) return false;
        return failureCount < 1;
      },
    },
  },
});

interface QueryProviderProps {
  children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

export { queryClient };
