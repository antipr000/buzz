import { View, TouchableOpacity } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Text } from '@/components/ui/text'
import { router } from 'expo-router'
import { ChevronLeft } from 'lucide-react-native'
import AddressForm from '@/components/AddressForm'

const AddAddress = () => {
    return (
        <SafeAreaView className='flex-1 bg-background' edges={['top']}>
            {/* Header */}
            <View className='flex-row items-center px-5 py-10 pb-4 bg-white border-b border-[rgba(0,0,0,0.05)]'>
                <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
                    <ChevronLeft size={20} color="rgba(29,27,32,1)" />
                </TouchableOpacity>
                <Text className='font-bold text-sm text-secondary-foreground ml-4'>Edit Profile</Text>
            </View>

            {/* Address Form container with top padding */}
            <View className='flex-1 pt-4'>
                <AddressForm />
            </View>

            {/* Bottom Button */}
            <View className='absolute bottom-0 left-0 right-0 bg-white border-t border-[rgba(0,0,0,0.05)] px-4 py-3 pb-6'>
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => router.back()}
                    className='bg-primary w-full h-[42px] rounded-lg items-center justify-center'
                >
                    <Text className='text-white font-semibold text-[13px]'>Save Changes</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
}

export default AddAddress
