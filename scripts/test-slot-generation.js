const axios = require("axios");

// Конфигурация API
const API_BASE_URL = "https://api-production-4ce8.up.railway.app/api";
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

async function testSlotGeneration() {
  console.log("🧪 Testing slot generation logic...\n");

  // Получаем первый ресторан
  let restaurantId;
  try {
    console.log("🔍 Getting first restaurant...");
    const response = await apiClient.get("/restaurant/restaurants/");
    const restaurants = response.data.results || response.data;

    if (restaurants && restaurants.length > 0) {
      restaurantId = restaurants[0].id;
      console.log(
        `✅ Found restaurant: ${restaurants[0].name} (ID: ${restaurantId})`
      );
    } else {
      console.log("❌ No restaurants found");
      return;
    }
  } catch (error) {
    console.log("❌ Failed to get restaurants:", error.message);
    return;
  }

  // Тестируем разные даты
  const testDates = [
    "2024-01-15", // Monday
    "2024-01-16", // Tuesday
    "2024-01-17", // Wednesday
    "2024-01-18", // Thursday
    "2024-01-19", // Friday
    "2024-01-20", // Saturday
    "2024-01-21", // Sunday
    "2024-01-22", // Monday (next week)
  ];

  console.log("\n📅 Testing different dates:\n");

  for (const date of testDates) {
    try {
      console.log(
        `\n🧪 Testing ${date} (${new Date(date).toLocaleDateString("en-US", {
          weekday: "long",
        })})`
      );

      const response = await apiClient.get(
        `/restaurant/restaurants/${restaurantId}/availability/`,
        { params: { date } }
      );

      const data = response.data.data || response.data;

      console.log(`📊 Results for ${date}:`);
      console.log(`   • Day: ${data.day_of_week}`);
      console.log(`   • Is Open: ${data.is_open}`);
      console.log(`   • Hours: ${data.opening_time} - ${data.closing_time}`);
      console.log(`   • Available Slots: ${data.available_slots.length}`);

      if (data.available_slots.length > 0) {
        console.log(
          `   • First 5 slots: ${data.available_slots.slice(0, 5).join(", ")}`
        );
        console.log(
          `   • Last 5 slots: ${data.available_slots.slice(-5).join(", ")}`
        );
      }

      // Анализируем паттерн слотов
      if (data.available_slots.length > 0) {
        const slots = data.available_slots;
        const firstSlot = slots[0];
        const lastSlot = slots[slots.length - 1];
        const slotInterval =
          slots.length > 1
            ? (parseInt(slots[1].split(":")[0]) -
                parseInt(slots[0].split(":")[0])) *
                60 +
              (parseInt(slots[1].split(":")[1]) -
                parseInt(slots[0].split(":")[1]))
            : 60;

        console.log(
          `   • Slot Pattern: ${firstSlot} to ${lastSlot} (${slotInterval}min intervals)`
        );
      }
    } catch (error) {
      console.log(`❌ Error for ${date}: ${error.message}`);
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Data: ${JSON.stringify(error.response.data)}`);
      }
    }
  }

  // Тестируем логику генерации слотов
  console.log("\n🔍 Analyzing slot generation logic:\n");

  try {
    const response = await apiClient.get(
      `/restaurant/restaurants/${restaurantId}/availability/`,
      { params: { date: "2024-01-15" } }
    );

    const data = response.data.data || response.data;

    if (data.available_slots && data.available_slots.length > 0) {
      console.log("📋 Slot Generation Analysis:");
      console.log(`   • Opening Time: ${data.opening_time}`);
      console.log(`   • Closing Time: ${data.closing_time}`);
      console.log(`   • Total Slots: ${data.available_slots.length}`);

      // Проверяем интервалы
      const slots = data.available_slots;
      const intervals = [];
      for (let i = 1; i < slots.length; i++) {
        const prev = slots[i - 1].split(":");
        const curr = slots[i].split(":");
        const prevMinutes = parseInt(prev[0]) * 60 + parseInt(prev[1]);
        const currMinutes = parseInt(curr[0]) * 60 + parseInt(curr[1]);
        intervals.push(currMinutes - prevMinutes);
      }

      const uniqueIntervals = [...new Set(intervals)];
      console.log(`   • Slot Intervals: ${uniqueIntervals.join(", ")} minutes`);

      // Проверяем, начинается ли с opening_time
      const startsWithOpening = slots[0] === data.opening_time;
      console.log(
        `   • Starts with opening time: ${startsWithOpening ? "✅" : "❌"}`
      );

      // Проверяем, заканчивается ли перед closing_time
      const lastSlot = slots[slots.length - 1];
      const endsBeforeClosing = lastSlot < data.closing_time;
      console.log(
        `   • Ends before closing time: ${endsBeforeClosing ? "✅" : "❌"}`
      );

      console.log("\n🎯 Slot Generation Logic:");
      console.log("   1. Generate slots from opening_time to closing_time");
      console.log("   2. Use 1-hour intervals (60 minutes)");
      console.log("   3. Exclude closing_time from available slots");
      console.log("   4. Return slots in HH:MM format");
    }
  } catch (error) {
    console.log(`❌ Error analyzing slots: ${error.message}`);
  }
}

// Запуск теста
testSlotGeneration()
  .then(() => {
    console.log("\n✅ Slot generation test completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Test failed:", error);
    process.exit(1);
  });
