import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "@/context/AppContext";

export default function ProfileScreen() {
  const { user, logout, reservations, savedPharmacies } = useApp();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: () => {
          logout();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  const menuItems = [
    {
      section: "Account",
      items: [
        { icon: "person-outline" as const, label: "Personal Information", color: "#0f766e" },
        { icon: "location-outline" as const, label: "Saved Addresses", color: "#6366f1", badge: "1" },
        { icon: "bookmark-outline" as const, label: "Saved Pharmacies", color: "#f59e0b", badge: String(savedPharmacies.length) },
      ],
    },
    {
      section: "Preferences",
      items: [
        { icon: "notifications-outline" as const, label: "Notifications", color: "#ef4444" },
        { icon: "moon-outline" as const, label: "Dark Mode", color: "#8b5cf6" },
        { icon: "language-outline" as const, label: "Language", color: "#14b8a6", badge: "EN" },
      ],
    },
    {
      section: "Support",
      items: [
        { icon: "help-circle-outline" as const, label: "Help & FAQ", color: "#3b82f6" },
        { icon: "shield-checkmark-outline" as const, label: "Privacy Policy", color: "#64748b" },
        { icon: "document-text-outline" as const, label: "Terms of Service", color: "#64748b" },
      ],
    },
  ];

  type MenuItem = (typeof menuItems)[number]["items"][number] & { badge?: string };

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Profile Header */}
        <View className="bg-primary pt-6 pb-10 px-6 rounded-b-[40px]">
          <Text className="text-white/60 text-xs font-bold uppercase tracking-widest mb-4">My Profile</Text>

          <View className="flex-row items-center gap-4">
            <View className="w-16 h-16 rounded-2xl bg-white/20 items-center justify-center border-2 border-white/30">
              <Text className="text-white text-2xl font-bold">
                {user?.name?.charAt(0) ?? "U"}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-white text-xl font-bold">{user?.name ?? "Guest User"}</Text>
              <Text className="text-white/60 text-xs font-semibold mt-0.5">{user?.email}</Text>
              <View className="flex-row items-center gap-1 mt-1.5">
                <Ionicons name="location" size={11} color="rgba(255,255,255,0.5)" />
                <Text className="text-white/50 text-[11px] font-semibold">{user?.location ?? "Accra, Ghana"}</Text>
              </View>
            </View>
          </View>

          {/* Quick Stats */}
          <View className="flex-row mt-6 gap-3">
            <View className="flex-1 bg-white/10 rounded-2xl p-3.5 items-center border border-white/10">
              <Text className="text-white text-lg font-bold">{reservations.length}</Text>
              <Text className="text-white/50 text-[10px] font-bold uppercase tracking-wider mt-0.5">Reservations</Text>
            </View>
            <View className="flex-1 bg-white/10 rounded-2xl p-3.5 items-center border border-white/10">
              <Text className="text-white text-lg font-bold">{savedPharmacies.length}</Text>
              <Text className="text-white/50 text-[10px] font-bold uppercase tracking-wider mt-0.5">Saved</Text>
            </View>
            <View className="flex-1 bg-white/10 rounded-2xl p-3.5 items-center border border-white/10">
              <Text className="text-white text-lg font-bold">
                {reservations.filter((r) => r.status === "Collected").length}
              </Text>
              <Text className="text-white/50 text-[10px] font-bold uppercase tracking-wider mt-0.5">Collected</Text>
            </View>
          </View>
        </View>

        {/* Menu Sections */}
        <View className="px-6 mt-6">
          {menuItems.map((section) => (
            <View key={section.section} className="mb-5">
              <Text className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2.5 px-1">
                {section.section}
              </Text>
              <View className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
                {section.items.map((item, i) => (
                  <TouchableOpacity
                    key={item.label}
                    activeOpacity={0.6}
                    className={`flex-row items-center px-4 py-4 ${
                      i < section.items.length - 1 ? "border-b border-slate-100" : ""
                    }`}
                  >
                    <View
                      className="w-9 h-9 rounded-xl items-center justify-center mr-3"
                      style={{ backgroundColor: item.color + "15" }}
                    >
                      <Ionicons name={item.icon} size={18} color={item.color} />
                    </View>
                    <Text className="flex-1 text-sm font-semibold text-slate-700">{item.label}</Text>
                    {(item as MenuItem).badge ? (
                      <View className="bg-slate-100 px-2 py-0.5 rounded-full mr-2">
                        <Text className="text-[10px] font-bold text-slate-500">{(item as MenuItem).badge}</Text>
                      </View>
                    ) : null}
                    <Ionicons name="chevron-forward" size={16} color="#cbd5e1" />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}

          {/* Logout */}
          <TouchableOpacity
            onPress={handleLogout}
            activeOpacity={0.7}
            className="bg-white rounded-3xl border border-red-100 flex-row items-center justify-center py-4 gap-2 shadow-sm mt-2"
          >
            <Ionicons name="log-out-outline" size={18} color="#dc2626" />
            <Text className="text-red-600 font-bold text-sm">Sign Out</Text>
          </TouchableOpacity>

          <Text className="text-center text-[10px] text-slate-300 font-semibold mt-6">
            MediFind Ghana v1.0.0 • Built with ❤️ for Ghana
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
