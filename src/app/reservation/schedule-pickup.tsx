import React, { useState, useMemo } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "@/context/AppContext";
import { generatePickupSlots } from "@/utils/date";

export default function SchedulePickupScreen() {
  const router = useRouter();
  const { medicines, pharmacies } = useApp();
  const { medicineId, quantity } = useLocalSearchParams<{ medicineId?: string; quantity?: string }>();

  const medicine = medicines.find((m) => m.id === medicineId);
  const pharmacy = pharmacies.find((p) => p.id === medicine?.pharmacyId || p.name === medicine?.pharmacy);

  const slots = useMemo(() => generatePickupSlots(pharmacy?.openHours), [pharmacy?.openHours]);
  const [selectedSlot, setSelectedSlot] = useState(slots[0]?.title || "As soon as approved");

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
      <StatusBar style="dark" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 28 }}>
        <View className="px-6 pt-4 pb-2">
          <View className="flex-row items-center justify-between mb-4">
            <TouchableOpacity
              onPress={() => {
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.replace("/(tabs)/home");
                }
              }}
              className="w-10 h-10 rounded-xl bg-white border border-slate-200 items-center justify-center shadow-sm"
            >
              <Ionicons name="arrow-back" size={20} color="#0f766e" />
            </TouchableOpacity>
            <Text className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Step 5 of 7</Text>
            <View className="w-10" />
          </View>
          <Text className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em]">Reservation</Text>
          <Text className="text-slate-900 text-2xl font-bold mt-1">Schedule Pickup</Text>
          <Text className="text-slate-500 text-sm mt-2 leading-relaxed">
            Choose a preferred collection time based on {pharmacy?.name || "pharmacy"} operating hours.
          </Text>
        </View>

        <View className="mx-6 mt-4 bg-white rounded-[32px] p-5 border border-slate-200 shadow-sm gap-3">
          {slots.map((slot) => {
            const isSelected = selectedSlot === slot.title;
            return (
              <TouchableOpacity
                key={slot.id}
                onPress={() => setSelectedSlot(slot.title)}
                className={`p-4 rounded-2xl border flex-row items-center justify-between ${
                  isSelected ? "bg-teal-50 border-teal-500" : "bg-slate-50 border-slate-200"
                }`}
              >
                <View className="flex-1 pr-2">
                  <View className="flex-row items-center gap-2">
                    <Text className="text-slate-900 font-bold text-xs">{slot.title}</Text>
                    {slot.badge && (
                      <View className="bg-emerald-100 px-1.5 py-0.5 rounded-md">
                        <Text className="text-emerald-800 text-[9px] font-extrabold uppercase">
                          {slot.badge}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text className="text-slate-400 text-[11px] mt-0.5">{slot.subtitle}</Text>
                </View>
                <View
                  className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
                    isSelected ? "border-primary bg-primary" : "border-slate-300"
                  }`}
                >
                  {isSelected && <View className="w-2 h-2 rounded-full bg-white" />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View className="px-6 mt-5">
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/reservation/final-review",
                params: {
                  medicineId: medicineId ?? "",
                  quantity: quantity ?? "1",
                  pickupDate: selectedSlot,
                },
              } as never)
            }
            className="bg-primary rounded-2xl py-4 items-center shadow-lg"
            style={{ shadowColor: "#0f766e", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.22, shadowRadius: 16 }}
          >
            <Text className="text-white font-bold">Continue</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
