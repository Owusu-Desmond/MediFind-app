import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "@/context/AppContext";

export default function StatusTimelineScreen() {
  const router = useRouter();
  const { reservations } = useApp();
  const { reservationId } = useLocalSearchParams<{ reservationId?: string }>();
  const reservation = reservations.find((item) => item.id === reservationId);

  let steps = [];
  
  if (reservation?.fulfillmentMethod === "Delivery") {
    steps = [
      { title: "Pending Pharmacy Review", active: true },
      { title: "Approved", active: false },
      ...(reservation.paymentMethod === "Pay Online" ? [{ title: "Paid", active: false }] : []),
      { title: "Preparing", active: false },
      { title: "Out for Delivery", active: false },
      { title: "Delivered", active: false },
    ];
  } else {
    steps = [
      { title: "Pending Pharmacy Review", active: true },
      { title: "Approved", active: false },
      ...(reservation?.paymentMethod === "Pay Online" ? [{ title: "Paid", active: false }] : []),
      { title: "Ready for Pickup", active: false },
      { title: "Collected", active: false },
    ];
  }

  const activeIndex = reservation
    ? steps.findIndex((step) => step.title === reservation.status)
    : 0;

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
                  router.replace("/(tabs)/reservations");
                }
              }}
              className="w-10 h-10 rounded-xl bg-white border border-slate-200 items-center justify-center shadow-sm"
            >
              <Ionicons name="arrow-back" size={20} color="#0f766e" />
            </TouchableOpacity>
            <Text className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Reservation Status</Text>
            <View className="w-10" />
          </View>
          <Text className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em]">Tracking</Text>
          <Text className="text-slate-900 text-2xl font-bold mt-1">Reservation Status Timeline</Text>
          {reservation ? <Text className="text-slate-500 text-sm mt-2 leading-relaxed">{reservation.medicineName} · {reservation.fulfillmentMethod}</Text> : null}
        </View>

        <View className="mx-6 mt-4 bg-white rounded-[32px] p-5 border border-slate-200 shadow-sm gap-4">
          {steps.map((step, index) => (
            <View key={step.title} className="flex-row items-center gap-4">
              <View className={`w-10 h-10 rounded-full items-center justify-center ${index <= activeIndex ? "bg-primary" : "bg-slate-100"}`}>
                <Text className={`font-bold text-sm ${index <= activeIndex ? "text-white" : "text-slate-500"}`}>{index + 1}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-slate-900 font-bold">{step.title}</Text>
                <Text className="text-slate-500 text-xs mt-1">{index < activeIndex ? "Completed" : index === activeIndex ? "Current step" : "Pending"}</Text>
              </View>
              {index <= activeIndex ? <Ionicons name="checkmark-circle" size={18} color="#0f766e" /> : <Ionicons name="ellipse-outline" size={18} color="#cbd5e1" />}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
