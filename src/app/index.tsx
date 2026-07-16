import "../global.css";
import { useEffect } from "react";
import { useRouter } from "expo-router";
import { View, Text, ActivityIndicator } from "react-native";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/(auth)/onboarding");
    }, 800);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View className="flex-1 bg-slate-50 items-center justify-center px-6">
      <View className="absolute inset-0">
        <View className="absolute -top-20 -right-12 w-56 h-56 rounded-full bg-teal-200/30" />
        <View className="absolute top-1/3 -left-16 w-48 h-48 rounded-full bg-sky-200/30" />
      </View>
      <View className="items-center gap-4">
        <View className="w-24 h-24 rounded-[28px] bg-primary items-center justify-center shadow-xl" style={{ shadowColor: "#0f766e", shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.18, shadowRadius: 24 }}>
          <Text className="text-white text-4xl font-bold">M</Text>
        </View>
        <View className="items-center">
          <Text className="text-slate-900 text-3xl font-bold tracking-tight">MediFind</Text>
          <Text className="text-slate-500 text-sm font-semibold mt-1">Ghana Health Network</Text>
        </View>
        <View className="mt-6 flex-row items-center gap-3 bg-white rounded-full px-4 py-2 border border-slate-200">
          <ActivityIndicator color="#0f766e" />
          <Text className="text-slate-500 text-xs font-semibold uppercase tracking-[0.2em]">Loading your pharmacy network</Text>
        </View>
      </View>
    </View>
  );
}
