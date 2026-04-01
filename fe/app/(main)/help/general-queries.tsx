import { View } from 'react-native'
import React from 'react'
import { Text } from '@/components/ui/text'
import HelpPageTemplate from '@/components/help/HelpPageTemplate'

const faqs = [
    {
        question: "How does this app work?",
        element: (
            <View className='px-4 pb-4 bg-white'>
                <Text className='text-secondary-foreground font-bold text-xs mb-2'>We've got this.</Text>
                <Text className='text-secondary-foreground text-xs leading-5'>
                    Discover local events, book tickets in a few taps, or create your own event for the community. Everything you book or create lives under <Text className='font-bold text-xs'>My Events</Text>.
                </Text>
            </View>
        )
    },
    {
        question: "Do I need an account to book or create events?",
        element: (
            <View className='px-4 pb-4 bg-white'>
                <Text className='text-secondary-foreground font-bold text-xs mb-2'>Ofcourse, yes.</Text>
                <Text className='text-secondary-foreground text-xs leading-5'>
                    You'll need an account to book or create events so we can manage tickets, updates, and payments securely.
                </Text>
            </View>
        )
    },
    {
        question: "What if an event is cancelled or rescheduled?",
        element: (
            <View className='px-4 pb-4 bg-white'>
                <Text className='text-secondary-foreground font-bold text-xs mb-2'>We've got this handled.</Text>
                <Text className='text-secondary-foreground text-xs leading-5'>
                    You'll be notified right away if an event is cancelled or changed. Any refunds or next steps will be shared clearly in the app.
                </Text>
            </View>
        )
    },
    {
        question: "Can I trust the events listed on the app?",
        element: (
            <View className='px-4 pb-4 bg-white'>
                <Text className='text-secondary-foreground font-bold text-xs mb-2'>Yes, you can.</Text>
                <Text className='text-secondary-foreground text-xs leading-5'>
                    We work closely with organizers and review events to create a safe, reliable experience for everyone.
                </Text>
            </View>
        )
    }
]

const GeneralQueries = () => {
    return <HelpPageTemplate title="General" faqs={faqs} />
}

export default GeneralQueries
