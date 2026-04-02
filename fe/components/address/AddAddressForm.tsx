import { Alert, View } from "react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "expo-router";
import { useCreateAddress, useProfileMe } from "@/hooks/api";
import { useIndiaPincodeLookup } from "@/hooks/useIndiaPincodeLookup";
import { normalizeIndiaPinInput } from "@/lib/pincode/indiaZippopotam";
import {
  buildValidatedPayload,
  emptyAddressForm,
  type AddressFormState,
} from "@/components/address/addressFormModel";
import { AddressFormFields } from "@/components/address/AddressFormFields";
import { AddressSaveFooter } from "@/components/address/AddressSaveFooter";

type AddAddressFormProps = {
  /** Profile screen: show Save bar and POST + router.back(). Event/checkout: omit (fields only). */
  withSaveFooter?: boolean;
  /** Checkout: parent reads live state (e.g. Proceed, clear saved selection). */
  onFormChange?: (form: AddressFormState) => void;
  /** Set to 0 when parent already pads horizontally (e.g. checkout `ScrollView`). */
  contentHorizontalPadding?: number;
};

/**
 * New address: prefill mobile/email from profile, PIN lookup can fill city/state.
 * With `withSaveFooter`, Save → POST /user/addresses, then go back.
 */
export default function AddAddressForm({
  withSaveFooter = false,
  onFormChange,
  contentHorizontalPadding = 16,
}: AddAddressFormProps) {
  const router = useRouter();
  const { data: profile } = useProfileMe();
  const hydratedProfileId = useRef<string | null>(null);
  const onFormChangeRef = useRef(onFormChange);
  onFormChangeRef.current = onFormChange;

  const [form, setForm] = useState<AddressFormState>(emptyAddressForm);
  const update = useCallback((partial: Partial<AddressFormState>) => {
    setForm((prev) => ({ ...prev, ...partial }));
  }, []);

  useEffect(() => {
    onFormChangeRef.current?.(form);
  }, [form]);

  const pinLookup = useIndiaPincodeLookup(form.pinCode);
  const createMutation = useCreateAddress();

  useEffect(() => {
    if (!profile) return;
    if (hydratedProfileId.current === profile.id) return;
    update({
      ...(profile.mobile_number ? { mobile: profile.mobile_number } : {}),
      ...(profile.email ? { email: profile.email } : {}),
    });
    hydratedProfileId.current = profile.id;
  }, [profile, update]);

  useEffect(() => {
    if (pinLookup.status !== "ok") return;
    update({
      state: pinLookup.data.state,
      country: pinLookup.data.country,
      city: pinLookup.data.localityHint ?? "",
    });
  }, [pinLookup, update]);

  const onPinChange = (text: string) => {
    update({ pinCode: normalizeIndiaPinInput(text) });
  };

  const onSave = async () => {
    const body = buildValidatedPayload(form);
    if (!body) return;
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
        <AddressFormFields
          form={form}
          update={update}
          onPinChange={onPinChange}
          pinLookup={pinLookup}
          saving={withSaveFooter && saving}
          contentHorizontalPadding={contentHorizontalPadding}
        />
      </View>
      {withSaveFooter ? (
        <AddressSaveFooter saving={saving} onPress={() => void onSave()} />
      ) : null}
    </View>
  );
}
