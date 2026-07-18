import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function FulfillmentMethodScreen() {
  const [fulfillment, setFulfillment] = React.useState<"Pickup" | "Delivery">("Pickup");
  const { reservationId } = useLocalSearchParams<{ reservationId?: string }>();
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 28 }}>
        <View className="px-6 pt-4 pb-2">
          <View className="flex-row items-center justify-between mb-4">
            <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-xl bg-white border border-slate-200 items-center justify-center shadow-sm">
              <Ionicons name="arrow-back" size={20} color="#0f766e" />
            </TouchableOpacity>
            <Text className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Step 2 of 7</Text>
            <View className="w-10" />
          </View>
          <Text className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em]">Reservation</Text>
          <Text className="text-slate-900 text-2xl font-bold mt-1">Fulfillment Method</Text>
          <Text className="text-slate-500 text-sm mt-2 leading-relaxed">Choose how you want to receive your medicine reservation.</Text>
        </View>

        <View className="mx-6 mt-4 gap-3">
          {[
            { title: "Pickup at Pharmacy", desc: "Collect your medicine directly from the selected branch.", value: "Pickup" as const, icon: "storefront" },
            { title: "Home Delivery", desc: "Have the pharmacy send it to your address.", value: "Delivery" as const, icon: "car-outline" },
          ].map((item) => (
            <TouchableOpacity
              key={item.title}
              onPress={() => setFulfillment(item.value)}
              className={`rounded-[32px] p-5 border ${fulfillment === item.value ? "bg-teal-50 border-teal-100" : "bg-white border-slate-200"}`}
            >
              <View className="flex-row items-start gap-4">
                <View className={`w-12 h-12 rounded-2xl items-center justify-center ${fulfillment === item.value ? "bg-primary" : "bg-slate-100"}`}>
                  <Ionicons name={item.icon as any} size={22} color={fulfillment === item.value ? "white" : "#64748b"} />
                </View>
                <View className="flex-1">
                  <Text className="text-slate-900 font-bold text-base">{item.title}</Text>
                  <Text className="text-slate-500 text-xs mt-1 leading-relaxed">{item.desc}</Text>
                </View>
                <View className={`w-5 h-5 rounded-full border-2 ${fulfillment === item.value ? "border-primary bg-primary" : "border-slate-300"}`} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View className="px-6 mt-5">
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/reservation/payment-preference",
                params: {
                  reservationId: reservationId ?? "",
                  fulfillmentMethod: fulfillment,
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
