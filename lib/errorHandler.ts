interface ErrorInfo {
  componentStack?: string;
  errorBoundary?: string;
  errorBoundaryStack?: string;
}

class ErrorHandler {
  private isInitialized = false;

  init() {
    if (this.isInitialized) return;

    this.isInitialized = true;

    // Перехватываем console.error чтобы не показывать ошибки в UI
    const originalConsoleError = console.error;
    console.error = (...args: any[]) => {
      this.logError("Console Error", args.join(" "));
      // Не вызываем originalConsoleError
    };

    // Обработка необработанных промисов (только для web)
    if (typeof window !== "undefined" && window.addEventListener) {
      window.addEventListener("unhandledrejection", (event) => {
        this.logError("Unhandled Promise Rejection", event.reason);
        event.preventDefault();
      });
    }

    // Обработка глобальных ошибок (только для web)
    if (typeof window !== "undefined" && window.addEventListener) {
      window.addEventListener("error", (event) => {
        this.logError("Global Error", event.error);
        event.preventDefault();
      });
    }
  }

  logError(type: string, error: any, errorInfo?: ErrorInfo) {
    // Простое логирование в консоль
    console.log("🚨 [ERROR]", type, error);
  }

  // Метод для ручного логирования ошибок
  logManualError(error: any, context?: string) {
    this.logError(`Manual Error${context ? ` (${context})` : ""}`, error);
  }
}

export const errorHandler = new ErrorHandler();
