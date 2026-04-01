import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import LottieView from 'lottie-react-native';
import * as SplashScreen from 'expo-splash-screen';
import { Asset } from 'expo-asset';
import { Image } from 'expo-image';

type Props = {
    onAnimationFinish: () => void;
};

export default function AnimatedSplashScreen({ onAnimationFinish }: Props) {
    const [source, setSource] = useState<string | null>(null);
    const [showIcon, setShowIcon] = useState(false);

    // Load .lottie file
    useEffect(() => {
        Asset.fromModule(require('../../assets/images/splash.lottie'))
            .downloadAsync()
            .then(asset => setSource(asset.localUri ?? null));
    }, []);

    // Fallback timeout
    useEffect(() => {
        const t = setTimeout(onAnimationFinish, 8000);
        return () => clearTimeout(t);
    }, [onAnimationFinish]);

    return (
        <View style={styles.container} onLayout={() => SplashScreen.hideAsync().catch(() => { })}>
            {!showIcon && source && (
                <LottieView
                    source={{ uri: source }}
                    autoPlay
                    loop={false}
                    speed={1}
                    renderMode="HARDWARE"
                    onAnimationFinish={() => {
                        setShowIcon(true);
                        setTimeout(onAnimationFinish, 1000);
                    }}
                    style={styles.animation}
                    resizeMode="cover"
                />
            )}
            {showIcon && (
                <View style={styles.iconContainer}>
                    <Image
                        source={require('../../assets/images/icon.svg')}
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
    animation: {
        width: '100%',
        height: '100%',
    },
    icon: {
        width: 120,
        height: 120,
    },
    iconContainer: {
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
    },
    brandText: {
        fontSize: 28,
        fontFamily: 'Poppins_SemiBold',
        color: '#000',
        marginTop: 12,
    },
});
