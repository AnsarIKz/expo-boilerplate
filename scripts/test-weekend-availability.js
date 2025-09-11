/**
 * Скрипт для тестирования API доступности ресторанов на выходные
 * Запуск: node scripts/test-weekend-availability.js
 */

const axios = require("axios");

// Конфигурация
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  "https://api-production-4ce8.up.railway.app";
const API_PREFIX = "/api";

// Создаем axios instance
const apiClient = axios.create({
  baseURL: `${API_BASE_URL}${API_PREFIX}`,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Функция для тестирования получения доступности
async function testAvailability(restaurantId, date) {
  console.log(
    `\n🧪 Тестируем доступность для ресторана ${restaurantId} на дату ${date}`
  );

  try {
    const startTime = Date.now();
    const response = await apiClient.get(
      `/restaurant/restaurants/${restaurantId}/availability/?date=${date}`
    );
    const endTime = Date.now();

    console.log(`✅ Успешно получен ответ за ${endTime - startTime}ms:`);

    const data = response.data.data || response.data;

    if (data && typeof data === "object") {
      console.log("📋 Данные о доступности:");
      console.log(`   • ID ресторана: ${data.restaurant_id}`);
      console.log(`   • Дата: ${data.date}`);
      console.log(`   • День недели: ${data.day_of_week}`);
      console.log(
        `   • Время работы: ${data.opening_time} - ${data.closing_time}`
      );
      console.log(
        `   • Доступных слотов: ${data.available_slots?.length || 0}`
      );

      if (data.available_slots && Array.isArray(data.available_slots)) {
        console.log(
          `   • Первые слоты: ${data.available_slots.slice(0, 10).join(", ")}`
        );
      }
    }

    return data;
  } catch (error) {
    console.log(`❌ Ошибка при запросе доступности:`);
    console.log(`   • HTTP статус: ${error.response?.status || "N/A"}`);
    console.log(
      `   • Сообщение: ${error.response?.data?.message || error.message}`
    );

    return null;
  }
}

// Функция генерации дат для выходных
function generateWeekendDates() {
  const dates = [];
  const today = new Date();

  // Ищем ближайшие субботу и воскресенье
  for (let i = 0; i < 14; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);

    const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
    if (dayOfWeek === 6 || dayOfWeek === 0) {
      // Saturday or Sunday
      dates.push({
        date: date.toISOString().split("T")[0],
        dayName: dayOfWeek === 6 ? "Суббота" : "Воскресенье",
      });
    }

    if (dates.length >= 4) break; // Получаем 4 выходных дня
  }

  return dates;
}

// Основная функция тестирования
async function runWeekendTests() {
  console.log("🚀 Тестирование API доступности ресторанов на выходные");
  console.log(`📡 Базовый URL: ${API_BASE_URL}${API_PREFIX}`);

  // ID ресторана из предыдущего теста
  const restaurantId = "aecbde99-a4c0-4859-b9e5-6ec8f42b40a2";

  // Генерируем даты для выходных
  const weekendDates = generateWeekendDates();
  console.log(`📅 Тестируем на выходных датах:`);
  weekendDates.forEach(({ date, dayName }) => {
    console.log(`   • ${date} (${dayName})`);
  });

  console.log(`\n🎯 Запускаем ${weekendDates.length} тестов...`);

  for (const { date, dayName } of weekendDates) {
    console.log(`\n${"=".repeat(60)}`);
    console.log(`📅 Дата: ${date} (${dayName})`);

    await testAvailability(restaurantId, date);

    // Небольшая пауза между запросами
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log("✅ Тестирование выходных завершено!");
}

// Запуск тестирования
if (require.main === module) {
  runWeekendTests().catch((error) => {
    console.error("💥 Критическая ошибка:", error.message);
    process.exit(1);
  });
}
