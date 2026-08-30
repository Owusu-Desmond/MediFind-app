import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "@/context/AppContext";

export default function PharmaciesScreen() {
  const { pharmacies, savedPharmacies, toggleSavePharmacy, refreshData } = useApp();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
      {/* Header */}
      <View className="px-6 pt-4 pb-4">
        <Text className="text-2xl font-bold text-slate-800">Nearby Pharmacies</Text>
        <Text className="text-xs text-slate-400 font-semibold mt-1">
          Verified pharmacies in the MediFind network
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1 px-6"
        contentContainerStyle={{ paddingBottom: 24 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0f766e" colors={["#0f766e"]} />
        }
      >
        {pharmacies.length === 0 ? (
          <View className="items-center py-20">
            <View className="w-16 h-16 rounded-3xl bg-slate-100 items-center justify-center mb-4">
              <Ionicons name="storefront-outline" size={32} color="#cbd5e1" />
            </View>
            <Text className="text-slate-400 font-bold text-sm">No pharmacies available</Text>
            <Text className="text-slate-300 text-xs mt-1 text-center">
              There are currently no registered pharmacies.
            </Text>
          </View>
        ) : (
          pharmacies.map((pharmacy) => {
            const isSaved = savedPharmacies.includes(pharmacy.id);

            return (
              <TouchableOpacity
                key={pharmacy.id}
                onPress={() => router.push(`/pharmacy/${pharmacy.id}`)}
                activeOpacity={0.7}
                className="bg-white rounded-3xl p-5 mb-3 border border-slate-100 shadow-sm"
              >
                {/* Top row: icon + info + save */}
                <View className="flex-row items-start gap-4">
                  <View className={`w-14 h-14 rounded-2xl items-center justify-center ${pharmacy.verified ? "bg-teal-50" : "bg-slate-100"}`}>
                    <Ionicons name="storefront" size={26} color={pharmacy.verified ? "#0f766e" : "#94a3b8"} />
                  </View>

                  <View className="flex-1">
                    <View className="flex-row items-start justify-between">
                      <View className="flex-1 pr-2">
                        <View className="flex-row items-center gap-1.5">
                          <Text className="text-base font-bold text-slate-800" numberOfLines={1}>
                            {pharmacy.name}
                          </Text>
                          {pharmacy.verified && (
                            <Ionicons name="checkmark-circle" size={14} color="#0f766e" />
                          )}
                        </View>
                        <Text className="text-xs text-slate-400 font-semibold mt-0.5" numberOfLines={1}>
                          {pharmacy.address}
                        </Text>
                      </View>

                      <TouchableOpacity
                        onPress={(e) => {
                          e.stopPropagation();
                          toggleSavePharmacy(pharmacy.id);
                        }}
                        className="w-9 h-9 rounded-xl items-center justify-center"
                      >
                        <Ionicons
                          name={isSaved ? "bookmark" : "bookmark-outline"}
                          size={20}
                          color={isSaved ? "#0f766e" : "#94a3b8"}
                        />
                      </TouchableOpacity>
                    </View>

                    {/* Metadata row */}
                    <View className="flex-row items-center mt-3 gap-4 flex-wrap">
                      <View className="flex-row items-center gap-1">
                        <Ionicons name="location-outline" size={13} color="#64748b" />
                        <Text className="text-xs text-slate-500 font-semibold">{pharmacy.distance}</Text>
                      </View>
                      <View className="flex-row items-center gap-1">
                        <Ionicons name="star" size={13} color="#f59e0b" />
                        <Text className="text-xs font-bold text-slate-700">
                          {pharmacy.rating} ({pharmacy.reviews})
                        </Text>
                      </View>
                      <View className="flex-row items-center gap-1">
                        <Ionicons name="time-outline" size={13} color="#64748b" />
                        <Text className="text-xs text-slate-500 font-semibold">{pharmacy.openHours.split(":")[0]}</Text>
                      </View>
                    </View>

                    {/* Status + Action */}
                    <View className="flex-row items-center justify-between mt-4">
                      <View className={`flex-row items-center gap-1.5 px-3 py-1.5 rounded-full ${pharmacy.isOpen ? "bg-emerald-50 border border-emerald-100" : "bg-red-50 border border-red-100"}`}>
                        <View className={`w-1.5 h-1.5 rounded-full ${pharmacy.isOpen ? "bg-emerald-500" : "bg-red-500"}`} />
                        <Text className={`text-[10px] font-bold ${pharmacy.isOpen ? "text-emerald-700" : "text-red-700"}`}>
                          {pharmacy.isOpen ? "Open Now" : "Closed"}
                        </Text>
                      </View>

                      <View className="flex-row items-center gap-2">
                        <TouchableOpacity className="flex-row items-center gap-1 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl">
                          <Ionicons name="call-outline" size={14} color="#0f766e" />
                          <Text className="text-xs font-bold text-primary">Call</Text>
                        </TouchableOpacity>
                        <TouchableOpacity className="flex-row items-center gap-1 bg-primary px-3 py-2 rounded-xl">
                          <Ionicons name="navigate-outline" size={14} color="white" />
                          <Text className="text-xs font-bold text-white">Directions</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )
        }
      </ScrollView>
    </SafeAreaView>
  );
}
