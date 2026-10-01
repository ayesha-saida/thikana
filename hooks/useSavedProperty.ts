import { useSupabase } from "@/hooks/useSupabase";
import { useEffect, useState } from "react";

export function useSavedProperty(propertyId: string, onUnsave?: () => void) {
  const authSupabase = useSupabase();
  const [isSaved, setIsSaved] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    checkIfSaved();
  }, [propertyId]);

  const checkIfSaved = async () => {
    try {
      const { data: { user} } = await authSupabase.auth.getUser();

      if (!user) {
        setIsSaved(false);
        return;
      }

      const { data } = await authSupabase
        .from("saved_properties")
        .select("id")
        .eq("user_clerk_id", user.id)
        .eq("property_id", propertyId)
        .single();

      setIsSaved(!!data);
    } catch (error) {
      console.error("Error checking saved property:", error);
      setIsSaved(false);
    }
  };

  const toggleSave = async () => {
    if (saveLoading) return;
    try {
      const { data: { user} } = await authSupabase.auth.getUser();

      if (!user) return;

      setSaveLoading(true);
      if (isSaved) {
        await authSupabase
          .from("saved_properties")
          .delete()
          .eq("user_clerk_id", user.id)
          .eq("property_id", propertyId);
        setIsSaved(false);
        onUnsave?.();
      } else {
        await authSupabase
          .from("saved_properties")
          .insert({ user_clerk_id: user.id, property_id: propertyId });
        setIsSaved(true);
      }
    } catch (error) {
      console.error("Error toggling save:", error);
    } finally {
      setSaveLoading(false);
    }
  };

  return { isSaved, saveLoading, toggleSave };
}