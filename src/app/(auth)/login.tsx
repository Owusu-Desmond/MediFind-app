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
} from "react-native";
import { useRouter, Link } from "expo-router";
import { useApp } from "@/context/AppContext";
import { Ionicons } from "@expo/vector-icons";

export default function LoginScreen() {
  const { login } = useApp();
  const router = useRouter();
  const [email, setEmail] = useState("kwame.mensah@gmail.com");
  const [password, setPassword] = useState("patient123");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = () => {
    setError("");
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      login(email, password);
      setLoading(false);
      router.replace("/(tabs)/home");
    }, 1200);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View className="bg-primary pt-20 pb-14 px-8 rounded-b-[40px]">
          <View className="flex-row items-center gap-3 mb-8">
            <View className="w-12 h-12 rounded-2xl bg-white/20 items-center justify-center">
              <Ionicons name="medical" size={24} color="white" />
            </View>
            <View>
              <Text className="text-white text-2xl font-bold tracking-tight">MediFind</Text>
              <Text className="text-white/60 text-[10px] font-bold uppercase tracking-widest">
                Ghana Health Network
              </Text>
            </View>
          </View>

          <Text className="text-white text-3xl font-bold leading-tight">
            Find medicines{"\n"}near you, fast.
          </Text>
          <Text className="text-white/70 text-sm mt-3 leading-relaxed">
            Search, locate, and reserve prescriptions from verified pharmacies across Ghana.
          </Text>
        </View>

        {/* Login Form */}
        <View className="px-8 pt-10 pb-8 flex-1">
          <Text className="text-2xl font-bold text-slate-800 mb-1">Welcome Back</Text>
          <Text className="text-slate-400 text-sm mb-8 font-semibold">
            Sign in to manage your reservations
          </Text>

          {error ? (
            <View className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-5">
              <Text className="text-red-700 text-xs font-bold">{error}</Text>
            </View>
          ) : null}

          {/* Email */}
          <View className="mb-5">
            <Text className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
              Email Address
            </Text>
            <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-4">
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

          {/* Password */}
          <View className="mb-6">
            <Text className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
              Password
            </Text>
            <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-4">
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

          {/* Login Button */}
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

          {/* Register Link */}
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
  );
}
