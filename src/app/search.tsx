import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "@/context/AppContext";

const CATEGORIES = ["All", "Analgesic", "Antibiotic", "Antimalarial", "Antidiabetic", "Antihypertensive", "Statin"];

export default function SearchScreen() {
  const { medicines, searchQuery, setSearchQuery } = useApp();
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filtered = medicines.filter((m) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      m.name.toLowerCase().includes(query) ||
      (m.genericName && m.genericName.toLowerCase().includes(query)) ||
      (m.description && m.description.toLowerCase().includes(query)) ||
      (m.pharmacy && m.pharmacy.toLowerCase().includes(query));
    const matchesCategory =
      selectedCategory === "All" ||
      (m.category && m.category.toLowerCase() === selectedCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
      <View className="px-6 pt-4 pb-4">
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em]">Search</Text>
            <Text className="text-slate-900 text-2xl font-bold mt-1">Medicine Results</Text>
          </View>
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-xl bg-white border border-slate-200 items-center justify-center shadow-sm">
            <Ionicons name="close" size={20} color="#0f766e" />
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center bg-white border border-slate-200 rounded-2xl px-4 shadow-sm">
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
          ) : null}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        <View className="mt-2 mb-2">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4">
            {CATEGORIES.map((category) => {
              const active = selectedCategory === category;
              return (
                <TouchableOpacity
                  key={category}
                  onPress={() => setSelectedCategory(category)}
                  className={`mr-2.5 px-4 py-2.5 rounded-2xl border ${active ? "bg-primary border-primary" : "bg-white border-slate-200"}`}
                >
                  <Text className={`text-xs font-bold ${active ? "text-white" : "text-slate-600"}`}>{category}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View className="px-6 pt-2 pb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-sm font-bold text-slate-800">{filtered.length} results</Text>
            <Text className="text-xs text-slate-400 font-semibold">Sorted by distance</Text>
          </View>

          {filtered.length === 0 ? (
            <View className="items-center py-16">
              <Ionicons name="search-outline" size={48} color="#cbd5e1" />
              <Text className="text-slate-400 font-bold text-sm mt-4">No medicines found</Text>
              <Text className="text-slate-300 text-xs mt-1 text-center">Try a different search or category</Text>
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
                  <View className={`w-12 h-12 rounded-2xl items-center justify-center ${med.inStock ? "bg-teal-50" : "bg-slate-100"}`}>
                    <Ionicons name="medkit" size={22} color={med.inStock ? "#0f766e" : "#94a3b8"} />
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-start justify-between">
                      <View className="flex-1 pr-2">
                        <Text className="text-base font-bold text-slate-800" numberOfLines={1}>{med.name}</Text>
                        <Text className="text-xs text-slate-400 font-semibold mt-0.5">{med.genericName} · {med.category}</Text>
                      </View>
                      <Text className="text-primary font-bold text-lg">GH₵{med.price.toFixed(2)}</Text>
                    </View>
                    <View className="flex-row items-center mt-3 gap-4">
                      <View className="flex-row items-center gap-1">
                        <Ionicons name="storefront-outline" size={12} color="#64748b" />
                        <Text className="text-xs text-slate-500 font-semibold" numberOfLines={1}>{med.pharmacy}</Text>
                      </View>
                      <View className="flex-row items-center gap-1">
                        <Ionicons name="location-outline" size={12} color="#64748b" />
                        <Text className="text-xs text-slate-500 font-semibold">{med.distance}</Text>
                      </View>
                    </View>
                    <View className="flex-row items-center justify-between mt-3">
                      <View className="flex-row items-center gap-1">
                        <Ionicons name="star" size={12} color="#f59e0b" />
                        <Text className="text-xs font-bold text-slate-700">{med.rating} ({med.reviews})</Text>
                      </View>
                      <View className={`px-3 py-1 rounded-full ${med.inStock ? "bg-emerald-50 border border-emerald-100" : "bg-red-50 border border-red-100"}`}>
                        <Text className={`text-[10px] font-bold ${med.inStock ? "text-emerald-700" : "text-red-700"}`}>{med.inStock ? "In Stock" : "Out of Stock"}</Text>
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
