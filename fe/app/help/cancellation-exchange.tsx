import { View } from 'react-native'
import React from 'react'
import { Text } from '@/components/ui/text'
import HelpPageTemplate from '@/components/HelpPageTemplate'

const faqs = [
    {
        question: "Can I cancel or modify a event I have created or booked ?",
        element: (
            <View className='px-4 pb-4 bg-white'>
                <Text className='text-secondary-foreground font-bold text-xs mb-2'>We've got you covered</Text>
                <Text className='text-secondary-foreground text-xs leading-5'>
                    Visit My Events to cancel or modify an event you've created or booked. Still need help? Start a live chat with our team.
                </Text>
            </View>
        )
    },
    {
        question: "Can I cancel or modify a event I have created or booked ?",
        element: (
            <View className='px-4 pb-4 bg-white'>
                <Text className='text-secondary-foreground font-bold text-xs mb-2'>We've got you covered</Text>
                <Text className='text-secondary-foreground text-xs leading-5'>
                    Visit My Events to cancel or modify an event you've created or booked. Still need help? Start a live chat with our team.
                </Text>
            </View>
        )
    }
]

const CancellationAndExchange = () => {
    return <HelpPageTemplate title="Cancellation & Exchange" faqs={faqs} />
}

export default CancellationAndExchange
