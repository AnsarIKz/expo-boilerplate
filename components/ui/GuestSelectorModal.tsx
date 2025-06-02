import { Ionicons } from "@expo/vector-icons";
import { Modal, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../tokens";
import { Button } from "./Button";
import { GuestSelector } from "./GuestSelector";
import { Typography } from "./Typography";

interface GuestSelectorModalProps {
  visible: boolean;
  onClose: () => void;
  value: number;
  onChange: (value: number) => void;
  onConfirm: () => void;
  restaurantName: string;
}

export function GuestSelectorModal({
  visible,
  onClose,
  value,
  onChange,
  onConfirm,
  restaurantName,
}: GuestSelectorModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 bg-background-primary">
        {/* Header */}
        <View className="px-4 py-4 border-b border-border-light">
          <View className="flex-row items-center justify-between">
            <View className="w-10" />
            <Typography variant="h6" className="text-text-primary">
              Number of guests
            </Typography>
            <TouchableOpacity
              onPress={onClose}
              className="w-10 h-10 items-center justify-center"
            >
              <Ionicons name="close" size={24} color={Colors.neutral[600]} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        <View className="flex-1 px-4 py-6">
          <Typography
            variant="h4"
            className="text-text-primary text-center mb-8"
          >
            {restaurantName}
          </Typography>

          <View className="mb-8">
            <GuestSelector value={value} onChange={onChange} min={1} max={10} />
          </View>
        </View>

        {/* Footer */}
        <View className="px-4 pb-6 border-t border-border-light pt-4">
          <SafeAreaView edges={["bottom"]}>
            <Button variant="primary" size="lg" fullWidth onPress={onConfirm}>
              Continue
            </Button>
          </SafeAreaView>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
