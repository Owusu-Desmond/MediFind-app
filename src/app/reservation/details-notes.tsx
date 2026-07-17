import React from "react";
import { View, Text, TouchableOpacity, TextInput, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "@/context/AppContext";

export default function DetailsNotesScreen() {
  const router = useRouter();
  const { medicines } = useApp();
  const { medicineId, quantity } = useLocalSearchParams<{ medicineId?: string; quantity?: string }>();

  const medicine = medicines.find((item) => item.id === medicineId);
  const selectedQuantity = Number(quantity ?? "1") || 1;
  const pharmacyName = medicine?.pharmacy ?? "Selected pharmacy";

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 28 }}>
        <View className="px-6 pt-4 pb-2">
          <View className="flex-row items-center justify-between mb-4">
            <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-xl bg-white border border-slate-200 items-center justify-center shadow-sm">
              <Ionicons name="arrow-back" size={20} color="#0f766e" />
            </TouchableOpacity>
            <Text className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Step 1 of 7</Text>
            <View className="w-10" />
          </View>
          <Text className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em]">Reservation</Text>
          <Text className="text-slate-900 text-2xl font-bold mt-1">Details & Notes</Text>
          <Text className="text-slate-500 text-sm mt-2 leading-relaxed">Add extra information for the pharmacy before moving to fulfillment options.</Text>
        </View>

        <View className="mx-6 mt-4 bg-white rounded-[32px] p-5 border border-slate-200 shadow-sm">
          <Text className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Selected medicine</Text>
          <View className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 gap-1">
            <Text className="text-slate-900 font-bold">{medicine?.name ?? "Medicine"}</Text>
            <Text className="text-slate-500 text-xs">{pharmacyName}</Text>
            <Text className="text-slate-500 text-xs">Quantity: {selectedQuantity} unit{selectedQuantity === 1 ? "" : "s"}</Text>
          </View>

          <Text className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-5 mb-2">Notes</Text>
          <TextInput
            placeholder="Add allergies, preferred contact time, or other notes"
            placeholderTextColor="#94a3b8"
            multiline
            className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-slate-800 min-h-[120px]"
          />
        </View>

        <View className="px-6 mt-5">
          <TouchableOpacity onPress={() => router.push("/reservation/request-submitted" as never)} className="bg-primary rounded-2xl py-4 items-center shadow-lg" style={{ shadowColor: "#0f766e", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.22, shadowRadius: 16 }}>
            <Text className="text-white font-bold">Continue</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
