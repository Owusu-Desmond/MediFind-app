import React from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "@/context/AppContext";

export default function ConfirmationSuccessScreen() {
  const router = useRouter();
  const { reservations, markReservationPaid } = useApp();
  const { reservationId } = useLocalSearchParams<{ reservationId?: string }>();
  const reservation = reservations.find((item) => item.id === reservationId);

  const handlePay = () => {
    if (!reservation) {
      router.replace("/(tabs)/reservations");
      return;
    }

    Alert.alert(
      "Paystack Payment",
      `Pay for ${reservation.medicineName} now?`,
      [
        { text: "Not Now", style: "cancel" },
        {
          text: "Pay",
          onPress: () => {
            markReservationPaid(reservation.id);
            router.replace("/(tabs)/reservations");
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center px-6" edges={["top"]}>
      <StatusBar style="dark" />
      <View className="w-full bg-white rounded-[32px] p-6 border border-slate-200 shadow-sm items-center">
        <View className="w-20 h-20 rounded-full bg-teal-50 items-center justify-center mb-4">
          <Ionicons name="checkmark-circle" size={40} color="#0f766e" />
        </View>
        <Text className="text-slate-900 text-2xl font-bold text-center">Reservation Approved</Text>
        <Text className="text-slate-500 text-sm text-center mt-3 leading-relaxed">Your reservation has been approved. Please complete payment within 2 hours.</Text>

        {reservation ? (
          <View className="w-full bg-slate-50 rounded-2xl p-4 mt-5 border border-slate-200 gap-2">
            <Text className="text-slate-900 font-bold text-sm">{reservation.medicineName}</Text>
            <Text className="text-slate-500 text-xs">{reservation.pharmacyName}</Text>
            <Text className="text-slate-500 text-xs">Status: {reservation.status}</Text>
          </View>
        ) : null}

        <TouchableOpacity onPress={handlePay} className="bg-primary rounded-2xl py-4 px-6 items-center mt-6 self-stretch shadow-lg" style={{ shadowColor: "#0f766e", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.22, shadowRadius: 16 }}>
          <Text className="text-white font-bold">Pay with Paystack</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.replace("/(tabs)/reservations")} className="bg-white rounded-2xl py-4 px-6 items-center mt-3 self-stretch border border-slate-200">
          <Text className="text-primary font-bold">View Reservations</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
