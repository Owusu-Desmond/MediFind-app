import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function PharmacyPaymentInfoScreen() {
  const router = useRouter();
  const { medicineId, quantity } = useLocalSearchParams<{ medicineId?: string; quantity?: string }>();

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
            <Text className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Step 4 of 7</Text>
            <View className="w-10" />
          </View>
          <Text className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em]">Reservation</Text>
          <Text className="text-slate-900 text-2xl font-bold mt-1">Pharmacy Payment Info</Text>
          <Text className="text-slate-500 text-sm mt-2 leading-relaxed">Review the payment instructions from the selected pharmacy.</Text>
        </View>

        <View className="mx-6 mt-4 bg-white rounded-[32px] p-5 border border-slate-200 shadow-sm">
          <View className="flex-row items-center gap-3 mb-4">
            <View className="w-14 h-14 rounded-2xl bg-teal-50 items-center justify-center">
              <Ionicons name="information-circle-outline" size={28} color="#0f766e" />
            </View>
            <View className="flex-1">
              <Text className="text-slate-900 font-bold text-base">Ghana National Pharmacy</Text>
              <Text className="text-slate-500 text-xs mt-0.5">Ring Road Central, Accra</Text>
            </View>
          </View>

          <View className="bg-slate-50 rounded-2xl p-4 border border-slate-200 gap-3">
            <Text className="text-slate-900 font-bold text-sm">Payment options</Text>
            <Text className="text-slate-500 text-xs leading-relaxed">Pay at pickup is available for this pharmacy. If mobile money is chosen, the payment reference will be sent after approval.</Text>
          </View>
        </View>

        <View className="px-6 mt-5">
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/reservation/schedule-pickup",
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
