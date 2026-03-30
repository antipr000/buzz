import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Text } from '@/components/ui/text'
import { queryKeys } from '@/lib/query-keys'
import { saveEvent, unsaveEvent } from '@/services/events'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Image, ImageSource } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { Heart } from 'lucide-react-native'
import React, { useEffect, useState } from 'react'
import { Alert, Pressable, View } from 'react-native'

const AVATAR_IMAGES = [
    require('@/assets/images/common/img1.jpg'),
    require('@/assets/images/common/img2.jpg'),
    require('@/assets/images/common/img3.jpg'),
]

export type FeaturedEventCardProps = {
    eventId: string
    isSavedInitially?: boolean
    category: string
    categoryIcon: ImageSource
    calendarIcon: ImageSource
    timeIcon: ImageSource
    locationIcon: ImageSource
    title: string
    description: string
    date: string
    time: string
    location: string
    bg: ImageSource
    eventColor: string
    price: string
    attendees: number
    organizer: string
    organizerLogo: ImageSource
    isFeatured?: boolean
    isPopular?: boolean
}

export default function FeaturedEventCard({
    eventId,
    isSavedInitially = false,
    category,
    categoryIcon,
    calendarIcon,
    timeIcon,
    locationIcon,
    title,
    description,
    date,
    time,
    location,
    bg,
    eventColor,
    price,
    attendees,
    organizer,
    organizerLogo,
    isFeatured = true,
    isPopular = true,
}: FeaturedEventCardProps) {
    const router = useRouter()
    const queryClient = useQueryClient()
    const [saved, setSaved] = useState(isSavedInitially)

    const goToEventDetail = () => {
        router.push(`/event/${eventId}`)
    }

    useEffect(() => {
        setSaved(isSavedInitially)
    }, [isSavedInitially])

    const toggleSaveMutation = useMutation({
        mutationFn: (nextSaved: boolean) =>
            nextSaved ? saveEvent(eventId) : unsaveEvent(eventId),
        onSuccess: (_data, nextSaved) => {
            setSaved(nextSaved)
            queryClient.invalidateQueries({
                queryKey: [...queryKeys.events.all, 'discover'],
            })
            queryClient.invalidateQueries({
                queryKey: [...queryKeys.events.all, 'saved'],
            })
        },
        onError: () => {
            Alert.alert('Could not update', 'Please try again.')
        },
    })

    const onHeartPress = () => {
        if (toggleSaveMutation.isPending) return
        toggleSaveMutation.mutate(!saved)
    }

    return (
        <Card className='mb-5 mx-4 p-0 rounded-lg border border-[rgba(79,70,229,0.3)] overflow-hidden bg-white'>
            {/* ── Image Section ── */}
            <View className='h-[110px] w-full bg-white rounded-t-lg overflow-hidden'>
                <Image
                    source={bg}
                    pointerEvents='none'
                    className='absolute inset-0 size-full'
                    contentFit='cover'
                />
                <LinearGradient
                    colors={[eventColor, '#040047']}
                    locations={[0, 0.4]}
                    pointerEvents='none'
                    className='absolute inset-0 size-full opacity-40'
                />

                {/* Opens event detail; heart sits above with higher zIndex so save does not navigate */}
                <Pressable
                    onPress={goToEventDetail}
                    accessibilityRole='link'
                    accessibilityLabel='Open event details'
                    className='absolute inset-0 z-0'
                />

                {/* Featured Badge */}
                {isFeatured && (
                    <View className='absolute top-2 left-3 z-[1]' pointerEvents='none'>
                        <Badge variant='outline' className='border-0 px-3 py-1.5 bg-secondary '>
                            <Image source={require('@/assets/images/common/shine.svg')} className='size-3' contentFit='contain' />
                            <Text className='text-[10px] font-medium text-primary-foreground'>Featured</Text>
                        </Badge>
                    </View>
                )}

                <Pressable
                    onPress={onHeartPress}
                    hitSlop={12}
                    accessibilityRole='button'
                    accessibilityLabel={saved ? 'Remove from saved' : 'Save event'}
                    className='absolute top-2 right-2 z-[20] p-1'
                >
                    <Heart
                        size={18}
                        color='#ffffff'
                        fill={saved ? '#ffffff' : 'transparent'}
                        strokeWidth={2}
                    />
                </Pressable>

                {/* Bottom row: Avatars + Price */}
                <View
                    className='absolute bottom-3 left-3 right-3 z-[1] flex-row items-center justify-between'
                    pointerEvents='none'
                >
                    {/* Avatar stack */}
                    <View className='flex-row items-center'>
                        {AVATAR_IMAGES.map((src, i) => (
                            <Image
                                key={i}
                                source={src}
                                className={`size-5 rounded-[14px] border-2 border-[rgba(4,0,71,1)] ${i === 0 ? 'ml-0' : '-ml-2.5'}`}
                                contentFit='cover'
                            />
                        ))}
                        <Badge className='border-0 px-3 py-1 bg-secondary ml-1.5'>
                            <Text className='text-primary-foreground text-[10px] font-semibold'>
                                + {attendees.toLocaleString()}
                            </Text>
                        </Badge>
                    </View>

                    {/* Price Badge */}
                    <Badge variant='outline' className='border-0 bg-[rgba(196,240,0,1)] px-3 py-1'>
                        {price === 'Free' ? (
                            <>
                                <Image source={require('@/assets/images/home/free.svg')} className='size-2.5' contentFit='contain' />
                                <Text className='text-[10px] font-bold text-secondary'>Free</Text>
                            </>
                        ) : (
                            <Text className='text-[10px] font-bold text-secondary' >₹ {price}</Text>
                        )}
                    </Badge>
                </View>
            </View>

            {/* ── Content Section ── */}
            <Pressable onPress={goToEventDetail} accessibilityRole='link' accessibilityLabel='Open event details'>
            <View className='px-3.5 pt-2 pb-3'>
                {/* Category + Popular */}
                <View className='flex-row items-center gap-2 mb-2'>
                    <Badge variant='outline' className='border-0 px-2.5 py-1' style={{ backgroundColor: eventColor }}>
                        <Image source={categoryIcon} className='size-[13px]' contentFit='contain' />
                        <Text className='text-primary-foreground text-[10px] font-medium'>{category}</Text>
                    </Badge>
                    {isPopular && (
                        <View className='flex-row items-center gap-1'>
                            <Image source={require('@/assets/images/common/shine2.svg')} className='size-2.5' contentFit='contain' />
                            <Text className='text-primary text-[10px] font-medium'>Popular</Text>
                        </View>
                    )}
                </View>

                {/* Title */}
                <Text className='text-[rgba(15,23,42,1)] text-xs font-semibold mb-1' numberOfLines={1}>{title}</Text>

                {/* Description */}
                <Text className='text-[rgba(15,23,42,0.7)] text-xs leading-5 mb-3' numberOfLines={2}>{description}</Text>

                {/* Date & Time */}
                <View className='flex-row items-center gap-4 mb-1.5'>
                    <View className='flex-row items-center gap-1.5'>
                        <Image source={calendarIcon} className='size-[13px]' contentFit='contain' />
                        <Text className='text-[rgba(15,23,42,1)] font-medium text-[10px]'>{date}</Text>
                    </View>
                    <View className='flex-row items-center gap-1.5'>
                        <Image source={timeIcon} className='size-[13px]' contentFit='contain' />
                        <Text className='text-[rgba(15,23,42,1)] font-medium text-[10px]'>{time}</Text>
                    </View>
                </View>

                {/* Location */}
                <View className='flex-row items-center gap-1.5 mb-3'>
                    <Image source={locationIcon} className='size-[13px]' contentFit='contain' />
                    <Text className='text-[rgba(15,23,42,1)] font-medium text-[10px]'>{location}</Text>
                </View>

                {/* Divider */}
                <View className='h-[1px] bg-[rgba(4,0,71,0.1)] mb-2' />

                {/* Organizer Footer */}
                <View className='flex-row items-center justify-between'>
                    <View className='flex-row items-center gap-2'>
                        <Image source={organizerLogo} className='size-[15px]' contentFit='contain' />
                        <Text className='text-[rgba(15,23,42,1)] text-xs'>
                            by <Text className='text-[rgba(15,23,42,1)] text-xs font-semibold'>{organizer}</Text>
                        </Text>
                    </View>
                    <Badge className='border-0 px-3 py-1.5 bg-secondary'>
                        <Image source={require('@/assets/images/common/people.svg')} className='size-2.5' contentFit='contain' />
                        <Text className='text-primary-foreground text-[10px] font-medium'>{attendees.toLocaleString()}</Text>
                    </Badge>
                </View>
            </View>
            </Pressable>
        </Card>
    )
}
