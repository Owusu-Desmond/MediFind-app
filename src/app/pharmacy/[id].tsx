import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "@/context/AppContext";
import UniversalMapView from "@/components/UniversalMapView";

export default function PharmacyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { pharmacies, medicines, savedPharmacies, toggleSavePharmacy, userLocation } = useApp();
  const router = useRouter();

  const pharmacy = pharmacies.find(
    (p) => p.id === id || p.name.toLowerCase() === decodeURIComponent(id || "").toLowerCase()
  );
  const pharmacyMeds = medicines.filter(
    (m) => m.pharmacyId === id || (pharmacy && m.pharmacy === pharmacy.name)
  );
  const isSaved = savedPharmacies.includes(id);

  if (!pharmacy) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center">
        <Text className="text-slate-400 font-bold">Pharmacy not found</Text>
        <TouchableOpacity
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace("/(tabs)/pharmacies");
            }
          }}
          className="mt-4"
        >
          <Text className="text-primary font-bold">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const handleDirections = () => {
    router.push({
      pathname: "/pharmacy/directions",
      params: { pharmacyId: pharmacy.id },
    } as never);
  };

  const handleCall = () => {
    if (pharmacy.phone) {
      Linking.openURL(`tel:${pharmacy.phone.replace(/\s/g, "")}`);
    }
  };

  const mapEmbedUrl =
    pharmacy.lat && pharmacy.lng
      ? `https://maps.google.com/maps?q=${pharmacy.lat},${pharmacy.lng}&z=15&output=embed`
      : `https://maps.google.com/maps?q=${encodeURIComponent(pharmacy.name + ", " + pharmacy.address)}&z=15&output=embed`;

  return (
    <SafeAreaView className="flex-1 bg-primary" edges={["top"]}>
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false} className="bg-slate-50" contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Hero Header */}
        <View className="bg-primary pt-4 pb-12 px-6 rounded-b-[40px]">
          {/* Nav row */}
          <View className="flex-row items-center justify-between mb-6">
            <TouchableOpacity
              onPress={() => {
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.replace("/(tabs)/pharmacies");
                }
              }}
              className="w-10 h-10 rounded-xl bg-white/20 items-center justify-center"
            >
              <Ionicons name="arrow-back" size={20} color="white" />
            </TouchableOpacity>
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={() => toggleSavePharmacy(pharmacy.id)}
                className="w-10 h-10 rounded-xl bg-white/20 items-center justify-center"
              >
                <Ionicons
                  name={isSaved ? "bookmark" : "bookmark-outline"}
                  size={20}
                  color="white"
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleDirections}
                className="w-10 h-10 rounded-xl bg-white/20 items-center justify-center"
              >
                <Ionicons name="navigate-outline" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Pharmacy Info */}
          <View className="flex-row items-start gap-4">
            <View className="w-16 h-16 rounded-2xl bg-white/20 items-center justify-center border border-white/10">
              <Ionicons name="storefront" size={30} color="white" />
            </View>
            <View className="flex-1">
              <View className="flex-row items-center gap-1.5">
                <Text className="text-white text-xl font-bold leading-tight flex-1" numberOfLines={2}>
                  {pharmacy.name}
                </Text>
                {pharmacy.verified && (
                  <View className="bg-white/20 p-1 rounded-full">
                    <Ionicons name="checkmark-circle" size={16} color="white" />
                  </View>
                )}
              </View>
              <Text className="text-white/60 text-xs font-semibold mt-1">{pharmacy.address}</Text>
              <View className="flex-row items-center gap-3 mt-2 flex-wrap">
                <View className="flex-row items-center gap-1">
                  <Ionicons name="star" size={13} color="#fbbf24" />
                  <Text className="text-white font-bold text-xs">{pharmacy.rating}</Text>
                  <Text className="text-white/50 text-xs">({pharmacy.reviews})</Text>
                </View>
                <View className="bg-white/20 px-2 py-0.5 rounded-full flex-row items-center gap-1">
                  <Ionicons name="location" size={11} color="white" />
                  <Text className="text-white text-[10px] font-bold">
                    {pharmacy.distance}
                  </Text>
                </View>
                <View className={`flex-row items-center gap-1 px-2 py-0.5 rounded-full ${pharmacy.isOpen ? "bg-emerald-500/30" : "bg-red-500/30"}`}>
                  <View className={`w-1.5 h-1.5 rounded-full ${pharmacy.isOpen ? "bg-emerald-400" : "bg-red-400"}`} />
                  <Text className={`text-[10px] font-bold ${pharmacy.isOpen ? "text-emerald-300" : "text-red-300"}`}>
                    {pharmacy.isOpen ? "Open Now" : "Closed"}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="mx-6 -mt-6 bg-white rounded-3xl p-4 border border-slate-100 shadow-sm flex-row gap-3">
          <TouchableOpacity
            onPress={handleCall}
            activeOpacity={0.7}
            className="flex-1 flex-row items-center justify-center gap-2 bg-primary py-3.5 rounded-2xl"
          >
            <Ionicons name="call" size={16} color="white" />
            <Text className="text-white font-bold text-xs">Call</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleDirections}
            activeOpacity={0.7}
            className="flex-1 flex-row items-center justify-center gap-2 bg-slate-50 border border-slate-200 py-3.5 rounded-2xl"
          >
            <Ionicons name="navigate" size={16} color="#0f766e" />
            <Text className="text-primary font-bold text-xs">Directions</Text>
          </TouchableOpacity>
        </View>

        {/* Location & Map Preview */}
        <View className="mx-6 mt-5">
          <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">
            Map Location & GPS
          </Text>
          <View className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm">
            <View className="w-full h-48 bg-slate-100">
              <UniversalMapView
                userLocation={userLocation}
                pharmacies={[pharmacy]}
                selectedPharmacyId={pharmacy.id}
                style={{ width: "100%", height: "100%" }}
              />
            </View>
            <View className="p-4 flex-row items-center justify-between bg-white">
              <View>
                <Text className="text-xs font-bold text-slate-800">
                  {pharmacy.distance} from your location
                </Text>
                <Text className="text-[10px] text-slate-400 mt-0.5">
                  GPS: {pharmacy.lat ? `${pharmacy.lat.toFixed(4)}, ${pharmacy.lng?.toFixed(4)}` : "Verified coordinates"}
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleDirections}
                className="bg-teal-50 px-3 py-2 rounded-xl flex-row items-center gap-1 border border-teal-100"
              >
                <Ionicons name="navigate" size={12} color="#0f766e" />
                <Text className="text-primary text-xs font-bold">Navigate</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Details */}
        <View className="mx-6 mt-5">
          <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">
            Branch Information
          </Text>
          <View className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm gap-4">
            {[
              { icon: "location-outline", label: "Address", value: pharmacy.address },
              { icon: "time-outline", label: "Operating Hours", value: pharmacy.openHours },
              { icon: "call-outline", label: "Phone", value: pharmacy.phone },
              { icon: "navigate-outline", label: "Distance", value: `${pharmacy.distance} from your live location` },
              {
                icon: "shield-checkmark-outline",
                label: "Verification",
                value: pharmacy.verified ? "MediFind Verified Pharmacy" : "Pending Verification",
              },
            ].map((item) => (
              <View key={item.label} className="flex-row items-center gap-3">
                <View className="w-9 h-9 rounded-xl bg-teal-50 items-center justify-center">
                  <Ionicons name={item.icon as any} size={16} color="#0f766e" />
                </View>
                <View className="flex-1">
                  <Text className="text-[10px] font-bold text-slate-400 uppercase">{item.label}</Text>
                  <Text className="text-sm font-semibold text-slate-700">{item.value}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Available Medicines */}
        <View className="mx-6 mt-5">
          <View className="flex-row items-center justify-between mb-3 px-1">
            <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Available Medicines ({pharmacyMeds.length})
            </Text>
          </View>

          {pharmacyMeds.length === 0 ? (
            <View className="bg-white rounded-3xl p-8 border border-slate-100 items-center">
              <Ionicons name="medkit-outline" size={32} color="#cbd5e1" />
              <Text className="text-slate-400 text-xs font-bold mt-2">No medicines listed</Text>
            </View>
          ) : (
            pharmacyMeds.map((med) => (
              <TouchableOpacity
                key={med.id}
                onPress={() => router.push(`/medicine/${med.id}`)}
                activeOpacity={0.7}
                className="bg-white rounded-2xl p-4 mb-2 border border-slate-100 shadow-sm flex-row items-center gap-3"
              >
                <View className={`w-10 h-10 rounded-xl items-center justify-center ${med.inStock ? "bg-teal-50" : "bg-slate-100"}`}>
                  <Ionicons name="medkit" size={18} color={med.inStock ? "#0f766e" : "#94a3b8"} />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-bold text-slate-800" numberOfLines={1}>{med.name}</Text>
                  <Text className="text-xs text-slate-400 font-semibold">{med.genericName}</Text>
                </View>
                <View className="items-end">
                  <Text className="text-primary font-bold text-sm">GH₵{med.price.toFixed(2)}</Text>
                  <Text className={`text-[9px] font-bold mt-0.5 ${med.inStock ? "text-emerald-600" : "text-red-500"}`}>
                    {med.inStock ? "In Stock" : "Out of Stock"}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
