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

export default function RegisterScreen() {
  const { register } = useApp();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = () => {
    setError("");
    if (!name || !email || !phone || !password) {
      setError("All fields are required.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      register(name, email, password, phone);
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
        {/* Header */}
        <View className="bg-primary pt-16 pb-10 px-8 rounded-b-[40px]">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-xl bg-white/20 items-center justify-center mb-6"
          >
            <Ionicons name="arrow-back" size={20} color="white" />
          </TouchableOpacity>

          <Text className="text-white text-3xl font-bold leading-tight">
            Create your{"\n"}MediFind account
          </Text>
          <Text className="text-white/70 text-sm mt-3 leading-relaxed">
            Join thousands of Ghanaians finding medicine faster.
          </Text>
        </View>

        {/* Form */}
        <View className="px-8 pt-8 pb-8">
          {error ? (
            <View className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-5">
              <Text className="text-red-700 text-xs font-bold">{error}</Text>
            </View>
          ) : null}

          {/* Full Name */}
          <View className="mb-4">
            <Text className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
              Full Name
            </Text>
            <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-4">
              <Ionicons name="person-outline" size={18} color="#94a3b8" />
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Kwame Mensah"
                placeholderTextColor="#94a3b8"
                className="flex-1 py-4 px-3 text-sm text-slate-800"
              />
            </View>
          </View>

          {/* Email */}
          <View className="mb-4">
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

          {/* Phone */}
          <View className="mb-4">
            <Text className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
              Phone Number
            </Text>
            <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-4">
              <Ionicons name="call-outline" size={18} color="#94a3b8" />
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="+233 24 000 0000"
                placeholderTextColor="#94a3b8"
                keyboardType="phone-pad"
                className="flex-1 py-4 px-3 text-sm text-slate-800"
              />
            </View>
          </View>

          {/* Password */}
          <View className="mb-4">
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

          {/* Confirm Password */}
          <View className="mb-6">
            <Text className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
              Confirm Password
            </Text>
            <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-4">
              <Ionicons name="shield-checkmark-outline" size={18} color="#94a3b8" />
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="••••••••"
                placeholderTextColor="#94a3b8"
                secureTextEntry
                className="flex-1 py-4 px-3 text-sm text-slate-800"
              />
            </View>
          </View>

          {/* Register Button */}
          <TouchableOpacity
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.85}
            className="bg-primary rounded-2xl py-4 items-center flex-row justify-center gap-2 shadow-lg"
            style={{ shadowColor: "#0f766e", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 12 }}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Text className="text-white font-bold text-base">Create Account</Text>
                <Ionicons name="arrow-forward" size={18} color="white" />
              </>
            )}
          </TouchableOpacity>

          {/* Login Link */}
          <View className="flex-row items-center justify-center mt-8 gap-1">
            <Text className="text-slate-400 text-sm">Already have an account?</Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text className="text-primary font-bold text-sm">Sign In</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
