import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "@/context/AppContext";

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
  const { user, medicines, searchQuery, setSearchQuery } = useApp();
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filtered = medicines.filter((m) => {
    const matchSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.genericName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = selectedCategory === "All" || m.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
      {/* Header */}
      <View className="px-6 pt-4 pb-2">
        <View className="flex-row items-center justify-between mb-1">
          <View>
            <Text className="text-slate-400 text-xs font-bold">
              Welcome back 👋
            </Text>
            <Text className="text-slate-800 text-xl font-bold">
              {user?.name?.split(" ")[0] ?? "Patient"}
            </Text>
          </View>
          <TouchableOpacity className="w-10 h-10 rounded-xl bg-white border border-slate-200 items-center justify-center">
            <Ionicons name="notifications-outline" size={20} color="#0f766e" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View className="flex-row items-center bg-white border border-slate-200 rounded-2xl px-4 mt-4 shadow-sm">
          <Ionicons name="search" size={18} color="#94a3b8" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search medicines, symptoms..."
            placeholderTextColor="#94a3b8"
            className="flex-1 py-3.5 px-3 text-sm text-slate-800"
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={18} color="#94a3b8" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity className="w-8 h-8 rounded-lg bg-primary items-center justify-center">
              <Ionicons name="options" size={16} color="white" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {/* Quick Stats Banner */}
        <View className="mx-6 mt-4 bg-primary rounded-3xl p-5 flex-row items-center justify-between overflow-hidden">
          <View className="flex-1">
            <Text className="text-white/70 text-xs font-bold uppercase tracking-wider">
              Nearby Availability
            </Text>
            <Text className="text-white text-2xl font-bold mt-1">
              {medicines.filter((m) => m.inStock).length} medicines
            </Text>
            <Text className="text-white/60 text-xs mt-1 font-semibold">
              in stock at {new Set(medicines.filter((m) => m.inStock).map((m) => m.pharmacyId)).size} pharmacies near you
            </Text>
          </View>
          <View className="w-16 h-16 rounded-2xl bg-white/15 items-center justify-center">
            <Ionicons name="medical" size={32} color="white" />
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
                className={`mr-2.5 px-4 py-2.5 rounded-2xl flex-row items-center gap-2 border ${
                  selectedCategory === cat.name
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
                  className={`text-xs font-bold ${
                    selectedCategory === cat.name ? "text-white" : "text-slate-600"
                  }`}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Medicine Results */}
        <View className="px-6 mt-4 pb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-sm font-bold text-slate-800">
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </Text>
            <Text className="text-xs text-slate-400 font-semibold">Sorted by distance</Text>
          </View>

          {filtered.length === 0 ? (
            <View className="items-center py-16">
              <Ionicons name="search-outline" size={48} color="#cbd5e1" />
              <Text className="text-slate-400 font-bold text-sm mt-4">No medicines found</Text>
              <Text className="text-slate-300 text-xs mt-1">Try a different search or category</Text>
            </View>
          ) : (
            filtered.map((med) => (
              <TouchableOpacity
                key={med.id}
                onPress={() => router.push(`/medicine/${med.id}`)}
                activeOpacity={0.7}
                className="bg-white rounded-3xl p-5 mb-3 border border-slate-100 shadow-sm"
              >
                <View className="flex-row items-start gap-4">
                  {/* Icon */}
                  <View
                    className={`w-12 h-12 rounded-2xl items-center justify-center ${
                      med.inStock ? "bg-teal-50" : "bg-slate-100"
                    }`}
                  >
                    <Ionicons
                      name="medkit"
                      size={22}
                      color={med.inStock ? "#0f766e" : "#94a3b8"}
                    />
                  </View>

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
                        className={`px-3 py-1 rounded-full ${
                          med.inStock
                            ? "bg-emerald-50 border border-emerald-100"
                            : "bg-red-50 border border-red-100"
                        }`}
                      >
                        <Text
                          className={`text-[10px] font-bold ${
                            med.inStock ? "text-emerald-700" : "text-red-700"
                          }`}
                        >
                          {med.inStock ? "In Stock" : "Out of Stock"}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
