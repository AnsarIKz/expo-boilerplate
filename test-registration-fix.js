// Test script to validate registration API request format
const axios = require('axios');

const API_BASE_URL = "https://api-production-4ce8.up.railway.app/api";

async function testRegistrationFormat() {
  console.log("🧪 Testing registration API request format...\n");

  // Test data that matches what the RegistrationForm would send
  const testData = {
    phone_number: "+77001016110",
    code: "123456", // Test code (this will fail but shows format is correct)
    first_name: "TestFirst",
    last_name: "TestLast", 
    password: "testpassword123"
  };

  console.log("📤 Request payload:", JSON.stringify(testData, null, 2));

  try {
    const response = await axios.post(`${API_BASE_URL}/auth/verify-phone/`, testData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    console.log("✅ Unexpected success:", response.data);
  } catch (error) {
    console.log("❌ Expected error occurred:");
    console.log("Status:", error.response?.status);
    console.log("Error data:", JSON.stringify(error.response?.data, null, 2));
    
    // Analyze the error to see if it's a format issue vs validation issue
    if (error.response?.status === 400) {
      const errorData = error.response.data;
      if (errorData.errors) {
        console.log("\n🔍 Validation errors analysis:");
        Object.keys(errorData.errors).forEach(field => {
          console.log(`  - ${field}: ${errorData.errors[field]}`);
        });
        
        // Check if all expected fields are present in errors
        const expectedFields = ['phone_number', 'first_name', 'last_name'];
        const hasCorrectFields = expectedFields.every(field => 
          errorData.errors.hasOwnProperty(field)
        );
        
        if (hasCorrectFields) {
          console.log("✅ Field names are correct (snake_case), validation errors are expected with test data");
        } else {
          console.log("❌ Field name mismatch - some expected fields missing from errors");
        }
      }
    }
  }
}

testRegistrationFormat().catch(console.error);
