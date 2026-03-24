import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Text } from "@/components/ui/text"
import { Image } from 'expo-image'
import { Link } from "expo-router"
import React, { useState } from 'react'
import { ScrollView, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const SignUpScreen = () => {
  const [checked, setChecked] = useState(false)

  return (
    <SafeAreaView className='flex-1 bg-background'>
      <ScrollView
        contentContainerClassName='flex-grow items-center justify-center px-8'
        keyboardShouldPersistTaps='handled'
        automaticallyAdjustKeyboardInsets={true}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <Image
          source={require("@/assets/images/top.svg")}
          contentFit="contain"
          style={{ width: 60, height: 63 }}
        />

        {/* Title */}
        <Text className='text-secondary text-xl font-medium mt-2 mb-7'>
          Get Started Now
        </Text>

        {/* Full Name */}
        <View className='w-full mb-3'>
          <View className='flex flex-row items-center gap-2 mb-1.5'>
            <Image
              source={require("@/assets/images/user.svg")}
              contentFit="contain"
              style={{ width: 15, height: 15 }}
            />
            <Text className='text-xs font-medium text-secondary-foreground'>Full Name</Text>
          </View>
          <Input placeholder="John Smith" className="h-10 text-xs placeholder:text-[rgba(10,13,26,0.3)]" />
        </View>

        {/* Email */}
        <View className='w-full mb-3'>
          <View className='flex flex-row items-center gap-2 mb-1.5'>
            <Image
              source={require("@/assets/images/email.svg")}
              contentFit="contain"
              style={{ width: 15, height: 15 }}
            />
            <Text className='text-xs font-medium text-secondary-foreground'>Email</Text>
          </View>
          <Input
            placeholder="you@gmail.com"
            keyboardType="email-address"
            autoCapitalize="none"
            className="h-10 text-xs placeholder:text-[rgba(10,13,26,0.3)]"
          />
        </View>

        {/* Password */}
        <View className='w-full mb-3'>
          <View className='flex flex-row items-center gap-2 mb-1.5'>
            <Image
              source={require("@/assets/images/lock.svg")}
              contentFit="contain"
              style={{ width: 15, height: 15 }}
            />
            <Text className='text-xs font-medium text-secondary-foreground'>Password</Text>
          </View>
          <Input
            placeholder="••••••••••"
            secureTextEntry
            className="h-10 text-xs placeholder:text-[rgba(10,13,26,0.3)]"
          />
        </View>

        {/* Confirm Password */}
        <View className='w-full mb-4'>
          <View className='flex flex-row items-center gap-2 mb-1.5'>
            <Image
              source={require("@/assets/images/lock.svg")}
              contentFit="contain"
              style={{ width: 15, height: 15 }}
            />
            <Text className='text-xs font-bold text-secondary-foreground'>Confirm Password</Text>
          </View>
          <Input
            placeholder="••••••••••"
            secureTextEntry
            className="h-10 text-xs placeholder:text-[rgba(10,13,26,0.3)]"
          />
        </View>

        {/* Terms Checkbox */}
        <View className='flex flex-row items-center gap-2 w-full mb-6'>
          <Checkbox checked={checked} onCheckedChange={setChecked} className="rounded-sm w-4 h-4" />
          <Text className='text-[11px] text-muted-foreground'>
            I have agreed to the terms and conditions
          </Text>
        </View>

        {/* Sign Up Button */}
        <TouchableOpacity activeOpacity={0.8} className='w-full rounded-xl h-11 mb-4 bg-primary items-center justify-center'>
          <Text className='text-primary-foreground text-sm font-medium'>Sign up</Text>
        </TouchableOpacity>

        {/* OR Divider */}
        <Text className='text-secondary-foreground text-xs font-bold mb-4'>OR</Text>

        {/* Google Sign In */}
        <TouchableOpacity activeOpacity={0.8} className='w-full border rounded-xl h-11 border-primary bg-background mb-4 flex-row items-center justify-center gap-2'>
          <Image
            source={require("@/assets/images/google.svg")}
            contentFit="contain"
            style={{ width: 15, height: 15 }}
          />
          <Text className='text-primary text-sm font-medium'>Sign in with Google</Text>
        </TouchableOpacity>

        {/* Already have account */}
        <View className='flex flex-row items-center mb-6'>
          <Text className='text-xs text-muted-foreground'>Already have an account? </Text>
          <Link href={"/login" as any} asChild>
            <Text className='text-xs text-primary font-medium'>Sign in</Text>
          </Link>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default SignUpScreen