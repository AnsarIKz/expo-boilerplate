// Base API response structure according to Django documentation
export interface ApiResponse<T = any> {
  data: T;
  statusCode: number;
  message: string;
}

// Paginated response structure for lists
export interface PaginatedResponse<T = any> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Error response structure
export interface ApiErrorResponse {
  data: null;
  statusCode: number;
  message: string;
  errors?: any;
}

// Auth types
export interface SendVerificationRequest {
  phone_number: string;
}

export interface SendVerificationResponse {
  message: string;
}

export interface VerifyAndRegisterRequest {
  phone_number: string;
  code: string;
  first_name: string;
  last_name: string;
  email?: string;
  password: string;
}

export interface AuthUser {
  id: string;
  phone_number: string;
  first_name: string;
  last_name: string;
  email?: string;
  profile_image_url?: string;
  language: string;
  currency: string;
  role: "USER" | "ADMIN" | "RESTAURANT_OWNER";
  is_active?: boolean;
  created_at: string;
  updated_at: string;
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

// SMS Login types
export interface SendLoginCodeRequest {
  phone_number: string;
}

export interface SendLoginCodeResponse {
  message: string;
}

export interface VerifyLoginCodeRequest {
  phone_number: string;
  code: string;
}

export interface VerifyLoginCodeResponse {
  access_token: string;
  refresh_token: string;
  user: AuthUser;
}

// Legacy login request for backward compatibility
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
  email?: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  profile_image_url?: string;
  language: string;
  currency: string;
  role: "USER" | "ADMIN" | "RESTAURANT_OWNER";
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SessionResponse {
  user: SessionUser;
}

// Password management types
export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
}

export interface ForgotPasswordRequest {
  phone_number: string;
}

export interface ConfirmForgotPasswordRequest {
  phone_number: string;
  code: string;
  new_password: string;
}

// General User type for use across the app
export interface User {
  id: string;
  phoneNumber: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  profileImageUrl?: string;
  language?: string;
  currency?: string;
  role?: "USER" | "ADMIN" | "RESTAURANT_OWNER";
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  // Legacy fields for backward compatibility
  name?: string;
  avatar?: string;
  isVerified?: boolean;
  // Django API fields mapping
  phone_number?: string;
  first_name?: string;
  last_name?: string;
  profile_image_url?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}
