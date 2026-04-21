import {
  View,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import React, { useState } from "react";
import { Link, router } from "expo-router";
import { Text } from "@/components/ui/text";
import { ChevronRight, MoreVertical } from "lucide-react-native";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { savedPayoutSummary } from "@/components/payout/savedPayoutSummary";
import { useDeletePayout, usePatchPayout } from "@/hooks/api";
import type { PayoutOut } from "@/services/types/payout";
import type { UseQueryResult } from "@tanstack/react-query";

const DELETE_PAYOUT_DIALOG_SURFACE =
  "w-[80vw] self-center gap-5 rounded-xl border border-[rgba(0,0,0,0.08)] bg-white p-6 shadow-lg shadow-black/10";

type ProfilePayoutAccountsSectionProps = {
  query: UseQueryResult<PayoutOut[], Error>;
};

export function ProfilePayoutAccountsSection({
  query,
}: ProfilePayoutAccountsSectionProps) {
  const { data, isPending, isError, isFetching, refetch } = query;
  const deleteMutation = useDeletePayout();
  const patchMutation = usePatchPayout();
  const [deleteTarget, setDeleteTarget] = useState<PayoutOut | null>(null);

  const onSetPrimary = (row: PayoutOut) => {
    void (async () => {
      try {
        await patchMutation.mutateAsync({
          payoutId: row.id,
          patch: { is_primary: true },
        });
      } catch {
        Alert.alert("Could not update", "Please try again.");
      }
    })();
  };

  return (
    <>
      <View className="mb-3">
        <Text className="mb-2 text-[12px] font-semibold text-secondary-foreground">
          Your payout accounts
        </Text>
        {isPending ? (
          <View className="mb-3 items-center py-3">
            <ActivityIndicator size="small" color="#64748B" />
          </View>
        ) : isError ? (
          <View className="mb-3 gap-2">
            <Text className="text-[11px] text-[#64748B]">
              Could not load payout accounts. Try again in a moment.
            </Text>
            <TouchableOpacity
              onPress={() => void refetch()}
              disabled={isFetching}
              className="self-start rounded-md border border-[rgba(0,0,0,0.15)] px-3 py-1.5 active:bg-[rgba(0,0,0,0.04)]"
            >
              <Text className="text-[11px] font-medium text-[#334155]">
                {isFetching ? "Retrying…" : "Retry"}
              </Text>
            </TouchableOpacity>
          </View>
        ) : data && data.length > 0 ? (
          <View className="mb-3 gap-2">
            {data.map((row) => (
              <View
                key={row.id}
                className="flex-row items-center rounded-md border border-[rgba(0,0,0,0.1)] pl-3 pr-1 py-2"
              >
                <View className="min-w-0 flex-1 pr-2">
                  <Text
                    className="text-[11px] text-secondary-foreground"
                    numberOfLines={1}
                  >
                    {row.account_holder_name}
                    {row.is_primary ? (
                      <Text className="text-[10px] font-medium text-primary">
                        {" "}
                        · Primary
                      </Text>
                    ) : null}
                  </Text>
                  <Text className="mt-0.5 text-[10px] text-[#64748B]" numberOfLines={2}>
                    {row.bank_name?.trim() ? `${row.bank_name.trim()} · ` : ""}
                    {row.ifsc_code} · ****{row.account_number_last4}
                    {row.account_type === "SAVINGS" ? " · Savings" : " · Current"}
                  </Text>
                </View>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Pressable
                      hitSlop={8}
                      className="h-9 w-9 items-center justify-center rounded-md active:bg-[rgba(0,0,0,0.06)]"
                      accessibilityLabel="Payout account actions"
                    >
                      <MoreVertical size={18} color="#334155" />
                    </Pressable>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onPress={() =>
                        router.push(
                          `/profile/payout-detail?payoutId=${encodeURIComponent(row.id)}`
                        )
                      }
                    >
                      <Text className="text-sm text-popover-foreground">Edit</Text>
                    </DropdownMenuItem>
                    {!row.is_primary ? (
                      <DropdownMenuItem
                        onPress={() => onSetPrimary(row)}
                        disabled={patchMutation.isPending}
                      >
                        <Text className="text-sm text-popover-foreground">
                          Set as primary
                        </Text>
                      </DropdownMenuItem>
                    ) : null}
                    <DropdownMenuItem
                      variant="destructive"
                      onPress={() => setDeleteTarget(row)}
                      disabled={deleteMutation.isPending}
                    >
                      <Text className="text-sm text-destructive">Delete</Text>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </View>
            ))}
          </View>
        ) : null}
        <Link href="/profile/payout-detail" asChild>
          <TouchableOpacity
            activeOpacity={0.7}
            className="h-9 flex-row items-center justify-between rounded-md border border-[rgba(0,0,0,0.1)] px-3"
          >
            <Text className="text-[11px] text-secondary-foreground">
              Add payout account
            </Text>
            <ChevronRight size={14} color="#0F172A" />
          </TouchableOpacity>
        </Link>
      </View>

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        {deleteTarget ? (
          <AlertDialogContent className={DELETE_PAYOUT_DIALOG_SURFACE}>
            <AlertDialogHeader className="items-center gap-1">
              <Text className="text-center text-[13px] font-semibold text-[#0F172A]">
                Delete payout account?
              </Text>
              <Text
                className="text-center text-[11px] leading-[16px] text-[rgba(15,23,42,0.65)]"
                numberOfLines={4}
              >
                {savedPayoutSummary(deleteTarget)}
              </Text>
            </AlertDialogHeader>
            <View className="w-full flex-col items-center gap-2 px-2">
              <AlertDialogCancel
                className="w-full"
                disabled={deleteMutation.isPending}
              >
                <Text className="text-center text-[12px] font-medium text-[#334155]">
                  Cancel
                </Text>
              </AlertDialogCancel>
              <AlertDialogAction
                className="w-full bg-red-500"
                disabled={deleteMutation.isPending}
                onPress={() => {
                  const row = deleteTarget;
                  if (!row) return;
                  void (async () => {
                    try {
                      await deleteMutation.mutateAsync(row.id);
                      setDeleteTarget(null);
                    } catch {
                      Alert.alert("Could not delete", "Please try again.");
                    }
                  })();
                }}
              >
                <Text className="text-center text-[12px] font-semibold text-white">
                  {deleteMutation.isPending ? "Deleting…" : "Delete"}
                </Text>
              </AlertDialogAction>
            </View>
          </AlertDialogContent>
        ) : null}
      </AlertDialog>
    </>
  );
}
