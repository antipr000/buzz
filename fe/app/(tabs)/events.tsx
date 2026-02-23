import { StyleSheet, View, TouchableOpacity, ScrollView } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Text } from '@/components/ui/text'
import { Image } from 'expo-image'
import { Card } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react-native'
import { useRouter } from 'expo-router'
import { Separator } from '@/components/ui/separator'

const BOOKED_EVENTS = [
  {
    id: 'b1',
    bookingDate: '10 Aug, 2025 at 09:26:23 PM',
    title: 'Hoop Music Festival',
    language: 'English',
    date: 'Mon, 10 aug, 2025 | 09:27 PM',
    location: 'Central Park Area, Kolkata',
    tickets: '2 Tickets: PREMIUM - L5, L6, L7',
    image: require('@/assets/images/home/bg_music.png'),
    status: 'ATTENDED',
    statusMessage: 'Hope you had an amazing time!'
  }
]

const Events = () => {
  const router = useRouter()

  return (
    <SafeAreaView className='flex-1 bg-background' edges={['top']}>
      <View className='flex-1'>
        {/* Header */}
        <View className='px-5 py-10 pb-3 bg-secondary flex-row items-center gap-4'>
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ArrowLeft size={24} color='rgba(249, 250, 251, 1)' strokeWidth={2.5} />
          </TouchableOpacity>
          <Text className='text-background text-xl font-semibold'>
            Your Events
          </Text>
        </View>

        {/* Event Cards list */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
        >
          {BOOKED_EVENTS.map((event) => (
            <View key={event.id} className='mb-6'>
              <Text className='text-[rgba(15,23,42,0.7)] text-[11px] font-medium mb-3 ml-1'>
                Booking done on: {event.bookingDate}
              </Text>

              <Card className='p-0 bg-[rgba(244,248,255,1)] border border-[rgba(0,0,0,0.07)] shadow-sm rounded-xl overflow-hidden gap-0'>

                {/* Top Content: Image & Details */}
                <View className='p-4 flex-row gap-4'>
                  {/* Event Image */}
                  <Image
                    source={event.image}
                    style={{ width: 100, height: 130, borderRadius: 12 }}
                    contentFit='cover'
                  />

                  {/* Event Details */}
                  <View className='flex-1 shrink'>
                    <View className='flex-row justify-between items-start'>
                      <View>
                        <Text className='text-secondary-foreground font-bold text-xs'>{event.title}</Text>
                        <Text className='text-[rgba(15,23,42,0.7)] text-[11px] mt-0.5'>{event.language}</Text>
                      </View>
                      <Text className='text-[rgba(15,23,42,0.7)] font-semibold text-[11px]'>E-Ticket</Text>
                    </View>

                    <View className='mt-9 gap-0.5'>
                      <Text className='text-secondary-foreground font-semibold text-[11px]'>{event.date}</Text>
                      <Text className='text-[rgba(15,23,42,0.7)] text-[11px]'>{event.location}</Text>
                      <Text className='text-secondary-foreground font-medium text-[11px] mt-1'>{event.tickets}</Text>
                    </View>
                  </View>
                </View>

                {/* Divider */}
                <Separator className=' bg-[rgba(0,0,0,0.07)] w-[92%] self-center' />

                {/* Bottom Content: Status */}
                <View className='px-4 py-4 flex-row items-center gap-3'>
                  <View className='bg-[rgba(145,145,145,1)] px-2 py-1.5 rounded-lg'>
                    <Text className='text-white font-bold text-[10px] tracking-wider'>{event.status}</Text>
                  </View>
                  <Separator orientation='vertical' className='w-[1px] h-full bg-[rgba(0,0,0,0.05)]' />
                  <Text className='text-[rgba(15,23,42,0.7)] text-[11px]'>{event.statusMessage}</Text>
                </View>
              </Card>
            </View>
          ))}

          {/* Empty State Text */}
          <Text className='text-center text-[rgba(15,23,42,0.7)] font-bold text-xs mt-4'>
            You have no more events
          </Text>
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}

export default Events

const styles = StyleSheet.create({})