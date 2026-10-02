import { useSavedProperty } from "@/hooks/useSavedProperty";
import { formatPrice } from "@/lib/utils";
import { Property } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";

export default function PropertyCard({
  property,
  onUnsave,
  showSave = false,
  onEdit,
  onDelete,
}: {
  property: Property;
  onUnsave?: () => void;
  showSave?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const router = useRouter();
  const { isSaved, saveLoading, toggleSave } = useSavedProperty(
    property.id,
    onUnsave,
  );

  return (
    <TouchableOpacity
      onPress={() => router.push(`/(root)/property/${property.id}`)}
      className="flex-row bg-white rounded-2xl mb-4 overflow-hidden"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
      }}
    >
      {/* Image */}
      <Image
        source={{ uri: property.images[0] }}
        className="w-28 h-28"
        resizeMode="cover"
      />

      {/* Info */}
      <View className="flex-1 p-3 justify-between">
        <View>
          <Text
            className="text-sm font-bold text-gray-800 mb-1"
            numberOfLines={1}
          >
            {property.title}
          </Text>
          <View className="flex-row items-center gap-1">
            <Ionicons name="location-outline" size={11} color="#6B7280" />
            <Text className="text-xs text-gray-500" numberOfLines={1}>
              {property.city}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center justify-between">
          <Text className="text-blue-600 font-bold text-sm">
            {formatPrice(property.price)}
          </Text>

          <View className="flex-row gap-3">
            <View className="flex-row items-center gap-1">
              <Ionicons name="bed-outline" size={11} color="#6B7280" />
              <Text className="text-xs text-gray-500">
                {property.bedrooms} bd
              </Text>
            </View>
            <View className="flex-row items-center gap-1">
              <Ionicons name="expand-outline" size={11} color="#6B7280" />
              <Text className="text-xs text-gray-500">
                {property.area_sqft} ft²
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Save / Edit / Delete Buttons */}
      {(showSave || onEdit || onDelete) && (
        <View className="w-10 items-center pt-3">
          {showSave && (
            <TouchableOpacity
              onPress={toggleSave}
              disabled={saveLoading}
              className="items-center"
            >
              <Ionicons
                name={isSaved ? "heart" : "heart-outline"}
                size={18}
                color={isSaved ? "#EF4444" : "#9CA3AF"}
              />
            </TouchableOpacity>
          )}
          {onEdit && (
            <TouchableOpacity
              onPress={onEdit}
              className={showSave ? "mt-3" : ""}
              hitSlop={8}
            >
              <Ionicons name="create-outline" size={18} color="#2563EB" />
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity
              onPress={onDelete}
              className={showSave || onEdit ? "mt-3" : ""}
              hitSlop={8}
            >
              <Ionicons name="trash-outline" size={18} color="#EF4444" />
            </TouchableOpacity>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}
