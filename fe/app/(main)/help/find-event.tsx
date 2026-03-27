import { StyleSheet, View, TouchableOpacity, Platform, Keyboard, ScrollView } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Text } from '@/components/ui/text'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react-native'
import { router } from 'expo-router'
import BackButton from '@/components/BackButton'

const FindEventDetails = () => {
    const [inputValue, setInputValue] = useState('')

    return (
        <SafeAreaView edges={['top']} className='flex-1 bg-white'>
            <ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                automaticallyAdjustKeyboardInsets={true}
                keyboardShouldPersistTaps="handled"
                className="flex-1 bg-background"
                showsVerticalScrollIndicator={false}
            >
                <View className='flex-1 justify-between bg-[rgba(244,246,251,1)]'>
                    <View>
                        {/* Header */}
                        <View className='flex-row items-center px-5 py-5 pb-4 bg-white'>
                            <BackButton />
                            <Text className='font-semibold text-xs text-secondary-foreground'>Find Your Event Details</Text>
                        </View>

                        {/* Content */}
                        <View className='px-5 pt-5'>
                            <Text className='text-secondary-foreground font-medium text-xs mb-4 leading-normal tracking-tight'>
                                Please provide your mobile number or email address that you have used while booking or creating the event
                            </Text>

                            <Text className='text-[rgba(15,23,42,0.6)] font-medium text-xs mb-2'>
                                There are 4 attempts you can make to find your event
                            </Text>

                            <Text className='text-secondary-foreground font-bold text-sm tracking-[6px] mb-4'>
                                _ _ _ _
                            </Text>

                            <Text className='text-secondary-foreground font-bold text-xs mb-2'>
                                Mobile Number / Email
                            </Text>

                            <Input
                                placeholder="93426734xx / hello@gmail.com"
                                value={inputValue}
                                onChangeText={setInputValue}
                                className="h-10 bg-white border-0 shadow-sm rounded-md mb-6 px-4  text-xs "
                                placeholderTextColor="rgba(15, 23, 42, 0.4)"
                            />
                        </View>
                    </View>

                    {/* Bottom action button */}
                    <View className='p-5 mb-4'>
                        <Button className='w-full rounded-xl h-11 bg-primary'>
                            <Text className='text-primary-foreground text-sm font-semibold'>Continue</Text>
                        </Button>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default FindEventDetails
