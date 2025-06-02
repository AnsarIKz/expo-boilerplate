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
}

export function TimeSlotSelector({
  timeSlots,
  selectedTime,
  onTimeSelect,
  showAllSlots = false,
}: TimeSlotSelectorProps) {
  const [showAll, setShowAll] = useState(showAllSlots);

  // Filter available slots
  const availableSlots = timeSlots.filter((slot) => slot.available);

  // Show first 8 slots unless showAll is true
  const slotsToShow = showAll ? availableSlots : availableSlots.slice(0, 8);

  if (availableSlots.length === 0) {
    return (
      <View>
        <Typography variant="body1" className="text-text-primary mb-4">
          Available time
        </Typography>
        <View className="py-8 items-center">
          <Typography
            variant="body2"
            className="text-text-secondary text-center"
          >
            No available time slots for this date. Please select a different
            date.
          </Typography>
        </View>
      </View>
    );
  }

  return (
    <View>
      <Typography variant="body1" className="text-text-primary mb-4">
        Available time
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
                variant={isSelected ? "elevated" : "outlined"}
                padding="sm"
                className={`min-w-[80px] ${
                  isSelected ? "bg-primary-100 border-primary-300" : ""
                }`}
              >
                <Typography
                  variant="body2"
                  className={`text-center ${
                    isSelected ? "text-primary-700" : "text-text-primary"
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
            Show all slots
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
            Show less
          </Typography>
        </TouchableOpacity>
      )}
    </View>
  );
}
