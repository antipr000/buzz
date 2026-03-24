import { TouchableOpacity, View } from 'react-native'
import React from 'react'
import { Text } from '@/components/ui/text'
import { Button } from '@/components/ui/button'
import AddressForm from '@/components/AddressForm'
import PageLayout from '@/components/PageLayout'
import { useRouter } from 'expo-router'

const AddAddress = () => {
    const router = useRouter()
    return (
        <PageLayout title="Address" scrollEnabled={false} contentContainerStyle={{ padding: 0 }}>
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
        </PageLayout>
    )
}

export default AddAddress
