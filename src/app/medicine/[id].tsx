import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "@/context/AppContext";

import { StatusBar } from "expo-status-bar";

export default function MedicineDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { medicines, pharmacies } = useApp();
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [reserved, setReserved] = useState(false);

  const medicine = medicines.find(
    (m) => m.id === id || (m.rawMedicineId !== undefined && String(m.rawMedicineId) === id) || m.id.startsWith(`${id}-`)
  );
  const pharmacy = pharmacies.find((p) => p.id === medicine?.pharmacyId || p.name === medicine?.pharmacy);

  if (!medicine) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center">
        <Text className="text-slate-400 font-bold">Medicine not found</Text>
        <TouchableOpacity
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace("/(tabs)/home");
            }
          }}
          className="mt-4"
        >
          <Text className="text-primary font-bold">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const handleReserve = () => {
    if (!medicine.inStock) {
      Alert.alert("Out of Stock", "This medicine is currently unavailable.");
      return;
    }
    router.push({
      pathname: "/reservation/create-request",
      params: {
        medicineId: medicine.id,
        initialQuantity: String(qty),
      },
    } as never);
  };

  return (
    <SafeAreaView className="flex-1 bg-primary" edges={["top"]}>
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false} className="bg-slate-50" contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Header with back button */}
        <View className="bg-primary pt-4 pb-10 px-6 rounded-b-[40px]">
          <TouchableOpacity
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace("/(tabs)/home");
              }
            }}
            className="w-10 h-10 rounded-xl bg-white/20 items-center justify-center mb-6"
          >
            <Ionicons name="arrow-back" size={20} color="white" />
          </TouchableOpacity>

          <View className="flex-row items-start gap-4">
            {medicine.imageUrl ? (
              <Image source={{ uri: medicine.imageUrl }} className="w-16 h-16 rounded-2xl bg-white/20" resizeMode="cover" />
            ) : (
              <View className="w-16 h-16 rounded-2xl bg-white/20 items-center justify-center">
                <Ionicons name="medkit" size={30} color="white" />
              </View>
            )}
            <View className="flex-1">
              <Text className="text-white text-xl font-bold leading-tight">{medicine.name}</Text>
              <Text className="text-white/60 text-xs font-semibold mt-1">{medicine.dosage || medicine.genericName}</Text>
              <View className="flex-row items-center gap-2 mt-2">
                <View className="bg-white/15 px-2.5 py-1 rounded-full">
                  <Text className="text-white text-[10px] font-bold">{medicine.category}</Text>
                </View>
                <View className={`px-2.5 py-1 rounded-full ${medicine.inStock ? "bg-emerald-500/20" : "bg-red-500/20"}`}>
                  <Text className={`text-[10px] font-bold ${medicine.inStock ? "text-emerald-300" : "text-red-300"}`}>
                    {medicine.inStock ? "In Stock" : "Out of Stock"}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>


        {/* Price + Rating */}
        <View className="mx-6 -mt-5 bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex-row items-center justify-between">
          <View>
            <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Price Per Unit</Text>
            <Text className="text-2xl font-bold text-primary mt-1">GH₵{medicine.price.toFixed(2)}</Text>
          </View>
          <View className="items-end">
            <View className="flex-row items-center gap-1">
              <Ionicons name="star" size={16} color="#f59e0b" />
              <Text className="text-lg font-bold text-slate-800">{medicine.rating}</Text>
            </View>
            <Text className="text-[10px] text-slate-400 font-semibold">{medicine.reviews} reviews</Text>
          </View>
        </View>

        {/* Pharmacy Info */}
        {pharmacy && (
          <View className="mx-6 mt-4">
            <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">
              Available At
            </Text>
            <TouchableOpacity
              onPress={() => router.push(`/pharmacy/${pharmacy.id}`)}
              activeOpacity={0.7}
              className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm"
            >
              <View className="flex-row items-center gap-3">
                <View className="w-12 h-12 rounded-2xl bg-teal-50 items-center justify-center">
                  <Ionicons name="storefront" size={22} color="#0f766e" />
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center gap-1.5">
                    <Text className="text-base font-bold text-slate-800">{pharmacy.name}</Text>
                    {pharmacy.verified && <Ionicons name="checkmark-circle" size={14} color="#0f766e" />}
                  </View>
                  <Text className="text-xs text-slate-400 font-semibold mt-0.5">{pharmacy.address}</Text>
                  <View className="flex-row items-center gap-3 mt-2">
                    <View className="flex-row items-center gap-1">
                      <Ionicons name="location-outline" size={12} color="#64748b" />
                      <Text className="text-xs text-slate-500 font-semibold">{pharmacy.distance}</Text>
                    </View>
                    <View className={`flex-row items-center gap-1 px-2.5 py-0.5 rounded-full ${pharmacy.isOpen ? "bg-emerald-50 border border-emerald-100" : "bg-red-50 border border-red-100"}`}>
                      <View className={`w-1.5 h-1.5 rounded-full ${pharmacy.isOpen ? "bg-emerald-500" : "bg-red-500"}`} />
                      <Text className={`text-[10px] font-bold ${pharmacy.isOpen ? "text-emerald-700" : "text-red-700"}`}>
                        {pharmacy.isOpen ? "Open Now" : "Closed"}
                      </Text>
                    </View>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Helper function to split text by lines or bullets */}
        {(() => {
          const parseListItems = (text?: string): string[] => {
            if (!text) return [];
            return text
              .split(/\n|•|\\n/)
              .map((item) => item.replace(/^[-*•]\s*/, "").trim())
              .filter(Boolean);
          };

          const descriptionText = medicine.description || "Effective for relief of mild to moderate pain including headache, migraine, neuralgia, toothache, sore throat, period pain, and relief of symptoms of flu and fever.";
          const dosageItems = parseListItems(medicine.dosageInstructions || medicine.dosage || "Adults & Children > 12y:\n1-2 tablets every 4-6 hours as required. Do not exceed 8 tablets in 24 hours.");

          const precautionsItems = parseListItems(medicine.precautions || "Avoid alcohol consumption while taking this medication.\nDo not take with other paracetamol-containing products.");
          const sideEffectsItems = parseListItems(medicine.sideEffects || "Common side effects are rare but may include allergic reactions (skin rash, swelling), or blood disorders. Consult a doctor if you experience any unusual symptoms.");

          return (
            <View className="mx-6 mt-5 gap-5">
              {/* Description */}
              <View className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm gap-2">
                <View className="flex-row items-center gap-2 mb-1">
                  <Ionicons name="information-circle-outline" size={18} color="#0f766e" />
                  <Text className="text-base font-bold text-slate-800">Description</Text>
                </View>
                <Text className="text-xs text-slate-600 leading-relaxed">
                  {descriptionText}
                </Text>
              </View>

              {/* Dosage */}
              <View className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm gap-3">
                <View className="flex-row items-center gap-2 mb-1">
                  <Ionicons name="fitness-outline" size={18} color="#0f766e" />
                  <Text className="text-base font-bold text-slate-800">Dosage</Text>
                </View>
                {dosageItems.map((item, idx) => (
                  <View key={idx} className="flex-row items-start gap-2.5">
                    <View className="w-1.5 h-1.5 rounded-full bg-teal-600 mt-1.5" />
                    <Text className="flex-1 text-xs font-bold text-slate-800 leading-normal">{item}</Text>
                  </View>
                ))}
              </View>

              {/* Precautions */}
              <View className="bg-red-50/50 rounded-3xl p-5 border border-red-100 shadow-sm gap-3">
                <View className="flex-row items-center gap-2 mb-1">
                  <Ionicons name="warning-outline" size={18} color="#dc2626" />
                  <Text className="text-base font-bold text-red-900">Precautions</Text>
                </View>
                {precautionsItems.map((item, idx) => (
                  <View key={idx} className="flex-row items-start gap-2.5">
                    <View className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5" />
                    <Text className="flex-1 text-xs font-semibold text-red-950 leading-normal">{item}</Text>
                  </View>
                ))}
              </View>

              {/* Side Effects */}
              <View className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm gap-3">
                <View className="flex-row items-center gap-2 mb-1">
                  <Ionicons name="medkit-outline" size={18} color="#0f766e" />
                  <Text className="text-base font-bold text-slate-800">Side Effects</Text>
                </View>
                {sideEffectsItems.map((item, idx) => (
                  <View key={idx} className="flex-row items-start gap-2.5">
                    <View className="w-1.5 h-1.5 rounded-full bg-teal-600 mt-1.5" />
                    <Text className="flex-1 text-xs text-slate-600 leading-normal">{item}</Text>
                  </View>
                ))}
              </View>
            </View>
          );
        })()}
      </ScrollView>


      {/* Bottom Action Bar */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 pt-4 pb-8">
        {reserved ? (
          <View className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex-row items-center gap-3">
            <Ionicons name="checkmark-circle" size={24} color="#059669" />
            <View className="flex-1">
              <Text className="text-emerald-800 font-bold text-sm">Reserved Successfully!</Text>
              <Text className="text-emerald-600 text-xs mt-0.5">Check your Reservations tab for details.</Text>
            </View>
          </View>
        ) : (
          <View className="flex-row items-center gap-4">
            {/* Qty selector */}
            <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden">
              <TouchableOpacity
                onPress={() => setQty(Math.max(1, qty - 1))}
                className="w-10 h-12 items-center justify-center"
              >
                <Ionicons name="remove" size={18} color="#64748b" />
              </TouchableOpacity>
              <View className="w-10 h-12 items-center justify-center border-x border-slate-200">
                <Text className="text-sm font-bold text-slate-800">{qty}</Text>
              </View>
              <TouchableOpacity
                onPress={() => setQty(qty + 1)}
                className="w-10 h-12 items-center justify-center"
              >
                <Ionicons name="add" size={18} color="#64748b" />
              </TouchableOpacity>
            </View>

            {/* Reserve button */}
            <TouchableOpacity
              onPress={handleReserve}
              disabled={!medicine.inStock}
              activeOpacity={0.85}
              className={`flex-1 flex-row items-center justify-center gap-2 py-4 rounded-2xl shadow-lg ${
                medicine.inStock ? "bg-primary" : "bg-slate-300"
              }`}
              style={medicine.inStock ? { shadowColor: "#0f766e", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 12 } : {}}
            >
              <Ionicons name="cart-outline" size={18} color="white" />
              <Text className="text-white font-bold text-sm">
                Reserve · GH₵{(medicine.price * qty).toFixed(2)}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
