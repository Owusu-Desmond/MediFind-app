import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function RequestSubmittedScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center px-6" edges={["top"]}>
      <StatusBar style="dark" />
      <View className="w-full bg-white rounded-[32px] p-6 border border-slate-200 shadow-sm items-center">
        <View className="w-20 h-20 rounded-full bg-emerald-50 items-center justify-center mb-4">
          <Ionicons name="paper-plane-outline" size={36} color="#059669" />
        </View>
        <Text className="text-slate-900 text-2xl font-bold text-center">Pending Pharmacy Review</Text>
        <Text className="text-slate-500 text-sm text-center mt-3 leading-relaxed">Your reservation request has been sent to the pharmacy for review. Fulfillment options and payment will unlock after approval.</Text>

        <TouchableOpacity onPress={() => router.replace("/(tabs)/reservations")} className="bg-primary rounded-2xl py-4 px-6 items-center mt-6 self-stretch shadow-lg" style={{ shadowColor: "#0f766e", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.22, shadowRadius: 16 }}>
          <Text className="text-white font-bold">Go to Reservations</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
