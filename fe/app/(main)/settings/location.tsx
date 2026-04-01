import { View, TouchableOpacity, TextInput } from 'react-native'
import React from 'react'
import { Text } from '@/components/ui/text'
import { Image } from 'expo-image'
import { Search } from 'lucide-react-native'
import PageLayout from '@/components/layout/PageLayout'

const Location = () => {
    const popularCities = [
        { name: 'Bangalore', icon: require('@/assets/images/settings/location/bangalore.svg') },
        { name: 'Mumbai', icon: require('@/assets/images/settings/location/mumbai.svg') },
        { name: 'Hyderabad', icon: require('@/assets/images/settings/location/hyderabad.svg') },
        { name: 'Ahmedabad', icon: require('@/assets/images/settings/location/ahemadabad.svg') },
        { name: 'Delhi-NCR', icon: require('@/assets/images/settings/location/delhi.svg') },
        { name: 'Pune', icon: require('@/assets/images/settings/location/pune.svg') },
    ];

    const otherCities = [
        'Kolkata', 'Pune', 'Gurugram', 'Chennai', 'Kochi'
    ];

    return (
        <PageLayout title="Location">

            {/* Auto Detect & Search */}
            <View className=' px-5 py-4'>
                <TouchableOpacity activeOpacity={0.7} className='flex-row items-center gap-2 mb-4'>
                    <Image source={require('@/assets/images/settings/location/target.svg')} style={{ width: 16, height: 16 }} contentFit="contain" />
                    <Text className='text-[rgba(255,13,13,1)] text-xs '>Auto Detect My Location</Text>
                </TouchableOpacity>

                <View className='flex-row items-center bg-white border border-[rgba(0,0,0,0.1)] rounded-md px-3 py-px'>
                    <Search size={15} color="#000" />
                    <TextInput
                        placeholder="Search for your city"
                        className='flex-1 ml-2 text-xs placeholder:text-[rgba(15,23,42,0.5)]'
                        placeholderTextColor="rgba(15,23,42,0.5)"
                    />
                </View>
            </View>

            {/* Popular Cities */}
            <View className=' px-5 py-4'>
                <Text className='text-xs font-bold text-secondary-foreground'>POPULAR CITIES</Text>
            </View>

            <View className='bg-white px-5 py-6 flex-row flex-wrap gap-y-6'>
                {popularCities.map((city, index) => (
                    <TouchableOpacity key={index} activeOpacity={0.7} className='items-center w-1/4'>
                        <View className='w-16 h-16 rounded-full border border-[rgba(0,0,0,0.3)] items-center justify-center mb-2'>
                            <Image source={city.icon} style={{ width: 45, height: 45 }} contentFit="contain" />
                        </View>
                        <Text className='text-primary text-[12px] font-medium text-center'>{city.name}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Other Cities */}
            <View className=' px-5 py-4'>
                <Text className='text-xs font-bold text-secondary-foreground'>OTHER CITIES</Text>
            </View>

            <View className='bg-white px-5 py-3'>
                {otherCities.map((city, index) => (
                    <TouchableOpacity key={index} activeOpacity={0.7} className='py-4'>
                        <Text className='text-secondary-foreground text-xs'>{city}</Text>
                    </TouchableOpacity>
                ))}
            </View>

        </PageLayout>
    )
}

export default Location;
