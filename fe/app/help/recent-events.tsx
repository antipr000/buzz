import { View, TouchableOpacity, ScrollView, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import React from 'react'
import { Text } from '@/components/ui/text'
import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react-native'
import { router } from 'expo-router'
import { Image } from 'expo-image'
import { Separator } from '@/components/ui/separator'
import HelpContact from '@/components/HelpContact'
import BackButton from '@/components/BackButton'

const RecentEvents = () => {
    return (
        <SafeAreaView edges={['top']} className='flex-1 '>
            {/* Header */}
            <View className='flex-row items-center px-5 py-10 pb-4 bg-white border-b border-[rgba(0,0,0,0.05)]'>
                <BackButton size={16} />
                <Text className='font-bold text-xs text-secondary-foreground'>Recent Events</Text>
            </View>

            {/* Content Area */}
            <ScrollView className='flex-1 bg-background' contentContainerStyle={{ padding: 16 }}>

                {/* Event Card */}
                <View className='mb-6'>
                    <View className='p-0 bg-[rgba(244,248,255,1)] border border-[rgba(0,0,0,0.07)] shadow-sm rounded-xl overflow-hidden gap-0'>

                        {/* Top Content: Image & Details */}
                        <View className='p-4 flex-row gap-4'>
                            {/* Event Image */}
                            <Image
                                source={require('@/assets/images/home/bg_music.png')}
                                style={{ width: 100, height: 130, borderRadius: 12 }}
                                contentFit='cover'
                            />

                            {/* Event Details */}
                            <View className='flex-1 shrink'>
                                <View className='flex-row justify-between items-start'>
                                    <View>
                                        <Text className='text-secondary-foreground font-bold text-xs'>Hoop Music Festival</Text>
                                        <Text className='text-[rgba(15,23,42,0.7)] text-[11px] mt-0.5'>English</Text>
                                    </View>
                                    <Text className='text-[rgba(15,23,42,0.7)] font-semibold text-[11px]'>E-Ticket</Text>
                                </View>

                                <View className='mt-9 gap-0.5'>
                                    <Text className='text-secondary-foreground font-semibold text-[11px]'>Mon, 10 aug, 2025 | 09:27 PM</Text>
                                    <Text className='text-[rgba(15,23,42,0.7)] text-[11px]'>Central Park Area, Kolkata</Text>
                                    <Text className='text-secondary-foreground font-medium text-[11px] mt-1'>2 Tickets: PREMIUM - L5, L6, L7</Text>
                                </View>
                            </View>
                        </View>

                        {/* Divider */}
                        <Separator className=' bg-[rgba(0,0,0,0.07)] w-[92%] self-center' />

                        {/* Bottom Content: Status */}
                        <View className='px-4 py-4 flex-row items-center gap-3'>
                            <View className='bg-[rgba(145,145,145,1)] px-2 py-1.5 rounded-lg'>
                                <Text className='text-white font-bold text-[10px] tracking-wider'>ATTENDED</Text>
                            </View>
                            <Separator orientation='vertical' className='w-[1px] h-full bg-[rgba(0,0,0,0.05)]' />
                            <Text className='text-[rgba(15,23,42,0.7)] text-[11px]'>Hope you had an amazing time!</Text>
                        </View>
                    </View>
                </View>

            </ScrollView>

            {/* Bottom Contact Section */}
            <HelpContact />

        </SafeAreaView>
    )
}

export default RecentEvents
