/**
 * Скрипт для тестирования API доступности ресторанов
 * Запуск: node scripts/test-availability-api.js
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
    console.log("📊 Структура ответа:", {
      status: response.status,
      statusText: response.statusText,
      dataStructure: typeof response.data,
    });

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
          `   • Слоты: ${data.available_slots.slice(0, 5).join(", ")}${
            data.available_slots.length > 5 ? "..." : ""
          }`
        );
      }
    } else {
      console.log("⚠️ Неожиданная структура данных:", data);
    }

    return data;
  } catch (error) {
    console.log(`❌ Ошибка при запросе доступности:`);
    console.log(`   • Код ошибки: ${error.code || "N/A"}`);
    console.log(`   • HTTP статус: ${error.response?.status || "N/A"}`);
    console.log(`   • Сообщение: ${error.message}`);

    if (error.response?.data) {
      console.log(`   • Ответ сервера:`, error.response.data);
    }

    // Теперь API должен возвращать 200 с пустыми слотами вместо 400
    // Если получили 400, значит что-то не так с запросом
    if (error.response?.status === 400) {
      console.log(
        `⚠️  Получен статус 400 - возможно, изменилось поведение API`
      );
    }

    return null;
  }
}

// Функция для получения списка ресторанов
async function getRestaurants() {
  console.log("\n🏪 Получаем список ресторанов...");

  try {
    const response = await apiClient.get(
      "/restaurant/restaurants/?page_size=5"
    );
    const data = response.data;

    if (data.results && Array.isArray(data.results)) {
      console.log(
        `✅ Найдено ${data.results.length} ресторанов (из ${data.count} всего):`
      );
      return data.results.map((restaurant) => ({
        id: restaurant.id,
        name: restaurant.name,
        address: restaurant.address,
      }));
    } else {
      console.log("⚠️ Неожиданная структура ответа:", data);
      return [];
    }
  } catch (error) {
    console.log(`❌ Ошибка получения ресторанов: ${error.message}`);
    return [];
  }
}

// Функция генерации дат для тестирования
function generateTestDates() {
  const dates = [];
  const today = new Date();

  for (let i = 0; i < 3; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push(date.toISOString().split("T")[0]);
  }

  return dates;
}

// Основная функция тестирования
async function runTests() {
  console.log("🚀 Запуск тестирования API доступности ресторанов");
  console.log(`📡 Базовый URL: ${API_BASE_URL}${API_PREFIX}`);

  // Получаем рестораны
  const restaurants = await getRestaurants();

  if (restaurants.length === 0) {
    console.log("❌ Не удалось получить рестораны для тестирования");
    return;
  }

  // Генерируем даты для тестирования
  const testDates = generateTestDates();
  console.log(`📅 Тестируем на датах: ${testDates.join(", ")}`);

  // Тестируем первые 2 ресторана на первые 2 даты
  const testsToRun = [];

  for (let i = 0; i < Math.min(2, restaurants.length); i++) {
    for (let j = 0; j < Math.min(2, testDates.length); j++) {
      testsToRun.push({
        restaurant: restaurants[i],
        date: testDates[j],
      });
    }
  }

  console.log(`\n🎯 Запускаем ${testsToRun.length} тестов...`);

  for (const test of testsToRun) {
    console.log(`\n${"=".repeat(60)}`);
    console.log(
      `🏪 Ресторан: ${test.restaurant.name} (ID: ${test.restaurant.id})`
    );
    console.log(`📍 Адрес: ${test.restaurant.address}`);
    console.log(`📅 Дата: ${test.date}`);

    await testAvailability(test.restaurant.id, test.date);

    // Небольшая пауза между запросами
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log("✅ Тестирование завершено!");

  // Краткая сводка
  console.log("\n📊 Краткая сводка:");
  console.log(
    `   • Протестировано ресторанов: ${Math.min(2, restaurants.length)}`
  );
  console.log(`   • Протестировано дат: ${Math.min(2, testDates.length)}`);
  console.log(`   • Всего тестов: ${testsToRun.length}`);
  console.log(
    `   • API endpoint: GET /restaurant/restaurants/{id}/availability/?date=YYYY-MM-DD`
  );
}

// Запуск тестирования
if (require.main === module) {
  runTests().catch((error) => {
    console.error("💥 Критическая ошибка:", error.message);
    process.exit(1);
  });
}

module.exports = {
  testAvailability,
  getRestaurants,
  runTests,
};
