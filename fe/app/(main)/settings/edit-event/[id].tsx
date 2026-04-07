import { Text } from '@/components/ui/text'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { ArrowLeft } from 'lucide-react-native'
import React from 'react'
import { TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

/** Placeholder until full edit form (Phase 4). */
export default function EditCreatedEventScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { id } = useLocalSearchParams<{ id: string }>()
  const eventId = typeof id === 'string' ? id : id?.[0] ?? ''

  return (
    <View className="flex-1 bg-surface">
      <View
        className="pb-4 px-5 bg-secondary flex-row items-center gap-4"
        style={{ paddingTop: Math.max(insets.top, 40) }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          className="p-1"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowLeft size={24} color="rgba(249, 250, 251, 1)" strokeWidth={2.5} />
        </TouchableOpacity>
        <Text className="text-xl font-semibold text-[#F97316]">Edit event</Text>
      </View>
      <View className="flex-1 items-center justify-center px-8">
        <Text className="text-primary text-sm text-center">
          Editing is not wired yet. Event id: {eventId || '—'}
        </Text>
      </View>
    </View>
  )
}
