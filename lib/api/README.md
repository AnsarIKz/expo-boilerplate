# API Structure

This directory contains the API layer for the application, built with axios and React Query.

## Structure

```
lib/api/
├── config.ts          # Axios configuration and interceptors
├── types.ts           # TypeScript interfaces for API
├── auth.ts            # Auth-related API calls
└── index.ts           # Main exports
```

## Usage

### 1. Authentication Flow

The authentication is integrated into existing components:

- **`AuthRequired`** - Phone number input with SMS sending
- **`SmsCodeInput`** - Code verification
- **`RegistrationForm`** - User registration form

### 2. Authentication Hooks

```tsx
import { useSendVerification, useVerifyAndRegister } from "@/lib/api";

function AuthComponent() {
  const sendVerification = useSendVerification();
  const verifyAndRegister = useVerifyAndRegister();

  const handleSendCode = async () => {
    try {
      await sendVerification.mutateAsync({
        phone_number: "+77001234567",
      });
    } catch (error) {
      // Handle error
    }
  };

  const handleRegister = async () => {
    try {
      await verifyAndRegister.mutateAsync({
        phone_number: "+77001234567",
        code: "123456",
        first_name: "John",
        last_name: "Doe",
        password: "password123",
      });
      // User is automatically logged in via auth store
    } catch (error) {
      // Handle error
    }
  };
}
```

### 3. Flow Description

1. **User enters phone number** → `AuthRequired` component
2. **SMS sent via API** → `/api/v1/auth/send-verification`
3. **User enters code** → `SmsCodeInput` component
4. **Registration form shown** → `RegistrationForm` component
5. **User completes registration** → `/api/v1/auth/verify-and-register`
6. **User automatically logged in** → Auth store updated

### 4. Configuration

Update the API base URL in `lib/api/config.ts`:

```typescript
export const API_BASE_URL = "http://localhost:3000";
```

### 5. Adding New Endpoints

1. Add types to `types.ts`
2. Create service functions in appropriate file (e.g., `auth.ts`)
3. Create React Query hooks in `hooks/api/`
4. Export from `index.ts`

## Features

- ✅ Automatic token handling
- ✅ Auto-logout on 401 errors
- ✅ TypeScript support
- ✅ Error handling
- ✅ React Query integration
- ✅ Loading states
- ✅ Resend SMS functionality
- ✅ Integrated with existing UI components
- ✅ Auto-login after registration
