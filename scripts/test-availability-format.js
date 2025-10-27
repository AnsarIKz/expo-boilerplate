const axios = require("axios");

// Конфигурация API
const API_BASE_URL = "https://api-production-4ce8.up.railway.app/api";
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

async function getFirstRestaurant() {
  try {
    console.log("🔍 Getting first available restaurant...");
    const response = await apiClient.get("/restaurant/restaurants/");
    const restaurants = response.data.results || response.data;

    if (restaurants && restaurants.length > 0) {
      const firstRestaurant = restaurants[0];
      console.log(
        `✅ Found restaurant: ${firstRestaurant.name} (ID: ${firstRestaurant.id})`
      );
      return firstRestaurant.id;
    } else {
      console.log("❌ No restaurants found");
      return null;
    }
  } catch (error) {
    console.log("❌ Failed to get restaurants:", error.message);
    return null;
  }
}

async function testAvailabilityFormat() {
  console.log("🧪 Testing availability API format...\n");

  // Получаем реальный ID ресторана
  const restaurantId = await getFirstRestaurant();
  if (!restaurantId) {
    console.log("❌ Cannot proceed without a valid restaurant ID");
    return false;
  }

  const testDate = "2024-01-15";

  try {
    console.log(
      `📅 Testing availability for restaurant ${restaurantId} on ${testDate}`
    );

    const response = await apiClient.get(
      `/restaurant/restaurants/${restaurantId}/availability/`,
      {
        params: { date: testDate },
      }
    );

    console.log("✅ API Response received:");
    console.log("Status:", response.status);
    console.log("Headers:", response.headers["content-type"]);

    const data = response.data.data || response.data;
    console.log("\n📊 Response data structure:");
    console.log(JSON.stringify(data, null, 2));

    // Проверяем наличие всех ожидаемых полей
    const expectedFields = [
      "restaurant_id",
      "date",
      "day_of_week",
      "is_open",
      "opening_time",
      "closing_time",
      "available_slots",
    ];

    console.log("\n🔍 Field validation:");
    expectedFields.forEach((field) => {
      const hasField = data.hasOwnProperty(field);
      const value = data[field];
      console.log(
        `${hasField ? "✅" : "❌"} ${field}: ${
          hasField
            ? typeof value === "object"
              ? JSON.stringify(value)
              : value
            : "MISSING"
        }`
      );
    });

    // Проверяем типы данных
    console.log("\n🔍 Type validation:");
    console.log(
      `restaurant_id (string): ${
        typeof data.restaurant_id === "string" ? "✅" : "❌"
      }`
    );
    console.log(
      `date (string): ${typeof data.date === "string" ? "✅" : "❌"}`
    );
    console.log(
      `day_of_week (string): ${
        typeof data.day_of_week === "string" ? "✅" : "❌"
      }`
    );
    console.log(
      `is_open (boolean): ${typeof data.is_open === "boolean" ? "✅" : "❌"}`
    );
    console.log(
      `opening_time (string): ${
        typeof data.opening_time === "string" ? "✅" : "❌"
      }`
    );
    console.log(
      `closing_time (string): ${
        typeof data.closing_time === "string" ? "✅" : "❌"
      }`
    );
    console.log(
      `available_slots (array): ${
        Array.isArray(data.available_slots) ? "✅" : "❌"
      }`
    );

    // Проверяем формат времени
    const timeFormat = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    console.log(`\n🕐 Time format validation:`);
    console.log(
      `opening_time format (HH:MM): ${
        timeFormat.test(data.opening_time) ? "✅" : "❌"
      }`
    );
    console.log(
      `closing_time format (HH:MM): ${
        timeFormat.test(data.closing_time) ? "✅" : "❌"
      }`
    );

    // Проверяем слоты времени
    if (Array.isArray(data.available_slots)) {
      const validSlots = data.available_slots.filter((slot) =>
        timeFormat.test(slot)
      );
      console.log(
        `available_slots format: ${
          validSlots.length === data.available_slots.length ? "✅" : "❌"
        } (${validSlots.length}/${data.available_slots.length} valid)`
      );
    }

    console.log("\n🎯 Expected format:");
    console.log(
      JSON.stringify(
        {
          restaurant_id: "uuid",
          date: "2024-01-15",
          day_of_week: "Monday",
          is_open: true,
          opening_time: "09:00",
          closing_time: "22:00",
          available_slots: ["09:00", "10:00", "11:00", "14:00", "15:00"],
        },
        null,
        2
      )
    );

    return true;
  } catch (error) {
    console.log("❌ API call failed:");
    console.log("Error:", error.message);
    if (error.response) {
      console.log("Status:", error.response.status);
      console.log("Data:", error.response.data);
    }
    return false;
  }
}

// Запуск теста
testAvailabilityFormat()
  .then((success) => {
    console.log(
      `\n${success ? "✅" : "❌"} Test ${success ? "passed" : "failed"}`
    );
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error("💥 Test crashed:", error);
    process.exit(1);
  });
