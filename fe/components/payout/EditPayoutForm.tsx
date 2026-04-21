import { View, ActivityIndicator, Alert } from "react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Text } from "@/components/ui/text";
import { useRouter } from "expo-router";
import { usePatchPayout, usePayout } from "@/hooks/api";
import {
  buildValidatedPayoutPatchPayload,
  emptyPayoutForm,
  formStateFromPayoutOut,
  type PayoutFormState,
} from "@/components/payout/payoutFormModel";
import { PayoutFormFields } from "@/components/payout/PayoutFormFields";
import { PayoutSaveFooter } from "@/components/payout/PayoutSaveFooter";

type EditPayoutFormProps = {
  payoutId: string;
};

/**
 * Edit payout: load row (masked account), Save → PATCH /user/payouts/{id}, then go back.
 */
export default function EditPayoutForm({ payoutId }: EditPayoutFormProps) {
  const router = useRouter();
  const hydratedForId = useRef<string | null>(null);

  const {
    data: payoutRow,
    isPending: payoutLoadPending,
    isError: payoutLoadError,
  } = usePayout(payoutId);

  const [form, setForm] = useState<PayoutFormState>(() => emptyPayoutForm());
  const update = useCallback((partial: Partial<PayoutFormState>) => {
    setForm((prev) => ({ ...prev, ...partial }));
  }, []);

  const patchMutation = usePatchPayout();

  useEffect(() => {
    if (!payoutRow || payoutRow.id !== payoutId) return;
    if (hydratedForId.current === payoutId) return;
    setForm(formStateFromPayoutOut(payoutRow));
    hydratedForId.current = payoutId;
  }, [payoutId, payoutRow]);

  const onSave = async () => {
    if (payoutLoadPending) {
      Alert.alert("Please wait", "Still loading this account.");
      return;
    }
    if (payoutLoadError || !payoutRow) {
      Alert.alert(
        "Could not load",
        "This payout account could not be loaded. Try going back."
      );
      return;
    }

    const patch = buildValidatedPayoutPatchPayload(form);
    if (!patch) return;

    try {
      await patchMutation.mutateAsync({ payoutId, patch });
      router.back();
    } catch {
      Alert.alert("Could not save", "Please try again.");
    }
  };

  const saving = patchMutation.isPending;

  if (payoutLoadPending) {
    return (
      <View className="flex-1 items-center justify-center pt-8">
        <ActivityIndicator size="large" color="#64748B" />
      </View>
    );
  }

  if (payoutLoadError || !payoutRow) {
    return (
      <View className="flex-1 items-center justify-center px-6 pt-8">
        <Text className="text-center text-[13px] text-[#64748B]">
          Could not load this payout account. Go back and try again.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <View className="flex-1 pt-4">
        <PayoutFormFields
          form={form}
          update={update}
          saving={saving}
          variant="edit"
          accountLast4={payoutRow.account_number_last4}
        />
      </View>
      <PayoutSaveFooter
        saving={saving}
        submitLabel="Save changes"
        onPress={() => void onSave()}
      />
    </View>
  );
}
