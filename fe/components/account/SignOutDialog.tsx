import { useCallback, useState, type ReactNode } from 'react';
import { Text } from '@/components/ui/text';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/providers/AuthProvider';

export function SignOutDialog({ children }: { children: ReactNode }) {
    const { signOut } = useAuth();
    const [isSigningOut, setIsSigningOut] = useState(false);

    const onConfirmSignOut = useCallback(async () => {
        if (isSigningOut) return;
        setIsSigningOut(true);
        try {
            await signOut();
        } finally {
            setIsSigningOut(false);
        }
    }, [isSigningOut, signOut]);

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                {children}
            </AlertDialogTrigger>
            <AlertDialogContent className='w-[80%] max-w-[370px] self-center flex-col items-center justify-center gap-6 p-6 py-5 rounded-xl'>
                <AlertDialogHeader className='items-center justify-center'>
                    <Text className='text-center text-xs text-[rgba(15,23,42,0.7)] font-medium'>Are you sure you want to Sign out?</Text>
                </AlertDialogHeader>
                <AlertDialogFooter className='flex-col items-center justify-center w-full'>
                    <AlertDialogAction
                        className='bg-[rgba(255,20,20,1)] rounded-md px-2 py-1 h-auto opacity-100'
                        disabled={isSigningOut}
                        onPress={onConfirmSignOut}
                    >
                        <Text className='text-white text-xs'>
                            {isSigningOut ? 'Signing out…' : 'Sign out'}
                        </Text>
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
