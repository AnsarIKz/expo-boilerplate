import { createContext, ReactNode, useContext, useState } from "react";
import { Toast, ToastType } from "../components/ui/Toast";

interface ToastData {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  action?: {
    label: string;
    onPress: () => void;
  };
  duration?: number;
}

interface ToastContextType {
  showToast: (toast: Omit<ToastData, "id">) => void;
  showSuccess: (title: string, message?: string) => void;
  showWarning: (title: string, message?: string) => void;
  showError: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const showToast = (toast: Omit<ToastData, "id">) => {
    const id = Date.now().toString();
    const newToast = { ...toast, id };

    setToasts((prev) => [...prev, newToast]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const showSuccess = (title: string, message?: string) => {
    showToast({ type: "success", title, message });
  };

  const showWarning = (title: string, message?: string) => {
    showToast({ type: "warning", title, message });
  };

  const showError = (title: string, message?: string) => {
    showToast({ type: "error", title, message });
  };

  return (
    <ToastContext.Provider
      value={{
        showToast,
        showSuccess,
        showWarning,
        showError,
      }}
    >
      {children}

      {/* Render toasts */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          type={toast.type}
          title={toast.title}
          message={toast.message}
          action={toast.action}
          visible={true}
          onDismiss={() => dismissToast(toast.id)}
          duration={toast.duration}
        />
      ))}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
