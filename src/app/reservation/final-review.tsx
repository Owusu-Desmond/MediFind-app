import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "@/context/AppContext";

export default function FinalReviewScreen() {
  const router = useRouter();
  const { medicines, createReservation } = useApp();
  const { medicineId, quantity } = useLocalSearchParams<{ medicineId?: string; quantity?: string }>();
  const selectedQuantity = Number(quantity ?? "1") || 1;
  const medicine = medicines.find((item) => item.id === medicineId) ?? medicines[0];

  const handleSubmit = () => {
    if (medicine) {
      createReservation(medicine, selectedQuantity, "Today, 4:00 PM", "Prescription attached");
    }
    router.push("/reservation/request-submitted" as never);
  };


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
            <Text className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Step 6 of 7</Text>
            <View className="w-10" />
          </View>
          <Text className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em]">Reservation</Text>
          <Text className="text-slate-900 text-2xl font-bold mt-1">Final Review</Text>
          <Text className="text-slate-500 text-sm mt-2 leading-relaxed">Confirm the medicine, pharmacy, payment, and pickup details before submitting.</Text>
        </View>

        <View className="mx-6 mt-4 bg-white rounded-[32px] p-5 border border-slate-200 shadow-sm gap-3">
          {[
            ["Medicine", medicine.name],
            ["Pharmacy", medicine.pharmacy],
            ["Quantity", `${selectedQuantity} unit${selectedQuantity === 1 ? "" : "s"}`],
            ["Fulfillment", "Pickup at Pharmacy"],
            ["Payment", "Pay at Pharmacy"],
            ["Pickup", "Today · 4:00 PM - 6:00 PM"],
          ].map(([label, value]) => (
            <View key={label} className="flex-row items-center justify-between py-2 border-b border-slate-100 last:border-b-0">
              <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider">{label}</Text>
              <Text className="text-slate-900 text-sm font-semibold text-right flex-1 pl-4">{value}</Text>
            </View>
          ))}
        </View>

        <View className="px-6 mt-5 gap-3">
          <TouchableOpacity onPress={handleSubmit} className="bg-primary rounded-2xl py-4 items-center shadow-lg" style={{ shadowColor: "#0f766e", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.22, shadowRadius: 16 }}>
            <Text className="text-white font-bold">Submit Reservation Request</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace("/(tabs)/home");
              }
            }}
            className="bg-white rounded-2xl py-4 items-center border border-slate-200"
          >
            <Text className="text-primary font-bold">Go Back</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
