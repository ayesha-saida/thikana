import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Linking,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) setUserEmail(data.user.email);
    });
  }, []);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.replace("/sign-in");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleUpdateProfileImage = async () => {
    Alert.alert("Coming Soon", "Profile image update coming soon!");
  };

  return (
    <SafeAreaView className="flex-1 bg-white mb-10">
      {/* Avatar + Name */}
      <View className="items-center py-8">
        <View className="relative">
          <Image
            source={require("../../../assets/images/thikana.png")}
            style={{ width: 48, height: 48, marginBottom: 16 }}
          />
          <TouchableOpacity
            onPress={handleUpdateProfileImage}
            className="absolute bottom-3 right-0 bg-blue-600 rounded-full p-2"
          >
            <Ionicons name="camera" size={16} color="white" />
          </TouchableOpacity>
        </View>
        <Text className="text-xl font-bold text-gray-800">User</Text>
        {userEmail ? (
          <Text className="text-gray-500 mt-1">{userEmail}</Text>
        ) : null}
      </View>

      {/* Menu Items */}
      <View className="px-6 gap-2">
        <TouchableOpacity
          onPress={() => router.push("/(root)/(tabs)/saved")}
          className="flex-row items-center gap-4 bg-gray-50 px-4 py-4 rounded-2xl"
        >
          <Ionicons name="heart-outline" size={22} color="#6B7280" />
          <Text className="flex-1 text-gray-700 font-medium text-base">
            Saved Properties
          </Text>
          <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
        </TouchableOpacity>

        <MenuItem
          icon="notifications-outline"
          label="Notifications"
          onPress={() =>
            Alert.alert("Coming Soon", "Notifications coming soon!")
          }
        />

        <MenuItem
          icon="settings-outline"
          label="Settings"
          onPress={() => Alert.alert("Coming Soon", "Settings coming soon!")}
        />

        <MenuItem
          icon="help-circle-outline"
          label="Help & Support"
          onPress={() =>
            Linking.openURL(
              "mailto:storyofanavocado@gmail.com?subject=Help & Support - thikana App",
            )
          }
        />
      </View>

      {/* Sign Out */}
      <View className="px-6 mt-auto mb-8">
        <TouchableOpacity
          onPress={handleSignOut}
          className="flex-row items-center justify-center gap-2 bg-red-50 py-4 rounded-2xl border border-red-100"
        >
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text className="text-red-500 font-semibold text-base">Sign Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function MenuItem({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center gap-4 bg-gray-50 px-4 py-4 rounded-2xl"
    >
      <Ionicons name={icon} size={22} color="#6B7280" />
      <Text className="flex-1 text-gray-700 font-medium text-base">
        {label}
      </Text>
      <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
    </TouchableOpacity>
  );
}
