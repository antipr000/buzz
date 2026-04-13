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
import { useDeactivateAccount } from '@/hooks/api';
import { useAuth } from '@/providers/AuthProvider';

export function DeactivateAccountDialog({ children }: { children: ReactNode }) {
    const { signOut } = useAuth();
    const { mutateAsync, isPending } = useDeactivateAccount();
    const [open, setOpen] = useState(false);

    const onConfirmDeactivate = useCallback(async () => {
        if (isPending) return;
        try {
            await mutateAsync();
        } catch {
            Alert.alert('Could not deactivate account', 'Please try again.');
            return;
        }
        try {
            await signOut();
        } catch {
            Alert.alert(
                'Account deactivated',
                'We could not sign you out on this device. Close the app or try signing out again.',
            );
        }
        setOpen(false);
    }, [isPending, mutateAsync, signOut]);

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                {children}
            </AlertDialogTrigger>
            <AlertDialogContent className='w-[80%] max-w-[320px] self-center flex-col items-center justify-center gap-4 p-6 py-5 rounded-xl'>
                <AlertDialogHeader className='items-center justify-center gap-2'>
                    <Text className='text-center text-[13px] text-[rgba(15,23,42,0.9)] font-semibold'>Deactivate your account?</Text>
                    <Text className='text-center text-[11px] text-[rgba(15,23,42,0.6)] font-regular px-2'>We will deactivate your account and sign you out. You will not be able to use the app with this account.</Text>
                </AlertDialogHeader>
                <AlertDialogFooter className='flex-col items-center justify-center w-full mt-2'>
                    <AlertDialogAction
                        className='bg-[rgba(255,20,20,1)] rounded-md px-3 py-1.5 h-auto opacity-100'
                        disabled={isPending}
                        onPress={onConfirmDeactivate}
                    >
                        <Text className='text-white text-xs'>
                            {isPending ? 'Deactivating…' : 'Deactivate account'}
                        </Text>
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
