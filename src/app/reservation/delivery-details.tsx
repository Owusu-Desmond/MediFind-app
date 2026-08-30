import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInput, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "@/context/AppContext";

export default function DeliveryDetailsScreen() {
  const router = useRouter();
  const { reservationId, fulfillmentMethod, paymentMethod } = useLocalSearchParams<{ reservationId?: string; fulfillmentMethod?: "Pickup" | "Delivery"; paymentMethod?: string }>();
  const { updateFulfillmentAndPayment, user } = useApp();

  const [address, setAddress] = useState(user?.location ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [instructions, setInstructions] = useState("");

  const handleSubmit = async () => {
    if (!reservationId || !fulfillmentMethod || !paymentMethod) return;

    const fullAddress = instructions ? `${address} (Note: ${instructions})` : address;

    if (paymentMethod === "Pay Online") {
      router.push({
        pathname: "/reservation/mock-paystack",
        params: { reservationId, fulfillmentMethod, address: fullAddress },
      } as never);
    } else {
      await updateFulfillmentAndPayment(reservationId, fulfillmentMethod, paymentMethod, fullAddress);
      router.push("/(tabs)/reservations" as never);
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
            <Text className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Step 3 of 3</Text>
            <View className="w-10" />
          </View>
          <Text className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em]">Reservation</Text>
          <Text className="text-slate-900 text-2xl font-bold mt-1">Delivery Details</Text>
          <Text className="text-slate-500 text-sm mt-2 leading-relaxed">Please provide your delivery address and contact information.</Text>
        </View>

        <View className="mx-6 mt-4 bg-white rounded-[32px] p-5 border border-slate-200 shadow-sm">
          <Text className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Delivery Address</Text>
          <TextInput
            placeholder="e.g. 14 Boundary Road, East Legon"
            placeholderTextColor="#94a3b8"
            value={address}
            onChangeText={setAddress}
            className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-slate-800 mb-4"
          />

          <Text className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Contact Number</Text>
          <TextInput
            placeholder="e.g. +233 24 000 0000"
            placeholderTextColor="#94a3b8"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-slate-800 mb-4"
          />

          <Text className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Delivery Instructions (Optional)</Text>
          <TextInput
            placeholder="e.g. Leave with security at the gate"
            placeholderTextColor="#94a3b8"
            multiline
            value={instructions}
            onChangeText={setInstructions}
            className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-slate-800 min-h-[100px]"
            textAlignVertical="top"
          />
        </View>

        <View className="px-6 mt-5">
          <TouchableOpacity onPress={handleSubmit} className="bg-primary rounded-2xl py-4 items-center shadow-lg" style={{ shadowColor: "#0f766e", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.22, shadowRadius: 16 }}>
            <Text className="text-white font-bold">{paymentMethod === "Pay Online" ? "Continue to Payment" : "Confirm Delivery"}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
