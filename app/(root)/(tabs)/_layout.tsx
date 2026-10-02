import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useEffect, useState } from "react";
import { AppState, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  // Only admins see the "Add Property" tab.
  // Starts false so non-admins never see it flash on launch.
  const [isAdmin, setIsAdmin] = useState(false);

  const loadAdmin = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setIsAdmin(false);
      return;
    }

    const { data } = await supabase
      .from("users")
      .select("is_admin")
      .eq("clerk_id", user.id)
      .maybeSingle();

    setIsAdmin(!!data?.is_admin);
  };

  useEffect(() => {
    loadAdmin();

    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") loadAdmin();
    });
    return () => sub?.remove();
  }, []);

  const bottomPad =
    Platform.OS === "android" ? Math.max(insets.bottom, 14) : insets.bottom;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#2563EB",
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopColor: "#E5E7EB",
          height: 60 + bottomPad,
          paddingBottom: 8 + bottomPad,
          paddingTop: Platform.OS === "android" ? 4 : 6,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="create"
        options={{
          title: "Add Property",
          // Hidden from the tab bar for non-admins
          href: isAdmin ? undefined : null,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="saved"
        options={{
          title: "Saved",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
