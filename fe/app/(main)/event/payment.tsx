import { View, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import React, { useMemo, useRef, useState } from 'react'
import { Text } from '@/components/ui/text'
import { Image, ImageSource } from 'expo-image'
import { ChevronLeft, ChevronRight } from 'lucide-react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { firstParamString } from '@/lib/expo-router/params'
import type { PurchasePaymentMethod } from '@/constants/paymentMethods'
import { usePurchaseTickets, useVerifyRazorpayPayment } from '@/hooks/api'
import { useRazorpay } from '@codearcade/expo-razorpay'
import type { PurchaseAddressIn, PurchaseBody, PurchaseResponse, PurchaseTicketLine } from '@/services/types/booking'

/** Stable row id for React; `method` is the API `payment_method` string. */
const PAYMENT_OPTIONS: {
    id: string
    method: PurchasePaymentMethod
    label: string
    icon: ImageSource
}[] = [
    { id: 'upi', method: 'upi', label: 'UPI (Pay via any App)', icon: require('@/assets/images/payments/upi.svg') },
    { id: 'card', method: 'credit_debit_card', label: 'Credit/Debit Card', icon: require('@/assets/images/payments/card.svg') },
    { id: 'pay_later', method: 'pay_later', label: 'Pay Later', icon: require('@/assets/images/payments/pay_later.svg') },
    { id: 'wallets', method: 'wallets', label: 'Wallets', icon: require('@/assets/images/payments/wallets.svg') },
    { id: 'emi', method: 'emi', label: 'EMI', icon: require('@/assets/images/payments/emi.svg') },
    { id: 'net_banking', method: 'net_banking', label: 'Net Banking', icon: require('@/assets/images/payments/net_banking.svg') },
    { id: 'cod', method: 'cash_on_delivery', label: 'Cash on Delivery', icon: require('@/assets/images/payments/cod.svg') },
];

/**
 * Methods that skip Razorpay checkout entirely (free bookings or COD).
 * All other methods open the Razorpay WebView after the server creates an order.
 */
const NON_RAZORPAY_METHODS = new Set<PurchasePaymentMethod>(['free', 'cash_on_delivery']);

/**
 * Maps our payment_method values to Razorpay prefill.method strings so the
 * checkout opens on the right tab. Unmapped methods (pay_later) open on the default tab.
 */
const RAZORPAY_PREFILL_METHOD: Partial<Record<PurchasePaymentMethod, string>> = {
    upi: 'upi',
    credit_debit_card: 'card',
    wallets: 'wallet',
    emi: 'emi',
    net_banking: 'netbanking',
};

/** Route params are strings; previous screens send either addressId (saved) or address JSON (new). */
function checkoutFromParams(params: {
    eventId?: string | string[];
    tickets?: string | string[];
    addressId?: string | string[];
    address?: string | string[];
    eventTitle?: string | string[];
}): CheckoutState {
    const eventId = firstParamString(params.eventId);
    const ticketsJson = firstParamString(params.tickets);
    const addressId = firstParamString(params.addressId);
    const addressJson = firstParamString(params.address);
    const eventTitle = firstParamString(params.eventTitle) ?? '';
    if (!eventId || !ticketsJson) return { ok: false };
    if (!addressId && !addressJson) return { ok: false };
    try {
        const tickets = JSON.parse(ticketsJson) as PurchaseTicketLine[];
        if (!Array.isArray(tickets) || tickets.length === 0) return { ok: false };
        if (addressId) return { ok: true, eventId, tickets, addressId, eventTitle };
        const address = JSON.parse(addressJson!) as PurchaseAddressIn;
        return { ok: true, eventId, tickets, address, eventTitle };
    } catch {
        return { ok: false };
    }
}

type CheckoutReady = {
    ok: true;
    eventId: string;
    tickets: PurchaseTicketLine[];
    eventTitle: string;
} & (
    | { addressId: string; address?: never }
    | { address: PurchaseAddressIn; addressId?: never }
);

type CheckoutState = CheckoutReady | { ok: false };

function useCheckoutFromParams(): CheckoutState {
    const params = useLocalSearchParams<{
        eventId?: string | string[];
        tickets?: string | string[];
        addressId?: string | string[];
        address?: string | string[];
        eventTitle?: string | string[];
    }>();
    return useMemo(
        () => checkoutFromParams(params),
        [params.eventId, params.tickets, params.addressId, params.address, params.eventTitle],
    );
}

const Payment = () => {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const checkout = useCheckoutFromParams();
    const purchase = usePurchaseTickets();
    const verify = useVerifyRazorpayPayment();
    const { openCheckout, RazorpayUI } = useRazorpay();
    const [selectedMethod, setSelectedMethod] = useState<PurchasePaymentMethod | null>(null);
    const submittingRef = useRef(false);

    const navigateBooked = (data: Pick<PurchaseResponse, 'booking_id' | 'payment_status'>) => {
        if (!checkout.ok) return;
        router.replace({
            pathname: '/event-booked',
            params: {
                bookingId: data.booking_id,
                paymentStatus: data.payment_status,
                eventTitle: checkout.eventTitle,
            },
        });
    };

    const submitPurchase = (method: PurchasePaymentMethod) => {
        if (!checkout.ok || purchase.isPending || verify.isPending) return;
        if (submittingRef.current) return;
        submittingRef.current = true;

        const body: PurchaseBody = checkout.addressId
            ? { event_id: checkout.eventId, tickets: checkout.tickets, address_id: checkout.addressId, payment_method: method }
            : { event_id: checkout.eventId, tickets: checkout.tickets, address: checkout.address!, payment_method: method };

        purchase.mutate(body, {
            onSuccess: (data) => {
                submittingRef.current = false;
                // Free / COD: no Razorpay checkout needed, navigate immediately.
                if (NON_RAZORPAY_METHODS.has(method)) {
                    navigateBooked(data);
                    return;
                }

                // No Razorpay order → nothing to open in WebView (e.g. ₹0 total with UPI/card/etc.).
                if (!data.razorpay_order_id) {
                    navigateBooked(data);
                    return;
                }

                // Have an order but no publishable key — misconfiguration; cannot open checkout.
                if (!data.razorpay_key_id) {
                    Alert.alert(
                        'Payment unavailable',
                        'Online checkout could not start because payments are not fully configured. Please try again later or contact support.',
                    );
                    return;
                }

                // Online payment: open Razorpay checkout.
                // amount * 100 converts rupees (stored in DB) → paise (required by Razorpay SDK).
                openCheckout(
                    {
                        key: data.razorpay_key_id,
                        order_id: data.razorpay_order_id,
                        amount: data.amount * 100,
                        currency: data.currency,
                        name: 'Buzz',
                        description: checkout.eventTitle || 'Event Booking',
                        prefill: { method: RAZORPAY_PREFILL_METHOD[method] },
                        theme: { color: '#4F46E5' },
                    },
                    {
                        onSuccess: (rzpData) => {
                            // Razorpay gave us three ids — verify HMAC on the server before marking paid.
                            verify.mutate(
                                {
                                    booking_id: data.booking_id,
                                    razorpay_payment_id: rzpData.razorpay_payment_id,
                                    razorpay_order_id: rzpData.razorpay_order_id,
                                    razorpay_signature: rzpData.razorpay_signature,
                                },
                                {
                                    onSuccess: () => navigateBooked({ booking_id: data.booking_id, payment_status: 'completed' }),
                                    onError: () => {
                                        Alert.alert(
                                            'Verification failed',
                                            'Your payment was received but could not be confirmed. Please contact support with your booking ID: ' + data.booking_id,
                                        );
                                    },
                                },
                            );
                        },
                        onFailure: (err) => {
                            // The package has a known quirk: err may already be the inner error object.
                            const description = err?.description ?? 'Payment could not be completed. Please try again.';
                            Alert.alert('Payment failed', description);
                        },
                        onClose: () => {
                            // User dismissed without paying — stay on screen so they can retry.
                        },
                    },
                );
            },
            onError: (err) => {
                submittingRef.current = false;
                Alert.alert(
                    'Could not complete purchase',
                    err instanceof Error ? err.message : 'Please try again.',
                );
            },
        });
    };

    const isLoading = purchase.isPending || verify.isPending;
    const canProceed = selectedMethod != null && !isLoading;

    /** One source of truth with footer: pt-4 (16) + Proceed h-10 (40) + bottom inset */
    const footerBottomInset = Math.max(insets.bottom, 16);
    const scrollPaddingBottom = 16 + 40 + footerBottomInset;

    if (!checkout.ok) {
        return (
            <SafeAreaView edges={['top']} className="flex-1 bg-white">
                <View className="flex-row items-center px-5 py-5 pb-4">
                    <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} className="hitSlop-10">
                        <ChevronLeft size={20} color="rgba(29,27,32,1)" />
                    </TouchableOpacity>
                    <Text className="font-bold text-sm text-secondary-foreground ml-4">Payment</Text>
                </View>
                <View className="flex-1 px-5 justify-center items-center">
                    <Text className="text-center text-secondary-foreground text-sm mb-4">
                        Missing checkout data or bad JSON. Go back and continue from the event.
                    </Text>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        activeOpacity={0.8}
                        className="bg-primary px-6 py-3 rounded-lg"
                    >
                        <Text className="text-white font-semibold text-sm">Go back</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView edges={['top']} className="flex-1 ">
            <View className="flex-row items-center px-5 py-5 pb-4 ">
                <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} className="hitSlop-10">
                    <ChevronLeft size={20} color="rgba(29,27,32,1)" />
                </TouchableOpacity>
                <Text className="font-bold text-sm text-secondary-foreground ml-4">Payment</Text>
            </View>

            <View className="flex-1 relative">
                {isLoading ? (
                    <View
                        className="absolute inset-0 z-10 bg-white/60 items-center justify-center"
                        pointerEvents="auto"
                    >
                        <ActivityIndicator size="large" color="rgba(79,70,229,1)" />
                    </View>
                ) : null}

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: scrollPaddingBottom }}
                >

                <TouchableOpacity
                    activeOpacity={0.7}
                    className="bg-white flex-row items-center justify-between px-5 py-4 border-b border-[rgba(0,0,0,0.05)] shadow-sm"
                >
                    <Text className="font-bold text-[12px] text-secondary-foreground">Coupons & Bank Offers</Text>
                    <View className="flex-row items-center">
                        <Text className="font-semibold text-[11px] text-primary mr-1">All offers</Text>
                        <ChevronRight size={14} color="#7E22CE" />
                    </View>
                </TouchableOpacity>

                <View className="px-5 py-5 pb-3">
                    <Text className="font-bold text-xs text-[rgba(15,23,42,0.7)] tracking-wider">PAYMENT OPTIONS</Text>
                </View>

                <View className="bg-white ">
                    {PAYMENT_OPTIONS.map((option, index) => {
                        const selected = selectedMethod === option.method;
                        return (
                            <TouchableOpacity
                                key={option.id}
                                activeOpacity={0.7}
                                disabled={isLoading}
                                onPress={() => setSelectedMethod(option.method)}
                                className={`flex-row items-center px-5 py-4 ${selected ? 'bg-[rgba(79,70,229,0.08)]' : ''
                                    } ${index !== PAYMENT_OPTIONS.length - 1 ? 'border-b border-[rgba(0,0,0,0.1)]' : ''}`}
                            >
                                <View className="w-6 items-center justify-center mr-3">
                                    <Image source={option.icon} style={{ width: 18, height: 18 }} contentFit="contain" />
                                </View>
                                <Text className="font-semibold text-[12px] text-secondary-foreground flex-1">{option.label}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                </ScrollView>

                <View
                    className="absolute bottom-0 w-full bg-white px-5 py-4 border-t border-[rgba(0,0,0,0.05)] pt-4 shadow-sm"
                    style={{ paddingBottom: footerBottomInset }}
                >
                    <TouchableOpacity
                        activeOpacity={0.8}
                        disabled={!canProceed}
                        onPress={() => selectedMethod && submitPurchase(selectedMethod)}
                        className={`w-full h-10 rounded-lg items-center justify-center bg-primary ${canProceed ? 'opacity-100' : 'opacity-40'}`}
                    >
                        <Text className="text-white font-semibold text-sm">Proceed</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Razorpay WebView checkout — renders as a native Modal, so placement in tree doesn't matter */}
            {RazorpayUI}
        </SafeAreaView>
    );
};

export default Payment;
