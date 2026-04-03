import {
    View,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Text } from '@/components/ui/text'
import { ChevronLeft } from 'lucide-react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import AddressForm from '@/components/address/AddressForm'
import { savedAddressSummary } from '@/components/address/savedAddressSummary'
import { useAddresses } from '@/hooks/api'
import {
    addressFormSatisfiesPurchase,
    buildValidatedPayload,
    emptyAddressForm,
    type AddressFormState,
} from '@/components/address/addressFormModel'

function firstParamString(v: string | string[] | undefined): string | undefined {
    if (v === undefined) return undefined
    const s = typeof v === 'string' ? v : v[0]
    const t = s?.trim()
    return t || undefined
}

type CheckoutAddressMode = 'saved' | 'new'

const AddressDetails = () => {
    const router = useRouter()
    const params = useLocalSearchParams<{
        eventId?: string | string[]
        tickets?: string | string[]
        eventTitle?: string | string[]
    }>()
    const eventTitle = firstParamString(params.eventTitle) ?? 'Delivery address'
    const eventId = firstParamString(params.eventId)
    const ticketsJson = firstParamString(params.tickets)

    const {
        data: savedAddresses,
        isPending: addressesPending,
        isError: addressesError,
        refetch: refetchAddresses,
        isFetching: addressesFetching,
    } = useAddresses()

    const [checkoutForm, setCheckoutForm] = useState<AddressFormState>(() => emptyAddressForm())
    const [addressMode, setAddressMode] = useState<CheckoutAddressMode>('new')
    const [selectedSavedId, setSelectedSavedId] = useState<string | null>(null)

    const onCheckoutFormChange = useCallback((form: AddressFormState) => {
        setCheckoutForm(form)
    }, [])

    const selectedSavedRow = useMemo(
        () => savedAddresses?.find((a) => a.id === selectedSavedId) ?? null,
        [savedAddresses, selectedSavedId]
    )

    useEffect(() => {
        if (addressMode !== 'saved' || !selectedSavedId) return
        if (selectedSavedRow !== null) return
        setAddressMode('new')
        setSelectedSavedId(null)
        setCheckoutForm(emptyAddressForm())
    }, [addressMode, selectedSavedId, selectedSavedRow])

    const hasSavedAddresses =
        !addressesPending &&
        !addressesError &&
        Boolean(savedAddresses && savedAddresses.length > 0)

    const usingSavedAddress =
        addressMode === 'saved' &&
        selectedSavedId !== null &&
        selectedSavedRow !== null

    const checkoutParamsOk = Boolean(eventId && ticketsJson)

    const canProceed =
        checkoutParamsOk &&
        (addressMode === 'saved'
            ? Boolean(selectedSavedRow)
            : addressFormSatisfiesPurchase(checkoutForm))

    const onPressSavedRow = (id: string) => {
        if (selectedSavedId === id && addressMode === 'saved') {
            setSelectedSavedId(null)
            setAddressMode('new')
            setCheckoutForm(emptyAddressForm())
            return
        }
        setSelectedSavedId(id)
        setAddressMode('saved')
    }

    const proceedToPayment = () => {
        if (!eventId || !ticketsJson) {
            Alert.alert('Missing details', 'Go back and choose tickets again.')
            router.back()
            return
        }
        try {
            const parsed = JSON.parse(ticketsJson) as unknown
            if (!Array.isArray(parsed) || parsed.length === 0) {
                throw new Error('invalid')
            }
        } catch {
            Alert.alert('Invalid checkout', 'Go back and choose tickets again.')
            router.back()
            return
        }

        if (addressMode === 'saved') {
            if (!selectedSavedRow) return
            router.push({
                pathname: '/event/payment',
                params: {
                    eventId,
                    tickets: ticketsJson,
                    eventTitle: firstParamString(params.eventTitle) ?? '',
                    addressId: selectedSavedRow.id,
                },
            })
        } else {
            const body = buildValidatedPayload(checkoutForm)
            if (!body) return
            router.push({
                pathname: '/event/payment',
                params: {
                    eventId,
                    tickets: ticketsJson,
                    eventTitle: firstParamString(params.eventTitle) ?? '',
                    address: JSON.stringify(body),
                },
            })
        }
    }

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
                {/*
                Pin code eligibility (home delivery) — restore when product needs it.
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
                                const selected =
                                    addressMode === 'saved' && selectedSavedId === addr.id
                                return (
                                    <TouchableOpacity
                                        key={addr.id}
                                        activeOpacity={0.85}
                                        onPress={() => onPressSavedRow(addr.id)}
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

                {hasSavedAddresses && !usingSavedAddress ? (
                    <View className="my-5 flex-row items-center gap-3">
                        <View className="h-px flex-1 bg-[rgba(0,0,0,0.12)]" />
                        <Text className="px-2 text-[11px] font-medium uppercase tracking-wider text-[#64748B]">
                            or enter below
                        </Text>
                        <View className="h-px flex-1 bg-[rgba(0,0,0,0.12)]" />
                    </View>
                ) : null}

                {usingSavedAddress && selectedSavedRow ? (
                    <View className="mb-4 rounded-md border border-primary/30 bg-[rgba(126,34,206,0.06)] px-3 py-3">
                        <Text className="mb-1 text-[11px] font-semibold text-secondary-foreground">
                            Selected address
                        </Text>
                        <Text className="text-[11px] text-secondary-foreground" numberOfLines={2}>
                            {savedAddressSummary(selectedSavedRow)}
                        </Text>
                        {selectedSavedRow.address_line1 ? (
                            <Text
                                className="mt-0.5 text-[10px] text-[#64748B]"
                                numberOfLines={2}
                            >
                                {selectedSavedRow.address_line1}
                            </Text>
                        ) : null}
                        <TouchableOpacity
                            onPress={() => onPressSavedRow(selectedSavedRow.id)}
                            activeOpacity={0.7}
                            className="mt-2 self-start"
                        >
                            <Text className="text-[11px] font-medium text-primary">
                                Choose a different or new address
                            </Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <>
                        <Text className="mb-2 text-[12px] font-semibold text-secondary-foreground">
                            Delivery address
                        </Text>
                        <AddressForm
                            contentHorizontalPadding={0}
                            onFormChange={onCheckoutFormChange}
                        />
                    </>
                )}
            </ScrollView>

            <View className='absolute bottom-0 w-full bg-white px-5 py-4 border-t border-[rgba(0,0,0,0.05)] pt-4 pb-8'>
                <TouchableOpacity
                    activeOpacity={0.8}
                    disabled={!canProceed}
                    onPress={proceedToPayment}
                    className={`bg-primary w-full h-12 rounded-lg items-center justify-center ${!canProceed ? 'opacity-45' : ''}`}
                >
                    <Text className='text-white font-bold text-[14px]'>Proceed</Text>
                </TouchableOpacity>
                {!checkoutParamsOk ? (
                    <Text className="mt-2 text-center text-[10px] text-[#64748B]">
                        Missing event or ticket selection — go back to the event page.
                    </Text>
                ) : null}
            </View>
        </SafeAreaView>
    )
}

export default AddressDetails;
