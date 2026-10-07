import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "@/context/AppContext";

export default function PaymentPreferenceScreen() {
  const router = useRouter();
  const { reservationId, fulfillmentMethod } = useLocalSearchParams<{ reservationId?: string; fulfillmentMethod?: "Pickup" | "Delivery" }>();
  const { updateFulfillmentAndPayment } = useApp();

  const isDelivery = fulfillmentMethod === "Delivery";
  
  const paymentOptions = isDelivery ? [
    { title: "Pay Online with Paystack", desc: "Pay securely with Mobile Money (MTN, Telecel, AT) or Card.", value: "Pay Online" as const, icon: "card-outline" },
    { title: "Pay on Delivery", desc: "Pay cash directly when the medicine is delivered.", value: "Pay on Delivery" as const, icon: "cash-outline" },
  ] : [
    { title: "Pay Online with Paystack", desc: "Pay securely with Mobile Money (MTN, Telecel, AT) or Card.", value: "Pay Online" as const, icon: "card-outline" },
    { title: "Pay at Pharmacy", desc: "Pay cash at the pharmacy counter upon pickup.", value: "Pay at Pharmacy" as const, icon: "cash-outline" },
  ];

  const [payment, setPayment] = useState<string>("Pay Online");

  const handleContinue = async () => {
    if (!reservationId || !fulfillmentMethod) return;

    if (isDelivery) {
      router.push({
        pathname: "/reservation/delivery-details",
        params: { reservationId, fulfillmentMethod, paymentMethod: payment },
      } as never);
    } else {
      if (payment === "Pay Online") {
        router.push({
          pathname: "/reservation/paystack-checkout",
          params: { reservationId, fulfillmentMethod },
        } as never);
      } else {
        await updateFulfillmentAndPayment(reservationId, fulfillmentMethod, payment);
        router.replace({
          pathname: "/reservation/status-timeline",
          params: { reservationId },
        } as never);
      }
    }
  };


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
            <Text className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Step 2 of 2</Text>
            <View className="w-10" />
          </View>
          <Text className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em]">Reservation</Text>
          <Text className="text-slate-900 text-2xl font-bold mt-1">Payment Preference</Text>
          <Text className="text-slate-500 text-sm mt-2 leading-relaxed">Select how you want to pay for the reservation.</Text>
        </View>

        <View className="mx-6 mt-4 gap-3">
          {paymentOptions.map((item) => (
            <TouchableOpacity
              key={item.title}
              onPress={() => setPayment(item.value)}
              className={`rounded-[32px] p-5 border ${payment === item.value ? "bg-teal-50 border-teal-100" : "bg-white border-slate-200"}`}
            >
              <View className="flex-row items-start gap-4">
                <View className={`w-12 h-12 rounded-2xl items-center justify-center ${payment === item.value ? "bg-primary" : "bg-slate-100"}`}>
                  <Ionicons name={item.icon as any} size={22} color={payment === item.value ? "white" : "#64748b"} />
                </View>
                <View className="flex-1">
                  <Text className="text-slate-900 font-bold text-base">{item.title}</Text>
                  <Text className="text-slate-500 text-xs mt-1 leading-relaxed">{item.desc}</Text>
                </View>
                <View className={`w-5 h-5 rounded-full border-2 ${payment === item.value ? "border-primary bg-primary" : "border-slate-300"}`} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View className="px-6 mt-5">
          <TouchableOpacity
            onPress={handleContinue}
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
