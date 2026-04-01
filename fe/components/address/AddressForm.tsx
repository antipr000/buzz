import { View, ScrollView, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { Text } from '@/components/ui/text'
import { Input } from '@/components/ui/input'
import { Image } from 'expo-image'

const AddressForm = () => {
    const [selectedAddressType, setSelectedAddressType] = useState('Home');

    return (
        <ScrollView showsVerticalScrollIndicator={false} className='' contentContainerStyle={{ padding: 16, paddingTop: 0, paddingBottom: 100 }}>

            {/* Address Form */}
            <View className='bg-white rounded-md border border-[rgba(0,0,0,0.1)] p-4'>
                <Text className='text-[rgba(15,23,42,0.7)] font-semibold text-[11px] mb-4'>Please enter all mandatory details for event ticket delivery/booking</Text>

                {/* Save as */}
                <View className='mb-4'>
                    <Text className='text-secondary-foreground font-medium text-[12px] mb-2'>Save as <Text className='text-[rgba(255,20,51,0.9)]'>*</Text></Text>
                    <View className='flex-row gap-2'>
                        {['Home', 'Work', 'Other'].map((type) => (
                            <TouchableOpacity
                                key={type}
                                activeOpacity={0.7}
                                onPress={() => setSelectedAddressType(type)}
                                className={`px-3.5 py-1 rounded-md border ${selectedAddressType === type ? 'border-[rgba(0,0,0,0.5)] bg-[rgba(0,0,0,0.05)]' : 'border-[rgba(0,0,0,0.2)]'}`}
                            >
                                <Text className={`text-[11px] ${selectedAddressType === type ? 'text-[#334155] font-medium' : 'text-[#64748B]'}`}>{type}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* First Name */}
                <View className='mb-4'>
                    <Text className='text-secondary-foreground font-medium text-[12px] mb-1.5'>First Name <Text className='text-[rgba(255,20,51,0.9)]'>*</Text></Text>
                    <Input
                        placeholder="Enter First Name"
                        placeholderTextColor="#94A3B8"
                        className='border border-[rgba(0,0,0,0.2)] rounded-md h-9 px-3 py-0 text-[11px] text-[#334155] font-poppins focus-visible:ring-0 shadow-none bg-white'
                    />
                </View>

                {/* Last Name */}
                <View className='mb-4'>
                    <Text className='text-[#475569] font-semibold text-[12px] mb-1.5'>Last Name <Text className='text-[rgba(255,20,51,0.9)]'>*</Text></Text>
                    <Input
                        placeholder="Enter Last Name"
                        placeholderTextColor="#94A3B8"
                        className='border border-[rgba(0,0,0,0.2)] rounded-md h-9 px-3 py-0 text-[11px] text-[#334155] font-poppins focus-visible:ring-0 shadow-none bg-white'
                    />
                </View>

                {/* Mobile Number */}
                <View className='mb-4'>
                    <Text className='text-[#475569] font-semibold text-[12px] mb-1.5'>Mobile Number <Text className='text-red-500'>*</Text></Text>
                    <View className='border border-[rgba(0,0,0,0.2)] rounded-md h-9 px-3 flex-row items-center justify-between'>
                        <Input
                            value='+91 7878678901'
                            className='flex-1 border-0 h-full p-0 py-0 shadow-none text-[11px] text-[#334155]'
                            style={{ borderWidth: 0 }}
                            keyboardType="numeric"
                        />
                        <Image source={require('@/assets/images/tick2.svg')} style={{ width: 14, height: 14 }} contentFit="contain" />
                    </View>
                </View>

                {/* Email ID */}
                <View className='mb-4'>
                    <Text className='text-[#475569] font-semibold text-[12px] mb-1.5'>Email ID <Text className='text-red-500'>*</Text></Text>
                    <View className='border border-[rgba(0,0,0,0.2)] rounded-md h-9 px-3 flex-row items-center justify-between'>
                        <Input
                            value="abc@gmail.com"
                            className='flex-1 border-0 h-full p-0 py-0 shadow-none text-[11px] text-[#334155] bg-transparent opacity-100'
                            style={{ borderWidth: 0 }}
                            editable={false}
                        />
                        <Image source={require('@/assets/images/tick2.svg')} style={{ width: 14, height: 14 }} contentFit="contain" />
                    </View>
                </View>

                {/* Address Line 1 */}
                <View className='mb-4'>
                    <Text className='text-[#475569] font-semibold text-[12px] mb-1.5'>Address Line 1 <Text className='text-red-500'>*</Text></Text>
                    <Input
                        placeholder="Flat no., House no., Building"
                        placeholderTextColor="#94A3B8"
                        className='border border-[rgba(0,0,0,0.2)] rounded-md h-9 px-3 py-0 text-[11px] text-[#334155] font-poppins focus-visible:ring-0 shadow-none bg-white'
                    />
                </View>

                {/* Address Line 2 */}
                <View className='mb-4'>
                    <Text className='text-[#475569] font-semibold text-[12px] mb-1.5'>Address Line 2</Text>
                    <Input
                        placeholder="Area, Colony, Street, Sector"
                        placeholderTextColor="#94A3B8"
                        className='border border-[rgba(0,0,0,0.2)] rounded-md h-9 px-3 py-0 text-[11px] text-[#334155] font-poppins focus-visible:ring-0 shadow-none bg-white'
                    />
                </View>

                {/* Landmark */}
                <View className='mb-4'>
                    <Text className='text-[#475569] font-semibold text-[12px] mb-1.5'>Landmark</Text>
                    <Input
                        placeholder="Eg. Central Musuem"
                        placeholderTextColor="#94A3B8"
                        className='border border-[rgba(0,0,0,0.2)] rounded-md h-9 px-3 py-0 text-[11px] text-[#334155] font-poppins focus-visible:ring-0 shadow-none bg-white'
                    />
                </View>

                {/* Pin Code */}
                <View className='mb-4'>
                    <Text className='text-[#475569] font-semibold text-[12px] mb-1.5'>Pin Code</Text>
                    <View className='border border-[rgba(0,0,0,0.2)] rounded-md h-9 px-3 flex-row items-center justify-between'>
                        <Input
                            value="400001"
                            className='flex-1 border-0 h-full p-0 py-0 shadow-none text-[11px] text-[#334155] font-poppins bg-transparent opacity-100'
                            style={{ borderWidth: 0 }}
                            editable={false}
                        />
                        <Image source={require('@/assets/images/tick2.svg')} style={{ width: 14, height: 14 }} contentFit="contain" />
                    </View>
                </View>

                {/* City */}
                <View className='mb-4'>
                    <Text className='text-[#475569] font-semibold text-[12px] mb-1.5'>City <Text className='text-red-500'>*</Text></Text>
                    <View className='border border-[rgba(0,0,0,0.2)] rounded-md h-9 px-3 flex-row items-center justify-between'>
                        <Input
                            value="Mumbai"
                            className='flex-1 border-0 h-full p-0 py-0 shadow-none text-[11px] text-[#334155] font-poppins bg-transparent opacity-100'
                            style={{ borderWidth: 0 }}
                            editable={false}
                        />
                        <Image source={require('@/assets/images/tick2.svg')} style={{ width: 14, height: 14 }} contentFit="contain" />
                    </View>
                </View>

                {/* State */}
                <View className='mb-4'>
                    <Text className='text-[#475569] font-semibold text-[12px] mb-1.5'>State <Text className='text-red-500'>*</Text></Text>
                    <View className='border border-[rgba(0,0,0,0.2)] rounded-md h-9 px-3 flex-row items-center justify-between'>
                        <Input
                            value="Maharashtra"
                            className='flex-1 border-0 h-full p-0 py-0 shadow-none text-[11px] text-[#334155] font-poppins bg-transparent opacity-100'
                            style={{ borderWidth: 0 }}
                            editable={false}
                        />
                        <Image source={require('@/assets/images/tick2.svg')} style={{ width: 14, height: 14 }} contentFit="contain" />
                    </View>
                </View>

                {/* Country */}
                <View className='mb-4'>
                    <Text className='text-[#475569] font-semibold text-[12px] mb-1.5'>Country <Text className='text-red-500'>*</Text></Text>
                    <View className='border border-[rgba(0,0,0,0.2)] rounded-md h-9 px-3 flex-row items-center justify-between pb-0'>
                        <Input
                            value="India"
                            className='flex-1 border-0 h-full p-0 py-0 shadow-none text-[11px] text-[#334155] font-poppins bg-transparent opacity-100'
                            style={{ borderWidth: 0 }}
                            editable={false}
                        />
                        <Image source={require('@/assets/images/tick2.svg')} style={{ width: 14, height: 14 }} contentFit="contain" />
                    </View>
                </View>

            </View>

        </ScrollView>
    )
}

export default AddressForm;
