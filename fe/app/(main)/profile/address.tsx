import { View } from "react-native";
import React from "react";
import AddAddressForm from "@/components/address/AddAddressForm";
import EditAddressForm from "@/components/address/EditAddressForm";
import PageLayout from "@/components/layout/PageLayout";
import { useLocalSearchParams } from "expo-router";

function normalizeParam(v: string | string[] | undefined): string | undefined {
  const raw = typeof v === "string" ? v : v?.[0];
  const t = raw?.trim();
  return t || undefined;
}

const AddAddress = () => {
  const { addressId: rawAddressId } = useLocalSearchParams<{
    addressId?: string | string[];
  }>();
  const addressId = normalizeParam(rawAddressId);

  const title = addressId ? "Edit address" : "Add address";

  return (
    <PageLayout title={title} scrollEnabled={false} contentContainerStyle={{ padding: 0 }}>
      <View className="flex-1">
        {addressId ? (
          <EditAddressForm addressId={addressId} key={addressId} />
        ) : (
          <AddAddressForm key="new" withSaveFooter />
        )}
      </View>
    </PageLayout>
  );
};

export default AddAddress;
