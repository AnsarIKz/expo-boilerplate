import React, { useState } from "react";
import { StyleSheet, Alert } from "react-native";
import {
  View,
  Text,
  Button,
  TextField,
  Colors,
  Typography,
  Spacings,
} from "react-native-ui-lib";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

const AUTH_API_BASE = "http://localhost:3000/auth"; // Change to your backend URL

export default function AuthScreen() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCountryCode, setSelectedCountryCode] = useState("+77");

  const handleRequestCode = async () => {
    if (!phoneNumber) {
      Alert.alert("Ошибка", "Введите номер телефона");
      return;
    }

    const fullPhoneNumber = selectedCountryCode + phoneNumber;
    setIsLoading(true);

    try {
      const response = await fetch(`${AUTH_API_BASE}/phone/request-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber: fullPhoneNumber,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsCodeSent(true);
        Alert.alert("Успешно", "Код отправлен на ваш номер");
      } else {
        Alert.alert("Ошибка", data.message || "Не удалось отправить код");
      }
    } catch (error) {
      Alert.alert("Ошибка", "Проблемы с подключением к серверу");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode) {
      Alert.alert("Ошибка", "Введите код подтверждения");
      return;
    }

    const fullPhoneNumber = selectedCountryCode + phoneNumber;
    setIsLoading(true);

    try {
      const response = await fetch(`${AUTH_API_BASE}/phone/verify-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber: fullPhoneNumber,
          code: verificationCode,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store tokens (you might want to use a more secure storage solution)
        // For now, just navigate to main app
        Alert.alert("Успешно", "Вы вошли в систему");
        router.replace("/(tabs)");
      } else {
        Alert.alert("Ошибка", data.message || "Неверный код");
      }
    } catch (error) {
      Alert.alert("Ошибка", "Проблемы с подключением к серверу");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Авторизация</Text>
        </View>

        {!isCodeSent ? (
          <View style={styles.form}>
            <Text style={styles.label}>Введите номер телефона</Text>

            <View style={styles.phoneInputContainer}>
              <View style={styles.countryCodeContainer}>
                <View style={styles.flag}>
                  <Text style={styles.flagText}>🇰🇿</Text>
                </View>
                <Text style={styles.countryCode}>{selectedCountryCode}</Text>
              </View>

              <TextField
                style={styles.phoneInput}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="00 101 61 10"
                keyboardType="phone-pad"
                maxLength={11}
                fieldStyle={styles.textFieldStyle}
              />
            </View>
          </View>
        ) : (
          <View style={styles.form}>
            <Text style={styles.label}>Введите код из SMS</Text>
            <Text style={styles.sublabel}>
              Код отправлен на номер {selectedCountryCode}
              {phoneNumber}
            </Text>

            <TextField
              style={styles.codeInput}
              value={verificationCode}
              onChangeText={setVerificationCode}
              placeholder="123456"
              keyboardType="number-pad"
              maxLength={6}
              fieldStyle={styles.textFieldStyle}
            />
          </View>
        )}

        <View style={styles.bottom}>
          <Button
            style={styles.loginButton}
            onPress={!isCodeSent ? handleRequestCode : handleVerifyCode}
            disabled={isLoading}
            backgroundColor={Colors.brown30}
          >
            <Text style={styles.loginButtonText}>
              {isLoading
                ? "Загрузка..."
                : !isCodeSent
                  ? "Войти"
                  : "Подтвердить"}
            </Text>
          </Button>

          <Text style={styles.termsText}>
            Продолжая, вы соглашаетесь с{" "}
            <Text style={styles.termsLink}>правилами пользования</Text> и{" "}
            <Text style={styles.termsLink}>политикой приватности</Text>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F3F0",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#2C2C2C",
  },
  form: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    color: "#666666",
    marginBottom: 16,
  },
  sublabel: {
    fontSize: 14,
    color: "#999999",
    marginBottom: 20,
  },
  phoneInputContainer: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 12,
    paddingLeft: 16,
    alignItems: "center",
    marginBottom: 20,
  },
  countryCodeContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 12,
    borderRightWidth: 1,
    borderRightColor: "#E5E5E5",
  },
  flag: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FFD700",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  flagText: {
    fontSize: 16,
  },
  countryCode: {
    fontSize: 16,
    color: "#2C2C2C",
    fontWeight: "500",
  },
  phoneInput: {
    flex: 1,
    paddingLeft: 12,
  },
  codeInput: {
    backgroundColor: "white",
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  textFieldStyle: {
    fontSize: 16,
    paddingVertical: 16,
  },
  bottom: {
    justifyContent: "flex-end",
    paddingBottom: 40,
  },
  loginButton: {
    backgroundColor: "#B8860B",
    borderRadius: 12,
    paddingVertical: 18,
    marginBottom: 20,
  },
  loginButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  termsText: {
    fontSize: 12,
    color: "#999999",
    textAlign: "center",
    lineHeight: 18,
  },
  termsLink: {
    textDecorationLine: "underline",
  },
});
