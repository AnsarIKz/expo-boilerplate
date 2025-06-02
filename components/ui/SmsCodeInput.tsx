import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import { TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Typography } from "./Typography";

interface SmsCodeInputProps {
  phoneNumber: string;
  onVerify: (code: string) => void;
  onBack: () => void;
  onClose: () => void;
}

export function SmsCodeInput({
  phoneNumber,
  onVerify,
  onBack,
  onClose,
}: SmsCodeInputProps) {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [resendTimer, setResendTimer] = useState(29);
  const [keepSignedIn, setKeepSignedIn] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleCodeChange = (value: string, index: number) => {
    if (value.length > 1) return; // Only allow single digit

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto verify when all fields are filled
    if (newCode.every((digit) => digit !== "")) {
      onVerify(newCode.join(""));
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResendCode = () => {
    if (resendTimer === 0) {
      setResendTimer(29);
      console.log("Resend code");
    }
  };

  return (
    <View className="flex-1 bg-background-primary">
      <SafeAreaView className="flex-1">
        {/* Header */}
        <View className="flex-row items-center px-4 py-3 border-b border-neutral-200">
          {/* Back Button */}
          <TouchableOpacity
            onPress={onBack}
            className="w-8 h-8 items-center justify-center mr-3"
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>

          {/* Title */}
          <View className="flex-1">
            <Typography className="text-black text-lg font-medium">
              Enter Your Code
            </Typography>
          </View>

          {/* Close Button */}
          <TouchableOpacity
            onPress={onClose}
            className="w-8 h-8 items-center justify-center"
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View className="flex-1 px-4 pt-6">
          {/* Description */}
          <View className="mb-8">
            <Typography className="text-neutral-600 text-base leading-relaxed">
              We've sent a 6-digit code to your {phoneNumber}.{"\n"}
              Enter it below to verify your identity
            </Typography>
          </View>

          {/* Code Input Section */}
          <View className="mb-6">
            <Typography className="text-black text-sm font-medium mb-3">
              6-digit code
            </Typography>

            {/* Code Input Fields */}
            <View className="flex-row justify-between mb-4">
              {code.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => {
                    inputRefs.current[index] = ref;
                  }}
                  value={digit}
                  onChangeText={(value) => handleCodeChange(value, index)}
                  onKeyPress={({ nativeEvent }) =>
                    handleKeyPress(nativeEvent.key, index)
                  }
                  keyboardType="numeric"
                  maxLength={1}
                  className="w-12 h-12 border border-neutral-300 rounded-lg text-center text-xl font-medium text-black bg-white"
                  selectTextOnFocus
                  blurOnSubmit={false}
                />
              ))}
            </View>

            {/* Keep me signed in */}
            <TouchableOpacity
              className="flex-row items-center mb-6"
              onPress={() => setKeepSignedIn(!keepSignedIn)}
              activeOpacity={0.7}
            >
              <View
                className={`w-5 h-5 rounded border-2 mr-3 items-center justify-center ${
                  keepSignedIn
                    ? "bg-primary-500 border-primary-500"
                    : "border-neutral-400 bg-white"
                }`}
              >
                {keepSignedIn && (
                  <Ionicons name="checkmark" size={14} color="white" />
                )}
              </View>
              <Typography className="text-black text-sm">
                Keep me signed in
              </Typography>
            </TouchableOpacity>
          </View>

          {/* Resend Code */}
          <View className="items-center mb-8">
            <TouchableOpacity
              onPress={handleResendCode}
              disabled={resendTimer > 0}
              activeOpacity={0.7}
            >
              <Typography
                className={`text-sm ${
                  resendTimer > 0 ? "text-neutral-400" : "text-primary-500"
                }`}
              >
                {resendTimer > 0
                  ? `Resend code in ${resendTimer} sec`
                  : "Resend code"}
              </Typography>
            </TouchableOpacity>
          </View>

          {/* Terms */}
          <View className="items-center px-4 mb-8">
            <Typography className="text-neutral-500 text-xs text-center leading-relaxed">
              By continuing, you agree to our{" "}
              <Typography className="text-primary-500 text-xs underline">
                Terms of Service
              </Typography>{" "}
              &{" "}
              <Typography className="text-primary-500 text-xs underline">
                Privacy Policy
              </Typography>
            </Typography>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
