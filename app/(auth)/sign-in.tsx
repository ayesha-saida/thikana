import { supabase } from "@/lib/supabase";
import { Link, router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

interface FormErrors {
  email?: string;
  password?: string;
}

export default function SignInScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!EMAIL_REGEX.test(email.trim())) {
      newErrors.email = "Enter a valid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < MIN_PASSWORD_LENGTH) {
      newErrors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSignInPress = async () => {
    if (!validate()) return;

    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        Alert.alert("Sign In Failed", error.message);
        return;
      }

      router.replace("/(root)/(tabs)");
    } catch {
      Alert.alert("Error", "Sign in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white px-6">
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      className="bg-white"
      keyboardShouldPersistTaps="handled"
    >
      <View className="flex-1 justify-center items-center bg-white px-6">
        <Image
          source={require("../../assets/images/thikana.jpg")}
          className="w-36 h-16 mb-8"
          resizeMode="contain"
        />
        <Text className="text-2xl font-bold text-gray-800 mb-2">
          Welcome back
        </Text>
        <Text className="text-gray-500 mb-8">Sign in to your account</Text>

        <View className="w-full mb-1">
          <TextInput
            className="border border-gray-300 rounded-xl px-4 py-3"
            placeholder="Email address"
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={(v) => {
              setEmail(v);
              if (errors.email) setErrors({ ...errors, email: undefined });
            }}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {errors.email && (
            <Text className="text-red-500 text-xs mt-1 ml-1">
              {errors.email}
            </Text>
          )}
        </View>

        <View className="w-full mb-6">
          <TextInput
            className="border border-gray-300 rounded-xl px-4 py-3"
            placeholder="Password"
            placeholderTextColor="#9CA3AF"
            value={password}
            onChangeText={(v) => {
              setPassword(v);
              if (errors.password)
                setErrors({ ...errors, password: undefined });
            }}
            secureTextEntry
          />
          {errors.password && (
            <Text className="text-red-500 text-xs mt-1 ml-1">
              {errors.password}
            </Text>
          )}
        </View>

        <TouchableOpacity
          onPress={onSignInPress}
          disabled={loading}
          className="w-full bg-blue-600 py-4 rounded-xl items-center mb-4"
        >
          <Text className="text-white font-bold text-base">Sign In</Text>
        </TouchableOpacity>

        <View className="flex-row justify-center">
          <Text className="text-gray-500">
            Don&apos;t have an account?{" "}
            <Link href="/sign-up">
              <Text className="text-blue-600 font-semibold">Sign Up</Text>
            </Link>
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
