import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "@/context/AppContext";

export default function MedicineDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { medicines, pharmacies } = useApp();
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [reserved, setReserved] = useState(false);

  const medicine = medicines.find((m) => m.id === id);
  const pharmacy = pharmacies.find((p) => p.id === medicine?.pharmacyId);

  if (!medicine) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center">
        <Text className="text-slate-400 font-bold">Medicine not found</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4">
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
      pathname: "/reservation/details-notes",
      params: {
        medicineId: medicine.id,
        quantity: String(qty),
      },
    } as never);
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Header with back button */}
        <View className="bg-primary pt-4 pb-10 px-6 rounded-b-[40px]">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-xl bg-white/20 items-center justify-center mb-6"
          >
            <Ionicons name="arrow-back" size={20} color="white" />
          </TouchableOpacity>

          <View className="flex-row items-start gap-4">
            <View className="w-16 h-16 rounded-2xl bg-white/20 items-center justify-center">
              <Ionicons name="medkit" size={30} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-white text-xl font-bold leading-tight">{medicine.name}</Text>
              <Text className="text-white/60 text-xs font-semibold mt-1">{medicine.genericName}</Text>
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
                    <View className={`flex-row items-center gap-1 px-2 py-0.5 rounded-full ${pharmacy.isOpen ? "bg-emerald-50" : "bg-red-50"}`}>
                      <View className={`w-1.5 h-1.5 rounded-full ${pharmacy.isOpen ? "bg-emerald-500" : "bg-red-500"}`} />
                      <Text className={`text-[10px] font-bold ${pharmacy.isOpen ? "text-emerald-700" : "text-red-700"}`}>
                        {pharmacy.isOpen ? "Open" : "Closed"}
                      </Text>
                    </View>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Drug Info */}
        <View className="mx-6 mt-5">
          <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">
            Drug Information
          </Text>
          <View className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm gap-4">
            {[
              { label: "Brand Name", value: medicine.name, icon: "medical-outline" },
              { label: "Generic Name", value: medicine.genericName, icon: "flask-outline" },
              { label: "Category", value: medicine.category, icon: "pricetag-outline" },
              { label: "Dosage Form", value: "Tablet / Capsule", icon: "tablet-portrait-outline" },
              { label: "Storage", value: "Store below 30°C, dry place", icon: "thermometer-outline" },
            ].map((item) => (
              <View key={item.label} className="flex-row items-center gap-3">
                <View className="w-9 h-9 rounded-xl bg-slate-50 items-center justify-center">
                  <Ionicons name={item.icon as any} size={16} color="#64748b" />
                </View>
                <View className="flex-1">
                  <Text className="text-[10px] font-bold text-slate-400 uppercase">{item.label}</Text>
                  <Text className="text-sm font-semibold text-slate-700">{item.value}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
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
