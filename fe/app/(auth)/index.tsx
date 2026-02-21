import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Text } from "@/components/ui/text"
import { Image } from 'expo-image'
import { Link } from "expo-router"
import React, { useState } from 'react'
import { ScrollView, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const SignUpScreen = () => {
  const [checked, setChecked] = useState(false)

  return (
    <SafeAreaView className='flex-1 bg-background'>
      <ScrollView
        contentContainerClassName='flex-grow items-center justify-center px-9'
        keyboardShouldPersistTaps='handled'
      >
        {/* Logo */}
        <Image
          source={require("@/assets/images/top.svg")}
          contentFit="contain"
          style={{ width: 70, height: 73 }}
        />

        {/* Title */}
        <Text className='text-secondary text-2xl font-semibold mt-4 mb-8'>
          Get Started Now
        </Text>

        {/* Full Name */}
        <View className='w-full mb-4'>
          <View className='flex flex-row items-center gap-2 mb-2'>
            <Image
              source={require("@/assets/images/user.svg")}
              contentFit="contain"
              style={{ width: 16, height: 16 }}
            />
            <Text className='text-sm font-medium text-secondary'>Full Name</Text>
          </View>
          <Input placeholder="John Smith" />
        </View>

        {/* Email */}
        <View className='w-full mb-4'>
          <View className='flex flex-row items-center gap-2 mb-2'>
            <Image
              source={require("@/assets/images/email.svg")}
              contentFit="contain"
              style={{ width: 16, height: 16 }}
            />
            <Text className='text-sm font-medium text-secondary'>Email</Text>
          </View>
          <Input
            placeholder="you@gmail.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Password */}
        <View className='w-full mb-4'>
          <View className='flex flex-row items-center gap-2 mb-2'>
            <Image
              source={require("@/assets/images/lock.svg")}
              contentFit="contain"
              style={{ width: 16, height: 16 }}
            />
            <Text className='text-sm font-medium text-secondary'>Password</Text>
          </View>
          <Input
            placeholder="••••••••••"
            secureTextEntry
          />
        </View>

        {/* Confirm Password */}
        <View className='w-full mb-4'>
          <View className='flex flex-row items-center gap-2 mb-2'>
            <Image
              source={require("@/assets/images/lock.svg")}
              contentFit="contain"
              style={{ width: 16, height: 16 }}
            />
            <Text className='text-sm font-medium text-secondary'>Confirm Password</Text>
          </View>
          <Input
            placeholder="••••••••••"
            secureTextEntry
          />
        </View>

        {/* Terms Checkbox */}
        <View className='flex flex-row items-center  gap-2 w-full mb-8'>
          <Checkbox checked={checked} onCheckedChange={setChecked} className="rounded-none" />
          <Text className='text-xs text-foreground'>
            I have read and agree to the terms and conditions
          </Text>
        </View>

        {/* Sign Up Button */}
        <Button className='w-full rounded-xl h-12 mb-4'>
          <Text className='text-primary-foreground text-base font-semibold'>Sign up</Text>
        </Button>

        {/* OR Divider */}
        <Text className='text-foreground text-sm font-medium mb-4'>OR</Text>

        {/* Google Sign In */}
        {/* fix the color change on press */}
        <Button variant="outline" className='w-full rounded-xl h-12  border-primary mb-5'>
          <Image
            source={require("@/assets/images/google.svg")}
            contentFit="contain"
            style={{ width: 16, height: 16 }}
          />
          <Text className='text-primary text-base font-semibold'>Sign in with Google</Text>
        </Button>

        {/* Already have account */}
        <View className='flex flex-row items-center'>
          <Text className='text-sm text-foreground'>Already have an account? </Text>
          <Link href="/login" asChild>
            <Text className='text-sm text-primary font-medium underline'>Sign in</Text>
          </Link>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default SignUpScreen