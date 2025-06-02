# UI Components

Этот каталог содержит переиспользуемые UI компоненты для приложения поиска ресторанов, созданные с использованием **Tailwind CSS** (NativeWind) и шрифта **SF Pro Text**.

## Технологии

- **NativeWind**: Tailwind CSS для React Native
- **Expo Image**: Оптимизированные изображения
- **SF Pro Text**: Системный шрифт Apple
- **TypeScript**: Строгая типизация

## Компоненты

### SearchBar

Компонент поисковой строки с иконкой поиска.

**Props:**

- `placeholder: string` - Текст плейсхолдера
- `value: string` - Текущее значение поиска
- `onChangeText: (text: string) => void` - Обработчик изменения текста

**Tailwind классы:**

- `flex-row items-center` - Горизонтальное расположение с центрированием
- `bg-white rounded-xl border border-border` - Белый фон с закругленными углами и границей
- `font-sf-pro` - Шрифт SF Pro Text

### FilterChips

Компонент для отображения фильтров в виде чипов с кнопкой "Фильтр".

**Props:**

- `chips: FilterChip[]` - Массив чипов для отображения
- `onChipPress: (chipId: string) => void` - Обработчик нажатия на чип
- `onFilterPress: () => void` - Обработчик нажатия на кнопку "Фильтр"

**Tailwind классы:**

- `bg-primary` - Основной цвет для активных элементов
- `bg-white border-border` - Неактивные чипы

### RestaurantCard

Карточка ресторана с изображением, рейтингом и тегами.

**Props:**

- `restaurant: Restaurant` - Объект ресторана
- `onPress: (restaurantId: string) => void` - Обработчик нажатия на карточку

**Tailwind классы:**

- `shadow-lg` - Тень для карточки
- `bg-cardBackground` - Фон информационной секции
- `absolute bottom-3 left-3` - Позиционирование рейтинга

### EmptyState

Компонент для отображения пустого состояния.

**Props:**

- `title: string` - Заголовок
- `subtitle?: string` - Подзаголовок (опционально)
- `iconName?: keyof typeof Ionicons.glyphMap` - Имя иконки (опционально)

### LoadingSpinner

Компонент индикатора загрузки.

**Props:**

- `text?: string` - Текст загрузки (по умолчанию "Загрузка...")
- `size?: 'small' | 'large'` - Размер спиннера (по умолчанию 'large')

## Цветовая схема (Tailwind)

Все компоненты используют кастомные цвета, определенные в `tailwind.config.js`:

```javascript
colors: {
  primary: "#bd561c",        // bg-primary, text-primary
  background: "#fff4d6",     // bg-background
  cardBackground: "#fff9e9", // bg-cardBackground
  text: "#0d0d0d",          // text-text
  secondaryText: "#a5a5a5",  // text-secondaryText
  border: "#a5a5a5",        // border-border
  star: "#efd661",          // Цвет звезды рейтинга
}
```

## Типография

- **Основной шрифт**: `font-sf-pro` (SF Pro Text)
- **Размеры**: `text-[15px]`, `text-[18px]` и др.
- **Веса**: `font-semibold`, `font-normal`

## Утилиты Tailwind

Наиболее используемые классы:

- **Layout**: `flex-1`, `flex-row`, `items-center`, `justify-center`
- **Spacing**: `px-4`, `py-3`, `mx-[14px]`, `mt-4`, `mb-2`
- **Colors**: `bg-primary`, `text-white`, `border-border`
- **Border**: `rounded-xl`, `rounded-[10px]`, `border`
- **Shadows**: `shadow-lg`

## Настройка

1. **Установка NativeWind**: `npm install nativewind tailwindcss`
2. **Конфигурация**: `tailwind.config.js` с кастомными цветами и шрифтами
3. **Babel**: Добавить `"nativewind/babel"` в плагины
4. **Metro**: Использовать `withNativeWind` wrapper
5. **CSS**: Импортировать `global.css` в `_layout.tsx`
