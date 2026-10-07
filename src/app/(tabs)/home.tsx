import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Image,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useApp, useNotifications, Medicine } from "@/context/AppContext";

const CATEGORIES = [
  { name: "All", icon: "grid-outline" },
  { name: "Analgesic", icon: "bandage-outline" },
  { name: "Antibiotic", icon: "flask-outline" },
  { name: "Antimalarial", icon: "bug-outline" },
  { name: "Antidiabetic", icon: "heart-outline" },
  { name: "Antihypertensive", icon: "pulse-outline" },
  { name: "Statin", icon: "fitness-outline" },
];

export default function HomeScreen() {
  const {
    user,
    medicines,
    searchQuery,
    setSearchQuery,
    searchLoading,
    refreshData,
    hasMoreMedicines,
    loadingMoreMedicines,
    loadMoreMedicines,
  } = useApp();
  const { unreadCount } = useNotifications();
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  const filtered = medicines.filter((m) => {
    if (selectedCategory === "All") return true;
    return m.category && m.category.toLowerCase() === selectedCategory.toLowerCase();
  });

  const handleEndReached = useCallback(() => {
    if (!loadingMoreMedicines && hasMoreMedicines) {
      loadMoreMedicines();
    }
  }, [loadingMoreMedicines, hasMoreMedicines, loadMoreMedicines]);

  const renderMedicineItem = useCallback(
    ({ item: med }: { item: Medicine }) => (
      <View className="px-6 mb-3">
        <TouchableOpacity
          onPress={() => router.push(`/medicine/${med.id}`)}
          activeOpacity={0.7}
          className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm"
        >
          <View className="flex-row items-start gap-4">
            {/* Medicine Image / Icon */}
            {med.imageUrl ? (
              <Image
                source={{ uri: med.imageUrl }}
                className="w-12 h-12 rounded-2xl bg-slate-100"
                resizeMode="cover"
              />
            ) : (
              <View
                className={`w-12 h-12 rounded-2xl items-center justify-center ${med.inStock ? "bg-teal-50" : "bg-slate-100"
                  }`}
              >
                <Ionicons
                  name="medkit"
                  size={22}
                  color={med.inStock ? "#0f766e" : "#94a3b8"}
                />
              </View>
            )}

            {/* Details */}
            <View className="flex-1">
              <View className="flex-row items-start justify-between">
                <View className="flex-1 pr-2">
                  <Text className="text-base font-bold text-slate-800" numberOfLines={1}>
                    {med.name}
                  </Text>
                  <Text className="text-xs text-slate-400 font-semibold mt-0.5">
                    {med.genericName} · {med.category}
                  </Text>
                </View>
                <Text className="text-primary font-bold text-lg">
                  GH₵{med.price.toFixed(2)}
                </Text>
              </View>

              <View className="flex-row items-center mt-3 gap-4">
                <View className="flex-row items-center gap-1">
                  <Ionicons name="storefront-outline" size={12} color="#64748b" />
                  <Text className="text-xs text-slate-500 font-semibold" numberOfLines={1}>
                    {med.pharmacy}
                  </Text>
                </View>
                <View className="flex-row items-center gap-1">
                  <Ionicons name="location-outline" size={12} color="#64748b" />
                  <Text className="text-xs text-slate-500 font-semibold">{med.distance}</Text>
                </View>
              </View>

              <View className="flex-row items-center justify-between mt-3">
                <View className="flex-row items-center gap-1">
                  <Ionicons name="star" size={12} color="#f59e0b" />
                  <Text className="text-xs font-bold text-slate-700">
                    {med.rating} ({med.reviews})
                  </Text>
                </View>
                <View
                  className={`px-3 py-1 rounded-full ${med.inStock
                      ? "bg-emerald-50 border border-emerald-100"
                      : "bg-red-50 border border-red-100"
                    }`}
                >
                  <Text
                    className={`text-[10px] font-bold ${med.inStock ? "text-emerald-700" : "text-red-700"
                      }`}
                  >
                    {med.inStock ? "In Stock" : "Out of Stock"}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    ),
    [router]
  );

  const renderBannerAndCategories = useCallback(
    () => (
      <View>
        {/* Quick Stats Banner */}
        <View className="mx-6 mt-4 bg-primary rounded-[32px] p-5 flex-row items-center justify-between overflow-hidden">
          <View className="flex-1">
            <Text className="text-white/70 text-xs font-bold uppercase tracking-[0.2em]">
              Nearby Availability
            </Text>
            <Text className="text-white text-2xl font-bold mt-1">
              {medicines.filter((m) => m.inStock).length} medicines
            </Text>
            <Text className="text-white/60 text-xs mt-1 font-semibold">
              in stock at {new Set(medicines.filter((m) => m.inStock).map((m) => m.pharmacyId)).size} pharmacies near you
            </Text>
          </View>
          <View className="w-16 h-16 rounded-2xl bg-white/15 items-center justify-center overflow-hidden">
            <Image
              source={require("../../../assets/logo.png")}
              style={{ width: 44, height: 44, borderRadius: 10 }}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Category Chips */}
        <View className="mt-6 mb-2">
          <Text className="px-6 text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Browse by Category
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4">
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.name}
                onPress={() => setSelectedCategory(cat.name)}
                className={`mr-2.5 px-4 py-2.5 rounded-2xl flex-row items-center gap-2 border ${selectedCategory === cat.name
                    ? "bg-primary border-primary"
                    : "bg-white border-slate-200"
                  }`}
              >
                <Ionicons
                  name={cat.icon as any}
                  size={14}
                  color={selectedCategory === cat.name ? "white" : "#64748b"}
                />
                <Text
                  className={`text-xs font-bold ${selectedCategory === cat.name ? "text-white" : "text-slate-600"
                    }`}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Results Counter */}
        <View className="px-6 mt-4 mb-3 flex-row items-center justify-between">
          <Text className="text-sm font-bold text-slate-800">
            {filtered.length} medicine{filtered.length !== 1 ? "s" : ""}
          </Text>
          <Text className="text-xs text-slate-400 font-semibold">Sorted by distance</Text>
        </View>
      </View>
    ),
    [medicines, selectedCategory, filtered.length]
  );

  const renderFooter = useCallback(() => {
    if (loadingMoreMedicines) {
      return (
        <View className="py-6 items-center justify-center">
          <ActivityIndicator size="small" color="#0f766e" />
          <Text className="text-xs text-slate-400 font-semibold mt-2">Loading more medicines...</Text>
        </View>
      );
    }
    if (!hasMoreMedicines && filtered.length >= 20) {
      return (
        <View className="py-6 items-center justify-center">
          <Text className="text-xs text-slate-400 font-semibold">You've reached the end of available medicines</Text>
        </View>
      );
    }
    return <View className="h-6" />;
  }, [loadingMoreMedicines, hasMoreMedicines, filtered.length]);

  const renderEmpty = useCallback(() => {
    if (searchLoading && filtered.length === 0) {
      return (
        <View className="items-center py-16">
          <ActivityIndicator size="large" color="#0f766e" />
          <Text className="text-slate-500 font-bold text-sm mt-4">Searching medicines...</Text>
        </View>
      );
    }
    if (filtered.length === 0) {
      return (
        <View className="items-center py-16">
          <Ionicons name="search-outline" size={48} color="#cbd5e1" />
          <Text className="text-slate-400 font-bold text-sm mt-4">No medicines found</Text>
          <Text className="text-slate-300 text-xs mt-1">Try a different search or category</Text>
        </View>
      );
    }
    return null;
  }, [searchLoading, filtered.length]);

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
      <StatusBar style="dark" />

      {/* Fixed Header & Search Bar - Kept outside FlatList so typing never unmounts/resets */}
      <View className="px-6 pt-4 pb-2 bg-slate-50 z-10">
        <View className="flex-row items-center justify-between mb-1">
          <View>
            <Text className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em]">
              Welcome back 👋
            </Text>
            <Text className="text-slate-900 text-xl font-bold mt-1">
              {user?.name?.split(" ")[0] ?? "Patient"}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/notifications")}
            className="w-10 h-10 rounded-xl bg-white border border-slate-200 items-center justify-center shadow-sm relative"
          >
            <Ionicons name="notifications-outline" size={20} color="#0f766e" />
            {unreadCount > 0 && (
              <View className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 rounded-full items-center justify-center border-2 border-white">
                <Text className="text-white text-[9px] font-bold">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Search Bar with live searching indicator */}
        <View className="flex-row items-center bg-white border border-slate-200 rounded-2xl px-4 mt-4 shadow-sm">
          {searchLoading ? (
            <ActivityIndicator size="small" color="#0f766e" />
          ) : (
            <Ionicons name="search" size={18} color="#94a3b8" />
          )}
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search medicines, brands, symptoms..."
            placeholderTextColor="#94a3b8"
            className="flex-1 py-3.5 px-3 text-sm text-slate-800"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery ? (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close-circle" size={18} color="#94a3b8" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderMedicineItem}
        ListHeaderComponent={renderBannerAndCategories}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.4}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#0f766e"
            colors={["#0f766e"]}
          />
        }
      />
    </SafeAreaView>
  );
}
