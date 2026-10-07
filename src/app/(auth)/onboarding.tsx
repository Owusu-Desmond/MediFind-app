import React from "react";
import { View, Text, TouchableOpacity, ScrollView, Image } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";

const STEPS = [
  {
    title: "Find Medicines Nearby",
    description: "Search for available medicine at pharmacies near your location.",
    icon: "location-outline",
  },
  {
    title: "Compare Pharmacies",
    description: "Check price, distance, opening hours, and verified availability.",
    icon: "swap-horizontal-outline",
  },
  {
    title: "Reserve With Confidence",
    description: "Choose a pharmacy, confirm quantity, and track the reservation.",
    icon: "shield-checkmark-outline",
  },
];

export default function OnboardingScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
      <StatusBar style="dark" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
        <View className="px-6 pt-4 pb-6 flex-1 justify-between">
          <View>
            <View className="flex-row items-center justify-between mb-6">
              <View className="flex-row items-center gap-3">
                <Image
                  source={require("../../../assets/logo.png")}
                  style={{ width: 44, height: 44, borderRadius: 14 }}
                  resizeMode="contain"
                />
                <View>
                  <Text className="text-slate-900 text-2xl font-bold">MediFind</Text>
                  <Text className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">
                    Ghana Health Network
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => router.replace("/(auth)/login")}
              >
                <Text className="text-primary text-sm font-bold">Skip</Text>
              </TouchableOpacity>
            </View>

            <View className="bg-white rounded-[32px] p-6 border border-slate-200 shadow-sm">
              <View className="items-center mb-6">
                <Image
                  source={require("../../../assets/logo.png")}
                  style={{ width: 84, height: 84, borderRadius: 24, marginBottom: 16 }}
                  resizeMode="contain"
                />
                <Text className="text-slate-900 text-3xl font-bold text-center leading-tight">
                  Find medicine faster.
                </Text>
                <Text className="text-slate-500 text-sm text-center mt-3 leading-relaxed max-w-[300px]">
                  The easiest way to search, compare, and reserve verified pharmacy stock in Ghana.
                </Text>
              </View>

              <View className="gap-3">
                {STEPS.map((step, index) => (
                  <View key={step.title} className="flex-row items-center gap-3 bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <View className="w-11 h-11 rounded-2xl bg-white items-center justify-center border border-slate-200">
                      <Ionicons name={step.icon as any} size={20} color="#0f766e" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-slate-900 font-bold">{index + 1}. {step.title}</Text>
                      <Text className="text-slate-500 text-xs mt-1 leading-relaxed">{step.description}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>

          <View className="mt-6">
            <View className="flex-row items-center justify-center gap-2 mb-5">
              <View className="w-8 h-2 rounded-full bg-primary" />
              <View className="w-2 h-2 rounded-full bg-slate-300" />
              <View className="w-2 h-2 rounded-full bg-slate-300" />
            </View>

            <TouchableOpacity
              onPress={() => router.replace("/(auth)/register")}
              className="bg-primary rounded-2xl py-4 items-center shadow-lg"
              style={{ shadowColor: "#0f766e", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.22, shadowRadius: 16 }}
            >
              <Text className="text-white font-bold text-base">Get Started</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.replace("/(auth)/login")}
              className="py-4 items-center"
            >
              <Text className="text-slate-500 font-bold text-sm">I already have an account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
