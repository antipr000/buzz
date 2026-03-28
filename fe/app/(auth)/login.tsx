import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { signInWithGoogle } from "@/lib/google-oauth";
import { getSupabase } from "@/lib/supabase";
import { Image } from "expo-image";
import { Link, router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [keepSignedIn, setKeepSignedIn] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSignIn = async () => {
    setError(null);
    const trimmed = email.trim();
    if (!trimmed || !password) {
      setError("Please enter email and password.");
      return;
    }

    let supabase: ReturnType<typeof getSupabase>;
    try {
      supabase = getSupabase();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Supabase is not configured."
      );
      return;
    }

    setSubmitting(true);
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: trimmed,
        password,
      });
      if (authError) {
        // check implementation 
        const msg = authError.message ?? "";
        if (/email not confirmed/i.test(msg)) {
          setError(
            "Confirm your email using the link we sent you, then try signing in again."
          );
        } else {
          setError(msg);
        }
        return;
      }
      router.replace("/location");
    } finally {
      setSubmitting(false);
    }
  };

  const onGoogleSignIn = async () => {
    setError(null);
    setGoogleSubmitting(true);
    try {
      const result = await signInWithGoogle();
      if (result.status === "success") {
        router.replace("/location");
        return;
      }
      if (result.status === "cancelled") {
        return;
      }
      setError(result.message);
    } finally {
      setGoogleSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        contentContainerClassName="flex-grow items-center justify-center px-8"
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets={true}
        showsVerticalScrollIndicator={false}
      >
        <Image
          source={require("@/assets/images/top.svg")}
          contentFit="contain"
          style={{ width: 60, height: 63 }}
        />

        <Text className="text-secondary text-xl font-medium mt-2 mb-7">
          Welcome Back
        </Text>

        {error ? (
          <Text className="text-destructive text-center text-xs w-full mb-3">{error}</Text>
        ) : null}

        <View className="w-full mb-3">
          <View className="flex flex-row items-center gap-2 mb-1.5">
            <Image
              source={require("@/assets/images/email.svg")}
              contentFit="contain"
              style={{ width: 15, height: 15 }}
            />
            <Text className="text-xs font-medium text-secondary-foreground">
              Email
            </Text>
          </View>
          <Input
            placeholder="you@gmail.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            value={email}
            onChangeText={setEmail}
            className="h-10 text-xs placeholder:text-[rgba(10,13,26,0.3)]"
          />
        </View>

        <View className="w-full mb-4">
          <View className="flex flex-row items-center gap-2 mb-1.5">
            <Image
              source={require("@/assets/images/lock.svg")}
              contentFit="contain"
              style={{ width: 15, height: 15 }}
            />
            <Text className="text-xs font-medium text-secondary-foreground">
              Password
            </Text>
          </View>
          <Input
            placeholder="••••••••••"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            className="h-10 text-xs placeholder:text-[rgba(10,13,26,0.3)]"
          />
        </View>

        <View className="flex flex-row items-center gap-2 w-full mb-6">
          <Checkbox
            checked={keepSignedIn}
            onCheckedChange={(v) => setKeepSignedIn(v === true)}
            className="rounded-sm w-4 h-4"
          />
          <Text className="text-[11px] text-muted-foreground">
            Keep me signed in
          </Text>
        </View>

        <TouchableOpacity
          onPress={onSignIn}
          disabled={submitting || googleSubmitting}
          activeOpacity={0.8}
          className="w-full rounded-xl h-11 mb-4 bg-primary items-center justify-center"
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-primary-foreground text-sm font-medium">
              Sign in
            </Text>
          )}
        </TouchableOpacity>

        <Text className="text-secondary-foreground text-xs font-bold mb-4">
          OR
        </Text>

        <TouchableOpacity
          onPress={onGoogleSignIn}
          disabled={submitting || googleSubmitting}
          activeOpacity={0.8}
          className="w-full rounded-xl h-11 border border-primary bg-background mb-4 flex-row items-center justify-center gap-2"
        >
          {googleSubmitting ? (
            <ActivityIndicator />
          ) : (
            <>
              <Image
                source={require("@/assets/images/google.svg")}
                contentFit="contain"
                style={{ width: 15, height: 15 }}
              />
              <Text className="text-primary text-sm font-medium">
                Sign in with Google
              </Text>
            </>
          )}
        </TouchableOpacity>

        <View className="flex flex-row items-center mb-6">
          <Text className="text-xs text-muted-foreground opacity-60">
            Don&apos;t have an account?{" "}
          </Text>
          <Link href="/signup" asChild>
            <Text className="text-xs text-primary font-medium">Sign up</Text>
          </Link>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default LoginScreen;
