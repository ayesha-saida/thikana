import PropertyForm, { PropertyFormValues } from "@/components/PropertyForm";
import { useSupabase } from "@/hooks/useSupabase";
import { Property } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const TYPES = ["apartment", "house", "villa", "studio"];

// Convert a saved property row into prefilled form values.
// Existing image URLs serve as both saved values and previews.
function toFormValues(p: Property): PropertyFormValues {
  const images = p.images ?? [];
  return {
    title: p.title ?? "",
    description: p.description ?? "",
    price: p.price != null ? String(p.price) : "",
    type: TYPES.includes(p.type)
      ? (p.type as PropertyFormValues["type"])
      : "apartment",
    bedrooms: p.bedrooms ?? 1,
    bathrooms: p.bathrooms ?? 1,
    areaSqft: p.area_sqft != null ? String(p.area_sqft) : "",
    address: p.address ?? "",
    city: p.city ?? "",
    latitude: p.latitude != null ? String(p.latitude) : "",
    longitude: p.longitude != null ? String(p.longitude) : "",
    isFeatured: !!p.is_featured,
    images,
    localImages: images,
  };
}

export default function EditListingScreen() {
  const router = useRouter();
  const authSupabase = useSupabase();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!id) {
        setLoadError("Missing listing id.");
        setLoading(false);
        return;
      }

      const { data, error } = await authSupabase
        .from("properties")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        console.error("Load listing failed:", error.message, error.code);
        setLoadError(
          error.code === "42501"
            ? "You don't have permission to edit this listing."
            : `Could not load listing: ${error.message}`,
        );
      } else if (!data) {
        setLoadError(
          "Listing not found or you don't have permission to edit it.",
        );
      } else {
        setProperty(data as Property);
      }
      setLoading(false);
    };

    load();
  }, [authSupabase, id]);

  const handleSave = async (values: PropertyFormValues) => {
    const { data, error } = await authSupabase
      .from("properties")
      .update({
        title: values.title.trim(),
        description: values.description.trim(),
        price: Number(values.price),
        type: values.type,
        bedrooms: values.bedrooms,
        bathrooms: values.bathrooms,
        area_sqft: values.areaSqft ? Number(values.areaSqft) : null,
        address: values.address.trim(),
        city: values.city.trim(),
        latitude: values.latitude ? Number(values.latitude) : null,
        longitude: values.longitude ? Number(values.longitude) : null,
        images: values.images,
        is_featured: values.isFeatured,
      })
      .eq("id", id)
      .select("id");

    if (error) {
      console.error("Update property failed:", error.message, error.code);
      if (error.code === "42501") {
        Alert.alert("Setup required");
      } else {
        Alert.alert("Error", `Failed to update property: ${error.message}`);
      }
      return;
    }

    if (!data || data.length === 0) {
      Alert.alert(
        "Not saved",
        "No changes were saved. You may not have permission to edit this listing.",
      );
      return;
    }

    Alert.alert("Saved ✓", "Property changes saved.", [
      { text: "OK", onPress: () => router.back() },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#2563EB" />
      </SafeAreaView>
    );
  }

  if (loadError || !property) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center px-8">
          <View className="w-20 h-20 bg-red-50 rounded-full items-center justify-center mb-4">
            <Ionicons name="alert-circle-outline" size={36} color="#EF4444" />
          </View>
          <Text className="text-gray-700 text-lg font-bold mb-1 text-center">
            {"Can't edit this listing"}
          </Text>
          <Text className="text-gray-400 text-sm text-center mb-6">
            {loadError ?? "Listing not found."}
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-blue-600 px-6 py-3 rounded-2xl"
          >
            <Text className="text-white font-semibold">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <PropertyForm
      headerTitle="Edit Property"
      submitLabel="Save Changes"
      initialValues={toFormValues(property)}
      onBack={() => router.back()}
      confirmImageRemoval
      onSubmit={handleSave}
    />
  );
}
