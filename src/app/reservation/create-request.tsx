import React, { useState, useMemo, useEffect } from "react";
import { View, Text, TouchableOpacity, TextInput, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "@/context/AppContext";
import { generatePickupSlots } from "@/utils/date";

export default function CreateRequestScreen() {
  const router = useRouter();
  const { medicines, pharmacies, createReservation } = useApp();
  const { medicineId, initialQuantity } = useLocalSearchParams<{ medicineId?: string; initialQuantity?: string }>();

  const medicine = medicines.find((item) => item.id === medicineId);
  const pharmacy = pharmacies.find(
    (p) => p.id === medicine?.pharmacyId || p.name === medicine?.pharmacy
  );

  const [qty, setQty] = useState(Number(initialQuantity ?? "1") || 1);
  const [notes, setNotes] = useState("");

  const slots = useMemo(() => generatePickupSlots(pharmacy?.openHours), [pharmacy?.openHours]);
  const [pickupDate, setPickupDate] = useState(slots[0]?.title || "As soon as approved");

  useEffect(() => {
    if (slots.length > 0 && !slots.some((s) => s.title === pickupDate)) {
      setPickupDate(slots[0].title);
    }
  }, [slots]);

  const pharmacyName = pharmacy?.name || medicine?.pharmacy || "Selected pharmacy";
  const pharmacyHours = pharmacy?.openHours || "Mon–Sat: 8:00 AM – 9:00 PM";

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (medicine && !submitting) {
      setSubmitting(true);
      try {
        await createReservation(medicine, qty, pickupDate, notes);
        router.replace("/reservation/request-submitted" as never);
      } catch (err) {
        // Continue anyway
        router.replace("/reservation/request-submitted" as never);
      } finally {
        setSubmitting(false);
      }
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
      <StatusBar style="dark" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 28 }}>
        <View className="px-6 pt-4 pb-2">
          <View className="flex-row items-center justify-between mb-4">
            <TouchableOpacity
              onPress={() => {
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.replace("/(tabs)/home");
                }
              }}
              className="w-10 h-10 rounded-xl bg-white border border-slate-200 items-center justify-center shadow-sm"
            >
              <Ionicons name="arrow-back" size={20} color="#0f766e" />
            </TouchableOpacity>
            <Text className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Step 1 of 3</Text>
            <View className="w-10" />
          </View>
          <Text className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em]">Reservation</Text>
          <Text className="text-slate-900 text-2xl font-bold mt-1">Create Request</Text>
          <Text className="text-slate-500 text-sm mt-2 leading-relaxed">Enter details for your reservation request.</Text>
        </View>

        <View className="mx-6 mt-4 bg-white rounded-[32px] p-5 border border-slate-200 shadow-sm">
          <Text className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Medicine & Pharmacy</Text>
          <View className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 gap-1 mb-4">
            <Text className="text-slate-900 font-bold text-base">{medicine?.name ?? "Medicine"}</Text>
            <View className="flex-row items-center justify-between mt-0.5">
              <Text className="text-slate-600 text-xs font-semibold">{pharmacyName}</Text>
              <View className="flex-row items-center gap-1 bg-teal-50 border border-teal-100 px-2 py-0.5 rounded-full">
                <Ionicons name="time-outline" size={11} color="#0f766e" />
                <Text className="text-[10px] font-bold text-primary">{pharmacyHours}</Text>
              </View>
            </View>
          </View>

          <Text className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Quantity</Text>
          <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden self-start mb-4">
            <TouchableOpacity onPress={() => setQty(Math.max(1, qty - 1))} className="w-12 h-12 items-center justify-center">
              <Ionicons name="remove" size={20} color="#64748b" />
            </TouchableOpacity>
            <View className="w-12 h-12 items-center justify-center border-x border-slate-200">
              <Text className="text-base font-bold text-slate-800">{qty}</Text>
            </View>
            <TouchableOpacity onPress={() => setQty(qty + 1)} className="w-12 h-12 items-center justify-center">
              <Ionicons name="add" size={20} color="#64748b" />
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Preferred Collection Time</Text>
          </View>
          <View className="gap-2.5 mb-4">
            {slots.map((slot) => {
              const isSelected = pickupDate === slot.title;
              return (
                <TouchableOpacity
                  key={slot.id}
                  onPress={() => setPickupDate(slot.title)}
                  className={`p-3.5 rounded-2xl border flex-row items-center justify-between ${isSelected ? "bg-teal-50/80 border-teal-500 shadow-xs" : "bg-slate-50 border-slate-200"
                    }`}
                >
                  <View className="flex-row items-center gap-3 flex-1 pr-2">
                    <View
                      className={`w-9 h-9 rounded-xl items-center justify-center ${isSelected ? "bg-primary text-white" : "bg-white border border-slate-200"
                        }`}
                    >
                      <Ionicons
                        name={slot.icon || "time-outline"}
                        size={18}
                        color={isSelected ? "white" : "#0f766e"}
                      />
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2">
                        <Text className="text-slate-900 font-bold text-xs">{slot.title}</Text>
                        {slot.badge ? (
                          <View className="bg-emerald-100 px-1.5 py-0.5 rounded-md">
                            <Text className="text-emerald-800 text-[9px] font-extrabold uppercase tracking-wider">
                              {slot.badge}
                            </Text>
                          </View>
                        ) : null}
                      </View>
                      <Text className="text-slate-400 text-[11px] font-medium mt-0.5" numberOfLines={1}>
                        {slot.subtitle}
                      </Text>
                    </View>
                  </View>
                  <View
                    className={`w-5 h-5 rounded-full border-2 items-center justify-center ${isSelected ? "border-primary bg-primary" : "border-slate-300"
                      }`}
                  >
                    {isSelected && <View className="w-2 h-2 rounded-full bg-white" />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Notes</Text>
          <TextInput
            placeholder="Add allergies, preferred contact time, or other notes"
            placeholderTextColor="#94a3b8"
            multiline
            value={notes}
            onChangeText={setNotes}
            className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-slate-800 min-h-[100px]"
            textAlignVertical="top"
          />
        </View>

        <View className="px-6 mt-5">
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={submitting}
            className={`rounded-2xl py-4 items-center shadow-lg ${submitting ? "bg-teal-700/60" : "bg-primary"}`}
            style={{ shadowColor: "#0f766e", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.22, shadowRadius: 16 }}
          >
            <Text className="text-white font-bold">{submitting ? "Submitting..." : "Submit Request"}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
