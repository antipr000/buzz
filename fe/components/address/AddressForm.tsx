import { View, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { Text } from "@/components/ui/text";
import { Input } from "@/components/ui/input";
import { useProfileMe } from "@/hooks/api/useProfileMe";
import { useIndiaPincodeLookup } from "@/hooks/useIndiaPincodeLookup";
import {
  isCompleteIndiaPin,
  normalizeIndiaPinInput,
} from "@/lib/pincode/indiaZippopotam";

function pinLookupHint(lookup: ReturnType<typeof useIndiaPincodeLookup>): string | null {
  if (lookup.status === "loading") return "Looking up PIN…";
  if (lookup.status === "error") {
    if (lookup.error === "not_found") return "PIN not found — check or enter city/state manually";
    if (lookup.error === "network") return "Could not reach PIN directory — check connection";
  }
  return null;
}

const AddressForm = () => {
  const { data: profile } = useProfileMe();
  const hydratedProfileId = useRef<string | null>(null);

  const [selectedAddressType, setSelectedAddressType] = useState<"Home" | "Work" | "Other">(
    "Home"
  );
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [landmark, setLandmark] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [country, setCountry] = useState("India");

  const pinLookup = useIndiaPincodeLookup(pinCode);

  useEffect(() => {
    if (!profile) return;
    if (hydratedProfileId.current === profile.id) return;
    if (profile.mobile_number) setMobile(profile.mobile_number);
    if (profile.email) setEmail(profile.email);
    hydratedProfileId.current = profile.id;
  }, [profile]);

  useEffect(() => {
    if (pinLookup.status !== "ok") return;
    setStateName(pinLookup.data.state);
    setCountry(pinLookup.data.country);
    setCity(pinLookup.data.localityHint ?? "");
  }, [pinLookup]);

  const onPinChange = (text: string) => {
    setPinCode(normalizeIndiaPinInput(text));
  };

  const pinHint = pinLookupHint(pinLookup);
  const showPinOk = isCompleteIndiaPin(pinCode) && pinLookup.status === "ok";

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      className=""
      contentContainerStyle={{ padding: 16, paddingTop: 0, paddingBottom: 100 }}
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
            {(["Home", "Work", "Other"] as const).map((type) => (
              <TouchableOpacity
                key={type}
                activeOpacity={0.7}
                onPress={() => setSelectedAddressType(type)}
                className={`px-3.5 py-1 rounded-md border ${
                  selectedAddressType === type
                    ? "border-[rgba(0,0,0,0.5)] bg-[rgba(0,0,0,0.05)]"
                    : "border-[rgba(0,0,0,0.2)]"
                }`}
              >
                <Text
                  className={`text-[11px] ${
                    selectedAddressType === type
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
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Enter First Name"
            placeholderTextColor="#94A3B8"
            className="border border-[rgba(0,0,0,0.2)] rounded-md h-9 px-3 py-0 text-[11px] text-[#334155] font-poppins focus-visible:ring-0 shadow-none bg-white"
          />
        </View>

        <View className="mb-4">
          <Text className="text-[#475569] font-semibold text-[12px] mb-1.5">
            Last Name <Text className="text-[rgba(255,20,51,0.9)]">*</Text>
          </Text>
          <Input
            value={lastName}
            onChangeText={setLastName}
            placeholder="Enter Last Name"
            placeholderTextColor="#94A3B8"
            className="border border-[rgba(0,0,0,0.2)] rounded-md h-9 px-3 py-0 text-[11px] text-[#334155] font-poppins focus-visible:ring-0 shadow-none bg-white"
          />
        </View>

        <View className="mb-4">
          <Text className="text-[#475569] font-semibold text-[12px] mb-1.5">
            Mobile Number <Text className="text-red-500">*</Text>
          </Text>
          <Input
            value={mobile}
            onChangeText={setMobile}
            placeholder="+91 …"
            placeholderTextColor="#94A3B8"
            keyboardType="phone-pad"
            className="border border-[rgba(0,0,0,0.2)] rounded-md h-9 px-3 py-0 text-[11px] text-[#334155] font-poppins focus-visible:ring-0 shadow-none bg-white"
          />
        </View>

        <View className="mb-4">
          <Text className="text-[#475569] font-semibold text-[12px] mb-1.5">
            Email ID <Text className="text-red-500">*</Text>
          </Text>
          <Input
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor="#94A3B8"
            keyboardType="email-address"
            autoCapitalize="none"
            className="border border-[rgba(0,0,0,0.2)] rounded-md h-9 px-3 py-0 text-[11px] text-[#334155] font-poppins focus-visible:ring-0 shadow-none bg-white"
          />
        </View>

        <View className="mb-4">
          <Text className="text-[#475569] font-semibold text-[12px] mb-1.5">
            Address Line 1 <Text className="text-red-500">*</Text>
          </Text>
          <Input
            value={addressLine1}
            onChangeText={setAddressLine1}
            placeholder="Flat no., House no., Building"
            placeholderTextColor="#94A3B8"
            className="border border-[rgba(0,0,0,0.2)] rounded-md h-9 px-3 py-0 text-[11px] text-[#334155] font-poppins focus-visible:ring-0 shadow-none bg-white"
          />
        </View>

        <View className="mb-4">
          <Text className="text-[#475569] font-semibold text-[12px] mb-1.5">Address Line 2</Text>
          <Input
            value={addressLine2}
            onChangeText={setAddressLine2}
            placeholder="Area, Colony, Street, Sector"
            placeholderTextColor="#94A3B8"
            className="border border-[rgba(0,0,0,0.2)] rounded-md h-9 px-3 py-0 text-[11px] text-[#334155] font-poppins focus-visible:ring-0 shadow-none bg-white"
          />
        </View>

        <View className="mb-4">
          <Text className="text-[#475569] font-semibold text-[12px] mb-1.5">Landmark</Text>
          <Input
            value={landmark}
            onChangeText={setLandmark}
            placeholder="Eg. Central Museum"
            placeholderTextColor="#94A3B8"
            className="border border-[rgba(0,0,0,0.2)] rounded-md h-9 px-3 py-0 text-[11px] text-[#334155] font-poppins focus-visible:ring-0 shadow-none bg-white"
          />
        </View>

        <View className="mb-4">
          <Text className="text-[#475569] font-semibold text-[12px] mb-1.5">
            Pin Code <Text className="text-red-500">*</Text>
          </Text>
          <View className="border border-[rgba(0,0,0,0.2)] rounded-md h-9 px-3 flex-row items-center gap-2">
            <Input
              value={pinCode}
              onChangeText={onPinChange}
              placeholder="6-digit PIN"
              placeholderTextColor="#94A3B8"
              keyboardType="number-pad"
              maxLength={6}
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
            value={city}
            onChangeText={setCity}
            placeholder="City"
            placeholderTextColor="#94A3B8"
            className="border border-[rgba(0,0,0,0.2)] rounded-md h-9 px-3 py-0 text-[11px] text-[#334155] font-poppins focus-visible:ring-0 shadow-none bg-white"
          />
        </View>

        <View className="mb-4">
          <Text className="text-[#475569] font-semibold text-[12px] mb-1.5">
            State <Text className="text-red-500">*</Text>
          </Text>
          <Input
            value={stateName}
            onChangeText={setStateName}
            placeholder="State"
            placeholderTextColor="#94A3B8"
            className="border border-[rgba(0,0,0,0.2)] rounded-md h-9 px-3 py-0 text-[11px] text-[#334155] font-poppins focus-visible:ring-0 shadow-none bg-white"
          />
        </View>

        <View className="mb-4">
          <Text className="text-[#475569] font-semibold text-[12px] mb-1.5">
            Country <Text className="text-red-500">*</Text>
          </Text>
          <Input
            value={country}
            onChangeText={setCountry}
            placeholder="Country"
            placeholderTextColor="#94A3B8"
            className="border border-[rgba(0,0,0,0.2)] rounded-md h-9 px-3 py-0 text-[11px] text-[#334155] font-poppins focus-visible:ring-0 shadow-none bg-white"
          />
        </View>
      </View>
    </ScrollView>
  );
};

export default AddressForm;
