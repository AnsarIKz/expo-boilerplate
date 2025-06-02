# Обновления приложения: Дизайн-система и лучшие практики

## Обзор изменений

Приложение было полностью переписано с использованием современной дизайн-системы и лучших практик React Native/Expo.

## Основные улучшения

### 🎨 Дизайн-система

- **Компоненты UI**: Переиспользуемые компоненты в `components/ui/`
- **Типография**: Централизованная система типографики с вариантами
- **Цветовая палитра**: Полная цветовая система с семантическими цветами
- **Токены**: Централизованные токены дизайна в `components/tokens.ts`

### 📱 Новые экраны и функциональность

- **Бронирования** (`/bookings`) - Управление бронированиями пользователя
- **Избранное** (`/favorites`) - Список избранных ресторанов
- **Профиль** (`/profile`) - Профиль пользователя с настройками

### 🔐 Управление состоянием

- **Zustand** для локального состояния (авторизация)
- **React Query** для серверного состояния (данные ресторанов)
- **AsyncStorage** для персистентности данных

### 🏗️ Архитектура

- Четкое разделение компонентов UI и бизнес-логики
- Хуки для работы с данными (`hooks/useRestaurants.ts`)
- Провайдеры для глобального состояния
- TypeScript для типизации

## Структура проекта

```
├── app/                          # Экраны приложения
│   ├── (tabs)/                   # Табы приложения
│   │   ├── index.tsx            # Главная страница
│   │   ├── bookings.tsx         # Бронирования
│   │   ├── favorites.tsx        # Избранное
│   │   ├── profile.tsx          # Профиль
│   │   └── _layout.tsx          # Layout табов
│   ├── auth.tsx                 # Экран авторизации
│   ├── +not-found.tsx          # 404 страница
│   └── _layout.tsx             # Основной layout
├── components/
│   ├── ui/                      # UI компоненты
│   │   ├── Button.tsx          # Кнопки
│   │   ├── Input.tsx           # Поля ввода
│   │   ├── Typography.tsx      # Типография
│   │   ├── Card.tsx            # Карточки
│   │   ├── EmptyState.tsx      # Пустые состояния
│   │   ├── LoadingSpinner.tsx  # Индикаторы загрузки
│   │   └── ...
│   └── tokens.ts               # Токены дизайна
├── stores/
│   └── authStore.ts            # Zustand store для авторизации
├── providers/
│   └── QueryProvider.tsx      # React Query провайдер
├── hooks/
│   └── useRestaurants.ts      # Хуки для данных
└── types/                     # TypeScript типы
```

## Использованные технологии

### State Management

- **Zustand** - Легковесное управление состоянием
- **React Query** - Серверное состояние и кэширование
- **AsyncStorage** - Локальное хранение данных

### UI/UX

- **NativeWind** - Tailwind CSS для React Native
- **Expo Image** - Оптимизированные изображения
- **System fonts** - SF Pro на iOS, системные шрифты

### Навигация

- **Expo Router** - Файловая система роутинга
- **Tab Navigation** - Bottom tabs с иконками

## Ключевые компоненты

### Button

```tsx
<Button variant="primary" size="lg" loading={isLoading}>
  Подтвердить
</Button>
```

### Typography

```tsx
<Typography variant="h4" color="primary">
  Заголовок
</Typography>
```

### Input

```tsx
<Input
  label="Телефон"
  placeholder="+7 000 000 00 00"
  leftIcon="phone"
  variant="outline"
/>
```

### Card

```tsx
<Card variant="elevated" padding="lg">
  Контент карточки
</Card>
```

## Состояние авторизации

### Zustand Store

```tsx
const { isAuthenticated, user, login, logout } = useAuthStore();

// Авторизация
login(userData, token);

// Выход
logout();
```

### Защищенные экраны

- Профиль автоматически перенаправляет на авторизацию
- Бронирования и избранное показывают заглушку для неавторизованных

## Работа с данными

### React Query

```tsx
const { data, isLoading, error, refetch } = useRestaurants(searchQuery);
```

### Pull-to-refresh

```tsx
<ScrollView
  refreshControl={
    <RefreshControl refreshing={isLoading} onRefresh={refetch} />
  }
>
```

## Лучшие практики

### Performance

- **useMemo** для дорогих вычислений
- **useCallback** для стабильности функций
- **React Query** для кэширования данных
- **Lazy loading** изображений

### Accessibility

- Семантическая типография
- Правильные цветовые контрасты
- Читаемые размеры шрифтов

### Code Quality

- **TypeScript** строгая типизация
- **ESLint** для качества кода
- Консистентная архитектура
- Переиспользуемые компоненты

## Следующие шаги

1. **Анимации** - Добавить smooth transitions
2. **Темная тема** - Поддержка dark mode
3. **Offline mode** - Работа без интернета
4. **Push notifications** - Уведомления
5. **Детальные экраны** - Детали ресторанов
6. **Система бронирования** - Полная интеграция
7. **Геолокация** - Поиск по местоположению
8. **Фильтры** - Расширенная фильтрация

## Требования

- **Expo SDK 53+**
- **React Native 0.79+**
- **TypeScript 5.8+**
- **Node.js 18+**
