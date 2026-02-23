import { View, ScrollView, TouchableOpacity } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Text } from '@/components/ui/text'
import { Image } from 'expo-image'
import { ArrowLeft } from 'lucide-react-native'
import { useRouter } from 'expo-router'

const Ticket = () => {
    const router = useRouter()

    return (
        <SafeAreaView className='flex-1 bg-background' edges={['top']}>
            <View className='flex-1'>
                {/* Header */}
                <View className='px-5 py-10 pb-3 bg-secondary flex-row items-center gap-4'>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <ArrowLeft size={24} color='rgba(249, 250, 251, 1)' strokeWidth={2.5} />
                    </TouchableOpacity>
                    <Text className='text-background text-xl font-semibold'>
                        Your Events
                    </Text>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16 }}>

                    {/* Success Banner */}
                    <View className='bg-[rgba(9,183,9,0.05)] border border-[rgba(9,183,9,0.05)] flex-row items-center gap-2 p-3 rounded-md mb-6'>
                        <Image source={require('@/assets/images/tick.svg')} style={{ width: 12, height: 12 }} contentFit='contain' />
                        <Text className='text-[#22C55E] font-bold text-xs'>Thank you for trusting us!</Text>
                    </View>

                    {/* Ticket Card */}
                    <View className=' bg-white w-full max-w-[400px] self-center'>

                        {/* Top: QR */}
                        <View className='items-center pt-8 pb-6 px-4'>
                            <Image
                                source={require('@/assets/images/qr.svg')}
                                style={{ width: 90, height: 90 }}
                                contentFit='contain'
                            />
                            <Text className='text-[rgba(15,23,42,0.6)] font-medium text-xs tracking-wider mt-5'>
                                BOOKING ID
                            </Text>
                            <Text className='text-secondary-foreground font-semibold text-xs mt-1'>
                                DR2SPODC
                            </Text>
                        </View>

                        {/* Dashed Divider relative to ticket edges */}
                        <View className='flex-row items-center w-full px-2 overflow-hidden'>
                            <View className='w-full h-[1px] border-b border-dashed border-[rgba(0,0,0,0.2)]' />
                        </View>

                        {/* Bottom: Event Details */}
                        <View className='p-6 pt-5 gap-1'>
                            <Text className='text-secondary-foreground font-semibold text-sm mb-0'>
                                Hoop Music Festival
                            </Text>
                            <Text className='text-[rgba(15,23,42,0.7)] text-[11px] mb-2 font-medium'>
                                English
                            </Text>

                            <Text className='text-secondary-foreground font-semibold text-[11px] mt-1'>
                                Mon, 10 aug, 2025 | 09:27 PM
                            </Text>
                            <Text className='text-[rgba(15,23,42,0.7)] text-[11px] mb-2 font-medium'>
                                Central Park Area, Kolkata
                            </Text>
                            <Text className='text-secondary-foreground font-medium text-[11px]'>
                                2 Tickets: PREMIUM - L5, L6, L7
                            </Text>
                        </View>

                    </View>

                </ScrollView>
            </View>
        </SafeAreaView>
    )
}

export default Ticket
