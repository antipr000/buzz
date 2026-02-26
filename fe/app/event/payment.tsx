import { View, ScrollView, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import React, { useState } from 'react'
import { Text } from '@/components/ui/text'
import { Image, ImageSource } from 'expo-image'
import { ChevronLeft, ChevronRight } from 'lucide-react-native'
import { useRouter } from 'expo-router'

const PAYMENT_OPTIONS: { id: string; label: string; icon: ImageSource }[] = [
    { id: 'upi', label: 'UPI (Pay via any App)', icon: require('@/assets/images/payments/upi.svg') },
    { id: 'card', label: 'Credit/Debit Card', icon: require('@/assets/images/payments/card.svg') },
    { id: 'pay_later', label: 'Pay Later', icon: require('@/assets/images/payments/pay_later.svg') },
    { id: 'wallets', label: 'Wallets', icon: require('@/assets/images/payments/wallets.svg') },
    { id: 'emi', label: 'EMI', icon: require('@/assets/images/payments/emi.svg') },
    { id: 'net_banking', label: 'Net Banking', icon: require('@/assets/images/payments/net_banking.svg') },
    { id: 'cod', label: 'Cash on Delivery', icon: require('@/assets/images/payments/cod.svg') },
];

const Payment = () => {
    const router = useRouter();

    return (
        <SafeAreaView edges={['top']} className='flex-1 '>
            {/* Header */}
            <View className='flex-row items-center px-5 py-6 pb-4 '>
                <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} className='hitSlop-10'>
                    <ChevronLeft size={20} color="rgba(29,27,32,1)" />
                </TouchableOpacity>
                <Text className='font-bold text-sm text-secondary-foreground ml-4'>Payment</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

                {/* Offers Section */}
                <TouchableOpacity
                    activeOpacity={0.7}
                    className='bg-white flex-row items-center justify-between px-5 py-4 border-b border-[rgba(0,0,0,0.05)] shadow-sm'
                >
                    <Text className='font-bold text-[12px] text-secondary-foreground'>Coupons & Bank Offers</Text>
                    <View className='flex-row items-center'>
                        <Text className='font-semibold text-[11px] text-primary mr-1'>All offers</Text>
                        <ChevronRight size={14} color="#7E22CE" />
                    </View>
                </TouchableOpacity>

                {/* Section Title */}
                <View className='px-5 py-5 pb-3'>
                    <Text className='font-bold text-xs text-[rgba(15,23,42,0.7)] tracking-wider'>PAYMENT OPTIONS</Text>
                </View>

                {/* Payment Options List */}
                <View className='bg-white '>
                    {PAYMENT_OPTIONS.map((option, index) => (
                        <TouchableOpacity
                            key={option.id}
                            activeOpacity={0.7}
                            className={`flex-row items-center px-5 py-4 ${index !== PAYMENT_OPTIONS.length - 1 ? 'border-b border-[rgba(0,0,0,0.1)]' : ''
                                }`}
                        >
                            <View className='w-6 items-center justify-center mr-3'>
                                <Image source={option.icon} style={{ width: 18, height: 18 }} contentFit='contain' />
                            </View>
                            <Text className='font-semibold text-[12px] text-secondary-foreground'>{option.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

            </ScrollView>

            {/* Bottom Proceed Button */}
            <View className='absolute bottom-0 w-full bg-white px-5 py-4 border-t border-[rgba(0,0,0,0.05)] pt-4 pb-8 shadow-sm'>
                <TouchableOpacity activeOpacity={0.8} className='bg-primary w-full h-10 rounded-lg items-center justify-center'>
                    <Text className='text-white font-semibold text-sm'>Proceed</Text>
                </TouchableOpacity>
            </View>

        </SafeAreaView>
    )
}

export default Payment;
