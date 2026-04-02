import { View, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import React from "react";
import { Text } from "@/components/ui/text";
import { Input } from "@/components/ui/input";
import type { PincodeLookupState } from "@/hooks/useIndiaPincodeLookup";
import { isCompleteIndiaPin } from "@/lib/pincode/indiaZippopotam";
import {
  ADDRESS_TYPES_UI,
  type AddressFormState,
  pinLookupHint,
} from "@/components/address/addressFormModel";

export type AddressFormFieldsProps = {
  form: AddressFormState;
  update: (partial: Partial<AddressFormState>) => void;
  onPinChange: (text: string) => void;
  pinLookup: PincodeLookupState;
  saving: boolean;
  /** Use 0 when the parent ScrollView already applies horizontal padding (e.g. event checkout). */
  contentHorizontalPadding?: number;
};

/**
 * All address inputs in document order — shared by add and edit flows.
 */
export function AddressFormFields({
  form,
  update,
  onPinChange,
  pinLookup,
  saving,
  contentHorizontalPadding = 16,
}: AddressFormFieldsProps) {
  const pinHint = pinLookupHint(pinLookup);
  const showPinOk = isCompleteIndiaPin(form.pinCode) && pinLookup.status === "ok";

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      className=""
      contentContainerStyle={{
        paddingTop: 0,
        paddingBottom: 100,
        paddingLeft: contentHorizontalPadding,
        paddingRight: contentHorizontalPadding,
      }}
    >
      <View className="bg-white rounded-md border border-[rgba(0,0,0,0.1)] p-4">
        <Text className="text-[rgba(15,23,42,0.7)] font-semibold text-[11px] mb-4">
          Please enter all mandatory details for event ticket delivery/booking
        </Text>

        <View className="mb-4">
          <Text className="text-secondary-foreground font-medium text-[12px] mb-2">
            Save as <Text className="text-[rgba(255,20,51,0.9)]">*</Text>
          </Text>
          <View className="flex-row gap-2">
            {ADDRESS_TYPES_UI.map((type) => (
              <TouchableOpacity
                key={type}
                activeOpacity={0.7}
                onPress={() => update({ addressType: type })}
                className={`px-3.5 py-1 rounded-md border ${
                  form.addressType === type
                    ? "border-[rgba(0,0,0,0.5)] bg-[rgba(0,0,0,0.05)]"
                    : "border-[rgba(0,0,0,0.2)]"
                }`}
              >
                <Text
                  className={`text-[11px] ${
                    form.addressType === type
                      ? "text-[#334155] font-medium"
                      : "text-[#64748B]"
                  }`}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View className="mb-4">
          <Text className="text-secondary-foreground font-medium text-[12px] mb-1.5">
            First Name <Text className="text-[rgba(255,20,51,0.9)]">*</Text>
          </Text>
          <Input
            value={form.firstName}
            onChangeText={(firstName) => update({ firstName })}
            placeholder="Enter First Name"
            placeholderTextColor="#94A3B8"
            editable={!saving}
            className="border border-[rgba(0,0,0,0.2)] rounded-md h-9 px-3 py-0 text-[11px] text-[#334155] font-poppins focus-visible:ring-0 shadow-none bg-white"
          />
        </View>

        <View className="mb-4">
          <Text className="text-[#475569] font-semibold text-[12px] mb-1.5">
            Last Name <Text className="text-[rgba(255,20,51,0.9)]">*</Text>
          </Text>
          <Input
            value={form.lastName}
            onChangeText={(lastName) => update({ lastName })}
            placeholder="Enter Last Name"
            placeholderTextColor="#94A3B8"
            editable={!saving}
            className="border border-[rgba(0,0,0,0.2)] rounded-md h-9 px-3 py-0 text-[11px] text-[#334155] font-poppins focus-visible:ring-0 shadow-none bg-white"
          />
        </View>

        <View className="mb-4">
          <Text className="text-[#475569] font-semibold text-[12px] mb-1.5">
            Mobile Number <Text className="text-red-500">*</Text>
          </Text>
          <Input
            value={form.mobile}
            onChangeText={(mobile) => update({ mobile })}
            placeholder="+91 …"
            placeholderTextColor="#94A3B8"
            keyboardType="phone-pad"
            editable={!saving}
            className="border border-[rgba(0,0,0,0.2)] rounded-md h-9 px-3 py-0 text-[11px] text-[#334155] font-poppins focus-visible:ring-0 shadow-none bg-white"
          />
        </View>

        <View className="mb-4">
          <Text className="text-[#475569] font-semibold text-[12px] mb-1.5">
            Email ID <Text className="text-red-500">*</Text>
          </Text>
          <Input
            value={form.email}
            onChangeText={(email) => update({ email })}
            placeholder="you@example.com"
            placeholderTextColor="#94A3B8"
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!saving}
            className="border border-[rgba(0,0,0,0.2)] rounded-md h-9 px-3 py-0 text-[11px] text-[#334155] font-poppins focus-visible:ring-0 shadow-none bg-white"
          />
        </View>

        <View className="mb-4">
          <Text className="text-[#475569] font-semibold text-[12px] mb-1.5">
            Address Line 1 <Text className="text-red-500">*</Text>
          </Text>
          <Input
            value={form.addressLine1}
            onChangeText={(addressLine1) => update({ addressLine1 })}
            placeholder="Flat no., House no., Building"
            placeholderTextColor="#94A3B8"
            editable={!saving}
            className="border border-[rgba(0,0,0,0.2)] rounded-md h-9 px-3 py-0 text-[11px] text-[#334155] font-poppins focus-visible:ring-0 shadow-none bg-white"
          />
        </View>

        <View className="mb-4">
          <Text className="text-[#475569] font-semibold text-[12px] mb-1.5">Address Line 2</Text>
          <Input
            value={form.addressLine2}
            onChangeText={(addressLine2) => update({ addressLine2 })}
            placeholder="Area, Colony, Street, Sector"
            placeholderTextColor="#94A3B8"
            editable={!saving}
            className="border border-[rgba(0,0,0,0.2)] rounded-md h-9 px-3 py-0 text-[11px] text-[#334155] font-poppins focus-visible:ring-0 shadow-none bg-white"
          />
        </View>

        <View className="mb-4">
          <Text className="text-[#475569] font-semibold text-[12px] mb-1.5">Landmark</Text>
          <Input
            value={form.landmark}
            onChangeText={(landmark) => update({ landmark })}
            placeholder="Eg. Central Museum"
            placeholderTextColor="#94A3B8"
            editable={!saving}
            className="border border-[rgba(0,0,0,0.2)] rounded-md h-9 px-3 py-0 text-[11px] text-[#334155] font-poppins focus-visible:ring-0 shadow-none bg-white"
          />
        </View>

        <View className="mb-4">
          <Text className="text-[#475569] font-semibold text-[12px] mb-1.5">
            Pin Code <Text className="text-red-500">*</Text>
          </Text>
          <View className="border border-[rgba(0,0,0,0.2)] rounded-md h-9 px-3 flex-row items-center gap-2">
            <Input
              value={form.pinCode}
              onChangeText={onPinChange}
              placeholder="6-digit PIN"
              placeholderTextColor="#94A3B8"
              keyboardType="number-pad"
              maxLength={6}
              editable={!saving}
              className="flex-1 border-0 h-full p-0 py-0 shadow-none text-[11px] text-[#334155] font-poppins bg-transparent"
              style={{ borderWidth: 0 }}
            />
            {pinLookup.status === "loading" ? (
              <ActivityIndicator size="small" color="#64748B" />
            ) : null}
          </View>
          {pinHint ? (
            <Text className="text-[10px] text-[#64748B] mt-1">{pinHint}</Text>
          ) : showPinOk ? (
            <Text className="text-[10px] text-emerald-700 mt-1">
              PIN matched — verify city detail
            </Text>
          ) : null}
        </View>

        <View className="mb-4">
          <Text className="text-[#475569] font-semibold text-[12px] mb-1.5">
            City <Text className="text-red-500">*</Text>
          </Text>
          <Input
            value={form.city}
            onChangeText={(city) => update({ city })}
            placeholder="City"
            placeholderTextColor="#94A3B8"
            editable={!saving}
            className="border border-[rgba(0,0,0,0.2)] rounded-md h-9 px-3 py-0 text-[11px] text-[#334155] font-poppins focus-visible:ring-0 shadow-none bg-white"
          />
        </View>

        <View className="mb-4">
          <Text className="text-[#475569] font-semibold text-[12px] mb-1.5">
            State <Text className="text-red-500">*</Text>
          </Text>
          <Input
            value={form.state}
            onChangeText={(stateName) => update({ state: stateName })}
            placeholder="State"
            placeholderTextColor="#94A3B8"
            editable={!saving}
            className="border border-[rgba(0,0,0,0.2)] rounded-md h-9 px-3 py-0 text-[11px] text-[#334155] font-poppins focus-visible:ring-0 shadow-none bg-white"
          />
        </View>

        <View className="mb-4">
          <Text className="text-[#475569] font-semibold text-[12px] mb-1.5">
            Country <Text className="text-red-500">*</Text>
          </Text>
          <Input
            value={form.country}
            onChangeText={(country) => update({ country })}
            placeholder="Country"
            placeholderTextColor="#94A3B8"
            editable={!saving}
            className="border border-[rgba(0,0,0,0.2)] rounded-md h-9 px-3 py-0 text-[11px] text-[#334155] font-poppins focus-visible:ring-0 shadow-none bg-white"
          />
        </View>
      </View>
    </ScrollView>
  );
}
