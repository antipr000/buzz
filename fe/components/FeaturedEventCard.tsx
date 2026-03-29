import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Text } from '@/components/ui/text'
import { Image, ImageSource } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import React from 'react'
import { View } from 'react-native'

const AVATAR_IMAGES = [
    require('@/assets/images/common/img1.jpg'),
    require('@/assets/images/common/img2.jpg'),
    require('@/assets/images/common/img3.jpg'),
]

export type FeaturedEventCardProps = {
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
    return (
        <Card className='mx-4 mb-5 p-0 rounded-lg border border-[rgba(79,70,229,0.3)] overflow-hidden bg-white'>
            {/* ── Image Section ── */}
            <View className='h-[110px] w-full bg-white rounded-t-lg overflow-hidden'>
                <Image source={bg} style={{ width: '100%', height: '100%', position: 'absolute' }} contentFit='cover' />
                <LinearGradient
                    colors={[eventColor, '#040047']}
                    locations={[0, 0.4]}
                    style={{ width: '100%', height: '100%', position: 'absolute', opacity: 0.4 }}
                />

                {/* Featured Badge */}
                {isFeatured && (
                    <View className='absolute top-2 left-3'>
                        <Badge variant='outline' className='border-0 px-3 py-1.5 bg-secondary '>
                            <Image source={require('@/assets/images/common/shine.svg')} style={{ width: 12, height: 12 }} contentFit='contain' />
                            <Text className='text-[10px] font-medium text-primary-foreground'>Featured</Text>
                        </Badge>
                    </View>
                )}

                {/* Heart Icon */}
                <View className='absolute top-3 right-3 '>
                    <Image source={require('@/assets/images/common/heart.svg')} style={{ width: 18, height: 18 }} contentFit='contain' />
                </View>

                {/* Bottom row: Avatars + Price */}
                <View className='absolute bottom-3 left-3 right-3 flex-row items-center justify-between'>
                    {/* Avatar stack */}
                    <View className='flex-row items-center'>
                        {AVATAR_IMAGES.map((src, i) => (
                            <Image
                                key={i}
                                source={src}
                                style={{
                                    width: 20,
                                    height: 20,
                                    borderRadius: 14,
                                    borderWidth: 2,
                                    borderColor: 'rgba(4, 0, 71, 1)',
                                    marginLeft: i === 0 ? 0 : -10,
                                }}
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
                    <Badge variant='outline' className='border-0 px-3 py-1' style={{ backgroundColor: 'rgba(196,240,0,1)' }}>
                        {price === 'Free' ? (
                            <>
                                <Image source={require('@/assets/images/home/free.svg')} style={{ width: 10, height: 10 }} contentFit='contain' />
                                <Text className='text-[10px] font-bold text-secondary'>Free</Text>
                            </>
                        ) : (
                            <Text className='text-[10px] font-bold text-secondary' >₹ {price}</Text>
                        )}
                    </Badge>
                </View>
            </View>

            {/* ── Content Section ── */}
            <View className='px-3 py-2 pt-0'>
                {/* Category + Popular */}
                <View className='flex-row items-center gap-2 mb-2'>
                    <Badge variant='outline' className='border-0 px-2.5 py-1' style={{ backgroundColor: eventColor }}>
                        <Image source={categoryIcon} style={{ width: 13, height: 13 }} contentFit='contain' />
                        <Text className='text-primary-foreground text-[10px] font-medium'>{category}</Text>
                    </Badge>
                    {isPopular && (
                        <View className='flex-row items-center gap-1'>
                            <Image source={require('@/assets/images/common/shine2.svg')} style={{ width: 10, height: 10 }} contentFit='contain' />
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
                        <Image source={calendarIcon} style={{ width: 13, height: 13 }} contentFit='contain' />
                        <Text className='text-[rgba(15,23,42,1)] font-medium text-[10px]'>{date}</Text>
                    </View>
                    <View className='flex-row items-center gap-1.5'>
                        <Image source={timeIcon} style={{ width: 13, height: 13 }} contentFit='contain' />
                        <Text className='text-[rgba(15,23,42,1)] font-medium text-[10px]'>{time}</Text>
                    </View>
                </View>

                {/* Location */}
                <View className='flex-row items-center gap-1.5 mb-3'>
                    <Image source={locationIcon} style={{ width: 13, height: 13 }} contentFit='contain' />
                    <Text className='text-[rgba(15,23,42,1)] font-medium text-[10px]'>{location}</Text>
                </View>

                {/* Divider */}
                <View className='h-[1px] bg-[rgba(4,0,71,0.1)] mb-2' />

                {/* Organizer Footer */}
                <View className='flex-row items-center justify-between'>
                    <View className='flex-row items-center gap-2'>
                        <Image source={organizerLogo} style={{ width: 15, height: 15 }} contentFit='contain' />
                        <Text className='text-[rgba(15,23,42,1)] text-xs'>
                            by <Text className='text-[rgba(15,23,42,1)] text-xs font-semibold'>{organizer}</Text>
                        </Text>
                    </View>
                    <Badge className='border-0 px-3 py-1.5 bg-secondary'>
                        <Image source={require('@/assets/images/common/people.svg')} style={{ width: 10, height: 10 }} contentFit='contain' />
                        <Text className='text-primary-foreground text-[10px] font-medium'>{attendees.toLocaleString()}</Text>
                    </Badge>
                </View>
            </View>
        </Card>
    )
}
