import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Логируем ошибку в консоль
    console.log("🚨 ErrorBoundary caught error:", error.message);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Логируем ошибку в консоль
    console.log("🚨 ErrorBoundary componentDidCatch:", error.message);
  }

  render() {
    if (this.state.hasError) {
      // Просто возвращаем children, скрывая ошибку
      return this.props.children;
    }

    return this.props.children;
  }
}
