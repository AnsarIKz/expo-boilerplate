// Main API exports
export * from "./adapters";
export * from "./auth";
export * from "./config";
export * from "./restaurant";
export * from "./restaurantAdapters";
export * from "./smsAuth";
export * from "./types";

// Re-export hooks
export * from "@/hooks/api/useAuth";
export * from "@/hooks/api/useRestaurantsApi";

// Export main API clients directly
export { authApi } from "./auth";
export { apiClient, checkApiHealth } from "./config";
export { restaurantApi } from "./restaurant";
export { smsAuthApi } from "./smsAuth";
