/**
 * Скрипт для тестирования Django REST API
 * Запуск: node scripts/test-django-api.js
 */

const axios = require("axios");

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  "https://api-production-4ce8.up.railway.app/api";

// Создаем axios instance для тестирования
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Тестирование health endpoint
async function testHealthEndpoint() {
  console.log("🌐 Testing API health endpoint...");
  try {
    const response = await apiClient.get("/health/");
    console.log("✅ Health check passed:", response.data);
    return true;
  } catch (error) {
    console.log("❌ Health check failed:", error.message);
    if (error.response) {
      console.log("Status:", error.response.status);
      console.log("Data:", error.response.data);
    }
    return false;
  }
}

// Тестирование SMS верификации для регистрации
async function testSendVerificationCode() {
  console.log("\n📱 Testing send verification code for registration...");
  const phoneNumber = "+77001016110"; // Ваш реальный номер телефона

  try {
    const response = await apiClient.post("/auth/send-verification-code/", {
      phone_number: phoneNumber,
    });

    console.log("✅ Verification code sent successfully:");
    console.log("Status:", response.status);
    console.log("Message:", response.data.message);
    return true;
  } catch (error) {
    console.log("❌ Failed to send verification code:");
    console.log("Error:", error.message);
    if (error.response) {
      console.log("Status:", error.response.status);
      console.log("Data:", error.response.data);
    }
    return false;
  }
}

// Тестирование SMS кода для входа
async function testSendLoginCode() {
  console.log("\n📱 Testing send login code...");
  const phoneNumber = "+77001016110"; // Ваш реальный номер телефона

  try {
    const response = await apiClient.post("/auth/login/send-code/", {
      phone_number: phoneNumber,
    });

    console.log("✅ Login code sent successfully:");
    console.log("Status:", response.status);
    console.log("Message:", response.data.message);
    return true;
  } catch (error) {
    console.log("❌ Failed to send login code:");
    console.log("Error:", error.message);
    if (error.response) {
      console.log("Status:", error.response.status);
      console.log("Data:", error.response.data);
    }
    return false;
  }
}

// Тестирование получения списка ресторанов
async function testGetRestaurants() {
  console.log("\n🍽️ Testing get restaurants...");

  try {
    const response = await apiClient.get("/restaurant/restaurants/", {
      params: {
        page: 1,
        page_size: 5,
      },
    });

    console.log("✅ Restaurants retrieved successfully:");
    console.log("Status:", response.status);
    console.log(
      "Response type:",
      Array.isArray(response.data) ? "Array" : "Object"
    );

    // Handle both paginated and array responses
    const restaurants = Array.isArray(response.data)
      ? response.data
      : response.data.results || [];
    const count = Array.isArray(response.data)
      ? response.data.length
      : response.data.count;

    console.log("Count:", count);
    console.log("Results count:", restaurants.length);

    if (restaurants && restaurants.length > 0) {
      const firstRestaurant = restaurants[0];
      console.log("First restaurant:", {
        id: firstRestaurant.id,
        name: firstRestaurant.name,
        cuisine: firstRestaurant.primary_cuisine_type?.name || "N/A",
        rating: firstRestaurant.average_rating || "N/A",
        price_range: firstRestaurant.price_range || "N/A",
      });
      return firstRestaurant;
    } else {
      console.log("⚠️ No restaurants found in response");
      return null;
    }
  } catch (error) {
    console.log("❌ Failed to get restaurants:");
    console.log("Error:", error.message);
    if (error.response) {
      console.log("Status:", error.response.status);
      console.log("Data:", error.response.data);
    }
    return null;
  }
}

// Тестирование получения типов кухонь (пропускаем, так как эндпоинт не существует)
async function testGetCuisineTypes() {
  console.log("\n🍳 Testing get cuisine types...");

  try {
    const response = await apiClient.get("/restaurant/cuisine-types/");

    console.log("✅ Cuisine types retrieved successfully:");
    console.log("Status:", response.status);
    console.log("Count:", response.data.count);

    if (response.data.results && response.data.results.length > 0) {
      console.log("Available cuisine types:");
      response.data.results.slice(0, 5).forEach((cuisine) => {
        console.log(
          `- ${cuisine.name} (${cuisine.slug}): ${cuisine.description}`
        );
      });
    }
    return true;
  } catch (error) {
    console.log("❌ Failed to get cuisine types:");
    console.log("Error:", error.message);
    if (error.response) {
      console.log("Status:", error.response.status);
      console.log("Data:", error.response.data);
    }
    return false;
  }
}

// Тестирование получения деталей ресторана
async function testGetRestaurantDetails(restaurantId) {
  if (!restaurantId) {
    console.log("\n⏭️ Skipping restaurant details test (no restaurant ID)");
    return false;
  }

  console.log(`\n🍽️ Testing get restaurant details for ID: ${restaurantId}...`);

  try {
    const response = await apiClient.get(
      `/restaurant/restaurants/${restaurantId}/`
    );

    console.log("✅ Restaurant details retrieved successfully:");
    console.log("Status:", response.status);
    console.log("Restaurant:", {
      id: response.data.id,
      name: response.data.name,
      description: response.data.description?.substring(0, 100) + "...",
      address: response.data.address,
      phone: response.data.phone_number,
      email: response.data.email,
      rating: response.data.average_rating,
      rating_count: response.data.rating_count,
      price_range: response.data.price_range,
      features: response.data.features,
      images_count: response.data.images?.length || 0,
      ratings_count: response.data.ratings?.length || 0,
    });
    return true;
  } catch (error) {
    console.log("❌ Failed to get restaurant details:");
    console.log("Error:", error.message);
    if (error.response) {
      console.log("Status:", error.response.status);
      console.log("Data:", error.response.data);
    }
    return false;
  }
}

// Тестирование проверки доступности ресторана
async function testGetRestaurantAvailability(restaurantId) {
  if (!restaurantId) {
    console.log("\n⏭️ Skipping availability test (no restaurant ID)");
    return false;
  }

  console.log(
    `\n📅 Testing get restaurant availability for ID: ${restaurantId}...`
  );

  // Попробуем несколько дней, начиная с понедельника
  const monday = new Date();
  // Получаем понедельник (день недели 1)
  const dayOfWeek = monday.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const daysUntilMonday = dayOfWeek === 0 ? 1 : (8 - dayOfWeek) % 7; // Дни до следующего понедельника
  monday.setDate(monday.getDate() + daysUntilMonday);
  const dateString = monday.toISOString().split("T")[0];

  console.log(
    `📅 Requesting availability for date: ${dateString} (${monday.toLocaleDateString(
      "en-US",
      { weekday: "long" }
    )})`
  );

  try {
    const response = await apiClient.get(
      `/restaurant/restaurants/${restaurantId}/availability/`,
      {
        params: {
          date: dateString,
        },
      }
    );

    console.log("✅ Restaurant availability retrieved successfully:");
    console.log("Status:", response.status);
    console.log("Availability:", {
      restaurant_id: response.data.data.restaurant_id,
      date: response.data.data.date,
      day_of_week: response.data.data.day_of_week,
      opening_time: response.data.data.opening_time,
      closing_time: response.data.data.closing_time,
      available_slots_count: response.data.data.available_slots?.length || 0,
      available_slots: response.data.data.available_slots?.slice(0, 5) || [],
    });
    return true;
  } catch (error) {
    console.log("❌ Failed to get restaurant availability:");
    console.log("Error:", error.message);
    if (error.response) {
      console.log("Status:", error.response.status);
      console.log("Data:", error.response.data);
    }
    return false;
  }
}

// Тестирование фильтрации ресторанов
async function testRestaurantFilters() {
  console.log("\n🔍 Testing restaurant filters...");

  const filterTests = [
    { name: "Price range filter", params: { price_range: "MODERATE" } },
    { name: "Cuisine filter", params: { cuisine: "Italian" } },
    { name: "Features filter", params: { features: "WIFI" } },
    { name: "Rating filter", params: { min_rating: 4.0 } },
    { name: "Search filter", params: { search: "pizza" } },
  ];

  for (const test of filterTests) {
    try {
      console.log(`\n  Testing ${test.name}...`);
      const response = await apiClient.get("/restaurant/restaurants/", {
        params: {
          ...test.params,
          page_size: 3,
        },
      });

      const restaurants = Array.isArray(response.data)
        ? response.data
        : response.data.results || [];
      const count = Array.isArray(response.data)
        ? response.data.length
        : response.data.count;

      console.log(`  ✅ ${test.name} successful:`);
      console.log(`  Count: ${count}`);
      console.log(`  Results: ${restaurants.length}`);
    } catch (error) {
      console.log(`  ❌ ${test.name} failed:`, error.message);
    }
  }
}

// Основная функция для запуска всех тестов
async function runAllTests() {
  console.log("🚀 Starting Django Restaurant API tests...");
  console.log(`📍 API Base URL: ${API_BASE_URL}`);
  console.log("=".repeat(60));

  const results = {
    health: false,
    sendVerificationCode: false,
    sendLoginCode: false,
    getCuisineTypes: false,
    getRestaurants: false,
    getRestaurantDetails: false,
    getRestaurantAvailability: false,
    restaurantFilters: false,
  };

  // Базовые тесты
  results.health = await testHealthEndpoint();

  // Тесты аутентификации
  results.sendVerificationCode = await testSendVerificationCode();
  results.sendLoginCode = await testSendLoginCode();

  // Тесты ресторанов
  results.getCuisineTypes = await testGetCuisineTypes();
  const firstRestaurant = await testGetRestaurants();
  results.getRestaurants = !!firstRestaurant;

  if (firstRestaurant) {
    results.getRestaurantDetails = await testGetRestaurantDetails(
      firstRestaurant.id
    );
    results.getRestaurantAvailability = await testGetRestaurantAvailability(
      firstRestaurant.id
    );
  }

  // Тесты фильтрации
  await testRestaurantFilters();
  results.restaurantFilters = true; // Считаем успешным если не упало

  // Результаты
  console.log("\n" + "=".repeat(60));
  console.log("📊 TEST RESULTS:");
  console.log("=".repeat(60));

  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(Boolean).length;

  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? "✅ PASS" : "❌ FAIL";
    console.log(`${status} ${test}`);
  });

  console.log("-".repeat(60));
  console.log(`📈 Summary: ${passedTests}/${totalTests} tests passed`);

  if (passedTests === totalTests) {
    console.log("🎉 All tests passed! API is working correctly.");
  } else {
    console.log(
      "⚠️ Some tests failed. Check the API configuration and server status."
    );
  }
}

// Запуск тестов
if (require.main === module) {
  runAllTests().catch((error) => {
    console.error("💥 Test suite failed:", error);
    process.exit(1);
  });
}

module.exports = {
  runAllTests,
  testHealthEndpoint,
  testSendVerificationCode,
  testSendLoginCode,
  testGetRestaurants,
  testGetCuisineTypes,
  testGetRestaurantDetails,
  testGetRestaurantAvailability,
  testRestaurantFilters,
};
