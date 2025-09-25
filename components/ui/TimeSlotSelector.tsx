import { useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { TimeSlot } from "../../types/booking";
import { Card } from "./Card";
import { Typography } from "./Typography";

interface TimeSlotSelectorProps {
  timeSlots: TimeSlot[];
  selectedTime?: string;
  onTimeSelect: (time: string) => void;
  showAllSlots?: boolean;
  restaurantInfo?: {
    dayOfWeek: string;
    openingTime: string;
    closingTime: string;
  };
}

export function TimeSlotSelector({
  timeSlots,
  selectedTime,
  onTimeSelect,
  showAllSlots = false,
  restaurantInfo,
}: TimeSlotSelectorProps) {
  const [showAll, setShowAll] = useState(showAllSlots);

  // Filter available slots
  const availableSlots = timeSlots.filter((slot) => slot.available);

  // Show first 8 slots unless showAll is true
  const slotsToShow = showAll ? availableSlots : availableSlots.slice(0, 8);

  if (availableSlots.length === 0) {
    const isRestaurantClosed =
      restaurantInfo &&
      (!restaurantInfo.openingTime ||
        !restaurantInfo.closingTime ||
        restaurantInfo.openingTime === restaurantInfo.closingTime);

    return (
      <View>
        <Typography variant="body1" className="text-text-primary mb-4">
          Доступное время
        </Typography>
        <View className="py-8 items-center">
          {isRestaurantClosed ? (
            <View className="items-center">
              <Typography
                variant="body2"
                className="text-text-secondary text-center mb-2"
              >
                Ресторан закрыт в этот день
              </Typography>
              <Typography
                variant="body2"
                className="text-text-muted text-center text-sm"
              >
                Попробуйте выбрать другую дату
              </Typography>
            </View>
          ) : (
            <View className="items-center">
              <Typography
                variant="body2"
                className="text-text-secondary text-center mb-2"
              >
                Все слоты заняты на эту дату
              </Typography>
              {restaurantInfo && (
                <Typography
                  variant="body2"
                  className="text-text-muted text-center text-sm"
                >
                  Рабочие часы: {restaurantInfo.openingTime} -{" "}
                  {restaurantInfo.closingTime}
                </Typography>
              )}
              <Typography
                variant="body2"
                className="text-text-muted text-center text-sm mt-1"
              >
                Попробуйте выбрать другую дату
              </Typography>
            </View>
          )}
        </View>
      </View>
    );
  }

  return (
    <View>
      <Typography variant="body1" className="text-text-primary mb-4">
        Доступное время
      </Typography>

      <View className="flex-row flex-wrap gap-3">
        {slotsToShow.map((slot) => {
          const isSelected = slot.time === selectedTime;
          return (
            <TouchableOpacity
              key={slot.time}
              onPress={() => onTimeSelect(slot.time)}
              activeOpacity={0.7}
            >
              <Card
                variant="outlined"
                padding="sm"
                className={`min-w-[80px] border ${
                  isSelected
                    ? "bg-primary-500 border-primary-500"
                    : "bg-background-cream border-neutral-300"
                }`}
              >
                <Typography
                  variant="body2"
                  className={`text-center ${
                    isSelected ? "text-white" : "text-text-primary"
                  }`}
                >
                  {slot.time}
                </Typography>
              </Card>
            </TouchableOpacity>
          );
        })}
      </View>

      {!showAll && availableSlots.length > 8 && (
        <TouchableOpacity
          onPress={() => setShowAll(true)}
          className="mt-4"
          activeOpacity={0.7}
        >
          <Typography variant="body2" className="text-primary-500 text-right">
            Показать все слоты
          </Typography>
        </TouchableOpacity>
      )}

      {showAll && availableSlots.length > 8 && (
        <TouchableOpacity
          onPress={() => setShowAll(false)}
          className="mt-4"
          activeOpacity={0.7}
        >
          <Typography variant="body2" className="text-primary-500 text-right">
            Показать меньше
          </Typography>
        </TouchableOpacity>
      )}
    </View>
  );
}
