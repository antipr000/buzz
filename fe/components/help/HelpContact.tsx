import React from 'react'
import { Linking, View } from 'react-native'
import { Text } from '@/components/ui/text'
import { Button } from '@/components/ui/button'
import { useProfileMe } from '@/hooks/api'

/** Dummy support line — replace with real E.164 digits (no +) for wa.me before release. */
const SUPPORT_WHATSAPP_WA_ME_NUMBER = '15551234567'
const SUPPORT_PHONE_TEL = '+15551234567'

function whatsAppChatUrl(): string {
    const text = encodeURIComponent('Hi, I need help with Buzz.')
    return `https://wa.me/${SUPPORT_WHATSAPP_WA_ME_NUMBER}?text=${text}`
}

function greetingNameFromFullName(fullName: string | undefined): string {
    const first = fullName?.trim().split(/\s+/)[0]
    return first && first.length > 0 ? first : 'there'
}

const HelpContact = () => {
    const { data: profile } = useProfileMe()
    const greetingName = greetingNameFromFullName(profile?.full_name)

    const onChatPress = () => {
        void Linking.openURL(whatsAppChatUrl())
    }

    const onCallPress = () => {
        void Linking.openURL(`tel:${SUPPORT_PHONE_TEL}`)
    }

    return (
        <View className='p-5 bg-white border-t border-[rgba(0,0,0,0.05)] pt-6 pb-8'>
            <Text className='text-secondary-foreground text-xs'>Hi {greetingName}, need more help?</Text>
            <Text className='text-[rgba(251,13,21,1)] font-bold text-xs mb-4 mt-1'>Contact Us</Text>

            <View className='gap-3'>
                <Button className='w-full rounded-md h-11 bg-primary' onPress={onChatPress}>
                    <Text className='text-white text-sm font-semibold'>CHAT WITH US</Text>
                </Button>
                <Button
                    variant="outline"
                    className='w-full rounded-md h-11 border-primary bg-background'
                    onPress={onCallPress}
                >
                    <Text className='text-primary text-sm font-semibold'>CALL ME NOW</Text>
                </Button>
            </View>
        </View>
    )
}

export default HelpContact
