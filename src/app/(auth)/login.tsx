import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter, Link } from "expo-router";
import { useApp } from "@/context/AppContext";
import { Ionicons } from "@expo/vector-icons";

export default function LoginScreen() {
  const { login } = useApp();
  const router = useRouter();
  const [email, setEmail] = useState("kwame.mensah@gmail.com");
  const [password, setPassword] = useState("patient1234");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
      router.replace("/(tabs)/home");
    } catch (err: any) {
      setError(err?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="px-6 pt-4 pb-4">
            <View className="bg-primary rounded-[32px] px-6 pt-6 pb-8 overflow-hidden">
              <View className="absolute -right-8 top-0 w-32 h-32 rounded-full bg-white/10" />
              <View className="absolute -left-6 -bottom-10 w-40 h-40 rounded-full bg-black/10" />

              <View className="flex-row items-center justify-between mb-10">
                <View className="flex-row items-center gap-3">
                  <Image
                    source={require("../../../assets/logo.png")}
                    style={{ width: 48, height: 48, borderRadius: 14 }}
                    resizeMode="contain"
                  />
                  <View>
                    <Text className="text-white text-2xl font-bold tracking-tight">MediFind</Text>
                    <Text className="text-white/60 text-[10px] font-bold uppercase tracking-widest">
                      Ghana Health Network
                    </Text>
                  </View>
                </View>
                <Link href="/(auth)/onboarding" asChild>
                  <TouchableOpacity className="bg-white/15 px-4 py-2 rounded-full">
                    <Text className="text-white text-xs font-bold uppercase tracking-wider">Skip</Text>
                  </TouchableOpacity>
                </Link>
              </View>

              <Text className="text-white text-3xl font-bold leading-tight">
                Find medicines{"\n"}near you, fast.
              </Text>
              <Text className="text-white/70 text-sm mt-3 leading-relaxed max-w-[320px]">
                Search, locate, and reserve prescriptions from verified pharmacies across Ghana.
              </Text>
            </View>
          </View>

          <View className="px-6 pt-4 pb-8 flex-1">
            <Text className="text-2xl font-bold text-slate-900 mb-1">Welcome back</Text>
            <Text className="text-slate-500 text-sm mb-8 font-semibold">Sign in to manage your reservations</Text>

            {error ? (
              <View className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-5">
                <Text className="text-red-700 text-xs font-bold">{error}</Text>
              </View>
            ) : null}

            <View className="mb-5">
              <Text className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                Email Address
              </Text>
              <View className="flex-row items-center bg-white border border-slate-200 rounded-2xl px-4">
                <Ionicons name="mail-outline" size={18} color="#94a3b8" />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="your@email.com"
                  placeholderTextColor="#94a3b8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  className="flex-1 py-4 px-3 text-sm text-slate-800"
                />
              </View>
            </View>

            <View className="mb-4">
              <Text className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                Password
              </Text>
              <View className="flex-row items-center bg-white border border-slate-200 rounded-2xl px-4">
                <Ionicons name="lock-closed-outline" size={18} color="#94a3b8" />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor="#94a3b8"
                  secureTextEntry={!showPassword}
                  className="flex-1 py-4 px-3 text-sm text-slate-800"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="#94a3b8"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View className="flex-row items-center justify-end mb-6">
              <Link href="/(auth)/forgot-password" asChild>
                <TouchableOpacity>
                  <Text className="text-primary font-bold text-sm">Forgot password?</Text>
                </TouchableOpacity>
              </Link>
            </View>

            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
              className="bg-primary rounded-2xl py-4 items-center flex-row justify-center gap-2 shadow-lg"
              style={{ shadowColor: "#0f766e", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 12 }}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Text className="text-white font-bold text-base">Sign In</Text>
                  <Ionicons name="arrow-forward" size={18} color="white" />
                </>
              )}
            </TouchableOpacity>

            <View className="flex-row items-center justify-center mt-8 gap-1">
              <Text className="text-slate-400 text-sm">Don't have an account?</Text>
              <Link href="/(auth)/register" asChild>
                <TouchableOpacity>
                  <Text className="text-primary font-bold text-sm">Sign Up</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
