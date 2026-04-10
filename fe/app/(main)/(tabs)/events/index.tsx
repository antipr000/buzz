import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Text } from '@/components/ui/text'
import { cn } from '@/lib/utils'
import { useRouter } from 'expo-router'
import { ArrowLeft } from 'lucide-react-native'
import React, { useState } from 'react'
import { TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import EventsCreatedTab from '@/components/events/EventsCreatedTab'
import MyBookingsTab from '@/components/events/MyBookingsTab'

const Events = () => {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState<'created' | 'bookings'>('bookings')

    const header = (
        <View className='flex-row items-center gap-4 bg-secondary px-5 py-10 pb-3'>
            <TouchableOpacity
                onPress={() => router.back()}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
                <ArrowLeft size={24} color='rgba(249, 250, 251, 1)' strokeWidth={2.5} />
            </TouchableOpacity>
            <Text className='text-xl font-semibold text-background'>Your Events</Text>
        </View>
    )

    const tabBar = (
        <View className='bg-[rgba(249,250,251,1)] px-4 pb-4 pt-6'>
            <Tabs
                value={activeTab}
                onValueChange={(v) => setActiveTab(v as 'created' | 'bookings')}
                className='w-full items-center gap-0'
            >
                {/* mr-0 overrides TabsList default `mr-auto` on native (left-align); items-center on Tabs centers this row */}
                <TabsList className='mr-0 h-[28px] w-[85%] max-w-[340px] flex-row rounded-md bg-white p-0.5 shadow-sm shadow-black/5'>
                    <TabsTrigger
                        value='created'
                        className={cn(
                            'h-[24px] flex-1 rounded-md border-0 px-1 py-0 shadow-none',
                            activeTab === 'created' ? 'bg-primary' : 'bg-white'
                        )}
                    >
                        <Text
                            className={cn(
                                'text-center text-[12px] font-medium',
                                activeTab === 'created' ? 'text-white' : 'text-primary'
                            )}
                        >
                            Events Created
                        </Text>
                    </TabsTrigger>
                    <TabsTrigger
                        value='bookings'
                        className={cn(
                            'h-[24px] flex-1 rounded-md border-0 px-1 py-0 shadow-none',
                            activeTab === 'bookings' ? 'bg-primary' : 'bg-white'
                        )}
                    >
                        <Text
                            className={cn(
                                'text-center text-[12px] font-medium',
                                activeTab === 'bookings' ? 'text-white' : 'text-primary'
                            )}
                        >
                            My Bookings
                        </Text>
                    </TabsTrigger>
                </TabsList>
            </Tabs>
        </View>
    )

    return (
        <SafeAreaView className='flex-1 bg-background' edges={['top']}>
            <View className='flex-1'>
                {header}
                {tabBar}
                {activeTab === 'created' ? <EventsCreatedTab /> : <MyBookingsTab />}
            </View>
        </SafeAreaView>
    )
}

export default Events
