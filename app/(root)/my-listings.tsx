import PropertyCard from "@/components/PropertyCard";
import { useSupabase } from "@/hooks/useSupabase";
import { Property } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MyListingsScreen() {
  const authSupabase = useSupabase();
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchListings = useCallback(async () => {
    const {
      data: { user },
    } = await authSupabase.auth.getUser();

    if (!user) {
      setProperties([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await authSupabase
      .from("properties")
      .select("*")
      .eq("created_by", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching my listings:", error.message, error.code);
      if (error.code === "42703") {
        Alert.alert("Setup required");
      }
      setProperties([]);
    } else {
      setProperties(data as Property[]);
    }
    setLoading(false);
  }, [authSupabase]);

  // Refresh whenever opened so a freshly created property shows up
  useFocusEffect(
    useCallback(() => {
      fetchListings();
    }, [fetchListings]),
  );

  const confirmDelete = (item: Property) => {
    Alert.alert(
      "Delete listing?",
      `"${item.title}" will be permanently removed.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => applyDelete(item),
        },
      ],
    );
  };

  const applyDelete = async (item: Property) => {
    const { data, error } = await authSupabase
      .from("properties")
      .delete()
      .eq("id", item.id)
      .select("id");

    if (error) {
      console.error("Delete property failed:", error.message, error.code);
      if (error.code === "42501") {
        Alert.alert("Setup required");
      } else {
        Alert.alert("Error", `Failed to delete listing: ${error.message}`);
      }
      return;
    }

    if (!data || data.length === 0) {
      Alert.alert(
        "Not deleted",
        "You may not have permission to delete this listing.",
      );
      return;
    }

    setProperties((prev) => prev.filter((p) => p.id !== item.id));
    Alert.alert("Deleted", "Listing removed.");
  };

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
          <Text className="text-2xl font-bold text-gray-900">My Listings</Text>
          {!loading && (
            <Text className="text-sm text-gray-400">
              {properties.length}{" "}
              {properties.length === 1 ? "property" : "properties"} uploaded
            </Text>
          )}
        </View>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : (
        <FlatList
          data={properties}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <PropertyCard
              property={item}
              onEdit={() =>
                router.push({
                  pathname: "/(root)/edit-listing",
                  params: { id: item.id },
                })
              }
              onDelete={() => confirmDelete(item)}
            />
          )}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-24">
              <View className="w-20 h-20 bg-blue-50 rounded-full items-center justify-center mb-4">
                <Ionicons name="business-outline" size={36} color="#2563EB" />
              </View>
              <Text className="text-gray-700 text-lg font-bold mb-1">
                No properties uploaded yet
              </Text>
              <Text className="text-gray-400 text-sm text-center px-8">
                Properties you create will appear here
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/(root)/(tabs)/create")}
                className="mt-6 bg-blue-600 px-6 py-3 rounded-2xl"
              >
                <Text className="text-white font-semibold">
                  Create Property
                </Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
