import { AuthUser, SessionUser, User } from "./types";

/**
 * Адаптеры для преобразования Django API ответов в наши типы данных
 */

// Преобразование Django AuthUser в наш User тип
export const adaptAuthUserToUser = (authUser: AuthUser): User => {
  return {
    id: authUser.id,
    phoneNumber: authUser.phone_number,
    firstName: authUser.first_name,
    lastName: authUser.last_name,
    email: authUser.email,
    profileImageUrl: authUser.profile_image_url,
    language: authUser.language,
    currency: authUser.currency,
    role: authUser.role,
    isActive: authUser.is_active,
    createdAt: authUser.created_at,
    updatedAt: authUser.updated_at,
    // Дублируем поля для обратной совместимости
    phone_number: authUser.phone_number,
    first_name: authUser.first_name,
    last_name: authUser.last_name,
    profile_image_url: authUser.profile_image_url,
    is_active: authUser.is_active,
    created_at: authUser.created_at,
    updated_at: authUser.updated_at,
  };
};

// Преобразование Django SessionUser в наш User тип
export const adaptSessionUserToUser = (sessionUser: SessionUser): User => {
  return {
    id: sessionUser.id,
    phoneNumber: sessionUser.phone_number,
    firstName: sessionUser.first_name,
    lastName: sessionUser.last_name,
    email: sessionUser.email,
    profileImageUrl: sessionUser.profile_image_url,
    language: sessionUser.language,
    currency: sessionUser.currency,
    role: sessionUser.role,
    isActive: sessionUser.is_active,
    createdAt: sessionUser.created_at,
    updatedAt: sessionUser.updated_at,
    // Дублируем поля для обратной совместимости
    phone_number: sessionUser.phone_number,
    first_name: sessionUser.first_name,
    last_name: sessionUser.last_name,
    profile_image_url: sessionUser.profile_image_url,
    is_active: sessionUser.is_active,
    created_at: sessionUser.created_at,
    updated_at: sessionUser.updated_at,
  };
};

// Преобразование для отправки SMS кода для входа
export const adaptLoginRequestToSendCode = (phoneNumber: string) => {
  return {
    phone_number: phoneNumber,
  };
};

// Преобразование для верификации кода входа
export const adaptLoginRequestToVerifyCode = (
  phoneNumber: string,
  code: string
) => {
  return {
    phone_number: phoneNumber,
    code: code,
  };
};

// Преобразование для отправки SMS кода регистрации
export const adaptPhoneNumberToSendVerification = (phoneNumber: string) => {
  return {
    phone_number: phoneNumber,
  };
};

// Преобразование для регистрации
export const adaptRegistrationDataToRequest = (
  phoneNumber: string,
  code: string,
  firstName: string,
  lastName: string,
  email?: string,
  password?: string
) => {
  return {
    phone_number: phoneNumber,
    code: code,
    first_name: firstName,
    last_name: lastName,
    email: email,
    password: password,
  };
};
