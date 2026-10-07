import React, { useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "@/context/AppContext";

export default function MockPaystackScreen() {
  const { reservationId, fulfillmentMethod, address } = useLocalSearchParams<{
    reservationId?: string;
    fulfillmentMethod?: "Pickup" | "Delivery";
    address?: string;
  }>();
  const { updateFulfillmentAndPayment } = useApp();
  const router = useRouter();

  useEffect(() => {
    // Simulate a payment process taking 3 seconds
    const timer = setTimeout(async () => {
      if (reservationId && fulfillmentMethod) {
        await updateFulfillmentAndPayment(reservationId, fulfillmentMethod, "Pay Online", address);
        router.replace("/(tabs)/reservations" as never);
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [reservationId, fulfillmentMethod, address]);

  return (
    <SafeAreaView className="flex-1 bg-white items-center justify-center px-6">
      <StatusBar style="dark" />
      <View className="items-center justify-center mb-8">
        <View className="w-24 h-24 rounded-full bg-blue-50 items-center justify-center mb-6">
          <Ionicons name="card" size={48} color="#0284c7" />
        </View>
        <Text className="text-2xl font-bold text-slate-800 text-center mb-2">Processing Payment...</Text>
        <Text className="text-slate-500 text-center px-4 leading-relaxed">
          Please wait while we securely process your Paystack payment. Do not close this screen.
        </Text>
      </View>
      <ActivityIndicator size="large" color="#0ea5e9" />
    </SafeAreaView>
  );
}
