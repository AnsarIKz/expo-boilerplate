/**
 * Простой скрипт для тестирования подключения к Django API
 * Запуск: node scripts/test-api.js
 */

const axios = require("axios");

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  "https://api-production-4ce8.up.railway.app/api";

// Тестирование health endpoint
async function testHealthEndpoint() {
  console.log("🌐 Testing API health endpoint...");

  try {
    const response = await axios.get(`${API_BASE_URL}/health/`, {
      timeout: 10000,
    });

    console.log("✅ Health check successful:");
    console.log("Status:", response.status);
    console.log("Data:", response.data);
    return true;
  } catch (error) {
    console.log("❌ Health check failed:");
    console.log("Error:", error.message);
    if (error.response) {
      console.log("Status:", error.response.status);
      console.log("Data:", error.response.data);
    }
    return false;
  }
}

// Тестирование restaurants endpoint (требует аутентификации)
async function testRestaurantsEndpoint() {
  console.log("\n🍽️ Testing restaurants endpoint...");

  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/restaurant/restaurants/`,
      {
        timeout: 10000,
      }
    );

    console.log("✅ Restaurants endpoint successful:");
    console.log("Status:", response.status);
    console.log("Data keys:", Object.keys(response.data));
    if (response.data.results) {
      console.log("Restaurants count:", response.data.results.length);
    }
    return true;
  } catch (error) {
    if (error.response?.status === 401) {
      console.log(
        "ℹ️  Restaurants endpoint requires authentication (expected):"
      );
      console.log("Status:", error.response.status);
      console.log("This is correct behavior - endpoint is protected.");
      return true; // Считаем это успехом, так как эндпоинт работает
    }

    console.log("❌ Restaurants endpoint failed:");
    console.log("Error:", error.message);
    if (error.response) {
      console.log("Status:", error.response.status);
      console.log("Data:", error.response.data);
    }
    return false;
  }
}

// Тестирование схемы API
async function testApiSchema() {
  console.log("\n📋 Testing API schema endpoint...");

  try {
    const response = await axios.get(`${API_BASE_URL}/api/schema/`, {
      timeout: 10000,
    });

    console.log("✅ API schema successful:");
    console.log("Status:", response.status);
    console.log("Content-Type:", response.headers["content-type"]);
    return true;
  } catch (error) {
    console.log("❌ API schema failed:");
    console.log("Error:", error.message);
    if (error.response) {
      console.log("Status:", error.response.status);
    }
    return false;
  }
}

// Основная функция
async function main() {
  console.log("🚀 Django API Connection Test");
  console.log("API URL:", API_BASE_URL);
  console.log("=".repeat(50));

  const results = [];

  // Запускаем тесты
  results.push(await testHealthEndpoint());
  results.push(await testRestaurantsEndpoint());
  results.push(await testApiSchema());

  // Выводим результаты
  console.log("\n" + "=".repeat(50));
  console.log("📊 Test Results:");
  console.log(`Health endpoint: ${results[0] ? "✅ PASS" : "❌ FAIL"}`);
  console.log(`Restaurants endpoint: ${results[1] ? "✅ PASS" : "❌ FAIL"}`);
  console.log(`API schema: ${results[2] ? "✅ PASS" : "❌ FAIL"}`);

  const passedTests = results.filter((r) => r).length;
  const totalTests = results.length;

  console.log(`\n🎯 Overall: ${passedTests}/${totalTests} tests passed`);

  if (passedTests === totalTests) {
    console.log("🎉 All tests passed! API is ready for integration.");
  } else {
    console.log("⚠️  Some tests failed. Check API configuration.");
  }
}

// Запускаем тесты
main().catch((error) => {
  console.error("💥 Test runner error:", error.message);
  process.exit(1);
});
