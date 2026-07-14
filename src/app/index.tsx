import "../global.css";
import { useEffect } from "react";
import { useRouter } from "expo-router";
import { View, Text, ActivityIndicator } from "react-native";
import { useApp } from "@/context/AppContext";

export default function Index() {
  const { user } = useApp();
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (user) {
        router.replace("/(tabs)/home");
      } else {
        router.replace("/(auth)/login");
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [user]);

  return (
    <View className="flex-1 bg-primary items-center justify-center">
      <View className="items-center gap-4">
        <View className="w-20 h-20 rounded-3xl bg-white/20 items-center justify-center">
          <Text className="text-white text-4xl font-bold">M</Text>
        </View>
        <Text className="text-white text-3xl font-bold tracking-tight">MediFind</Text>
        <Text className="text-white/60 text-sm font-semibold">Ghana Health Network</Text>
        <ActivityIndicator color="white" className="mt-6" />
      </View>
    </View>
  );
}
