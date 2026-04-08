import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  TouchableOpacity,
  View,
} from 'react-native';
import { Image } from 'expo-image';

import {
  formatDisplayDate,
  formatDisplayTime,
} from '@/app/(main)/create-event/payload';
import { Text } from '@/components/ui/text';

type Props = {
  dateValue: Date;
  timeValue: Date;
  onDateChange: (d: Date) => void;
  onTimeChange: (d: Date) => void;
};

export function CreateEventDateTimeRow({
  dateValue,
  timeValue,
  onDateChange,
  onTimeChange,
}: Props) {
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);

  const minimumEventDate = new Date();
  minimumEventDate.setHours(0, 0, 0, 0);

  const onDatePickerChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') {
      setShowDate(false);
      if (event.type === 'set' && selected) onDateChange(selected);
      return;
    }
    if (selected) onDateChange(selected);
  };

  const onTimePickerChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') {
      setShowTime(false);
      if (event.type === 'set' && selected) onTimeChange(selected);
      return;
    }
    if (selected) onTimeChange(selected);
  };

  const dateIosPicker = showDate ? (
    <Modal
      visible
      transparent
      animationType="slide"
      onRequestClose={() => setShowDate(false)}
    >
      <Pressable
        className="flex-1 justify-end bg-black/40"
        onPress={() => setShowDate(false)}
      >
        <Pressable
          className="rounded-t-2xl bg-background pb-6 pt-2"
          onPress={(e) => e.stopPropagation()}
        >
          <DateTimePicker
            value={dateValue}
            mode="date"
            display="spinner"
            minimumDate={minimumEventDate} // Might need to to do perodic checks .
            onChange={onDatePickerChange}
          />
          <Pressable
            onPress={() => setShowDate(false)}
            className="mx-4 mt-2 items-center rounded-xl bg-primary py-3"
          >
            <Text className="text-sm font-semibold text-white">Done</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  ) : null;

  const timeIosPicker = showTime ? (
    <Modal
      visible
      transparent
      animationType="slide"
      onRequestClose={() => setShowTime(false)}
    >
      <Pressable
        className="flex-1 justify-end bg-black/40"
        onPress={() => setShowTime(false)}
      >
        <Pressable
          className="rounded-t-2xl bg-background pb-6 pt-2"
          onPress={(e) => e.stopPropagation()}
        >
          <DateTimePicker
            value={timeValue}
            mode="time"
            display="spinner"
            is24Hour
            onChange={onTimePickerChange}
          />
          <Pressable
            onPress={() => setShowTime(false)}
            className="mx-4 mt-2 items-center rounded-xl bg-primary py-3"
          >
            <Text className="text-sm font-semibold text-white">Done</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  ) : null;

  return (
    <View className="flex-row gap-4">
      <View className="flex-1 gap-1">
        <Text className="font-semibold text-foreground text-sm">Date</Text>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setShowDate(true)}
          className="relative justify-center rounded-md"
        >
          <View className="pointer-events-none absolute left-3 top-0 bottom-0 z-10 justify-center">
            <Image
              source={require('@/assets/images/create/calender.svg')}
              style={{ width: 12, height: 12 }}
              contentFit="contain"
            />
          </View>
          <View className="min-h-10 justify-center rounded-md border-0 bg-[rgba(240,239,255,1)] pl-9 pr-3 py-2">
            <Text className="text-xs text-foreground">
              {formatDisplayDate(dateValue)}
            </Text>
          </View>
        </TouchableOpacity>
        {Platform.OS === 'android' && showDate ? (
          <DateTimePicker
            value={dateValue}
            mode="date"
            display="default"
            minimumDate={minimumEventDate}
            onChange={onDatePickerChange}
          />
        ) : null}
        {Platform.OS === 'ios' ? dateIosPicker : null}
      </View>

      <View className="flex-1 gap-1">
        <Text className="font-semibold text-foreground text-sm">Time</Text>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setShowTime(true)}
          className="relative justify-center rounded-md"
        >
          <View className="pointer-events-none absolute left-3 top-0 bottom-0 z-10 justify-center">
            <Image
              source={require('@/assets/images/create/clock.svg')}
              style={{ width: 12, height: 12 }}
              contentFit="contain"
            />
          </View>
          <View className="min-h-10 justify-center rounded-md border-0 bg-[rgba(240,239,255,1)] pl-9 pr-3 py-2">
            <Text className="text-xs text-foreground">
              {formatDisplayTime(timeValue)}
            </Text>
          </View>
        </TouchableOpacity>
        {Platform.OS === 'android' && showTime ? (
          <DateTimePicker
            value={timeValue}
            mode="time"
            display="default"
            is24Hour
            onChange={onTimePickerChange}
          />
        ) : null}
        {Platform.OS === 'ios' ? timeIosPicker : null}
      </View>
    </View>
  );
}
