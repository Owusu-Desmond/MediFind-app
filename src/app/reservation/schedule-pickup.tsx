import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function SchedulePickupScreen() {
  const router = useRouter();
  const { medicineId, quantity } = useLocalSearchParams<{ medicineId?: string; quantity?: string }>();

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
            <Text className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Step 5 of 7</Text>
            <View className="w-10" />
          </View>
          <Text className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em]">Reservation</Text>
          <Text className="text-slate-900 text-2xl font-bold mt-1">Schedule Pickup</Text>
          <Text className="text-slate-500 text-sm mt-2 leading-relaxed">Choose a preferred date and time for collection.</Text>
        </View>

        <View className="mx-6 mt-4 bg-white rounded-[32px] p-5 border border-slate-200 shadow-sm gap-3">
          {[
            "Today · 4:00 PM - 6:00 PM",
            "Tomorrow · 9:00 AM - 12:00 PM",
            "Tomorrow · 3:00 PM - 6:00 PM",
          ].map((slot, index) => (
            <View key={slot} className={`p-4 rounded-2xl border flex-row items-center justify-between ${index === 0 ? "bg-teal-50 border-teal-100" : "bg-slate-50 border-slate-200"}`}>
              <Text className="text-slate-900 font-semibold">{slot}</Text>
              <View className={`w-5 h-5 rounded-full border-2 ${index === 0 ? "border-primary bg-primary" : "border-slate-300"}`} />
            </View>
          ))}
        </View>

        <View className="px-6 mt-5">
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/reservation/final-review",
                params: {
                  medicineId: medicineId ?? "",
                  quantity: quantity ?? "1",
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
