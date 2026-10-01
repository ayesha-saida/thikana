import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
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
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export default function SignUpScreen() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [showVerifySent, setShowVerifySent] = useState(false);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

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

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSignUpPress = async () => {
    if (!validate()) return;

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            firstName: firstName.trim(),
            lastName: lastName.trim(),
          },
        },
      });

      if (error) {
        Alert.alert("Error", error.message);
        return;
      }

      if (data.session) {
        // Email confirmation is off — we're signed in already, go straight in
        router.replace("/(root)/(tabs)");
        return;
      }

      // Email confirmation is on — tell the user to verify first
      if (data.user) {
        setShowVerifySent(true);
      }
    } catch {
      Alert.alert("Error", "Sign up failed. Please try again.");
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

  if (showVerifySent) {
    return (
      <View className="flex-1 justify-center items-center bg-white px-6">
        <View className="w-20 h-20 bg-blue-50 rounded-full items-center justify-center mb-5">
          <Ionicons name="mail-outline" size={40} color="#2563EB" />
        </View>
        <Text className="text-2xl font-bold text-gray-800 mb-2">
          Check your email
        </Text>
        <Text className="text-gray-500 text-center mb-8">
          We sent a confirmation link to{" "}
          <Text className="font-semibold text-gray-700">{email.trim()}</Text>.
          Confirm your account, then sign in.
        </Text>

        <TouchableOpacity
          onPress={() => router.replace("/sign-in")}
          className="w-full bg-blue-600 py-4 rounded-xl items-center mb-4"
        >
          <Text className="text-white font-bold text-base">
            I have confirmed — Sign In
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setShowVerifySent(false)}>
          <Text className="text-blue-600 font-semibold">Back to Sign Up</Text>
        </TouchableOpacity>
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
          source={require("../../assets/images/thikana.png")}
          className="w-36 h-16 mb-8"
          resizeMode="contain"
        />

        <Text className="text-3xl font-bold text-gray-800 mb-2">
          Create account
        </Text>
        <Text className="text-gray-500 mb-8">Find your dream home today</Text>

        <View className="flex-row gap-3 mb-1">
          <View className="flex-1">
            <TextInput
              className="border border-gray-300 rounded-xl px-4 py-3"
              placeholder="First name"
              placeholderTextColor="#9CA3AF"
              value={firstName}
              onChangeText={(v) => {
                setFirstName(v);
                if (errors.firstName)
                  setErrors({ ...errors, firstName: undefined });
              }}
              autoCapitalize="words"
            />
            {errors.firstName && (
              <Text className="text-red-500 text-xs mt-1 ml-1">
                {errors.firstName}
              </Text>
            )}
          </View>
          <View className="flex-1">
            <TextInput
              className="border border-gray-300 rounded-xl px-4 py-3"
              placeholder="Last name"
              placeholderTextColor="#9CA3AF"
              value={lastName}
              onChangeText={(v) => {
                setLastName(v);
                if (errors.lastName)
                  setErrors({ ...errors, lastName: undefined });
              }}
              autoCapitalize="words"
            />
            {errors.lastName && (
              <Text className="text-red-500 text-xs mt-1 ml-1">
                {errors.lastName}
              </Text>
            )}
          </View>
        </View>

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

        <View className="w-full mb-1">
          <TextInput
            className="border border-gray-300 rounded-xl px-4 py-3"
            placeholder={`Password (min ${MIN_PASSWORD_LENGTH} characters)`}
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

        <View className="w-full mb-6">
          <TextInput
            className="border border-gray-300 rounded-xl px-4 py-3"
            placeholder="Confirm password"
            placeholderTextColor="#9CA3AF"
            value={confirmPassword}
            onChangeText={(v) => {
              setConfirmPassword(v);
              if (errors.confirmPassword)
                setErrors({ ...errors, confirmPassword: undefined });
            }}
            secureTextEntry
          />
          {errors.confirmPassword && (
            <Text className="text-red-500 text-xs mt-1 ml-1">
              {errors.confirmPassword}
            </Text>
          )}
        </View>

        <TouchableOpacity
          onPress={onSignUpPress}
          disabled={loading}
          className="w-full bg-blue-600 py-4 rounded-xl items-center mb-4"
        >
          <Text className="text-white font-bold text-base">Sign Up</Text>
        </TouchableOpacity>

        <View className="flex-row justify-center">
          <Text className="text-gray-500">
            Already have an account?{" "}
            <Link href="/sign-in">
              <Text className="text-blue-600 font-semibold">Sign In</Text>
            </Link>
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
