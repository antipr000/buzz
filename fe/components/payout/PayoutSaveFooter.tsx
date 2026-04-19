import { TouchableOpacity, View, ActivityIndicator } from "react-native";
import React from "react";
import { Text } from "@/components/ui/text";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type PayoutSaveFooterProps = {
  saving: boolean;
  onPress: () => void;
};

export function PayoutSaveFooter({ saving, onPress }: PayoutSaveFooterProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="absolute bottom-0 left-0 right-0 bg-white border-t border-[rgba(0,0,0,0.05)] px-4 py-3"
      style={{ paddingBottom: Math.max(insets.bottom, 12) }}
    >
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => {
          if (saving) return;
          onPress();
        }}
        disabled={saving}
        className={`bg-primary w-full h-[42px] rounded-lg items-center justify-center ${
          saving ? "opacity-60" : ""
        }`}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white font-semibold text-[13px]">Save account</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
