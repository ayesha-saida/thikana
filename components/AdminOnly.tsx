import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Full-screen gate for admin-only screens (deep links, role changes).
export default function AdminOnly({ message }: { message: string }) {
  const router = useRouter();

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/(root)/(tabs)");
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1 items-center justify-center px-8">
        <View className="w-20 h-20 bg-red-50 rounded-full items-center justify-center mb-4">
          <Ionicons name="lock-closed-outline" size={36} color="#EF4444" />
        </View>
        <Text className="text-gray-700 text-lg font-bold mb-1 text-center">
          Admins only
        </Text>
        <Text className="text-gray-400 text-sm text-center mb-6">
          {message}
        </Text>
        <TouchableOpacity
          onPress={handleBack}
          className="bg-blue-600 px-6 py-3 rounded-2xl"
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
