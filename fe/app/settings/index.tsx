import { View, TouchableOpacity, Switch } from 'react-native'
import React, { useState } from 'react'
import { Text } from '@/components/ui/text'
import { Image } from 'expo-image'
import { ChevronRight } from 'lucide-react-native'
import { Link } from 'expo-router'
import { SignOutDialog } from '@/components/SignOutDialog'
import { DeleteAccountDialog } from '@/components/DeleteAccountDialog'
import PageLayout from '@/components/PageLayout'

const Settings = () => {
    const [whatsappEnabled, setWhatsappEnabled] = useState(false);

    return (
        <PageLayout title="Settings">

            {/* General Options */}
            <View className='px-5 pt-6 pb-2'>
                <Text className='text-primary font-medium text-sm mb-4'>General options</Text>

                <Link href="/settings/location" asChild>
                    <TouchableOpacity activeOpacity={0.7} className='flex-row items-center justify-between bg-[rgba(248,249,250,1)] p-4 rounded-xl mb-3'>
                        <View className='flex-row items-center gap-4'>
                            <Image source={require('@/assets/images/settings/location2.svg')} style={{ width: 16, height: 16 }} contentFit="contain" />
                            <Text className='text-secondary-foreground font-medium text-xs'>My Location</Text>
                        </View>
                        <ChevronRight size={16} color="#6200EE" />
                    </TouchableOpacity>
                </Link>

                <TouchableOpacity activeOpacity={0.7} className='flex-row items-center justify-between bg-background p-4 rounded-xl mb-3'>
                    <View className='flex-row items-center gap-4'>
                        <Image source={require('@/assets/images/settings/wallet.svg')} style={{ width: 16, height: 16 }} contentFit="contain" />
                        <Text className='text-secondary-foreground font-medium text-xs'>Saved Payment Methods</Text>
                    </View>
                    <ChevronRight size={16} color="rgba(79, 70, 229, 1)" />
                </TouchableOpacity>

                <Link href="/(tabs)/saved" asChild>
                    <TouchableOpacity activeOpacity={0.7} className='flex-row items-center justify-between bg-background p-4 rounded-xl mb-3'>
                        <View className='flex-row items-center gap-4'>
                            <Image source={require('@/assets/images/settings/heart.svg')} style={{ width: 16, height: 16 }} contentFit="contain" />
                            <Text className='text-secondary-foreground font-medium text-xs'>Saved Events</Text>
                        </View>
                        <ChevronRight size={16} color="rgba(79, 70, 229, 1)" />
                    </TouchableOpacity>
                </Link>

                <Link href="/settings/saved-devices" asChild>
                    <TouchableOpacity activeOpacity={0.7} className='flex-row items-center justify-between bg-background p-4 rounded-xl mb-6'>
                        <View className='flex-row items-center gap-4'>
                            <Image source={require('@/assets/images/settings/device.svg')} style={{ width: 16, height: 16 }} contentFit="contain" />
                            <Text className='text-secondary-foreground font-medium text-xs'>Saved Devices</Text>
                        </View>
                        <ChevronRight size={16} color="rgba(79, 70, 229, 1)" />
                    </TouchableOpacity>
                </Link>
            </View>

            {/* Divider Line */}
            <View className='h-[1px] bg-[rgba(0,0,0,0.05)] w-full' />

            {/* Additional Options */}
            <View className='px-5 pt-6 pb-10'>
                <Text className='text-primary font-medium text-sm mb-4'>Additional options</Text>

                <View className='flex-row items-center justify-between bg-background p-4 rounded-xl mb-3'>
                    <View className='flex-row items-center gap-4 flex-1'>
                        <Image source={require('@/assets/images/settings/whatsapp.svg')} style={{ width: 16, height: 16 }} contentFit="contain" />
                        <View className='flex-1'>
                            <Text className='text-secondary-foreground font-medium text-xs mb-1'>Whatsapp Notifications</Text>
                            <Text className='text-[rgba(15,23,42,0.6)] text-[10px]'>Get your event details on Whatsapp</Text>
                        </View>
                    </View>
                    <Switch
                        trackColor={{ false: "#d4d4d8", true: "rgba(79, 70, 229, 1)" }}
                        thumbColor={whatsappEnabled ? "rgba(79, 70, 229, 1)" : "#f4f3f4"}
                        ios_backgroundColor="#3e3e3e"
                        onValueChange={setWhatsappEnabled}
                        value={whatsappEnabled}
                        style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                    />
                </View>

                <TouchableOpacity activeOpacity={0.7} className='flex-row items-center justify-between bg-background p-4 rounded-xl mb-3'>
                    <View className='flex-row items-center gap-4 flex-1'>
                        <Image source={require('@/assets/images/settings/location.svg')} style={{ width: 16, height: 16 }} contentFit="contain" />
                        <View className='flex-1'>
                            <Text className='text-secondary-foreground font-medium text-xs mb-1'>Location Permission</Text>
                            <Text className='text-[rgba(15,23,42,0.6)] text-[10px]'>Discover events, venues and more near you</Text>
                        </View>
                    </View>
                    <ChevronRight size={16} color="rgba(79, 70, 229, 1)" />
                </TouchableOpacity>

                <TouchableOpacity activeOpacity={0.7} className='flex-row items-center justify-between bg-background p-4 rounded-xl mb-3'>
                    <View className='flex-row items-center gap-4 flex-1'>
                        <Image source={require('@/assets/images/settings/notification.svg')} style={{ width: 16, height: 16 }} contentFit="contain" />
                        <View className='flex-1'>
                            <Text className='text-secondary-foreground font-medium text-xs mb-1'>Notification Permission</Text>
                            <Text className='text-[rgba(15,23,42,0.6)] text-[10px]'>Get notified on what's buzzing around you</Text>
                        </View>
                    </View>
                    <ChevronRight size={16} color="rgba(79, 70, 229, 1)" />
                </TouchableOpacity>

                <DeleteAccountDialog>
                    <TouchableOpacity activeOpacity={0.7} className='flex-row items-center justify-between bg-background p-4 rounded-xl mb-3'>
                        <View className='flex-row items-center gap-4'>
                            <Image source={require('@/assets/images/settings/delete.svg')} style={{ width: 16, height: 16 }} contentFit="contain" />
                            <Text className='text-secondary-foreground font-medium text-xs'>Delete Account</Text>
                        </View>
                        <ChevronRight size={16} color="rgba(79, 70, 229, 1)" />
                    </TouchableOpacity>
                </DeleteAccountDialog>

                <SignOutDialog>
                    <TouchableOpacity activeOpacity={0.7} className='flex-row items-center justify-between bg-background p-4 rounded-xl mb-3'>
                        <View className='flex-row items-center gap-4'>
                            <Image source={require('@/assets/images/settings/sign-out.svg')} style={{ width: 16, height: 16 }} contentFit="contain" />
                            <Text className='text-secondary-foreground font-medium text-xs'>Sign Out</Text>
                        </View>
                        <ChevronRight size={16} color="rgba(79, 70, 229, 1)" />
                    </TouchableOpacity>
                </SignOutDialog>
            </View>

        </PageLayout>
    )
}


export default Settings;
