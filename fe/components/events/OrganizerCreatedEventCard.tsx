import { Card } from '@/components/ui/card'
import { Text } from '@/components/ui/text'
import type { ImageSource } from 'expo-image'
import { Image } from 'expo-image'
import React from 'react'
import { Pressable, View } from 'react-native'

const ICON_PEOPLE = require('@/assets/images/createdEvents/people.svg')
const ICON_CALENDAR = require('@/assets/images/createdEvents/calender.svg')
const ICON_TIME = require('@/assets/images/createdEvents/time.svg')
const ICON_SCAN = require('@/assets/images/createdEvents/scan.svg')

export type OrganizerCreatedEventCardProps = {
    title: string
    dateLabel: string
    timeLabel: string
    attendees: number
    thumbnailSource: ImageSource
    onPressCard: () => void
    onPressVerify?: () => void
}

export default function OrganizerCreatedEventCard({
    title,
    dateLabel,
    timeLabel,
    attendees,
    thumbnailSource,
    onPressCard,
    onPressVerify,
}: OrganizerCreatedEventCardProps) {
    const attendeeLabel =
        attendees === 1 ? '1 attendee' : `${attendees.toLocaleString()} attendees`

    return (
        <Card className='gap-0 overflow-hidden rounded-xl border border-[rgba(0,0,0,0.07)] bg-white p-0 py-0 shadow-sm shadow-black/5'>
            <Pressable
                accessibilityRole='button'
                className='flex-row gap-3 p-4 active:opacity-90'
                onPress={onPressCard}
            >
                {/* Thumbnail */}
                <Image
                    source={thumbnailSource}
                    style={{ width: 60, height: 60, borderRadius: 12 }}
                    contentFit='cover'
                />

                {/* Content column */}
                <View className='min-w-0 flex-1'>

                    {/* Row 1: title (flex-1) + Verify Ticket button (right, top-aligned) */}
                    <View className='flex-row items-start gap-2'>
                        <Text
                            className='flex-1 text-xs font-semibold text-secondary-foreground'
                            numberOfLines={2}
                        >
                            {title}
                        </Text>

                        {/* Verify button — stops propagation so card tap doesn't fire */}
                        <Pressable
                            accessibilityRole='button'
                            accessibilityLabel='Verify ticket'
                            className='shrink-0 mt-1 flex-row items-center gap-1 rounded-sm border border-primary bg-white px-2 py-1.5 active:opacity-80'
                            hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
                            onPress={(e) => {
                                e.stopPropagation?.()
                                ;(onPressVerify ?? (() => {}))()
                            }}
                        >
                            <Image
                                source={ICON_SCAN}
                                style={{ width: 10, height: 10 }}
                                contentFit='contain'
                            />
                            <Text className='text-[11px]  text-[rgba(4,0,71,1)]'>
                                Verify Ticket
                            </Text>
                        </Pressable>
                    </View>

                    {/* Row 2: attendees */}
                    <View className='mt-1.5 flex-row items-center gap-1.5'>
                        <Image
                            source={ICON_PEOPLE}
                            style={{ width: 10, height: 10 }}
                            contentFit='contain'
                        />
                            <Text className='text-[10px] font-medium text-[rgba(15,23,42,1)]'>
                            {attendeeLabel}
                        </Text>
                    </View>

                    {/* Row 3: date + time on one line */}
                    <View className='mt-1 flex-row items-center gap-2'>
                        <View className='flex-row items-center gap-1'>
                            <Image
                                source={ICON_CALENDAR}
                                style={{ width: 10, height: 10 }}
                                contentFit='contain'
                            />
                            <Text className='text-[10px] font-medium text-[rgba(15,23,42,1)]'>
                                {dateLabel}
                            </Text>
                        </View>
                        <View className='flex-row items-center gap-1'>
                            <Image
                                source={ICON_TIME}
                                style={{ width: 10, height: 10 }}
                                contentFit='contain'
                            />
                            <Text className='text-[10px] font-medium text-[rgba(15,23,42,1)]'>
                                {timeLabel}
                            </Text>
                        </View>
                    </View>
                </View>
            </Pressable>
        </Card>
    )
}
