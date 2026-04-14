import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { getAuthRedirectUri } from "@/lib/auth/auth-redirect";
import { signInWithGoogle } from "@/lib/auth/google-oauth";
import { getSupabase } from "@/lib/auth/supabase";
import { verifyAppUserOrSignOut } from "@/lib/auth/verify-app-user";
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

const MIN_PASSWORD_LEN = 6;

const DUPLICATE_EMAIL_MSG =
  "An account with this email already exists. Try signing in.";

const SignUpScreen = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationEmail, setVerificationEmail] = useState<string | null>(null);

  const onSignUp = async () => {
    setError(null);
    setVerificationEmail(null);

    const name = fullName.trim();
    const mail = email.trim();

    if (!name || !mail || !password) {
      setError("Please fill in all fields.");
      return;
    }
    if (!termsAccepted) {
      setError("Please accept the terms and conditions.");
      return;
    }
    if (password.length < MIN_PASSWORD_LEN) {
      setError(`Password must be at least ${MIN_PASSWORD_LEN} characters.`);
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    let supabase: ReturnType<typeof getSupabase>;
    try {
      supabase = getSupabase();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Supabase is not configured.");
      return;
    }

    setSubmitting(true);
    try {
      const emailRedirectTo = getAuthRedirectUri();

      const { data, error: authError } = await supabase.auth.signUp({
        email: mail,
        password,
        options: {
          emailRedirectTo,
          data: {
            full_name: name,
            name,
          },
        },
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      if (data.session) {
        router.replace("/location");
        return;
      }

      if (data.user?.identities?.length === 0) {
        setError(DUPLICATE_EMAIL_MSG);
        return;
      }

      setPassword("");
      setConfirmPassword("");
      setVerificationEmail(mail);
    } finally {
      setSubmitting(false);
    }
  };

  const onGoogleSignUp = async () => {
    setError(null);
    if (!termsAccepted) {
      setError("Please accept the terms and conditions.");
      return;
    }
    setGoogleSubmitting(true);
    try {
      const result = await signInWithGoogle();
      if (result.status === "cancelled") {
        return;
      }
      if (result.status !== "success") {
        setError(result.message);
        return;
      }
      let supabase: ReturnType<typeof getSupabase>;
      try {
        supabase = getSupabase();
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "Not configured."
        );
        return;
      }
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        setError("Could not start your session. Please try again.");
        return;
      }
      const verified = await verifyAppUserOrSignOut(supabase);
      if (!verified.ok) {
        setError(verified.message);
        return;
      }
      router.replace("/location");
    } finally {
      setGoogleSubmitting(false);
    }
  };

  const clearVerificationFlow = () => {
    setVerificationEmail(null);
    setError(null);
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
          {verificationEmail ? "Check your email" : "Get Started Now"}
        </Text>

        {error ? (
          <Text className="text-destructive text-center text-xs w-full mb-3">{error}</Text>
        ) : null}

        {verificationEmail ? (
          <View className="w-full mb-6">
            <Text className="text-secondary-foreground text-center text-sm leading-5 mb-2">
              We sent a verification link to{" "}
              <Text className="font-semibold text-foreground">{verificationEmail}</Text>.
              Open the link to confirm your account, then sign in.
            </Text>
            <Text className="text-muted-foreground text-center text-xs leading-5 mb-6">
              Check your spam folder if you do not see it.
            </Text>
            <Link href="/login" asChild>
              <TouchableOpacity activeOpacity={0.8} className="w-full rounded-xl h-11 mb-3 border border-primary items-center justify-center">
                <Text className="text-primary text-sm font-medium">Go to sign in</Text>
              </TouchableOpacity>
            </Link>
            <TouchableOpacity
              onPress={clearVerificationFlow}
              activeOpacity={0.7}
              className="w-full min-h-11 py-3 justify-center items-center"
            >
              <Text className="text-center text-xs text-muted-foreground">
                Use a different email
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {!verificationEmail ? (
        <>
        <View className="w-full mb-3">
          <View className="flex flex-row items-center gap-2 mb-1.5">
            <Image
              source={require("@/assets/images/user.svg")}
              contentFit="contain"
              style={{ width: 15, height: 15 }}
            />
            <Text className="text-xs font-medium text-secondary-foreground">
              Full Name
            </Text>
          </View>
          <Input
            placeholder="John Smith"
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
            className="h-10 text-xs placeholder:text-[rgba(10,13,26,0.3)]"
          />
        </View>

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

        <View className="w-full mb-3">
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

        <View className="w-full mb-4">
          <View className="flex flex-row items-center gap-2 mb-1.5">
            <Image
              source={require("@/assets/images/lock.svg")}
              contentFit="contain"
              style={{ width: 15, height: 15 }}
            />
            <Text className="text-xs font-bold text-secondary-foreground">
              Confirm Password
            </Text>
          </View>
          <Input
            placeholder="••••••••••"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            className="h-10 text-xs placeholder:text-[rgba(10,13,26,0.3)]"
          />
        </View>

        <View className="flex flex-row items-center gap-2 w-full mb-6">
          <Checkbox
            checked={termsAccepted}
            onCheckedChange={(v) => setTermsAccepted(v === true)}
            className="rounded-sm w-4 h-4"
          />
          <Text className="text-[11px] text-muted-foreground">
            I have agreed to the terms and conditions
          </Text>
        </View>

        <TouchableOpacity
          onPress={onSignUp}
          disabled={submitting || googleSubmitting}
          activeOpacity={0.8}
          className="w-full rounded-xl h-11 mb-4 bg-primary items-center justify-center"
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-primary-foreground text-sm font-medium">
              Sign up
            </Text>
          )}
        </TouchableOpacity>

        <Text className="text-secondary-foreground text-xs font-bold mb-4">
          OR
        </Text>

        <TouchableOpacity
          onPress={onGoogleSignUp}
          disabled={submitting || googleSubmitting}
          activeOpacity={0.8}
          className="w-full border rounded-xl h-11 border-primary bg-background mb-4 flex-row items-center justify-center gap-2"
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
          <Text className="text-xs text-muted-foreground">
            Already have an account?{" "}
          </Text>
          <Link href="/login" asChild>
            <Text className="text-xs text-primary font-medium">Sign in</Text>
          </Link>
        </View>
        </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignUpScreen;
