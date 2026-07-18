import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInput, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "@/context/AppContext";

export default function CreateRequestScreen() {
  const router = useRouter();
  const { medicines, createReservation } = useApp();
  const { medicineId, initialQuantity } = useLocalSearchParams<{ medicineId?: string; initialQuantity?: string }>();

  const medicine = medicines.find((item) => item.id === medicineId);
  const [qty, setQty] = useState(Number(initialQuantity ?? "1") || 1);
  const [notes, setNotes] = useState("");
  const [pickupDate, setPickupDate] = useState("Today · 4:00 PM - 6:00 PM");

  const pharmacyName = medicine?.pharmacy ?? "Selected pharmacy";

  const handleSubmit = () => {
    if (medicine) {
      createReservation(medicine, qty, pickupDate, notes);
      router.push("/reservation/request-submitted" as never);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 28 }}>
        <View className="px-6 pt-4 pb-2">
          <View className="flex-row items-center justify-between mb-4">
            <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-xl bg-white border border-slate-200 items-center justify-center shadow-sm">
              <Ionicons name="arrow-back" size={20} color="#0f766e" />
            </TouchableOpacity>
            <Text className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Step 1 of 3</Text>
            <View className="w-10" />
          </View>
          <Text className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em]">Reservation</Text>
          <Text className="text-slate-900 text-2xl font-bold mt-1">Create Request</Text>
          <Text className="text-slate-500 text-sm mt-2 leading-relaxed">Enter details for your reservation request.</Text>
        </View>

        <View className="mx-6 mt-4 bg-white rounded-[32px] p-5 border border-slate-200 shadow-sm">
          <Text className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Medicine</Text>
          <View className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 gap-1 mb-4">
            <Text className="text-slate-900 font-bold">{medicine?.name ?? "Medicine"}</Text>
            <Text className="text-slate-500 text-xs">{pharmacyName}</Text>
          </View>

          <Text className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Quantity</Text>
          <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden self-start mb-4">
            <TouchableOpacity onPress={() => setQty(Math.max(1, qty - 1))} className="w-12 h-12 items-center justify-center">
              <Ionicons name="remove" size={20} color="#64748b" />
            </TouchableOpacity>
            <View className="w-12 h-12 items-center justify-center border-x border-slate-200">
              <Text className="text-base font-bold text-slate-800">{qty}</Text>
            </View>
            <TouchableOpacity onPress={() => setQty(qty + 1)} className="w-12 h-12 items-center justify-center">
              <Ionicons name="add" size={20} color="#64748b" />
            </TouchableOpacity>
          </View>

          <Text className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Expected Date</Text>
          <View className="gap-2 mb-4">
            {[
              "Today · 4:00 PM - 6:00 PM",
              "Tomorrow · 9:00 AM - 12:00 PM",
            ].map((slot) => (
              <TouchableOpacity
                key={slot}
                onPress={() => setPickupDate(slot)}
                className={`p-4 rounded-2xl border flex-row items-center justify-between ${pickupDate === slot ? "bg-teal-50 border-teal-100" : "bg-slate-50 border-slate-200"}`}
              >
                <Text className="text-slate-900 font-semibold text-sm">{slot}</Text>
                <View className={`w-5 h-5 rounded-full border-2 ${pickupDate === slot ? "border-primary bg-primary" : "border-slate-300"}`} />
              </TouchableOpacity>
            ))}
          </View>

          <Text className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Notes</Text>
          <TextInput
            placeholder="Add allergies, preferred contact time, or other notes"
            placeholderTextColor="#94a3b8"
            multiline
            value={notes}
            onChangeText={setNotes}
            className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-slate-800 min-h-[100px]"
            textAlignVertical="top"
          />
        </View>

        <View className="px-6 mt-5">
          <TouchableOpacity onPress={handleSubmit} className="bg-primary rounded-2xl py-4 items-center shadow-lg" style={{ shadowColor: "#0f766e", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.22, shadowRadius: 16 }}>
            <Text className="text-white font-bold">Submit Request</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
