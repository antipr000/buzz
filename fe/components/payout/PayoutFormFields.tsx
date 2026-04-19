import { View, ScrollView, TouchableOpacity, Switch } from "react-native";
import React from "react";
import { Text } from "@/components/ui/text";
import { Input } from "@/components/ui/input";
import {
  PAYOUT_ACCOUNT_TYPES_UI,
  type PayoutFormState,
} from "@/components/payout/payoutFormModel";

export type PayoutFormFieldsProps = {
  form: PayoutFormState;
  update: (partial: Partial<PayoutFormState>) => void;
  saving: boolean;
  contentHorizontalPadding?: number;
};

export function PayoutFormFields({
  form,
  update,
  saving,
  contentHorizontalPadding = 16,
}: PayoutFormFieldsProps) {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingTop: 0,
        paddingBottom: 100,
        paddingLeft: contentHorizontalPadding,
        paddingRight: contentHorizontalPadding,
      }}
    >
      <View className="bg-white rounded-md border border-[rgba(0,0,0,0.1)] p-4">
        <Text className="text-[rgba(15,23,42,0.7)] font-semibold text-[11px] mb-4">
          Bank account for receiving payouts (organizer settlements)
        </Text>

        <View className="mb-4">
          <Text className="text-secondary-foreground font-medium text-[12px] mb-2">
            Account type <Text className="text-[rgba(255,20,51,0.9)]">*</Text>
          </Text>
          <View className="flex-row gap-2 flex-wrap">
            {PAYOUT_ACCOUNT_TYPES_UI.map(({ label, value }) => (
              <TouchableOpacity
                key={value}
                activeOpacity={0.7}
                onPress={() => update({ accountType: value })}
                className={`px-3.5 py-1 rounded-md border ${
                  form.accountType === value
                    ? "border-[rgba(0,0,0,0.5)] bg-[rgba(0,0,0,0.05)]"
                    : "border-[rgba(0,0,0,0.2)]"
                }`}
              >
                <Text
                  className={`text-[11px] ${
                    form.accountType === value
                      ? "text-[#334155] font-medium"
                      : "text-[#64748B]"
                  }`}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View className="mb-4">
          <Text className="text-[#475569] font-semibold text-[12px] mb-1.5">
            Account holder name <Text className="text-[rgba(255,20,51,0.9)]">*</Text>
          </Text>
          <Input
            value={form.accountHolderName}
            onChangeText={(accountHolderName) => update({ accountHolderName })}
            placeholder="Name as per bank records"
            placeholderTextColor="#94A3B8"
            editable={!saving}
            autoCapitalize="words"
            className="border border-[rgba(0,0,0,0.2)] rounded-md h-9 px-3 py-0 text-[11px] text-[#334155] font-poppins focus-visible:ring-0 shadow-none bg-white"
          />
        </View>

        <View className="mb-4">
          <Text className="text-[#475569] font-semibold text-[12px] mb-1.5">Bank name</Text>
          <Input
            value={form.bankName}
            onChangeText={(bankName) => update({ bankName })}
            placeholder="Optional"
            placeholderTextColor="#94A3B8"
            editable={!saving}
            className="border border-[rgba(0,0,0,0.2)] rounded-md h-9 px-3 py-0 text-[11px] text-[#334155] font-poppins focus-visible:ring-0 shadow-none bg-white"
          />
        </View>

        <View className="mb-4">
          <Text className="text-[#475569] font-semibold text-[12px] mb-1.5">
            Account number <Text className="text-[rgba(255,20,51,0.9)]">*</Text>
          </Text>
          <Input
            value={form.accountNumber}
            onChangeText={(accountNumber) => update({ accountNumber })}
            placeholder="6–18 digits"
            placeholderTextColor="#94A3B8"
            editable={!saving}
            keyboardType="number-pad"
            className="border border-[rgba(0,0,0,0.2)] rounded-md h-9 px-3 py-0 text-[11px] text-[#334155] font-poppins focus-visible:ring-0 shadow-none bg-white"
          />
        </View>

        <View className="mb-4">
          <Text className="text-[#475569] font-semibold text-[12px] mb-1.5">
            Confirm account number <Text className="text-[rgba(255,20,51,0.9)]">*</Text>
          </Text>
          <Input
            value={form.confirmAccountNumber}
            onChangeText={(confirmAccountNumber) => update({ confirmAccountNumber })}
            placeholder="Re-enter account number"
            placeholderTextColor="#94A3B8"
            editable={!saving}
            keyboardType="number-pad"
            className="border border-[rgba(0,0,0,0.2)] rounded-md h-9 px-3 py-0 text-[11px] text-[#334155] font-poppins focus-visible:ring-0 shadow-none bg-white"
          />
        </View>

        <View className="mb-4">
          <Text className="text-[#475569] font-semibold text-[12px] mb-1.5">
            IFSC code <Text className="text-[rgba(255,20,51,0.9)]">*</Text>
          </Text>
          <Input
            value={form.ifscCode}
            onChangeText={(ifscCode) => update({ ifscCode: ifscCode.toUpperCase() })}
            placeholder="e.g. HDFC0001234"
            placeholderTextColor="#94A3B8"
            editable={!saving}
            autoCapitalize="characters"
            maxLength={11}
            className="border border-[rgba(0,0,0,0.2)] rounded-md h-9 px-3 py-0 text-[11px] text-[#334155] font-poppins focus-visible:ring-0 shadow-none bg-white"
          />
        </View>

        <View className="flex-row items-center justify-between gap-3 py-1">
          <Text className="text-[#475569] font-medium text-[12px] flex-1">
            Set as primary payout account
          </Text>
          <Switch
            value={form.setAsPrimary}
            onValueChange={(setAsPrimary) => update({ setAsPrimary })}
            disabled={saving}
          />
        </View>
      </View>
    </ScrollView>
  );
}
