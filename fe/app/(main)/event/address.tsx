import { View, ScrollView, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import React from 'react'
import { Text } from '@/components/ui/text'
import { Input } from '@/components/ui/input'
import { Image } from 'expo-image'
import { ChevronLeft, PlusCircle } from 'lucide-react-native'
import { useRouter, Link } from 'expo-router'
import AddressForm from '@/components/address/AddressForm'

const AddressDetails = () => {
    const router = useRouter();

    return (
        <SafeAreaView edges={['top']} className='flex-1 bg-white'>
            {/* Header */}
            <View className='flex-row items-center px-5 py-10 pb-4 bg-white border-b border-[rgba(0,0,0,0.05)]'>
                <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
                    <ChevronLeft size={20} color="rgba(29,27,32,1)" />
                </TouchableOpacity>
                <Text className='font-bold text-sm text-secondary-foreground ml-4'>Hoop Music Festival</Text>
            </View>

            <View className="px-4 pt-4 bg-background">
                {/* Add New Address */}
                <TouchableOpacity activeOpacity={0.7} className='bg-white rounded-md border border-[rgba(0,0,0,0.1)] p-3 flex-row items-center justify-between mb-4'>
                    <Text className='text-secondary-foreground font-medium text-[11px]'>Add New Address</Text>
                    <PlusCircle size={16} color="#334155" />
                </TouchableOpacity>

                {/* Check Pin code */}
                <View className='bg-white rounded-md border border-[rgba(0,0,0,0.1)] p-4 mb-4'>
                    <Text className='text-[rgba(15,23,42,0.7)] font-medium text-[11px] mb-3'>Check Pin code eligibility for new address</Text>
                    <View className='border border-[rgba(0,0,0,0.2)] rounded-md h-8 px-3 flex-row items-center justify-between mb-2'>
                        <Input
                            value="400001"
                            placeholder="Enter Pin Code"
                            className='flex-1 border-0 p-0 py-0 shadow-none text-[#334155] bg-transparent opacity-100 text-[11px]'
                            style={{ borderWidth: 0 }}
                            keyboardType="numeric"
                        />
                        <Image source={require('@/assets/images/tick2.svg')} style={{ width: 12, height: 12 }} contentFit="contain" />
                    </View>
                    <Text className='text-[rgba(36,168,3,0.7)] text-[11px] font-medium'>Home Delivery is available for your pin code</Text>
                </View>
            </View>

            <AddressForm />

            <View className='absolute bottom-0 w-full bg-white px-5 py-4 border-t border-[rgba(0,0,0,0.05)] pt-4 pb-8'>
                <Link href="/event/payment" asChild>
                    <TouchableOpacity activeOpacity={0.8} className='bg-primary w-full h-12 rounded-lg items-center justify-center'>
                        <Text className='text-white font-bold text-[14px]'>Proceed</Text>
                    </TouchableOpacity>
                </Link>
            </View>
        </SafeAreaView>
    )
}

export default AddressDetails;
