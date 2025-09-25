# Device Token Integration - React Native

## Обзор

Интеграция Device Token системы в React Native приложение позволяет пользователям бронировать столики без регистрации, используя анонимные токены устройств.

## Архитектура

```
App Launch
    ↓
useDeviceToken() hook
    ↓
DeviceTokenStore (Zustand + Persist)
    ↓
Auto-register device
    ↓
Store device_token
    ↓
API requests with X-Device-Token header
```

## Компоненты

### 1. DeviceTokenStore (`stores/deviceTokenStore.ts`)

Zustand store с persist для хранения device token:

```typescript
interface DeviceTokenState {
  deviceToken: string | null;
  deviceId: string | null;
  isRegistered: boolean;
  isLoading: boolean;
  error: string | null;
}
```

**Функции:**

- `generateDeviceId()` - генерация уникального ID устройства
- `registerDevice()` - регистрация устройства в backend
- `getDeviceToken()` - получение токена
- `clearDeviceToken()` - очистка токена

### 2. useDeviceToken Hook (`hooks/useDeviceToken.ts`)

Автоматическая инициализация device token при запуске приложения:

```typescript
export const useDeviceToken = () => {
  // Auto-register device if not already registered
  useEffect(() => {
    if (!isRegistered && !isLoading && !error) {
      registerDevice();
    }
  }, []);
};
```

### 3. API Integration (`lib/api/config.ts`)

Автоматическое добавление device token в API запросы:

```typescript
// Request interceptor
const token = useAuthStore.getState().accessToken;
if (token) {
  config.headers.Authorization = `Bearer ${token}`;
} else {
  // If no auth token, use device token
  const deviceToken = useDeviceTokenStore.getState().deviceToken;
  if (deviceToken) {
    config.headers["X-Device-Token"] = deviceToken;
  }
}
```

### 4. Booking Integration (`stores/bookingStore.ts`)

Автоматическая регистрация device token перед созданием бронирований:

```typescript
const createBookingAPI = async (request: BookingRequest) => {
  // Ensure device token is registered
  const deviceTokenStore = useDeviceTokenStore.getState();
  if (!deviceTokenStore.isRegistered) {
    await deviceTokenStore.registerDevice();
  }

  // Create booking with device token
  const response = await restaurantApi.createBooking(djangoRequest);
};
```

## Использование

### Автоматическая инициализация

Device token автоматически регистрируется при первом запуске приложения:

```typescript
// app/_layout.tsx
export default function RootLayout() {
  // Initialize device token for anonymous users
  useDeviceToken();

  return (
    // App components
  );
}
```

### Создание бронирований

Бронирования работают автоматически для неавторизованных пользователей:

```typescript
// components/BookingForm.tsx
const { addBooking } = useBookingStore();

const handleBooking = async (bookingData) => {
  // Device token автоматически добавляется в API запрос
  await addBooking(bookingData);
};
```

### Связывание с пользователем

При авторизации device token автоматически связывается с аккаунтом:

```typescript
// stores/authStore.ts
login: ({ accessToken, refreshToken, user }) => {
  set({ isAuthenticated: true, accessToken, refreshToken, user });

  // Link device token to user account
  const { linkDeviceToUser } = useDeviceTokenLink();
  linkDeviceToUser();
};
```

## API Endpoints

### 1. Регистрация устройства

```http
POST /api/auth/device/register/
Content-Type: application/json

{
  "device_id": "uuid-string",
  "device_type": "mobile",
  "device_name": "React Native App"
}
```

**Ответ:**

```json
{
  "device_token": "device-token-string",
  "device_id": "uuid-string",
  "created_at": "2024-01-01T00:00:00Z"
}
```

### 2. Связывание с пользователем

```http
POST /api/auth/device/link/
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "device_id": "uuid-string"
}
```

### 3. Создание бронирования с device token

```http
POST /api/restaurant/bookings/
X-Device-Token: device-token-string
Content-Type: application/json

{
  "restaurant": "restaurant-uuid",
  "booking_date": "2024-12-25",
  "booking_time": "19:00:00",
  "number_of_guests": 4
}
```

## Безопасность

### Device Token Generation

```typescript
const generateDeviceId = (): string => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback for environments without crypto.randomUUID
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};
```

### Persistence

Device token сохраняется в AsyncStorage через Zustand persist:

```typescript
{
  name: "device-token-storage",
  storage: createJSONStorage(() => AsyncStorage),
}
```

## Обработка ошибок

### Network Errors

```typescript
try {
  await deviceTokenStore.registerDevice();
} catch (error) {
  if (error.code === "ERR_NETWORK") {
    // Handle network error
    console.log("Network error, will retry later");
  }
}
```

### Device Registration Failure

```typescript
const registerDevice = async () => {
  try {
    const deviceToken = await registerDeviceAPI(deviceId);
    set({ deviceToken, isRegistered: true });
  } catch (error) {
    set({ error: error.message });
    // Device token registration failure doesn't break the app
  }
};
```

## Мониторинг

### Логирование

```typescript
console.log("📱 Device registered successfully:", deviceToken);
console.log("📱 Added Device Token to request");
console.log("✅ Booking created with device token");
```

### Метрики

- Количество зарегистрированных устройств
- Соотношение анонимных/авторизованных бронирований
- Успешность регистрации device token
- Ошибки API запросов

## Тестирование

### Unit Tests

```typescript
describe("DeviceTokenStore", () => {
  it("should generate unique device ID", () => {
    const store = useDeviceTokenStore.getState();
    const deviceId = store.generateDeviceId();
    expect(deviceId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );
  });
});
```

### Integration Tests

```typescript
describe("Device Token Integration", () => {
  it("should create booking with device token", async () => {
    const bookingStore = useBookingStore.getState();
    const booking = await bookingStore.addBooking(bookingRequest);
    expect(booking).toBeDefined();
  });
});
```

## Производительность

### Оптимизации

1. **Lazy Registration** - device token регистрируется только при необходимости
2. **Persistent Storage** - токен сохраняется между сессиями
3. **Error Recovery** - приложение работает даже при ошибках регистрации
4. **Minimal API Calls** - регистрация происходит только один раз

### Кэширование

```typescript
// Device token кэшируется в Zustand store
const deviceToken = useDeviceTokenStore.getState().deviceToken;
if (deviceToken) {
  // Use cached token
  config.headers["X-Device-Token"] = deviceToken;
}
```

## Развертывание

### 1. Backend Requirements

Убедитесь что Django backend поддерживает device token endpoints:

- `POST /api/auth/device/register/`
- `POST /api/auth/device/link/`
- `GET /api/auth/device/info/`

### 2. Frontend Integration

Device token интеграция уже включена в приложение:

```typescript
// app/_layout.tsx
useDeviceToken(); // Auto-initialize device token
```

### 3. Testing

```bash
# Test device token registration
npm run test:device-token

# Test booking with device token
npm run test:booking-anonymous
```

## Troubleshooting

### Common Issues

1. **Device token not registered**

   - Проверьте network connectivity
   - Проверьте API endpoint availability
   - Проверьте console logs

2. **Booking creation fails**

   - Убедитесь что device token зарегистрирован
   - Проверьте X-Device-Token header в network tab
   - Проверьте backend logs

3. **Token persistence issues**
   - Проверьте AsyncStorage permissions
   - Проверьте Zustand persist configuration
   - Очистите storage и перезапустите приложение

### Debug Mode

```typescript
// Enable debug logging
console.log("📱 Device token debug:", {
  isRegistered: useDeviceTokenStore.getState().isRegistered,
  deviceToken: useDeviceTokenStore.getState().deviceToken,
  deviceId: useDeviceTokenStore.getState().deviceId,
});
```

## Заключение

Device Token интеграция обеспечивает:

- ✅ **Беспроблемное бронирование** для неавторизованных пользователей
- ✅ **Автоматическая регистрация** устройства
- ✅ **Персистентность** токена между сессиями
- ✅ **Связывание с аккаунтом** при авторизации
- ✅ **Обратная совместимость** с существующей аутентификацией
- ✅ **Минимальные изменения** в UI/UX

Система готова к production использованию! 🚀
