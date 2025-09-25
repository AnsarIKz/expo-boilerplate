import { errorHandler } from "@/lib/errorHandler";
import { useCallback } from "react";

export function useErrorHandler() {
  const handleError = useCallback((error: any, context?: string) => {
    errorHandler.logManualError(error, context);
  }, []);

  const handleAsyncError = useCallback(
    async <T>(
      asyncFn: () => Promise<T>,
      context?: string
    ): Promise<T | null> => {
      try {
        return await asyncFn();
      } catch (error) {
        handleError(error, context);
        return null;
      }
    },
    [handleError]
  );

  return {
    handleError,
    handleAsyncError,
  };
}

