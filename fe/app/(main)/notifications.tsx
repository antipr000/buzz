import { View } from 'react-native'
import React, { useState } from 'react'
import { Text } from '@/components/ui/text'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Image } from 'expo-image'
import PageLayout from '@/components/PageLayout'

const Notifications = () => {
    const [activeTab, setActiveTab] = useState('events')

    return (
        <PageLayout title="Notifications" scrollEnabled={false} scrollClassName="pt-6">
            <View className='px-12'>
                <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
                    <TabsList className='w-full h-11 bg-white rounded-md p-1'>
                        <TabsTrigger
                            value="events"
                            className={`flex-1 h-full rounded-md ${activeTab === 'events' ? 'bg-primary' : 'bg-transparent'}`}
                        >
                            <Text className={`font-semibold text-xs ${activeTab === 'events' ? 'text-white' : 'text-primary'}`}>
                                Events
                            </Text>
                        </TabsTrigger>
                        <TabsTrigger
                            value="offers"
                            className={`flex-1 h-full rounded-md ${activeTab === 'offers' ? 'bg-primary' : 'bg-transparent'}`}
                        >
                            <Text className={`font-semibold text-xs ${activeTab === 'offers' ? 'text-white' : 'text-primary'}`}>
                                Offers & More
                            </Text>
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </View>

            {/* Content moved outside Tabs wrapper to use flex-1 properly */}
            <View className='flex-1 justify-center items-center '>
                {activeTab === 'events' && (
                    <View className='items-center justify-center'>
                        <View className='items-center justify-center p-4 rounded-full bg-white w-32 h-32 mb-6 shadow-sm shadow-black/5'>
                            <Image
                                source={require('@/assets/images/bee.gif')}
                                style={{ width: 90, height: 90 }}
                                contentFit="contain"
                            />
                        </View>
                        <Text className='text-secondary-foreground font-semibold text-base'>No buzz right now</Text>
                    </View>
                )}

                {activeTab === 'offers' && (
                    <View className='items-center justify-center'>
                        <View className='items-center justify-center p-4 rounded-full bg-white w-32 h-32 mb-6 shadow-sm shadow-black/5'>
                            <Image
                                source={require('@/assets/images/bee.gif')}
                                style={{ width: 90, height: 90 }}
                                contentFit="contain"
                            />
                        </View>
                        <Text className='text-secondary-foreground font-semibold text-base'>No buzz right now</Text>
                    </View>
                )}
            </View>
        </PageLayout>
    )
}

export default Notifications
