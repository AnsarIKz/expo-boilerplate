import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";

// Создаем QueryClient с настройками по умолчанию
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Время хранения данных в кэше (5 минут)
      staleTime: 5 * 60 * 1000,
      // Время хранения неактивных данных (10 минут)
      gcTime: 10 * 60 * 1000,
      // Повторные запросы при ошибках
      retry: 3,
      // Интервал между повторными запросами
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Автоматическое обновление при фокусе окна
      refetchOnWindowFocus: false,
      // Автоматическое обновление при переходе в онлайн
      refetchOnReconnect: true,
    },
    mutations: {
      // Повторные запросы для мутаций
      retry: 1,
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
