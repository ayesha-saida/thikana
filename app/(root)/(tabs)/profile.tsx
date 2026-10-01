import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
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
  const [userName, setUserName] = useState("User");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    setUserEmail(user.email ?? "");

    const { data } = await supabase
      .from("users")
      .select("first_name, last_name, avatar_url, is_admin")
      .eq("clerk_id", user.id)
      .maybeSingle();

    if (data) {
      const name = [data.first_name, data.last_name].filter(Boolean).join(" ");
      if (name) setUserName(name);
      if (data.avatar_url) setAvatarUrl(data.avatar_url);
      setIsAdmin(!!data.is_admin);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.replace("/sign-in");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleUpdateProfileImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permission Required",
        "Allow photo library access to change your photo.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    });

    if (result.canceled) return;

    setUploading(true);
    try {
      const asset = result.assets[0];
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in");

      // Use ImagePicker's mimeType; fall back to guessing from URI extension
      const uriExt = (
        asset.uri.split("?")[0].split(".").pop() || ""
      ).toLowerCase();
      const ext = ["png", "jpg", "jpeg", "webp"].includes(uriExt)
        ? uriExt
        : "jpg";
      const contentType =
        asset.mimeType && asset.mimeType.startsWith("image/")
          ? asset.mimeType
          : ext === "png"
            ? "image/png"
            : ext === "webp"
              ? "image/webp"
              : "image/jpeg";
      const path = `${user.id}/avatar_${Date.now()}.${ext}`;

      const base64 = asset.base64!;
      const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, bytes, { contentType, upsert: true });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(path);

      const { error: updateError } = await supabase
        .from("users")
        .update({ avatar_url: urlData.publicUrl })
        .eq("clerk_id", user.id);
      if (updateError) throw updateError;

      setAvatarUrl(urlData.publicUrl);
      Alert.alert("Success", "Profile photo updated!");
    } catch (err: any) {
      console.error("Avatar upload failed:", err?.message);
      if (String(err?.message).includes("Bucket not found")) {
        Alert.alert(
          "Setup required",
          'Storage bucket "avatars" is missing. Run supabase-migration-avatars.sql in the Supabase SQL Editor.',
        );
      } else {
        Alert.alert("Error", err?.message ?? "Failed to update photo.");
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white mb-10">
      {/* Avatar + Name */}
      <View className="items-center py-8">
        <View className="relative">
          <Image
            source={
              avatarUrl
                ? { uri: avatarUrl }
                : require("../../../assets/images/thikana.png")
            }
            style={{
              width: 96,
              height: 96,
              borderRadius: 48,
              marginBottom: 16,
            }}
          />
          <TouchableOpacity
            onPress={handleUpdateProfileImage}
            disabled={uploading}
            className="absolute bottom-3 right-0 bg-blue-600 rounded-full p-2"
          >
            {uploading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Ionicons name="camera" size={16} color="white" />
            )}
          </TouchableOpacity>
        </View>
        <Text className="text-xl font-bold text-gray-800">{userName}</Text>
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

        {isAdmin && (
          <MenuItem
            icon="business-outline"
            label="My Listings"
            onPress={() => router.push("/(root)/my-listings")}
          />
        )}

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
