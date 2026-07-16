import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.replace("/(auth)/login");
    }, 1000);
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
          <View className="px-6 pt-4 pb-6 flex-1 justify-center">
            <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-xl bg-white items-center justify-center border border-slate-200 mb-6">
              <Ionicons name="arrow-back" size={20} color="#0f766e" />
            </TouchableOpacity>

            <View className="bg-white rounded-[32px] p-6 border border-slate-200 shadow-sm">
              <View className="w-14 h-14 rounded-2xl bg-teal-50 items-center justify-center mb-5">
                <Ionicons name="lock-closed-outline" size={28} color="#0f766e" />
              </View>
              <Text className="text-slate-900 text-3xl font-bold leading-tight">Forgot password?</Text>
              <Text className="text-slate-500 text-sm mt-3 leading-relaxed">
                Enter the email address associated with your account and we’ll send you a reset link.
              </Text>

              <View className="mt-6">
                <Text className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Email Address</Text>
                <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-4">
                  <Ionicons name="mail-outline" size={18} color="#94a3b8" />
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="example@health.gh"
                    placeholderTextColor="#94a3b8"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    className="flex-1 py-4 px-3 text-sm text-slate-800"
                  />
                </View>
              </View>

              <TouchableOpacity
                onPress={handleSubmit}
                disabled={loading}
                className="bg-primary rounded-2xl py-4 items-center mt-6 flex-row justify-center gap-2"
                style={{ shadowColor: "#0f766e", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 14 }}
              >
                {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold">Send Reset Link</Text>}
              </TouchableOpacity>

              <Link href="/(auth)/login" asChild>
                <TouchableOpacity className="items-center mt-5">
                  <Text className="text-primary font-bold">Back to Login</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
