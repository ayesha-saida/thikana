import AdminOnly from "@/components/AdminOnly";
import { useSupabase } from "@/hooks/useSupabase";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface AdminUser {
  clerk_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  is_admin: boolean;
}

function displayName(row: AdminUser): string {
  const name = [row.first_name, row.last_name].filter(Boolean).join(" ");
  return name || row.email || "User";
}

function initials(row: AdminUser): string {
  const name = [row.first_name, row.last_name].filter(Boolean).join(" ");
  const source = name || row.email || "?";
  return source
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export default function ManageUsersScreen() {
  const authSupabase = useSupabase();
  const router = useRouter();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    const {
      data: { user },
    } = await authSupabase.auth.getUser();

    if (!user) {
      setUsers([]);
      setLoading(false);
      return;
    }
    setCurrentId(user.id);

    setLoading(true);
    const { data, error } = await authSupabase
      .from("users")
      .select("clerk_id, first_name, last_name, email, is_admin")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching users:", error.message, error.code);
      if (error.code === "42501") {
        Alert.alert("Setup required.");
      }
      setUsers([]);
    } else {
      setUsers(data as AdminUser[]);
    }
    setLoading(false);
  }, [authSupabase]);

  useFocusEffect(
    useCallback(() => {
      loadUsers();
    }, [loadUsers]),
  );

  const me = users.find((u) => u.clerk_id === currentId);
  const isSelf = (row: AdminUser) => row.clerk_id === currentId;

  const handleToggle = (row: AdminUser, next: boolean) => {
    const name = displayName(row);
    Alert.alert(
      next ? `Make ${name} an admin?` : `Remove admin from ${name}?`,
      next
        ? "They will be able to upload listings and manage users."
        : "They will lose access to admin features.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: next ? "Make Admin" : "Remove",
          style: next ? "default" : "destructive",
          onPress: () => applyToggle(row, next),
        },
      ],
    );
  };

  const applyToggle = async (row: AdminUser, next: boolean) => {
    setBusyId(row.clerk_id);
    const { error } = await authSupabase
      .from("users")
      .update({ is_admin: next })
      .eq("clerk_id", row.clerk_id);
    setBusyId(null);

    if (error) {
      console.error("Update admin failed:", error.message, error.code);
      if (error.code === "42501") {
        Alert.alert("Setup required");
      } else {
        Alert.alert("Error", error.message);
      }
      return;
    }

    const name = displayName(row);
    setUsers((prev) =>
      prev.map((u) =>
        u.clerk_id === row.clerk_id ? { ...u, is_admin: next } : u,
      ),
    );
    Alert.alert(
      "Updated",
      `${name} is now ${next ? "an admin" : "a regular user"}.`,
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#2563EB" />
      </SafeAreaView>
    );
  }

  // Only admins may manage users (RLS also blocks everyone else)
  if (!me?.is_admin) {
    return <AdminOnly message="You need admin permission to manage users." />;
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center gap-3 px-5 pt-4 pb-3">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-9 h-9 bg-white rounded-full items-center justify-center border border-gray-200"
        >
          <Ionicons name="arrow-back" size={20} color="#111827" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-2xl font-bold text-gray-900">Manage Users</Text>
          <Text className="text-sm text-gray-400">
            {users.length} registered {users.length === 1 ? "user" : "users"}
          </Text>
        </View>
      </View>

      <Text className="text-xs text-gray-400 px-5 pb-3">
        {
          "Toggle the switch to change a user's role. You can't change your own."
        }
      </Text>

      <FlatList
        data={users}
        keyExtractor={(item) => item.clerk_id}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const name = displayName(item);
          const meRow = isSelf(item);
          return (
            <View className="flex-row items-center bg-white rounded-2xl px-4 py-3.5 mb-3 border border-gray-100">
              <View className="w-11 h-11 rounded-full bg-blue-50 items-center justify-center">
                <Text className="text-blue-700 font-bold text-base">
                  {initials(item)}
                </Text>
              </View>

              <View className="flex-1 ml-3">
                <View className="flex-row items-center gap-1.5">
                  <Text
                    className="text-gray-900 font-semibold text-base flex-shrink"
                    numberOfLines={1}
                  >
                    {name}
                  </Text>
                  {meRow && (
                    <Text className="text-blue-600 text-[10px] font-bold">
                      (You)
                    </Text>
                  )}
                </View>
                <Text className="text-gray-400 text-xs" numberOfLines={1}>
                  {item.email ?? "—"}
                </Text>
              </View>

              <View className="items-end ml-2">
                <View
                  className={`px-2 py-1 rounded-full mb-1 ${
                    item.is_admin ? "bg-blue-100" : "bg-gray-100"
                  }`}
                >
                  <Text
                    className={`text-[10px] font-bold ${
                      item.is_admin ? "text-blue-700" : "text-gray-500"
                    }`}
                  >
                    {item.is_admin ? "ADMIN" : "MEMBER"}
                  </Text>
                </View>
                <Switch
                  value={!!item.is_admin}
                  disabled={meRow || busyId === item.clerk_id}
                  onValueChange={(next) => handleToggle(item, next)}
                  trackColor={{ false: "#D1D5DB", true: "#93C5FD" }}
                  thumbColor={item.is_admin ? "#2563EB" : "#F3F4F6"}
                />
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center py-24">
            <Text className="text-gray-400 text-sm">No users found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
