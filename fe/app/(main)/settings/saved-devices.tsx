import { View, TouchableOpacity } from 'react-native'
import React from 'react'
import { Text } from '@/components/ui/text'
import PageLayout from '@/components/layout/PageLayout'

const SavedDevices = () => {
    return (
        <PageLayout title="Saved Devices" contentContainerStyle={{ padding: 20 }}>
            <Text className='font-semibold text-xs text-secondary-foreground mb-4'>1/2 Saved Devices</Text>

            <View className='bg-white rounded-md p-5 shadow-sm border border-[rgba(0,0,0,0.03)]'>

                {/* Device 1 */}
                <View className='flex-row justify-between mb-6'>
                    <View className='flex-1 pr-4'>
                        <View className='flex-row items-center gap-2 mb-2'>
                            <Text className='font-medium text-xs text-secondary-foreground'>iPhone</Text>
                            <View className='bg-[rgba(220,255,198,1)] px-2 py-0.5 rounded-md'>
                                <Text className='text-[rgba(19,158,1,1)] text-[10px] font-medium'>Current device</Text>
                            </View>
                        </View>
                        <Text className='text-[rgba(15,23,42,0.5)] text-[11px] mb-0.5 '>BMS App 7.0.2 192.0.0.2</Text>
                        <Text className='text-[rgba(15,23,42,0.5)] text-[11px] '>Last used: 21st Dec 2025, 17:51</Text>
                    </View>
                    <TouchableOpacity activeOpacity={0.7} className='pt-1'>
                        <Text className='text-[rgba(255,43,23,1)] text-[11px] '>Remove</Text>
                    </TouchableOpacity>
                </View>

                {/* Device 2 */}
                <View className='flex-row justify-between'>
                    <View className='flex-1 pr-4'>
                        <View className='flex-row items-center gap-2 mb-2'>
                            <Text className='font-medium text-xs text-secondary-foreground'>Android</Text>
                        </View>
                        <Text className='text-[rgba(15,23,42,0.5)] text-[11px] mb-0.5 '>BMS App 7.0.2 192.0.0.2</Text>
                        <Text className='text-[rgba(15,23,42,0.5)] text-[11px] '>Last used: 21st Dec 2025, 17:51</Text>
                    </View>
                    <TouchableOpacity activeOpacity={0.7} className='pt-1'>
                        <Text className='text-[rgba(255,43,23,1)] text-[11px] '>Remove</Text>
                    </TouchableOpacity>
                </View>

            </View>

        </PageLayout>
    )
}

export default SavedDevices;
