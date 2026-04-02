import { View, ActivityIndicator, Alert } from "react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Text } from "@/components/ui/text";
import { useRouter } from "expo-router";
import { useAddress, usePatchAddress } from "@/hooks/api";
import { useIndiaPincodeLookup } from "@/hooks/useIndiaPincodeLookup";
import { normalizeIndiaPinInput } from "@/lib/pincode/indiaZippopotam";
import type { AddressPatchPayload } from "@/services/types/address";
import {
  buildValidatedPayload,
  emptyAddressForm,
  formStateFromAddressOut,
  type AddressFormState,
} from "@/components/address/addressFormModel";
import { AddressFormFields } from "@/components/address/AddressFormFields";
import { AddressSaveFooter } from "@/components/address/AddressSaveFooter";

type EditAddressFormProps = {
  addressId: string;
};

/**
 * Edit existing address: load row, fill form once, PIN lookup does not overwrite
 * until the user edits the PIN, Save → PATCH /user/addresses/{id}, then go back.
 */
export default function EditAddressForm({ addressId }: EditAddressFormProps) {
  const router = useRouter();
  const hydratedForId = useRef<string | null>(null);
  const skipPinLookupPrefill = useRef(false);

  const {
    data: addressRow,
    isPending: addressLoadPending,
    isError: addressLoadError,
  } = useAddress(addressId);

  const [form, setForm] = useState<AddressFormState>(emptyAddressForm);
  const update = useCallback((partial: Partial<AddressFormState>) => {
    setForm((prev) => ({ ...prev, ...partial }));
  }, []);

  const pinLookup = useIndiaPincodeLookup(form.pinCode);
  const patchMutation = usePatchAddress();

  useEffect(() => {
    if (!addressRow || addressRow.id !== addressId) return;
    if (hydratedForId.current === addressId) return;

    skipPinLookupPrefill.current = true;
    setForm(formStateFromAddressOut(addressRow));
    hydratedForId.current = addressId;
  }, [addressId, addressRow]);

  useEffect(() => {
    if (pinLookup.status !== "ok") return;
    if (skipPinLookupPrefill.current) return;
    update({
      state: pinLookup.data.state,
      country: pinLookup.data.country,
      city: pinLookup.data.localityHint ?? "",
    });
  }, [pinLookup, update]);

  const onPinChange = (text: string) => {
    skipPinLookupPrefill.current = false;
    update({ pinCode: normalizeIndiaPinInput(text) });
  };

  const onSave = async () => {
    if (addressLoadPending) {
      Alert.alert("Please wait", "Still loading this address.");
      return;
    }
    if (addressLoadError || !addressRow) {
      Alert.alert(
        "Could not load",
        "This address could not be loaded. Try going back."
      );
      return;
    }

    const body = buildValidatedPayload(form);
    if (!body) return;

    try {
      const patch: AddressPatchPayload = { ...body };
      await patchMutation.mutateAsync({ addressId, patch });
      router.back();
    } catch {
      Alert.alert("Could not save", "Please try again.");
    }
  };

  const saving = patchMutation.isPending;

  if (addressLoadPending) {
    return (
      <View className="flex-1 items-center justify-center pt-8">
        <ActivityIndicator size="large" color="#64748B" />
      </View>
    );
  }

  if (addressLoadError) {
    return (
      <View className="flex-1 items-center justify-center px-6 pt-8">
        <Text className="text-center text-[13px] text-[#64748B]">
          Could not load this address. Go back and try again.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <View className="flex-1 pt-4">
        <AddressFormFields
          form={form}
          update={update}
          onPinChange={onPinChange}
          pinLookup={pinLookup}
          saving={saving}
        />
      </View>
      <AddressSaveFooter saving={saving} onPress={() => void onSave()} />
    </View>
  );
}
