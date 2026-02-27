import { View } from 'react-native';
import React, { useEffect } from 'react';
import { Text } from '@/components/ui/text';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const EventCreated = () => {
    const router = useRouter();

    useEffect(() => {
        //Automatically dismiss the flow and redirect to tabs after 3 seconds
        const timer = setTimeout(() => {
            router.dismissAll();
            router.replace('/(tabs)');
        }, 3000);
        return () => clearTimeout(timer);
    }, [router]);

    return (
        <SafeAreaView className='flex-1 bg-background items-center justify-center'>
            <View className='items-center justify-center mb-4 -mt-16'>
                <Image
                    source={require('@/assets/images/create/img.gif')}
                    style={{ width: 250, height: 250 }}
                    contentFit='contain'
                />
            </View>
            <Text className='text-primary font-semibold text-2xl '>
                Event Created
            </Text>
        </SafeAreaView>
    );
};

export default EventCreated;
