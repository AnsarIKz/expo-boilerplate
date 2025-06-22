// Base API response structure
export interface ApiResponse<T = any> {
  data: T;
  statusCode: number;
  message: string;
}

// Auth types
export interface SendVerificationRequest {
  phoneNumber: string;
}

export interface SendVerificationResponse {
  message: string;
}

export interface VerifyAndRegisterRequest {
  phoneNumber: string;
  code: string;
  firstName: string;
  lastName: string;
  password: string;
}

export interface AuthUser {
  id: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  role: "USER" | "ADMIN";
}

export interface VerifyAndRegisterResponse {
  access_token: string;
  refresh_token: string;
  user: AuthUser;
  message: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
}

export interface LogoutRequest {
  refresh_token: string;
}

export interface LogoutResponse {
  message: string;
}

export interface DeleteAccountResponse {
  message: string;
}

export interface LoginRequest {
  phoneNumber: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: AuthUser;
}

// Error types - updated format
export interface ApiError {
  statusCode: number;
  message: string;
  error: string;
  timestamp: string;
  path: string;
}

export interface SessionUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  profileImageUrl: string | null;
  language: string;
  currency: string;
  role: "USER" | "ADMIN";
  createdAt: string;
  updatedAt: string;
}

export interface SessionResponse {
  user: SessionUser;
}

// General User type for use across the app
export interface User {
  id: string;
  phoneNumber: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  profileImageUrl?: string | null;
  language?: string;
  currency?: string;
  role?: "USER" | "ADMIN";
  createdAt?: string;
  updatedAt?: string;
  // Legacy fields for backward compatibility
  name?: string;
  avatar?: string;
}
