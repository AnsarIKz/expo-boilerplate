/**
 * Скрипт для тестирования нового поведения API доступности ресторанов
 * Теперь API возвращает 200 с пустыми слотами вместо 400 при отсутствии доступности
 * Запуск: node scripts/test-new-availability-behavior.js
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
async function testAvailability(
  restaurantId,
  date,
  expectedBehavior = "unknown"
) {
  console.log(
    `\n🧪 Тестируем доступность для ресторана ${restaurantId} на дату ${date}`
  );
  console.log(`   Ожидаемое поведение: ${expectedBehavior}`);

  try {
    const startTime = Date.now();
    const response = await apiClient.get(
      `/restaurant/restaurants/${restaurantId}/availability/?date=${date}`
    );
    const endTime = Date.now();

    console.log(
      `✅ Получен ответ ${response.status} за ${endTime - startTime}ms`
    );

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

      // Анализируем результат
      if (data.available_slots?.length > 0) {
        console.log("🟢 Статус: Есть доступные слоты");
        console.log(
          `   • Первые слоты: ${data.available_slots.slice(0, 5).join(", ")}`
        );
      } else if (
        Array.isArray(data.available_slots) &&
        data.available_slots.length === 0
      ) {
        // Определяем причину отсутствия слотов
        const hasWorkingHours =
          data.opening_time &&
          data.closing_time &&
          data.opening_time !== data.closing_time;

        if (!hasWorkingHours) {
          console.log("🔴 Статус: Ресторан закрыт в этот день");
        } else {
          console.log("🟡 Статус: Все слоты заняты");
        }
      } else {
        console.log("⚠️ Статус: Неожиданная структура available_slots");
      }

      return {
        success: true,
        data,
        hasSlots: data.available_slots?.length > 0,
        isClosed:
          !data.opening_time ||
          !data.closing_time ||
          data.opening_time === data.closing_time,
      };
    } else {
      console.log("⚠️ Неожиданная структура данных:", data);
      return { success: false, error: "Invalid data structure" };
    }
  } catch (error) {
    console.log(`❌ Ошибка при запросе доступности:`);
    console.log(`   • HTTP статус: ${error.response?.status || "N/A"}`);
    console.log(`   • Сообщение: ${error.message}`);

    if (error.response?.data) {
      console.log(`   • Ответ сервера:`, error.response.data);
    }

    // Анализируем ошибку
    if (error.response?.status === 400) {
      console.log("🚨 ВНИМАНИЕ: Получен статус 400!");
      console.log("   Это может означать, что API еще не обновлен");
      console.log("   или есть проблема с запросом");
    }

    return {
      success: false,
      error: error.message,
      status: error.response?.status,
      serverResponse: error.response?.data,
    };
  }
}

// Функция для получения ресторана
async function getRestaurant() {
  console.log("\n🏪 Получаем информацию о ресторане...");

  try {
    const response = await apiClient.get(
      "/restaurant/restaurants/?page_size=1"
    );
    const data = response.data;

    if (
      data.results &&
      Array.isArray(data.results) &&
      data.results.length > 0
    ) {
      const restaurant = data.results[0];
      console.log(
        `✅ Найден ресторан: ${restaurant.name} (ID: ${restaurant.id})`
      );
      return restaurant;
    } else {
      console.log("⚠️ Рестораны не найдены");
      return null;
    }
  } catch (error) {
    console.log(`❌ Ошибка получения ресторана: ${error.message}`);
    return null;
  }
}

// Функция генерации различных дат для тестирования
function generateTestDates() {
  const dates = [];
  const today = new Date();

  // Добавляем разные дни недели
  for (let i = 0; i < 14; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);

    const dayNames = [
      "Воскресенье",
      "Понедельник",
      "Вторник",
      "Среда",
      "Четверг",
      "Пятница",
      "Суббота",
    ];
    const dayOfWeek = date.getDay();

    dates.push({
      date: date.toISOString().split("T")[0],
      dayName: dayNames[dayOfWeek],
      dayOfWeek,
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
    });
  }

  return dates;
}

// Основная функция тестирования
async function runNewBehaviorTests() {
  console.log("🚀 Тестирование нового поведения API доступности ресторанов");
  console.log("📋 Проверяем, что API теперь возвращает 200 с пустыми слотами");
  console.log(`📡 Базовый URL: ${API_BASE_URL}${API_PREFIX}`);

  // Получаем ресторан
  const restaurant = await getRestaurant();

  if (!restaurant) {
    console.log("❌ Не удалось получить ресторан для тестирования");
    return;
  }

  // Генерируем даты для тестирования
  const testDates = generateTestDates();
  console.log(`📅 Будем тестировать ${testDates.length} дат...`);

  const results = {
    success: 0,
    errors: 0,
    closed: 0,
    hasSlots: 0,
    emptySlots: 0,
    status400: 0,
  };

  console.log(`\n🎯 Запускаем тестирование...`);

  for (const dateInfo of testDates) {
    console.log(`\n${"=".repeat(80)}`);
    console.log(`📅 Тестируем: ${dateInfo.date} (${dateInfo.dayName})`);

    const result = await testAvailability(
      restaurant.id,
      dateInfo.date,
      dateInfo.isWeekend ? "может быть закрыт" : "может работать"
    );

    // Анализируем результат
    if (result.success) {
      results.success++;
      if (result.isClosed) {
        results.closed++;
      } else if (result.hasSlots) {
        results.hasSlots++;
      } else {
        results.emptySlots++;
      }
    } else {
      results.errors++;
      if (result.status === 400) {
        results.status400++;
      }
    }

    // Небольшая пауза между запросами
    await new Promise((resolve) => setTimeout(resolve, 300));
  }

  console.log(`\n${"=".repeat(80)}`);
  console.log("✅ Тестирование завершено!");

  // Итоговая статистика
  console.log("\n📊 Статистика результатов:");
  console.log(`   • Успешных запросов: ${results.success}`);
  console.log(`   • Ошибок: ${results.errors}`);
  console.log(`   • Дней когда ресторан закрыт: ${results.closed}`);
  console.log(`   • Дней с доступными слотами: ${results.hasSlots}`);
  console.log(
    `   • Дней с пустыми слотами (все заняты): ${results.emptySlots}`
  );
  console.log(`   • Ошибок 400 (старое поведение): ${results.status400}`);

  // Выводы
  console.log("\n🔍 Анализ поведения API:");

  if (results.status400 > 0) {
    console.log("🚨 ВНИМАНИЕ: Обнаружены ответы со статусом 400!");
    console.log("   Возможно, API еще не обновлен до нового поведения");
  } else {
    console.log("✅ Отлично! API корректно возвращает статус 200");
    console.log("   даже когда нет доступных слотов");
  }

  if (results.success > 0) {
    console.log(
      `✅ API корректно работает в ${results.success} из ${testDates.length} тестов`
    );
  }

  const successRate = ((results.success / testDates.length) * 100).toFixed(1);
  console.log(`📈 Процент успешных запросов: ${successRate}%`);
}

// Запуск тестирования
if (require.main === module) {
  runNewBehaviorTests().catch((error) => {
    console.error("💥 Критическая ошибка:", error.message);
    process.exit(1);
  });
}

module.exports = {
  testAvailability,
  runNewBehaviorTests,
};
