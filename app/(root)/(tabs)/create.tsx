import AdminOnly from "@/components/AdminOnly";
import PropertyForm, { PropertyFormValues } from "@/components/PropertyForm";
import { useSupabase } from "@/hooks/useSupabase";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CreatePropertyScreen() {
  const router = useRouter();
  const authSupabase = useSupabase();

  // null = still checking. The tab is hidden for non-admins, and this screen
  // is guarded too so deep links / old navigation can't reach the form.
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    const check = async () => {
      const {
        data: { user },
      } = await authSupabase.auth.getUser();

      if (!user) {
        setIsAdmin(false);
        return;
      }

      const { data } = await authSupabase
        .from("users")
        .select("is_admin")
        .eq("clerk_id", user.id)
        .maybeSingle();

      setIsAdmin(!!data?.is_admin);
    };

    check();
  }, [authSupabase]);

  const handleSubmit = async (values: PropertyFormValues) => {
    const {
      data: { user },
    } = await authSupabase.auth.getUser();

    if (!user) {
      Alert.alert("Sign in required", "Please sign in to create a property.");
      return;
    }

    const { error } = await authSupabase.from("properties").insert({
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
      is_sold: false,
      created_by: user.id,
    });

    if (error) {
      console.error("Create property failed:", error.message, error.code);
      if (error.code === "42703") {
        Alert.alert(
          "Setup required",
          "Run supabase-migration-properties-created-by.sql in the Supabase SQL Editor.",
        );
      } else if (error.message.includes("Only admins")) {
        Alert.alert("Admins only", "Only admins can add properties.");
      } else {
        Alert.alert("Error", `Failed to create property: ${error.message}`);
      }
      return;
    }

    Alert.alert("Success 🎉", "New Property added", [
      { text: "OK", onPress: () => router.replace("/(root)/(tabs)") },
    ]);
  };

  if (isAdmin === null) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#2563EB" />
      </SafeAreaView>
    );
  }

  if (!isAdmin) {
    return <AdminOnly message="Only admins can add properties." />;
  }

  return (
    <PropertyForm
      headerTitle="Add Property"
      submitLabel="List Property"
      onSubmit={handleSubmit}
    />
  );
}
