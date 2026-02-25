import { StyleSheet, View, TouchableOpacity, SafeAreaView as RNSafeAreaView } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Text } from '@/components/ui/text'
import { ChevronLeft } from 'lucide-react-native'
import { router } from 'expo-router'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Image } from 'expo-image'
import BackButton from '@/components/BackButton'

const Notifications = () => {
    const [activeTab, setActiveTab] = useState('events')

    return (
        <SafeAreaView edges={['top']} className='flex-1 bg-white'>
            {/* Header */}
            <View className='flex-row items-center px-5 py-10 pb-4 bg-white border-b border-[rgba(0,0,0,0.05)]'>
                <BackButton />
                <Text className='font-bold text-xs text-secondary-foreground'>Notifications</Text>
            </View>

            <View className='flex-1 bg-background pt-6'>
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
            </View>
        </SafeAreaView>
    )
}

export default Notifications
