import { StyleSheet, View, TouchableOpacity, ScrollView } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Text } from '@/components/ui/text'
import { Image } from 'expo-image'
import { Card } from '@/components/ui/card'
import { ChevronLeft } from 'lucide-react-native'
import { router, Link } from 'expo-router'

const HelpCentre = () => {
    return (
        <SafeAreaView edges={['top']} className='flex-1 bg-background'>
            {/* Header */}
            <View className='flex-row items-center justify-between px-5 py-6 pb-4 bg-white'>
                <View className='flex-row items-center gap-4'>
                    <TouchableOpacity onPress={() => router.back()}>
                        <ChevronLeft size={15} color="rgba(29, 27, 32, 1)" />
                    </TouchableOpacity>
                    <Text className='font-semibold text-xs text-secondary'>Help Centre</Text>
                </View>
                <TouchableOpacity>
                    <Image
                        source={require('@/assets/images/help/search.svg')}
                        style={{ width: 15, height: 15 }}
                        contentFit='contain'
                    />
                </TouchableOpacity>
            </View>

            <ScrollView className='flex-1' contentContainerStyle={{ padding: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

                {/* Section 1: How can I assist you? */}
                <Text className='text-secondary font-semibold text-sm mb-4'>How can I assist you?</Text>

                <Link href="/help/find-event" asChild>
                    <TouchableOpacity activeOpacity={0.8} className='mb-3'>
                        <Card className='flex-row items-center justify-between p-4 bg-white rounded-md shadow-sm border border-[rgba(0,0,0,0.05)]'>
                            <Text className='text-secondary font-medium text-xs'>Find Your Event Details</Text>
                            <Image source={require('@/assets/images/help/event.gif')} style={{ width: 20, height: 20 }} />
                        </Card>
                    </TouchableOpacity>
                </Link>
                <Link href="/help/recent-events" asChild>
                <TouchableOpacity activeOpacity={0.8} className='mb-5'>
                    <Card className='flex-row items-center justify-between p-4 bg-white rounded-md shadow-sm border border-[rgba(0,0,0,0.05)]'>
                        <Text className='text-secondary font-medium text-xs'>Need help with your recent bookings ?</Text>
                        <Image source={require('@/assets/images/help/calender.gif')} style={{ width: 20, height: 20 }} />
                    </Card>
                </TouchableOpacity>
                </Link>

                {/* Section 2: Top help topics */}
                <Text className='text-[rgba(15,23,42,0.7)] text-xs font-medium mb-6'>Top help topics</Text>

                <View className='flex-row flex-wrap justify-between gap-y-4 mb-8'>
                    <TouchableOpacity activeOpacity={0.8} className='w-[48%]'>
                        <Card className='p-4 bg-white rounded-xl shadow-sm border-0 items-center justify-between h-[120px] gap-0 '>
                            <Text className='text-secondary font-bold text-xs text-center'>Payment & Refund</Text>
                            <Image source={require('@/assets/images/help/payment.gif')} style={{ width: 45, height: 45 }} />
                        </Card>
                    </TouchableOpacity>

                    <TouchableOpacity activeOpacity={0.8} className='w-[48%]'>
                        <Card className='p-4 bg-white rounded-xl shadow-sm border-0 items-center justify-between h-[120px] gap-0 '>
                            <Text className='text-secondary font-bold text-xs text-center'>Cancellation & Exchange</Text>
                            <Image source={require('@/assets/images/help/cancel.gif')} style={{ width: 45, height: 45 }} />
                        </Card>
                    </TouchableOpacity>

                    <TouchableOpacity activeOpacity={0.8} className='w-[48%]'>
                        <Card className='p-4 bg-white rounded-xl shadow-sm border-0 items-center justify-between h-[120px] gap-0 '>
                            <Text className='text-secondary font-bold text-[11px] text-center'>Event Booking/Creating Queries</Text>
                            <Image source={require('@/assets/images/help/query.gif')} style={{ width: 45, height: 45 }} />
                        </Card>
                    </TouchableOpacity>

                    <TouchableOpacity activeOpacity={0.8} className='w-[48%]'>
                        <Card className='p-4 bg-white rounded-xl shadow-sm border-0 items-center justify-between h-[120px] gap-0 '>
                            <Text className='text-secondary font-bold text-xs text-center'>General</Text>
                            <Image source={require('@/assets/images/help/general.gif')} style={{ width: 45, height: 45 }} />
                        </Card>
                    </TouchableOpacity>
                </View>

                {/* Section 3: Need more help? */}
                <Text className='text-secondary font-semibold text-sm mb-2'>Need more help?</Text>
                <Text className='text-secondary text-[11px] mb-1'>Our customer support team should be able to help you.</Text>
                <TouchableOpacity>
                    <Text className='text-[rgba(251,13,21,1)] font-bold text-xs'>Contact Us</Text>
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    )
}

export default HelpCentre
