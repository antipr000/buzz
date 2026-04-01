import { View } from 'react-native';
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

/**
 * Web: no native date/time picker — read-only display so the screen loads cleanly.
 * Create stays gated by location on web (`LocationField.web`); use iOS/Android to pick date/time.
 */
export function CreateEventDateTimeRow({ dateValue, timeValue }: Props) {
  return (
    <View className="flex-row gap-4">
      <View className="flex-1 gap-1">
        <Text className="font-semibold text-foreground text-sm">Date</Text>
        <View className="relative justify-center">
          <View className="pointer-events-none absolute left-3 top-0 bottom-0 z-10 justify-center">
            <Image
              source={require('@/assets/images/create/calender.svg')}
              style={{ width: 12, height: 12 }}
              contentFit="contain"
            />
          </View>
          <View className="min-h-10 justify-center rounded-md border-0 bg-[rgba(240,239,255,1)] pl-9 pr-3 py-2">
            <Text className="text-xs text-foreground">{formatDisplayDate(dateValue)}</Text>
          </View>
        </View>
      </View>
      <View className="flex-1 gap-1">
        <Text className="font-semibold text-foreground text-sm">Time</Text>
        <View className="relative justify-center">
          <View className="pointer-events-none absolute left-3 top-0 bottom-0 z-10 justify-center">
            <Image
              source={require('@/assets/images/create/clock.svg')}
              style={{ width: 12, height: 12 }}
              contentFit="contain"
            />
          </View>
          <View className="min-h-10 justify-center rounded-md border-0 bg-[rgba(240,239,255,1)] pl-9 pr-3 py-2">
            <Text className="text-xs text-foreground">{formatDisplayTime(timeValue)}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
