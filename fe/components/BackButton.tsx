import { TouchableOpacity, TouchableOpacityProps } from 'react-native'
import React from 'react'
import { ChevronLeft } from 'lucide-react-native'
import { router } from 'expo-router'

interface BackButtonProps extends TouchableOpacityProps {
    size?: number;
    color?: string;
}

const BackButton = ({ size = 15, color = "rgba(29, 27, 32, 1)", className, ...props }: BackButtonProps) => {
    return (
        <TouchableOpacity
            onPress={() => router.back()}
            className={`px-2 -ml-2 ${className || ''}`}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            {...props}
        >
            <ChevronLeft size={size} color={color} />
        </TouchableOpacity>
    )
}

export default BackButton
