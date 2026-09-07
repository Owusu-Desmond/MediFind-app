import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";

import { useApp } from "@/context/AppContext";

export default function SelectPharmacyScreen() {
  const router = useRouter();
  const { pharmacies } = useApp();
  const { medicineId, quantity } = useLocalSearchParams<{ medicineId?: string; quantity?: string }>();

  useEffect(() => {
    router.replace({
      pathname: "/reservation/details-notes",
      params: {
        medicineId: medicineId ?? "",
        quantity: quantity ?? "1",
      },
    } as never);
  }, [medicineId, quantity, router]);

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
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
            <Text className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Step 1 of 8</Text>
            <View className="w-10" />
          </View>
          <Text className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em]">Reservation</Text>
          <Text className="text-slate-900 text-2xl font-bold mt-1">Select Pharmacy & Quantity</Text>
          <Text className="text-slate-500 text-sm mt-2 leading-relaxed">Choose a verified pharmacy before setting quantity and adding notes.</Text>
        </View>

        <View className="mx-6 mt-4 bg-white rounded-[32px] p-5 border border-slate-200 shadow-sm">
          <View className="flex-row items-center gap-3 mb-4">
            <View className="w-14 h-14 rounded-2xl bg-teal-50 items-center justify-center">
              <Ionicons name="medkit" size={28} color="#0f766e" />
            </View>
            <View className="flex-1">
              <Text className="text-slate-900 font-bold text-base">Paracetamol 500mg</Text>
              <Text className="text-slate-500 text-xs mt-0.5">Acetaminophen · Analgesic</Text>
            </View>
            <Text className="text-primary font-bold text-lg">GH₵5.50</Text>
          </View>

          <Text className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Verified Pharmacies</Text>
          {pharmacies.map((pharmacy, index) => (
            <TouchableOpacity key={pharmacy.name} className={`p-4 rounded-2xl border mb-3 ${index === 0 ? "bg-teal-50 border-teal-100" : "bg-slate-50 border-slate-200"}`}>
              <View className="flex-row items-start justify-between">
                <View className="flex-1 pr-2">
                  <View className="flex-row items-center gap-2">
                    <Text className="text-slate-900 font-bold">{pharmacy.name}</Text>
                    {pharmacy.isOpen ? <Ionicons name="time-outline" size={12} color="#0f766e" /> : null}
                  </View>
                  <Text className="text-slate-500 text-xs mt-1">{pharmacy.distance} · {pharmacy.rating} rating</Text>
                </View>
                <View className={`px-2.5 py-1 rounded-full ${pharmacy.isOpen ? "bg-emerald-50" : "bg-red-50"}`}>
                  <Text className={`text-[10px] font-bold ${pharmacy.isOpen ? "text-emerald-700" : "text-red-700"}`}>{pharmacy.isOpen ? "Open" : "Closed"}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View className="px-6 mt-5">
          <TouchableOpacity onPress={() => router.push("/reservation/details-notes" as never)} className="bg-primary rounded-2xl py-4 items-center shadow-lg" style={{ shadowColor: "#0f766e", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.22, shadowRadius: 16 }}>
            <Text className="text-white font-bold">Continue</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
