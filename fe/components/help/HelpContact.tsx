import React from 'react'
import { View } from 'react-native'
import { Text } from '@/components/ui/text'
import { Button } from '@/components/ui/button'
import { useProfileMe } from '@/hooks/api'

function greetingNameFromFullName(fullName: string | undefined): string {
    const first = fullName?.trim().split(/\s+/)[0]
    return first && first.length > 0 ? first : 'there'
}

const HelpContact = () => {
    const { data: profile } = useProfileMe()
    const greetingName = greetingNameFromFullName(profile?.full_name)

    return (
        <View className='p-5 bg-white border-t border-[rgba(0,0,0,0.05)] pt-6 pb-8'>
            <Text className='text-secondary-foreground text-xs'>Hi {greetingName}, need more help?</Text>
            <Text className='text-[rgba(251,13,21,1)] font-bold text-xs mb-4 mt-1'>Contact Us</Text>

            <View className='gap-3'>
                <Button className='w-full rounded-md h-11 bg-primary'>
                    <Text className='text-white text-sm font-semibold'>CHAT WITH US</Text>
                </Button>
                <Button variant="outline" className='w-full rounded-md h-11 border-primary bg-background'>
                    <Text className='text-primary text-sm font-semibold'>CALL ME NOW</Text>
                </Button>
            </View>
        </View>
    )
}

export default HelpContact
