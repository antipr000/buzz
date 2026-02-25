import { View } from 'react-native'
import React from 'react'
import { Text } from '@/components/ui/text'
import HelpPageTemplate from '@/components/HelpPageTemplate'

const faqs = [
    {
        question: "How do I book an event or create my own?",
        element: (
            <View className='px-4 pb-4 bg-white'>
                <Text className='text-secondary-foreground text-xs leading-5'>
                    You can easily book any event by selecting it from the home screen and clicking on "Book Now". To create your own event, navigate to the "Create Event" page from the bottom menu and fill out the event details.
                </Text>
            </View>
        )
    },
    {
        question: "How will I receive payouts for my event?",
        element: (
            <View className='px-4 pb-4 bg-white'>
                <Text className='text-secondary-foreground text-xs leading-5'>
                    Payouts are processed automatically and transferred to your linked bank account within 3 to 5 business days after your event has successfully concluded.
                </Text>
            </View>
        )
    },
    {
        question: "Can I edit an event after publishing it?",
        element: (
            <View className='px-4 pb-4 bg-white'>
                <Text className='text-secondary-foreground text-xs leading-5'>
                    Yes, you can edit certain details of your event such as the description and images from your "My Events" dashboard, provided the event hasn't started yet.
                </Text>
            </View>
        )
    }
]

const EventBookingQueries = () => {
    return <HelpPageTemplate title="Event Booking Queries" faqs={faqs} />
}

export default EventBookingQueries
