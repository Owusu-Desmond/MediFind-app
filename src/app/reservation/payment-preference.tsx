import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function PaymentPreferenceScreen() {
  const router = useRouter();
  const { medicineId, quantity } = useLocalSearchParams<{ medicineId?: string; quantity?: string }>();

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 28 }}>
        <View className="px-6 pt-4 pb-2">
          <View className="flex-row items-center justify-between mb-4">
            <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-xl bg-white border border-slate-200 items-center justify-center shadow-sm">
              <Ionicons name="arrow-back" size={20} color="#0f766e" />
            </TouchableOpacity>
            <Text className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Step 3 of 7</Text>
            <View className="w-10" />
          </View>
          <Text className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em]">Reservation</Text>
          <Text className="text-slate-900 text-2xl font-bold mt-1">Payment Preference</Text>
          <Text className="text-slate-500 text-sm mt-2 leading-relaxed">Select how you want to pay for the reservation.</Text>
        </View>

        <View className="mx-6 mt-4 gap-3">
          {[
            { title: "Pay at Pharmacy", desc: "Pay when you collect the medicine.", badge: "Recommended", active: true },
            { title: "Mobile Money", desc: "Pay securely using your mobile wallet.", badge: "Instant", active: false },
            { title: "Card / Cashless", desc: "Use a bank card for quick payment.", badge: "Fast", active: false },
          ].map((item) => (
            <View key={item.title} className={`rounded-[32px] p-5 border ${item.active ? "bg-teal-50 border-teal-100" : "bg-white border-slate-200"}`}>
              <View className="flex-row items-start gap-4">
                <View className={`w-12 h-12 rounded-2xl items-center justify-center ${item.active ? "bg-primary" : "bg-slate-100"}`}>
                  <Ionicons name={item.active ? "cash-outline" : "card-outline"} size={22} color={item.active ? "white" : "#64748b"} />
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center gap-2">
                    <Text className="text-slate-900 font-bold text-base">{item.title}</Text>
                    <View className={`px-2.5 py-1 rounded-full ${item.active ? "bg-primary" : "bg-slate-100"}`}>
                      <Text className={`text-[10px] font-bold ${item.active ? "text-white" : "text-slate-500"}`}>{item.badge}</Text>
                    </View>
                  </View>
                  <Text className="text-slate-500 text-xs mt-1 leading-relaxed">{item.desc}</Text>
                </View>
                <View className={`w-5 h-5 rounded-full border-2 ${item.active ? "border-primary bg-primary" : "border-slate-300"}`} />
              </View>
            </View>
          ))}
        </View>

        <View className="px-6 mt-5">
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/reservation/pharmacy-payment-info",
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
