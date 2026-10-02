import { useSupabase } from "@/hooks/useSupabase";
import { useEffect, useState } from "react";
import { Alert } from "react-native";

export function useSavedProperty(propertyId: string, onUnsave?: () => void) {
  const authSupabase = useSupabase();
  const [isSaved, setIsSaved] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    checkIfSaved();
  }, [propertyId]);

  const checkIfSaved = async () => {
    const {
      data: { user },
    } = await authSupabase.auth.getUser();

    if (!user) {
      setIsSaved(false);
      return;
    }

    const { data, error } = await authSupabase
      .from("saved_properties")
      .select("id")
      .eq("user_id", user.id)
      .eq("property_id", propertyId)
      .maybeSingle();

    if (error) {
      console.error("Check save failed:", error.message);
      setIsSaved(false);
      return;
    }
    setIsSaved(!!data);
  };

  const toggleSave = async () => {
    if (saveLoading) return;

    const {
      data: { user },
    } = await authSupabase.auth.getUser();

    if (!user) {
      Alert.alert("Sign in required", "Please sign in to save properties.");
      return;
    }

    setSaveLoading(true);
    if (isSaved) {
      const { error } = await authSupabase
        .from("saved_properties")
        .delete()
        .eq("user_id", user.id)
        .eq("property_id", propertyId);

      if (error) {
        Alert.alert("Error", `Could not unsave: ${error.message}`);
      } else {
        setIsSaved(false);
        onUnsave?.();
      }
    } else {
      const { error } = await authSupabase
        .from("saved_properties")
        .insert({ user_id: user.id, property_id: propertyId });

      if (error) {
        console.error("Save failed:", error.message, error.details);
        if (error.code === "23503") {
          // foreign key violation
          Alert.alert("Setup required", "Your user record is missing.");
        } else if (error.code === "42501") {
          // insufficient-privilege/permission issue
          Alert.alert(
            "Permission denied",
            "RLS blocked this save. Check your Supabase policies.",
          );
        } else {
          Alert.alert("Error", `Could not save: ${error.message}`);
        }
      } else {
        setIsSaved(true);
      }
    }
    setSaveLoading(false);
  };

  return { isSaved, saveLoading, toggleSave };
}
