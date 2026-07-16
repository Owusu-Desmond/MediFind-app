import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function ConfirmationSuccessScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center px-6" edges={["top"]}>
      <View className="w-full bg-white rounded-[32px] p-6 border border-slate-200 shadow-sm items-center">
        <View className="w-20 h-20 rounded-full bg-teal-50 items-center justify-center mb-4">
          <Ionicons name="checkmark-circle" size={40} color="#0f766e" />
        </View>
        <Text className="text-slate-900 text-2xl font-bold text-center">Reservation Confirmed</Text>
        <Text className="text-slate-500 text-sm text-center mt-3 leading-relaxed">You can track the status of this reservation in the reservations tab.</Text>

        <TouchableOpacity onPress={() => router.replace("/(tabs)/reservations")} className="bg-primary rounded-2xl py-4 px-6 items-center mt-6 self-stretch shadow-lg" style={{ shadowColor: "#0f766e", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.22, shadowRadius: 16 }}>
          <Text className="text-white font-bold">Go to Reservations</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
