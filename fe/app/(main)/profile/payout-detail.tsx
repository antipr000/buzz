import { View } from "react-native";
import React from "react";
import AddPayoutForm from "@/components/payout/AddPayoutForm";
import EditPayoutForm from "@/components/payout/EditPayoutForm";
import PageLayout from "@/components/layout/PageLayout";
import { useLocalSearchParams } from "expo-router";

function normalizeParam(v: string | string[] | undefined): string | undefined {
  const raw = typeof v === "string" ? v : v?.[0];
  const t = raw?.trim();
  return t || undefined;
}

const PayoutDetail = () => {
  const { payoutId: rawPayoutId } = useLocalSearchParams<{
    payoutId?: string | string[];
  }>();
  const payoutId = normalizeParam(rawPayoutId);

  const title = payoutId ? "Edit payout account" : "Add payout account";

  return (
    <PageLayout title={title} scrollEnabled={false} contentContainerStyle={{ padding: 0 }}>
      <View className="flex-1">
        {payoutId ? (
          <EditPayoutForm payoutId={payoutId} key={payoutId} />
        ) : (
          <AddPayoutForm key="new" withSaveFooter />
        )}
      </View>
    </PageLayout>
  );
};

export default PayoutDetail;
