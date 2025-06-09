import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../tokens";
import { Button } from "./Button";
import { Card } from "./Card";
import { Typography } from "./Typography";

interface DateOption {
  date: string; // ISO string
  label: string;
  shortLabel: string;
}

interface DateSelectorProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  availableDates?: string[];
}

export function DateSelector({
  selectedDate,
  onDateChange,
  availableDates,
}: DateSelectorProps) {
  const [showCalendar, setShowCalendar] = useState(false);

  // Generate quick date options
  const getQuickDates = (): DateOption[] => {
    const today = new Date();
    const dates: DateOption[] = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      let label = "";
      let shortLabel = "";

      if (i === 0) {
        label = "Today";
        shortLabel = date.getDate().toString();
      } else if (i === 1) {
        label = "Tomorrow";
        shortLabel = date.getDate().toString();
      } else {
        label = date.toLocaleDateString("en-US", { weekday: "long" });
        shortLabel = date.getDate().toString();
      }

      dates.push({
        date: date.toISOString().split("T")[0],
        label: `${label}\n${date.getDate()} ${date.toLocaleDateString("en-US", {
          month: "short",
        })}`,
        shortLabel,
      });
    }

    return dates;
  };

  const quickDates = getQuickDates();

  const handleCalendarPress = () => {
    setShowCalendar(true);
  };

  const generateCalendarDays = () => {
    const today = new Date();
    const currentDate = new Date(selectedDate || today);
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Get first day of month and how many days in month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before month starts (adjust for Monday start)
    const adjustedStartDay =
      startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;
    for (let i = 0; i < adjustedStartDay; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateString = date.toISOString().split("T")[0];
      const isToday = dateString === today.toISOString().split("T")[0];
      const isSelected = dateString === selectedDate;
      const isPast = date < today && !isToday;

      days.push({
        day,
        date: dateString,
        isToday,
        isSelected,
        isPast,
      });
    }

    return days;
  };

  const renderCalendarModal = () => {
    const currentDate = new Date(selectedDate || new Date());
    const monthName = currentDate.toLocaleDateString("en-US", {
      month: "long",
    });
    const year = currentDate.getFullYear();
    const days = generateCalendarDays();

    return (
      <Modal
        visible={showCalendar}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCalendar(false)}
      >
        <View className="flex-1 bg-background-cream">
          <View className="px-4 py-6 border-b border-border-light">
            <View className="flex-row items-center justify-between">
              <Typography variant="h5" className="text-text-primary">
                Select a date
              </Typography>
              <TouchableOpacity
                onPress={() => setShowCalendar(false)}
                className="w-8 h-8 items-center justify-center"
              >
                <Ionicons name="close" size={24} color={Colors.neutral[600]} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView className="flex-1 px-4">
            <View className="py-6">
              <View className="flex-row items-center justify-between mb-6">
                <TouchableOpacity className="p-2">
                  <Ionicons
                    name="chevron-back"
                    size={20}
                    color={Colors.neutral[600]}
                  />
                </TouchableOpacity>
                <Typography variant="h5" className="text-text-primary">
                  {monthName} {year}
                </Typography>
                <TouchableOpacity className="p-2">
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={Colors.neutral[600]}
                  />
                </TouchableOpacity>
              </View>

              {/* Days of week header */}
              <View className="flex-row mb-4">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                  (day) => (
                    <View key={day} className="flex-1 items-center py-2">
                      <Typography
                        variant="caption"
                        className="text-text-secondary"
                      >
                        {day}
                      </Typography>
                    </View>
                  )
                )}
              </View>

              {/* Calendar grid */}
              <View className="flex-row flex-wrap">
                {days.map((day, index) => (
                  <View key={index} className="w-[14.28%] aspect-square p-1">
                    {day && (
                      <TouchableOpacity
                        onPress={() => {
                          if (!day.isPast) {
                            onDateChange(day.date);
                            setShowCalendar(false);
                          }
                        }}
                        disabled={day.isPast}
                        className={`flex-1 items-center justify-center rounded-lg ${
                          day.isSelected
                            ? "bg-primary-500"
                            : day.isToday
                            ? "bg-primary-100"
                            : "bg-transparent"
                        } ${day.isPast ? "opacity-30" : ""}`}
                      >
                        <Text
                          className={`font-sf-pro font-medium ${
                            day.isSelected
                              ? "text-white"
                              : day.isToday
                              ? "text-primary-700"
                              : "text-text-primary"
                          }`}
                        >
                          {day.day}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>

          <View className="p-4 border-t border-border-light">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onPress={() => setShowCalendar(false)}
            >
              Confirm
            </Button>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View>
      <View className="flex-row items-center justify-between mb-4">
        <Typography variant="body1" className="text-text-primary">
          Select a date
        </Typography>
        <TouchableOpacity
          onPress={handleCalendarPress}
          className="flex-row items-center"
        >
          <Ionicons
            name="calendar-outline"
            size={20}
            color={Colors.primary[500]}
          />
          <View className="w-2 h-2 bg-primary-500 rounded-full ml-2" />
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row gap-3">
          {quickDates.map((dateOption) => {
            const isSelected = dateOption.date === selectedDate;
            return (
              <TouchableOpacity
                key={dateOption.date}
                onPress={() => onDateChange(dateOption.date)}
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
                    variant="caption"
                    className={`text-center ${
                      isSelected ? "text-white" : "text-text-primary"
                    }`}
                  >
                    {dateOption.label}
                  </Typography>
                </Card>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {renderCalendarModal()}
    </View>
  );
}
