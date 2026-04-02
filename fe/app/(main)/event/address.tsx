import {
    View,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import React, { useState } from 'react'
import { Text } from '@/components/ui/text'
import { ChevronLeft, PlusCircle } from 'lucide-react-native'
import { useLocalSearchParams, useRouter, Link } from 'expo-router'
import AddressForm from '@/components/address/AddressForm'
import { savedAddressSummary } from '@/components/address/savedAddressSummary'
import { useAddresses } from '@/hooks/api'

function firstParamString(v: string | string[] | undefined): string | undefined {
    if (v === undefined) return undefined
    const s = typeof v === 'string' ? v : v[0]
    const t = s?.trim()
    return t || undefined
}

const AddressDetails = () => {
    const router = useRouter()
    const params = useLocalSearchParams<{
        eventId?: string | string[]
        tickets?: string | string[]
        eventTitle?: string | string[]
    }>()
    const eventTitle = firstParamString(params.eventTitle) ?? 'Delivery address'

    const {
        data: savedAddresses,
        isPending: addressesPending,
        isError: addressesError,
        refetch: refetchAddresses,
        isFetching: addressesFetching,
    } = useAddresses()

    const [selectedSavedId, setSelectedSavedId] = useState<string | null>(null)

    const hasSavedAddresses =
        !addressesPending &&
        !addressesError &&
        Boolean(savedAddresses && savedAddresses.length > 0)

    return (
        <SafeAreaView edges={['top']} className='flex-1 bg-white'>
            <View className='flex-row items-center px-5 py-10 pb-4 bg-white border-b border-[rgba(0,0,0,0.05)]'>
                <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
                    <ChevronLeft size={20} color="rgba(29,27,32,1)" />
                </TouchableOpacity>
                <Text
                    className='font-bold text-sm text-secondary-foreground ml-4 flex-1'
                    numberOfLines={2}
                >
                    {eventTitle}
                </Text>
            </View>

            <ScrollView
                className="flex-1 bg-background"
                contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 120 }}
                keyboardShouldPersistTaps="handled"
            >
                <TouchableOpacity activeOpacity={0.7} className='bg-white rounded-md border border-[rgba(0,0,0,0.1)] p-3 flex-row items-center justify-between mb-4'>
                    <Text className='text-secondary-foreground font-medium text-[11px]'>Add New Address</Text>
                    <PlusCircle size={16} color="#334155" />
                </TouchableOpacity>

                {/*
                Pin code eligibility (home delivery) — restore when product needs it.
                <View className='bg-white rounded-md border border-[rgba(0,0,0,0.1)] p-4 mb-4'>
                    <Text className='text-[rgba(15,23,42,0.7)] font-medium text-[11px] mb-3'>Check Pin code eligibility for new address</Text>
                    <View className='border border-[rgba(0,0,0,0.2)] rounded-md h-8 px-3 flex-row items-center justify-between mb-2'>
                        <Input ... />
                        <Image ... />
                    </View>
                    <Text className='text-[rgba(36,168,3,0.7)] text-[11px] font-medium'>Home Delivery is available for your pin code</Text>
                </View>
                */}

                <View className="mb-4">
                    <Text className="mb-2 text-[12px] font-semibold text-secondary-foreground">
                        Your saved addresses
                    </Text>
                    {addressesPending ? (
                        <View className="mb-3 items-center py-3">
                            <ActivityIndicator size="small" color="#64748B" />
                        </View>
                    ) : addressesError ? (
                        <View className="mb-3 gap-2">
                            <Text className="text-[11px] text-[#64748B]">
                                Could not load addresses. Try again in a moment.
                            </Text>
                            <TouchableOpacity
                                onPress={() => void refetchAddresses()}
                                disabled={addressesFetching}
                                className="self-start rounded-md border border-[rgba(0,0,0,0.15)] px-3 py-1.5 active:bg-[rgba(0,0,0,0.04)]"
                            >
                                <Text className="text-[11px] font-medium text-[#334155]">
                                    {addressesFetching ? 'Retrying…' : 'Retry'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ) : savedAddresses && savedAddresses.length > 0 ? (
                        <View className="mb-3 gap-2">
                            {savedAddresses.map((addr) => {
                                const selected = selectedSavedId === addr.id
                                return (
                                    <TouchableOpacity
                                        key={addr.id}
                                        activeOpacity={0.85}
                                        onPress={() =>
                                            setSelectedSavedId((prev) =>
                                                prev === addr.id ? null : addr.id
                                            )
                                        }
                                        className={`rounded-md border pl-3 pr-3 py-2 ${selected
                                            ? 'border-primary border-2 bg-[rgba(126,34,206,0.04)]'
                                            : 'border-[rgba(0,0,0,0.1)] bg-white'
                                            }`}
                                    >
                                        <Text
                                            className="text-[11px] text-secondary-foreground"
                                            numberOfLines={2}
                                        >
                                            {savedAddressSummary(addr)}
                                        </Text>
                                        {addr.address_line1 ? (
                                            <Text className="mt-0.5 text-[10px] text-[#64748B]" numberOfLines={1}>
                                                {addr.address_line1}
                                            </Text>
                                        ) : null}
                                    </TouchableOpacity>
                                )
                            })}
                        </View>
                    ) : null}
                </View>

                {hasSavedAddresses ? (
                    <View className="my-0 flex-row items-center gap-3">
                        <View className="h-px flex-1 bg-[rgba(0,0,0,0.12)]" />
                        <Text className="px-2 text-[11px] font-medium uppercase tracking-wider text-[#64748B]">
                            or
                        </Text>
                        <View className="h-px flex-1 bg-[rgba(0,0,0,0.12)]" />
                    </View>
                ) : null}

                <AddressForm contentHorizontalPadding={0} />
            </ScrollView>

            <View className='absolute bottom-0 w-full bg-white px-5 py-4 border-t border-[rgba(0,0,0,0.05)] pt-4 pb-8'>
                <Link href="/event/payment" asChild>
                    <TouchableOpacity activeOpacity={0.8} className='bg-primary w-full h-12 rounded-lg items-center justify-center'>
                        <Text className='text-white font-bold text-[14px]'>Proceed</Text>
                    </TouchableOpacity>
                </Link>
            </View>
        </SafeAreaView>
    )
}

export default AddressDetails;
