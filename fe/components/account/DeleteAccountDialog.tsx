import React from 'react';
import { Text } from '@/components/ui/text';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export function DeleteAccountDialog({ children }: { children: React.ReactNode }) {
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                {children}
            </AlertDialogTrigger>
            <AlertDialogContent className='w-[80%] max-w-[320px] self-center flex-col items-center justify-center gap-4 p-6 py-5 rounded-xl'>
                <AlertDialogHeader className='items-center justify-center gap-2'>
                    <Text className='text-center text-[13px] text-[rgba(15,23,42,0.9)] font-semibold'>Are you sure you want to delete your account?</Text>
                    <Text className='text-center text-[11px] text-[rgba(15,23,42,0.6)] font-regular px-2'>This action can not be undone. Your account and related data will be lost.</Text>
                </AlertDialogHeader>
                <AlertDialogFooter className='flex-col items-center justify-center w-full mt-2'>
                    <AlertDialogAction className='bg-[rgba(255,20,20,1)] rounded-md px-3 py-1.5 h-auto'>
                        <Text className='text-white text-xs'>Delete Account</Text>
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
