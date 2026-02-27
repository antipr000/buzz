import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { Image } from 'expo-image';

type Props = {
    onAnimationFinish: () => void;
};

export default function AnimatedSplashScreen({ onAnimationFinish }: Props) {
    const [showIcon, setShowIcon] = useState(false);

    useEffect(() => {
        setShowIcon(true);
        const t = setTimeout(onAnimationFinish, 1000);
        return () => clearTimeout(t);
    }, [onAnimationFinish]);

    return (
        <View style={styles.container} onLayout={() => SplashScreen.hideAsync().catch(() => { })}>
            {showIcon && (
                <View style={styles.iconContainer}>
                    <Image
                        source={require('../assets/images/icon.svg')}
                        style={styles.icon}
                        contentFit="contain"
                    />
                    <Text style={styles.brandText}>Buzz</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconContainer: {
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
    },
    icon: {
        width: 120,
        height: 120,
    },
    brandText: {
        fontSize: 28,
        fontFamily: 'Poppins_SemiBold',
        color: '#000',
        marginTop: 12,
    },
});
