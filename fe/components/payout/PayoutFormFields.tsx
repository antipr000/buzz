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
  /** Add = full account required; edit = optional (API only exposes last4). */
  variant?: "add" | "edit";
  /** Edit mode: show “ends in ····{last4}” hint. */
  accountLast4?: string;
  /** First account — server always forces primary; hide toggle and show note. */
  forcePrimary?: boolean;
};

export function PayoutFormFields({
  form,
  update,
  saving,
  contentHorizontalPadding = 16,
  variant = "add",
  accountLast4,
  forcePrimary = false,
}: PayoutFormFieldsProps) {
  const isEdit = variant === "edit";
  const accountRequired = !isEdit;

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
          {isEdit
            ? "Update bank details for this payout account."
            : "Bank account for receiving payouts (organizer settlements)"}
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
            Account number{" "}
            {accountRequired ? (
              <Text className="text-[rgba(255,20,51,0.9)]">*</Text>
            ) : null}
          </Text>
          {isEdit && accountLast4 ? (
            <Text className="text-[10px] text-[#64748B] mb-1.5">
              Current account ends in ****{accountLast4}. Leave both fields blank to keep it, or
              enter a new number twice to change.
            </Text>
          ) : null}
          <Input
            value={form.accountNumber}
            onChangeText={(accountNumber) => update({ accountNumber })}
            placeholder={isEdit ? "Leave blank to keep existing account number" : "6–18 digits"}
            placeholderTextColor="#94A3B8"
            editable={!saving}
            keyboardType="number-pad"
            className="border border-[rgba(0,0,0,0.2)] rounded-md h-9 px-3 py-0 text-[11px] text-[#334155] font-poppins focus-visible:ring-0 shadow-none bg-white"
          />
        </View>

        <View className="mb-4">
          <Text className="text-[#475569] font-semibold text-[12px] mb-1.5">
            Confirm account number{" "}
            {accountRequired ? (
              <Text className="text-[rgba(255,20,51,0.9)]">*</Text>
            ) : null}
          </Text>
          <Input
            value={form.confirmAccountNumber}
            onChangeText={(confirmAccountNumber) => update({ confirmAccountNumber })}
            placeholder={isEdit ? "Leave blank to keep existing account number" : "Re-enter account number"}
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

        {forcePrimary ? (
          <Text className="text-[10px] text-[#64748B] py-1">
            *This will be your primary payout account.
          </Text>
        ) : (
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
        )}
      </View>
    </ScrollView>
  );
}
