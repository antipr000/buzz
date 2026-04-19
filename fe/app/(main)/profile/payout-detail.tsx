import { View } from "react-native";
import React from "react";
import AddPayoutForm from "@/components/payout/AddPayoutForm";
import PageLayout from "@/components/layout/PageLayout";

const PayoutDetail = () => {
  return (
    <PageLayout title="Add payout account" scrollEnabled={false} contentContainerStyle={{ padding: 0 }}>
      <View className="flex-1">
        <AddPayoutForm key="new" withSaveFooter />
      </View>
    </PageLayout>
  );
};

export default PayoutDetail;
