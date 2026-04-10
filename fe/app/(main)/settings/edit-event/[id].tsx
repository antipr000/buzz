import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Text } from '@/components/ui/text'
import { useEventDetail, usePatchEvent } from '@/hooks/api'
import { uploadEventCover } from '@/services/events'
import type { PatchEventBody } from '@/services/types/events'
import { Image } from 'expo-image'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { ArrowLeft, ImageIcon } from 'lucide-react-native'
import React, { useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

function parseEventDateStart(isoDate: string): Date {
  const s = isoDate.trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const [y, m, d] = s.split('-').map(Number)
    return new Date(y, m - 1, d)
  }
  return new Date(s.includes('T') ? s : `${s}T12:00:00`)
}

function isEventOnOrBeforeToday(isoDate: string): boolean {
  const d = parseEventDateStart(isoDate)
  if (Number.isNaN(d.getTime())) return false
  const today = new Date()  // Date on device
  today.setHours(0, 0, 0, 0)
  d.setHours(0, 0, 0, 0)
  return d.getTime() <= today.getTime()
}

const SAVE_FAILED_MESSAGE =
  'We could not save your changes. Check your connection and try again.'

export default function EditCreatedEventScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { id: rawId } = useLocalSearchParams<{ id: string | string[] }>()
  const eventId =
    (typeof rawId === 'string' ? rawId : rawId?.[0])?.trim() || undefined

  const { data, isPending, isError, refetch } = useEventDetail(eventId)
  const patchMutation = usePatchEvent()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [coverAsset, setCoverAsset] = useState<{
    uri: string
    mimeType?: string | null
  } | null>(null)
  const [isUploadingCover, setIsUploadingCover] = useState(false)

  useEffect(() => {
    if (!data) return
    setTitle(data.title)
    setDescription(data.description)
    setCoverAsset(null)
  }, [data?.id])

  const notOrganizer = data != null && !data.is_organizer
  const pastOrToday = data != null && isEventOnOrBeforeToday(data.date)
  const locked = notOrganizer || pastOrToday

  const hasChanges = useMemo(() => {
    if (!data) return false
    if (coverAsset !== null) return true
    return (
      title.trim() !== data.title.trim() ||
      description.trim() !== data.description.trim()
    )
  }, [data, title, description, coverAsset])

  const canSave =
    Boolean(eventId) &&
    !locked &&
    hasChanges &&
    title.trim().length > 0 &&
    description.trim().length > 0

  const isBusy = patchMutation.isPending || isUploadingCover

  const pickImage = async () => {
    if (locked) return
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (!permissionResult.granted) {
        Alert.alert(
          'Photos',
          'Allow photo library access to change the cover image.'
        )
        return
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        quality: 1,
      })
      if (!result.canceled && result.assets[0]) {
        const a = result.assets[0]
        setCoverAsset({ uri: a.uri, mimeType: a.mimeType })
      }
    } catch {
      Alert.alert('Could not open photos', 'Please try again.')
    }
  }

  const onSave = async () => {
    if (!eventId || !data || !canSave || isBusy) return

    const body: PatchEventBody = {}
    if (title.trim() !== data.title.trim()) body.title = title.trim()
    if (description.trim() !== data.description.trim()) {
      body.description = description.trim()
    }

    try {
      if (coverAsset) {
        setIsUploadingCover(true)
        try {
          const { public_url } = await uploadEventCover(
            coverAsset.uri,
            coverAsset.mimeType ?? null
          )
          body.event_cover = public_url
        } finally {
          setIsUploadingCover(false)
        }
      }

      await patchMutation.mutateAsync({ eventId, body })
      router.back()
    } catch {
      Alert.alert('Could not save', SAVE_FAILED_MESSAGE)
    }
  }

  const coverSource = coverAsset
    ? { uri: coverAsset.uri }
    : data?.event_cover?.trim()
      ? { uri: data.event_cover.trim() }
      : null

  const listHeader = (
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
  )

  if (!eventId) {
    return (
      <View className="flex-1 bg-surface">
        {listHeader}
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-primary text-sm text-center">Missing event.</Text>
        </View>
      </View>
    )
  }

  if (isPending) {
    return (
      <View className="flex-1 bg-surface">
        {listHeader}
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator className="text-primary" />
        </View>
      </View>
    )
  }

  if (isError || !data) {
    return (
      <View className="flex-1 bg-surface">
        {listHeader}
        <View className="flex-1 items-center justify-center px-8 gap-4">
          <Text className="text-primary text-sm text-center">
            Could not load this event.
          </Text>
          <TouchableOpacity onPress={() => refetch()}>
            <Text className="text-[#FF8A00] text-sm font-medium">Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-surface">
      {listHeader}

      <ScrollView
        contentContainerClassName="p-5 gap-5"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        automaticallyAdjustKeyboardInsets
        keyboardShouldPersistTaps="handled"
      >
        {notOrganizer ? (
          <Text className="text-destructive text-sm">
            You can only edit events you organize.
          </Text>
        ) : null}

        <View className="gap-1">
          <Text className="font-medium text-foreground text-xs">Event cover</Text>
          <TouchableOpacity
            onPress={pickImage}
            activeOpacity={locked ? 1 : 0.8}
            disabled={locked}
            className="h-48 w-full rounded-2xl border-2 border-dashed border-primary/20 bg-[rgba(240,239,255,1)] items-center justify-center overflow-hidden"
          >
            {coverSource ? (
              <Image
                source={coverSource}
                style={{ width: '100%', height: '100%', borderRadius: 16 }}
                contentFit="cover"
              />
            ) : (
              <View className="items-center gap-2">
                <ImageIcon size={18} color="rgba(79, 70, 229, 0.5)" />
                <Text className="text-[rgba(15,23,42,0.7)] text-xs">
                  Tap to add a cover image
                </Text>
              </View>
            )}
          </TouchableOpacity>
          {/* {!locked ? (
            <Text className="text-[rgba(15,23,42,0.55)] text-[10px]">
              Leave unchanged or pick a new image. Current cover stays if you do
              not replace it.
            </Text>
          ) : null} */}
        </View>

        <View className="gap-1">
          <Text className="font-medium text-foreground text-xs">Event title</Text>
          <Input
            placeholder="Event title"
            editable={!locked}
            className="border-0 h-[30px]  placeholder:text-xs bg-[rgba(240,239,255,1)] text-xs"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View className="gap-1">
          <Text className="font-medium text-foreground text-xs">Description</Text>
          <Textarea
            placeholder="Describe your event"
            editable={!locked}
            className="min-h-[80px] text-xs border-0 bg-[rgba(240,239,255,1)] text-xs"
            value={description}
            onChangeText={setDescription}
          />
        </View>

        <View className="items-center pt-2">
          <Button
            className="bg-primary px-10 rounded-xl"
            disabled={!canSave || isBusy}
            onPress={() => void onSave()}
          >
            <Text className="text-white text-sm font-bold">
              {isUploadingCover
                ? 'Uploading…'
                : patchMutation.isPending
                  ? 'Saving…'
                  : 'Save changes'}
            </Text>
          </Button>
        </View>

        {pastOrToday ? (
          <Text className=" text-destructive text-xs text-center mt-2 px-1">
            *This event is scheduled for today or an earlier day and can no longer
            be edited.
          </Text>
        ) : null}
      </ScrollView>
    </View>
  )
}
