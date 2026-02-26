import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible'
import { ChevronDown, ChevronUp } from 'lucide-react-native'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Text } from '@/components/ui/text'
import { CATEGORY_COLORS } from '@/constants/categoryColors'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { useLocalSearchParams, useRouter, Link } from 'expo-router'
import React, { useState } from 'react'
import { ScrollView, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function EventDetails() {
    const { id } = useLocalSearchParams()
    const router = useRouter()

    // Find the event (In a real app, you'd fetch it based on `id` from backend or context)
    // For UI testing, we'll hardcode the featured event values that match the design.
    const event = {
        id: id,
        category: 'Music',
        categoryIcon: require('@/assets/images/events/music/music2.svg'),
        title: 'Hoop Music Festival',
        description: 'The biggest electronic music festival of the year featuring world class DJs and immersive light shows.',
        date: 'Thu, Jan 15, 2026',
        time: '8 PM',
        location: 'Central Park Arena',
        bg: require('@/assets/images/home/bg_music.png'),
        eventColor: CATEGORY_COLORS.Music,
        price: '750', // Base price
        organizer: 'Pulse Events',
        organizerLogo: require('@/assets/images/home/logo1.svg'),
        isPopular: true,
    }

    const [ticketCounts, setTicketCounts] = useState<Record<string, number>>({ Standard: 1 })
    const [openTickets, setOpenTickets] = useState<Record<string, boolean>>({})

    const toggleTicketOpen = (type: string) => {
        setOpenTickets(prev => ({ ...prev, [type]: !prev[type] }))
    }

    const TICKET_TYPES = [
        { type: 'Standard', price: 750 },
        { type: 'Premium', price: 1500 },
        { type: 'VIP', price: 5000 },
    ];

    const handleIncrement = (type: string) => {
        setTicketCounts(prev => {
            const currentTotal = Object.values(prev).reduce((a, b) => a + b, 0);
            if (currentTotal >= 10) return prev; // Max 10 tickets
            return { ...prev, [type]: (prev[type] || 0) + 1 };
        });
    };

    const handleDecrement = (type: string) => {
        setTicketCounts(prev => {
            const currentCount = prev[type] || 0;
            if (currentCount <= 0) return prev;
            const newCounts = { ...prev, [type]: currentCount - 1 };
            if (newCounts[type] === 0) {
                delete newCounts[type];
            }
            return newCounts;
        });
    };

    const totalPrice = TICKET_TYPES.reduce((sum, ticket) => sum + ticket.price * (ticketCounts[ticket.type] || 0), 0);

    return (
        <View className="flex-1 bg-background">
            <ScrollView showsVerticalScrollIndicator={false} >
                {/* Top Image Section */}
                <View className="w-full h-[214px]">
                    <Image source={event.bg} style={{ width: '100%', height: '100%', position: 'absolute' }} contentFit="cover" />
                    <LinearGradient
                        colors={['transparent', 'rgba(4,0,71,0.8)']}
                        locations={[0.5, 1]}
                        style={{ width: '100%', height: '100%', position: 'absolute' }}
                    />

                    {/* Top Bar Navigation */}
                    <SafeAreaView edges={['top']}>
                        <View className="flex-row items-center justify-between px-6 pt-2">
                            <TouchableOpacity onPress={() => router.back()} activeOpacity={0.8} className="w-8 h-8 rounded-full bg-white items-center justify-center shadow-sm">
                                <Image source={require('@/assets/images/events/detailed/arrow_back.svg')} style={{ width: 24, height: 24, marginRight: 2 }} contentFit="contain" />
                            </TouchableOpacity>
                            <TouchableOpacity activeOpacity={0.8} className="w-8 h-8 rounded-full bg-white items-center justify-center shadow-sm">
                                <Image source={require('@/assets/images/events/detailed/share.svg')} style={{ width: 24, height: 24 }} contentFit="contain" />
                            </TouchableOpacity>
                        </View>
                    </SafeAreaView>
                </View>

                <View className="px-6 py-4 bg-[rgba(245,243,255,1)]">
                    {/* Tags and "From ₹750 onwards" */}
                    <View className="flex-row items-center justify-between mb-1">
                        <View className="flex-row items-center gap-2">
                            <Badge variant="outline" className="border-0 px-2.5 py-1" style={{ backgroundColor: event.eventColor }}>
                                <Image source={event.categoryIcon} style={{ width: 11, height: 11 }} contentFit="contain" />
                                <Text className="text-primary-foreground text-[10px] font-medium">{event.category}</Text>
                            </Badge>
                            {event.isPopular && (
                                <View className="flex-row items-center gap-1">
                                    <Image source={require('@/assets/images/common/shine2.svg')} style={{ width: 10, height: 10 }} contentFit="contain" />
                                    <Text className="text-secondary-foreground text-[10px] font-medium">Popular</Text>
                                </View>
                            )}
                        </View>
                        <Text className="text-[12px] font-semibold text-primary">
                            From ₹750 onwards
                        </Text>
                    </View>

                    {/* Title */}
                    <Text className="text-sm font-semibold text-primary mb-2">{event.title}</Text>

                    {/* Date, Time, Location grid */}
                    <View className="flex-row flex-wrap items-center gap-y-1 ">
                        <View className="flex-row items-center gap-3">
                            <View className="flex-row items-center gap-1.5">
                                <Image source={require('@/assets/images/events/music/calender.svg')} style={{ width: 13, height: 13 }} contentFit="contain" />
                                <Text className="text-secondary-foreground font-medium text-[10px]">{event.date}</Text>
                            </View>
                            <View className="flex-row items-center gap-1.5">
                                <Image source={require('@/assets/images/events/music/time.svg')} style={{ width: 13, height: 13 }} contentFit="contain" />
                                <Text className="text-secondary-foreground font-medium text-[10px]">{event.time}</Text>
                            </View>
                        </View>
                        <View className="flex-row items-center gap-1.5 w-full mt-1">
                            <Image source={require('@/assets/images/events/music/location.svg')} style={{ width: 13, height: 13 }} contentFit="contain" />
                            <Text className="text-secondary-foreground font-medium text-[10px]">{event.location}</Text>
                        </View>
                    </View>
                </View>

                <View className="px-5 py-2.5 ">
                    {/* About the event */}
                    <View className="border border-dashed border-primary p-3 rounded-lg mb-4">
                        <Text className="text-[12px] font-bold text-secondary-foreground mb-1">About the event</Text>
                        <Text className="text-[11px] leading-normal text-[rgba(15,23,42,0.7)]">{event.description}</Text>
                    </View>

                    {/* Select Tickets */}
                    <View className="mb-6">
                        <View className="mb-3">
                            <Text className="text-[12px] font-medium text-secondary-foreground">Select Tickets</Text>
                            <Text className="text-[10px] text-[rgba(15,23,42,0.5)]">You can add up to 10 tickets only</Text>
                        </View>

                        {/* Ticket Cards */}
                        <View className="gap-3">
                            {TICKET_TYPES.map((ticket) => {
                                const count = ticketCounts[ticket.type] || 0;
                                const isOpen = !!openTickets[ticket.type];
                                return (
                                    <View key={ticket.type} className="bg-white rounded-xl shadow-xs border border-[rgba(79,70,229,0.03)] overflow-hidden">
                                        <View className="flex-row items-center justify-between p-2.5 ">
                                            <View>
                                                <Text className="text-[12px]  text-secondary">{ticket.type}</Text>
                                                <Text className="text-[12px] font-semibold text-secondary mt-0.5 mb-1">₹{ticket.price}</Text>
                                            </View>
                                            {count > 0 ? (
                                                <View className="flex-row items-center border border-primary rounded-md h-7 w-[70px] justify-between overflow-hidden">
                                                    <TouchableOpacity onPress={() => handleDecrement(ticket.type)} className="w-[30px] h-full items-center justify-center">
                                                        <Text className="text-primary text-[14px] font-medium">-</Text>
                                                    </TouchableOpacity>
                                                    <Text className="text-primary text-[12px] font-medium flex-1 text-center">{count}</Text>
                                                    <TouchableOpacity onPress={() => handleIncrement(ticket.type)} className="w-[30px] h-full items-center justify-center">
                                                        <Text className="text-primary text-[14px] font-medium">+</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            ) : (
                                                <TouchableOpacity
                                                    onPress={() => handleIncrement(ticket.type)}
                                                    className=" h-7 w-[70px] rounded-md border border-primary flex-row items-center justify-center"
                                                >
                                                    <Text className="text-[12px] font-medium text-primary">Add</Text>
                                                </TouchableOpacity>
                                            )}
                                        </View>

                                        <Collapsible open={isOpen} onOpenChange={() => toggleTicketOpen(ticket.type)}>
                                            <CollapsibleTrigger asChild>
                                                <TouchableOpacity className="px-2.5 pb-2.5 flex-row items-center gap-2" activeOpacity={0.7}>
                                                    <Text className="text-[10px] text-[rgba(228,5,5,0.7)] font-medium">{isOpen ? 'Show less' : 'Know more'}</Text>
                                                    {isOpen ? (
                                                        <ChevronUp size={12} color="rgba(228,5,5,0.7)" />
                                                    ) : (
                                                        <ChevronDown size={12} color="rgba(228,5,5,0.7)" />
                                                    )}
                                                </TouchableOpacity>
                                            </CollapsibleTrigger>
                                            <CollapsibleContent>
                                                <View className="px-4 pb-4 pt-1  mx-4 mb-3 rounded-lg border border-[rgba(255,75,75,0.1)]">
                                                    <View className="flex-row items-center mt-2">
                                                        <View className="w-1 h-1 rounded-full bg-slate-800 mr-2" />
                                                        <Text className="text-[12px] text-slate-700">Event access</Text>
                                                    </View>
                                                    <View className="flex-row items-center mt-1.5">
                                                        <View className="w-1 h-1 rounded-full bg-slate-800 mr-2" />
                                                        <Text className="text-[12px] text-slate-700">Basic Amenities</Text>
                                                    </View>
                                                </View>
                                            </CollapsibleContent>
                                        </Collapsible>
                                    </View>
                                );
                            })}
                        </View>
                    </View>

                    {/* Hosted by */}
                    <View className="flex-row justify-between mb-4  rounded-xl px-1">
                        <View>
                            <Text className="text-[12px] font-semibold text-secondary-foreground mb-4">Hosted by</Text>
                            <View className="flex-row items-center gap-3">
                                <Image source={event.organizerLogo} style={{ width: 27, height: 27 }} contentFit="contain" />
                                <Text className="text-[12px] font-semibold text-secondary-foreground">{event.organizer}</Text>
                            </View>
                        </View>
                        <View className="w-[147px] h-[102px] rounded-lg overflow-hidden relative bg-white">
                            <Image source={require('@/assets/images/events/detailed/159381c7db74a67c9fa011d60fc14cbaad891992.png')} style={{ width: '100%', height: '70%' }} contentFit="cover" />
                            <View className="absolute bottom-px w-full items-center">
                                <Text className="text-[10px] font-medium text-primary px-3 py-1 rounded-full">Open in maps</Text>
                            </View>
                        </View>
                    </View>
                </View>
                <View className=" w-full  px-6 py-4 flex-row items-center justify-between  pb-8">
                    <View>
                        <Text className="text-[12px] text-[rgba(15,23,42,0.7)] ">Total</Text>
                        <Text className="text-[16px] font-semibold text-secondary-foreground">₹{totalPrice}</Text>
                    </View>
                    <Link href="/event/address" asChild>
                        <TouchableOpacity activeOpacity={0.7} className="bg-primary px-8  h-10 rounded-lg items-center justify-center">
                            <Text className="text-primary-foreground text-[14px] font-bold">Proceed</Text>
                        </TouchableOpacity>
                    </Link>
                </View>
            </ScrollView>

            {/* Bottom Sticky CTA */}

        </View>
    )
}
