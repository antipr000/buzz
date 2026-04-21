import { Alert, View } from "react-native";
import React, { useCallback, useState } from "react";
import { useRouter } from "expo-router";
import { useCreatePayout, usePayouts } from "@/hooks/api";
import {
  buildValidatedPayload,
  emptyPayoutForm,
  type PayoutFormState,
} from "@/components/payout/payoutFormModel";
import { PayoutFormFields } from "@/components/payout/PayoutFormFields";
import { PayoutSaveFooter } from "@/components/payout/PayoutSaveFooter";

type AddPayoutFormProps = {
  withSaveFooter?: boolean;
};

/**
 * New payout account. With `withSaveFooter`, Save → POST /user/payouts, then go back.
 */
export default function AddPayoutForm({ withSaveFooter = false }: AddPayoutFormProps) {
  const router = useRouter();

  const [form, setForm] = useState<PayoutFormState>(() => emptyPayoutForm());
  const update = useCallback((partial: Partial<PayoutFormState>) => {
    setForm((prev) => ({ ...prev, ...partial }));
  }, []);

  const { data: existingPayouts } = usePayouts();
  // Server forces primary when user has no accounts yet; hide toggle in that case.
  const isFirstAccount = Array.isArray(existingPayouts) && existingPayouts.length === 0;

  const createMutation = useCreatePayout();

  const onSave = async () => {
    const body = buildValidatedPayload(form);
    if (!body) return;
    if (isFirstAccount) body.is_primary = true;
    try {
      await createMutation.mutateAsync(body);
      router.back();
    } catch {
      Alert.alert("Could not save", "Please try again.");
    }
  };

  const saving = createMutation.isPending;

  return (
    <View className="flex-1">
      <View className="flex-1 pt-4">
        <PayoutFormFields
          form={form}
          update={update}
          saving={withSaveFooter && saving}
          forcePrimary={isFirstAccount}
        />
      </View>
      {withSaveFooter ? (
        <PayoutSaveFooter saving={saving} onPress={() => void onSave()} />
      ) : null}
    </View>
  );
}
