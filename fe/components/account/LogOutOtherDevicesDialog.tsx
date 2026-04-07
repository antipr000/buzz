import { useCallback, useState, type ReactNode } from "react";
import { Alert } from "react-native";

import { Text } from "@/components/ui/text";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { getSupabase } from "@/lib/auth/supabase";
import { removeOtherDevices } from "@/lib/api/devices";

type Props = {
  children: ReactNode;
  deviceKey: string;
  onSuccess: () => void | Promise<void>;
};

export function LogOutOtherDevicesDialog({
  children,
  deviceKey,
  onSuccess,
}: Props) {
  const [busy, setBusy] = useState(false);

  const onConfirm = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    try {
      await removeOtherDevices(deviceKey);
      try {
        const supabase = getSupabase();
        await supabase.auth.signOut({ scope: "others" });
      } catch {
        // Env missing — backend rows still cleared
      }
      await onSuccess();
    } catch {
      Alert.alert(
        "Something went wrong",
        "Could not log out other devices. Try again.",
      );
    } finally {
      setBusy(false);
    }
  }, [busy, deviceKey, onSuccess]);

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent className="w-[80%] max-w-[370px] self-center flex-col items-center justify-center gap-6 p-6 py-5 rounded-xl">
        <AlertDialogHeader className="items-center justify-center gap-2">
          <Text className="text-center text-xs font-semibold text-foreground">
            Log out other devices?
          </Text>
          <Text className="text-center text-xs text-[rgba(15,23,42,0.7)] font-medium">
            You will be signed out on every other device. This device will stay
            signed in.
          </Text>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col items-center justify-center w-full gap-3">
          <AlertDialogCancel
            className="border border-border rounded-md px-2 py-1 h-auto w-full max-w-[240px]"
            disabled={busy}
          >
            <Text className="text-foreground text-xs">Cancel</Text>
          </AlertDialogCancel>
          <AlertDialogAction
            className="bg-[rgba(255,20,20,1)] rounded-md px-2 py-1 h-auto opacity-100 w-full max-w-[240px]"
            disabled={busy}
            onPress={onConfirm}
          >
            <Text className="text-white text-xs">
              {busy ? "Working…" : "Log out others"}
            </Text>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
