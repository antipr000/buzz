import { useCallback, useState, type ReactNode } from 'react';
import { Alert } from 'react-native';

import { Text } from '@/components/ui/text';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { removeOtherDevices } from '@/lib/api/devices';
import { getSupabase } from '@/lib/auth/supabase';

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
                await supabase.auth.signOut({ scope: 'others' });
            } catch (e) {
                console.error('Failed to sign out others', e);
            }
            await onSuccess();
        } catch {
            Alert.alert(
                'Something went wrong',
                'Could not log out other devices. Try again.',
            );
        } finally {
            setBusy(false);
        }
    }, [busy, deviceKey, onSuccess]);

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                {children}
            </AlertDialogTrigger>
            <AlertDialogContent className='w-[80vw] max-w-[370px] self-center flex-col items-center justify-center gap-6 p-6 py-5 rounded-xl'>
                <AlertDialogHeader className='items-center justify-center'>
                    <Text className='text-center text-xs text-[rgba(15,23,42,0.7)] font-medium'>
                        Sign out other devices? This device stays signed in. On other devices, signing out might take some time.
                    </Text>
                </AlertDialogHeader>
                <AlertDialogFooter className='flex-col items-center justify-center w-full'>
                    <AlertDialogAction
                        className='bg-[rgba(255,20,20,1)] rounded-md px-2 py-1 h-auto opacity-100'
                        disabled={busy}
                        onPress={onConfirm}
                    >
                        <Text className='text-white text-xs'>
                            {busy ? 'Logging out…' : 'Log out others'}
                        </Text>
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
