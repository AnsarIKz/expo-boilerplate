# Архитектура компонентов

## Структура папок

```
design-system/           # Базовые токены и примитивы
├── tokens.ts           # Цвета, типографика, отступы
└── components/         # Базовые UI компоненты
    ├── Button.tsx      # Кнопки
    ├── Input.tsx       # Поля ввода
    ├── Card.tsx        # Карточки
    └── Typography.tsx  # Типографика

components/             # Системные компоненты приложения
├── navigation/         # Навигационные компоненты
│   ├── HapticTab.tsx   # Тактильные табы
│   └── TabBar.tsx      # Кастомный таб бар
├── layout/             # Компоненты лейаута
│   ├── SafeAreaView.tsx # Безопасная зона
│   └── Container.tsx   # Контейнер
└── common/             # Общие утилиты
    ├── ExternalLink.tsx # Внешние ссылки
    └── ErrorBoundary.tsx # Обработка ошибок

components/ui/          # Переиспользуемые UI компоненты
├── forms/              # Формы и их элементы
│   ├── SearchBar.tsx   # Строка поиска
│   └── FilterChips.tsx # Фильтр чипы
├── feedback/           # Обратная связь пользователю
│   ├── LoadingSpinner.tsx # Загрузка
│   ├── EmptyState.tsx     # Пустое состояние
│   └── Toast.tsx          # Уведомления
├── data-display/       # Отображение данных
│   ├── Card.tsx        # Карточки данных
│   └── List.tsx        # Списки
└── icons/              # Иконки
    └── IconSymbol.tsx  # Символьные иконки
```

## Принципы организации

### `design-system/` - Основа дизайн-системы

- **Токены** - цвета, шрифты, отступы, тени
- **Примитивные компоненты** - Button, Input, Typography
- **Без бизнес-логики** - только UI и состояния
- **Максимальная переиспользуемость**

### `components/` - Системные компоненты

- **Навигация** - табы, роутинг, drawer
- **Лейаут** - обертки, контейнеры, сетки
- **Утилиты** - обработка ошибок, внешние ссылки
- **Платформо-специфичные** решения

### `components/ui/` - UI компоненты приложения

- **Формы** - поиск, фильтры, сложные инпуты
- **Отображение данных** - карточки, списки, таблицы
- **Обратная связь** - загрузка, пустые состояния, уведомления
- **Иконки и медиа** - изображения, видео, иконки

## Правила использования

### 1. Иерархия импортов

```typescript
// 1. Сначала design-system (примитивы)
import { Button, Input, Typography } from "@/design-system";

// 2. Затем системные компоненты
import { HapticTab } from "@/components/navigation/HapticTab";

// 3. Последними UI компоненты
import { SearchBar } from "@/components/ui/forms/SearchBar";
```

### 2. Зависимости

- `design-system/` → Не зависит ни от чего
- `components/` → Может использовать `design-system/`
- `components/ui/` → Может использовать `design-system/` и `components/`

### 3. Переиспользование

- `design-system/` - Используется везде
- `components/` - Переиспользуются в разных экранах
- `components/ui/` - Могут быть специфичными для одного экрана

## Примеры использования

### Design System компонент

```typescript
// design-system/components/Button.tsx
export function Button({ variant, children, ...props }) {
  // Только UI логика, никакой бизнес-логики
  return (
    <TouchableOpacity className={getButtonStyles(variant)} {...props}>
      <Text>{children}</Text>
    </TouchableOpacity>
  );
}
```

### UI компонент

```typescript
// components/ui/forms/SearchBar.tsx
import { Input } from "@/design-system";

export function SearchBar({ onSearch, ...props }) {
  // Специфичная логика для поиска
  return (
    <Input
      leftIcon="search"
      onChangeText={onSearch}
      placeholder="Поиск..."
      {...props}
    />
  );
}
```

### Системный компонент

```typescript
// components/navigation/HapticTab.tsx
import { Haptics } from "expo-haptics";

export function HapticTab({ children, ...props }) {
  // Системная функциональность - тактильная обратная связь
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    props.onPress?.();
  };

  return <TouchableOpacity onPress={handlePress}>{children}</TouchableOpacity>;
}
```
