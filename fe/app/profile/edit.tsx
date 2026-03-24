import { View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import React, { useState } from 'react'
import { Text } from '@/components/ui/text'
import { Input } from '@/components/ui/input'
import { Image } from 'expo-image'
import { router, Link } from 'expo-router'
import { ChevronRight } from 'lucide-react-native'
import PageLayout from '@/components/PageLayout'

const EditProfile = () => {
    const [identifyType, setIdentifyType] = useState<string | null>(null);
    const [maritalStatus, setMaritalStatus] = useState<string | null>(null);

    return (
        <PageLayout title="Edit Profile" scrollEnabled={false} contentContainerStyle={{ padding: 0 }}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Banner / Photo Upload */}
                <View className='bg-primary h-[117px] items-center justify-center relative overflow-hidden'>
                    <Image
                        source={require('@/assets/images/edit/image.jpg')}
                        style={[StyleSheet.absoluteFillObject, { opacity: 0.3 }]}
                        contentFit='cover'
                        contentPosition={{ top: -170, left: 30 }}
                    />
                    <TouchableOpacity activeOpacity={0.8} className='items-center'>
                        <Image source={require('@/assets/images/edit/user.svg')} style={{ width: 40, height: 40, marginBottom: 4 }} contentFit='contain' />
                        <Text className='text-white text-[12px] font-medium'>Add/Upload Photo</Text>
                    </TouchableOpacity>
                </View>

                {/* Form Content */}
                <View className='p-4 pt-5 bg-white'>

                    {/* Mobile Number */}
                    <View className='mb-4'>
                        <View className='flex-row items-center justify-between mb-1.5'>
                            <Text className='text-secondary-foreground font-semibold text-[12px]'>Mobile Number</Text>
                            <TouchableOpacity>
                                <Text className='text-[rgba(255,38,18,1)] font-medium text-[12px]'>Edit Number</Text>
                            </TouchableOpacity>
                        </View>
                        <View className='border border-[rgba(0,0,0,0.1)] rounded-md h-9 px-3 flex-row items-center justify-between'>
                            <Input
                                value='+91 - 8765465998'
                                className='flex-1 border-0 h-full p-0 py-0 shadow-none text-[11px] text-[#64748B] font-poppins bg-transparent opacity-100'
                                style={{ borderWidth: 0 }}
                                editable={false}
                            />
                            <Image source={require('@/assets/images/tick2.svg')} style={{ width: 14, height: 14, tintColor: '#22C55E' }} contentFit="contain" />
                        </View>
                    </View>

                    {/* Email Address */}
                    <View className='mb-6'>
                        <View className='flex-row items-center justify-between mb-1.5'>
                            <Text className='text-secondary-foreground font-semibold text-[12px]'>Email Address</Text>
                            <TouchableOpacity>
                                <Text className='text-[rgba(255,38,18,1)] font-medium text-[12px]'>Edit Email</Text>
                            </TouchableOpacity>
                        </View>
                        <View className='border border-[rgba(0,0,0,0.1)] rounded-md h-9 px-3 flex-row items-center justify-between'>
                            <Input
                                value='hello@gmail.com'
                                className='flex-1 border-0 h-full p-0 py-0 shadow-none text-[11px] text-[#64748B] font-poppins bg-transparent opacity-100'
                                style={{ borderWidth: 0 }}
                                editable={false}
                            />
                            <Image source={require('@/assets/images/tick2.svg')} style={{ width: 14, height: 14, tintColor: '#22C55E' }} contentFit="contain" />
                        </View>
                    </View>

                    <View className='h-[1px] bg-[rgba(0,0,0,0.05)] flex-1 -mx-4 mb-3' />

                    {/* Personal Details Section */}
                    <Text className='text-secondary-foreground font-semibold text-[13px] mb-3'>Personal Details</Text>

                    {/* First Name */}
                    <View className='mb-4'>
                        <Text className='text-secondary-foreground font-semibold text-xs mb-1.5'>First Name <Text className='text-[rgba(255,20,51,0.9)]'>*</Text></Text>
                        <Input
                            placeholder="Enter first name here"
                            placeholderTextColor="#94A3B8"
                            className='border border-[rgba(0,0,0,0.1)] rounded-md h-9 px-3 py-0 text-[11px] text-[#334155] font-poppins focus-visible:ring-0 shadow-none bg-white'
                        />
                    </View>

                    {/* Last Name */}
                    <View className='mb-4'>
                        <Text className='text-secondary-foreground font-semibold text-[12px] mb-1.5'>Last Name <Text className='text-[rgba(255,20,51,0.9)]'>*</Text></Text>
                        <Input
                            placeholder="Enter last name here"
                            placeholderTextColor="#94A3B8"
                            className='border border-[rgba(0,0,0,0.1)] rounded-md h-9 px-3 py-0 text-[11px] text-[#334155] font-poppins focus-visible:ring-0 shadow-none bg-white'
                        />
                    </View>

                    {/* Birthday */}
                    <View className='mb-4'>
                        <Text className='text-secondary-foreground font-semibold text-[12px] mb-1.5'>Birthday (Optional)</Text>
                        <Input
                            placeholder="dd/mm/yy"
                            placeholderTextColor="#94A3B8"
                            className='border border-[rgba(0,0,0,0.1)] rounded-md h-9 px-3 py-0 text-[11px] text-[#334155] font-poppins focus-visible:ring-0 shadow-none bg-white'
                        />
                    </View>

                    {/* Identify */}
                    <View className='mb-4'>
                        <Text className='text-secondary-foreground font-semibold text-[12px] mb-2'>Identify (Optional)</Text>
                        <View className='flex-row gap-2'>
                            {['Man', 'Woman', 'Other'].map((type) => (
                                <TouchableOpacity
                                    key={type}
                                    activeOpacity={0.7}
                                    onPress={() => setIdentifyType(type)}
                                    className={`px-3.5 py-1 rounded-md border ${identifyType === type ? 'border-[rgba(0,0,0,0.5)] bg-[rgba(0,0,0,0.05)]' : 'border-[rgba(0,0,0,0.2)]'}`}
                                >
                                    <Text className={`text-[11px] ${identifyType === type ? 'text-[#334155] font-medium' : 'text-[#64748B]'}`}>{type}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Marital Status */}
                    <View className='mb-5'>
                        <Text className='text-secondary-foreground font-semibold text-[12px] mb-2'>Marital Status (Optional)</Text>
                        <View className='flex-row gap-2'>
                            {['Single', 'Married'].map((type) => (
                                <TouchableOpacity
                                    key={type}
                                    activeOpacity={0.7}
                                    onPress={() => setMaritalStatus(type)}
                                    className={`px-3.5 py-1 rounded-md border ${maritalStatus === type ? 'border-[rgba(0,0,0,0.5)] bg-[rgba(0,0,0,0.05)]' : 'border-[rgba(0,0,0,0.2)]'}`}
                                >
                                    <Text className={`text-[11px] ${maritalStatus === type ? 'text-[#334155] font-medium' : 'text-[#64748B]'}`}>{type}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Saved Addresses */}
                    <View className='mb-4'>
                        <Text className='text-secondary-foreground font-semibold text-[12px] mb-2'>Your Saved Addresses</Text>
                        <Link href="/profile/address" asChild>
                            <TouchableOpacity
                                activeOpacity={0.7}
                                className='border border-[rgba(0,0,0,0.1)] rounded-md h-9 px-3 flex-row items-center justify-between'
                            >
                                <Text className='text-[11px] text-secondary-foreground'>Add new Address</Text>
                                <ChevronRight size={14} color="#0F172A" />
                            </TouchableOpacity>
                        </Link>
                    </View>

                </View>
            </ScrollView>

            {/* Bottom Button */}
            <View className='absolute bottom-0 left-0 right-0 bg-white border-t border-[rgba(0,0,0,0.05)] px-4 py-3 pb-6'>
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => router.push('/(tabs)')}
                    className='bg-primary w-full h-[42px] rounded-lg items-center justify-center'
                >
                    <Text className='text-white font-semibold text-[13px]'>Save Changes</Text>
                </TouchableOpacity>
            </View>

        </PageLayout>
    )
}

export default EditProfile
