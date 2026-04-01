import { View } from 'react-native'
import React from 'react'
import { Text } from '@/components/ui/text'
import HelpPageTemplate from '@/components/help/HelpPageTemplate'

const faqs = [
    {
        question: "It's been over 5-7 days. Why haven't I received my refund?",
        element: (
            <View className='px-4 pb-4 bg-white'>
                <Text className='text-secondary-foreground font-bold text-xs mb-2'>Looks like something went wrong!</Text>
                <Text className='text-secondary-foreground text-xs leading-5'>
                    Kindly review your updated bank statement. If the refund is still not reflected, you can initiate a live chat and our team will assist you further.
                </Text>
            </View>
        )
    },
    {
        question: "The amount was debited, but I haven't received a confirmation email/SMS",
        element: (
            <View className='px-4 pb-4 bg-white'>
                <Text className='text-secondary-foreground font-bold text-xs mb-2'>Don't worry! We got this</Text>
                <Text className='text-secondary-foreground text-xs leading-5 mb-4'>
                    Once you have made the payment, your event created/booked will be shown in <Text className='text-primary font-bold text-xs'>My Events</Text>.
                </Text>

                <Text className='text-secondary-foreground text-xs leading-5 mb-4'>
                    If your booking doesn't reflect under <Text className='text-primary font-bold text-xs'>My Events</Text>, we recommend making a fresh booking. However, check your <Text className='font-bold text-xs'>Whatsapp/SMS/Email</Text> for the booking confirmation before you attempt another transaction.
                </Text>

                <Text className='text-secondary-foreground text-xs leading-5 mb-1'>
                    The amount debited for the failed booking attempt will be refunded to the original payment source within the given timelines:
                </Text>
                <View className='pl-4 mb-4 gap-1 mt-1'>
                    <View className='flex-row items-start'>
                        <Text className='text-secondary-foreground text-xs mr-2'>•</Text>
                        <Text className='text-secondary-foreground text-xs'>Debit/Credit Card or Net Banking: <Text className='font-bold text-xs'>5-7 days</Text></Text>
                    </View>
                    <View className='flex-row items-start'>
                        <Text className='text-secondary-foreground text-xs mr-2'>•</Text>
                        <Text className='text-secondary-foreground text-xs'>UPI and Wallet: <Text className='font-bold text-xs'>24-48 hours</Text></Text>
                    </View>
                    <View className='flex-row items-start'>
                        <Text className='text-secondary-foreground text-xs mr-2'>•</Text>
                        <Text className='text-secondary-foreground text-xs'>BMS Cash: Within <Text className='font-bold text-xs'>2 hours</Text> instantly</Text>
                    </View>
                </View>

                <Text className='text-secondary-foreground text-xs leading-5'>
                    If you've redeemed a bank offer/voucher code for this transaction, don't panic. The discount is blocked for <Text className='font-bold text-xs'>5-30 min</Text> depending on the offer/voucher code.
                </Text>
            </View>
        )
    },
    {
        question: "Is it safe to enter my credit/debit card information on your app?",
        element: (
            <View className='px-4 pb-4 bg-white'>
                <Text className='text-secondary-foreground text-xs leading-5'>
                    Buzz ensures the highest level of security for all our customers who transact online. All credit card/debit card payments on Buzz are processed through secure and trusted payment gateways managed by leading banks.
                </Text>
            </View>
        )
    }
]

const PaymentAndRefund = () => {
    return <HelpPageTemplate title="Payment & Refund" faqs={faqs} />
}

export default PaymentAndRefund
