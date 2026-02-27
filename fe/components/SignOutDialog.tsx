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

export function SignOutDialog({ children }: { children: React.ReactNode }) {
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
                    <AlertDialogAction className='bg-[rgba(255,20,20,1)] rounded-md px-2 py-1 h-auto'>
                        <Text className='text-white text-xs'>Sign out</Text>
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
