import React, { useState } from "react";
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
import { useApp, Reservation } from "@/context/AppContext";

const STATUS_TABS = ["All", "Pending Pharmacy Review", "Approved", "Paid", "In Progress", "Completed", "Cancelled"] as const;

const reservationGroup = (status: Reservation["status"]) => {
  switch (status) {
    case "Pending Pharmacy Review":
      return "Pending Pharmacy Review";
    case "Approved":
      return "Approved";
    case "Paid":
    case "Preparing":
    case "Out for Delivery":
    case "Ready for Pickup":
      return "In Progress";
    case "Delivered":
    case "Collected":
      return "Completed";
    case "Cancelled":
      return "Cancelled";
  }
};

export default function ReservationsScreen() {
  const router = useRouter();
  const { reservations, cancelReservation, markReservationPaid, advanceReservationStatus, approveReservation } = useApp();
  const [activeTab, setActiveTab] = useState<string>("All");

  const filtered = activeTab === "All"
    ? reservations
    : reservations.filter((r) => reservationGroup(r.status) === activeTab);

  const statusConfig = (status: Reservation["status"]) => {
    switch (status) {
      case "Pending Pharmacy Review":
        return { bg: "bg-amber-50", border: "border-amber-100", text: "text-amber-700", icon: "time-outline" as const, dot: "bg-amber-500" };
      case "Approved":
        return { bg: "bg-sky-50", border: "border-sky-100", text: "text-sky-700", icon: "checkmark-circle-outline" as const, dot: "bg-sky-500" };
      case "Paid":
        return { bg: "bg-emerald-50", border: "border-emerald-100", text: "text-emerald-700", icon: "checkmark-circle-outline" as const, dot: "bg-emerald-500" };
      case "Ready for Pickup":
        return { bg: "bg-emerald-50", border: "border-emerald-100", text: "text-emerald-700", icon: "storefront-outline" as const, dot: "bg-emerald-500" };
      case "Preparing":
        return { bg: "bg-sky-50", border: "border-sky-100", text: "text-sky-700", icon: "cube-outline" as const, dot: "bg-sky-500" };
      case "Out for Delivery":
        return { bg: "bg-cyan-50", border: "border-cyan-100", text: "text-cyan-700", icon: "bicycle-outline" as const, dot: "bg-cyan-500" };
      case "Delivered":
        return { bg: "bg-blue-50", border: "border-blue-100", text: "text-blue-700", icon: "bag-check-outline" as const, dot: "bg-blue-500" };
      case "Collected":
        return { bg: "bg-blue-50", border: "border-blue-100", text: "text-blue-700", icon: "bag-check-outline" as const, dot: "bg-blue-500" };
      case "Cancelled":
        return { bg: "bg-red-50", border: "border-red-100", text: "text-red-600", icon: "close-circle-outline" as const, dot: "bg-red-500" };
    }
  };

  const handleCancel = (id: string, name: string) => {
    Alert.alert(
      "Cancel Reservation",
      `Cancel your reservation for ${name}?`,
      [
        { text: "Keep It", style: "cancel" },
        { text: "Cancel", style: "destructive", onPress: () => cancelReservation(id) },
      ]
    );
  };

  const handleCompleteOptions = (reservation: Reservation) => {
    router.push({
      pathname: "/reservation/fulfillment-method",
      params: { medicineId: reservation.medicineId, reservationId: reservation.id },
    } as never);
  };

  const handleAdvance = (reservation: Reservation) => {
    advanceReservationStatus(reservation.id);
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
      {/* Header */}
      <View className="px-6 pt-4 pb-2">
        <Text className="text-2xl font-bold text-slate-800">My Reservations</Text>
        <Text className="text-xs text-slate-400 font-semibold mt-1">
          Track and manage your medicine reservations
        </Text>
      </View>

      {/* Status Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 mt-3 mb-2" contentContainerStyle={{ paddingRight: 16 }}>
        {STATUS_TABS.map((tab) => {
          const count = tab === "All" ? reservations.length : reservations.filter((r) => reservationGroup(r.status) === tab).length;
          return (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              className={`mr-2 px-4 py-2 rounded-2xl flex-row items-center gap-1.5 border ${
                activeTab === tab
                  ? "bg-primary border-primary"
                  : "bg-white border-slate-200"
              }`}
            >
              <Text
                className={`text-xs font-bold ${
                  activeTab === tab ? "text-white" : "text-slate-600"
                }`}
              >
                {tab}
              </Text>
              <View
                className={`px-1.5 py-0.5 rounded-full min-w-[18px] items-center ${
                  activeTab === tab ? "bg-white/20" : "bg-slate-100"
                }`}
              >
                <Text
                  className={`text-[9px] font-bold ${
                    activeTab === tab ? "text-white" : "text-slate-500"
                  }`}
                >
                  {count}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Reservations List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1 px-6"
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 24 }}
      >
        {filtered.length === 0 ? (
          <View className="items-center py-20">
            <View className="w-16 h-16 rounded-3xl bg-slate-100 items-center justify-center mb-4">
              <Ionicons name="receipt-outline" size={32} color="#cbd5e1" />
            </View>
            <Text className="text-slate-400 font-bold text-sm">No reservations yet</Text>
            <Text className="text-slate-300 text-xs mt-1 text-center">
              Search for medicines and reserve{"\n"}them at nearby pharmacies
            </Text>
          </View>
        ) : (
          filtered.map((res) => {
            const sc = statusConfig(res.status);
            return (
              <View
                key={res.id}
                className="bg-white rounded-3xl p-5 mb-3 border border-slate-100 shadow-sm"
              >
                {/* Top row */}
                <View className="flex-row items-start justify-between mb-3">
                  <View className="flex-1 pr-3">
                    <Text className="text-base font-bold text-slate-800" numberOfLines={1}>
                      {res.medicineName}
                    </Text>
                    <Text className="text-xs text-slate-400 font-semibold mt-0.5">
                      {res.pharmacyName}
                    </Text>
                  </View>
                  <View className={`flex-row items-center gap-1.5 px-3 py-1.5 rounded-full ${sc.bg} border ${sc.border}`}>
                    <View className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                    <Text className={`text-[10px] font-bold ${sc.text}`}>{res.status}</Text>
                  </View>
                </View>

                {/* Info grid */}
                <View className="bg-slate-50 rounded-2xl p-3.5 flex-row flex-wrap gap-y-2">
                  <View className="w-1/2 flex-row items-center gap-2">
                    <Ionicons name="barcode-outline" size={14} color="#64748b" />
                    <View>
                      <Text className="text-[9px] text-slate-400 font-bold uppercase">Ref</Text>
                      <Text className="text-xs text-slate-700 font-bold">{res.refNumber}</Text>
                    </View>
                  </View>
                  <View className="w-1/2 flex-row items-center gap-2">
                    <Ionicons name="cube-outline" size={14} color="#64748b" />
                    <View>
                      <Text className="text-[9px] text-slate-400 font-bold uppercase">Qty</Text>
                      <Text className="text-xs text-slate-700 font-bold">{res.quantity} unit(s)</Text>
                    </View>
                  </View>
                  <View className="w-1/2 flex-row items-center gap-2">
                    <Ionicons name="calendar-outline" size={14} color="#64748b" />
                    <View>
                      <Text className="text-[9px] text-slate-400 font-bold uppercase">Date</Text>
                      <Text className="text-xs text-slate-700 font-bold">{res.date}</Text>
                    </View>
                  </View>
                  <View className="w-1/2 flex-row items-center gap-2">
                    <Ionicons name={res.fulfillmentMethod === "Delivery" ? "bicycle-outline" : "storefront-outline"} size={14} color="#64748b" />
                    <View>
                      <Text className="text-[9px] text-slate-400 font-bold uppercase">Mode</Text>
                      <Text className="text-xs text-slate-700 font-bold">{res.fulfillmentMethod}</Text>
                    </View>
                  </View>
                </View>

                {/* Actions */}
                {res.status === "Pending Pharmacy Review" && (
                  <View className="flex-row items-center gap-3 mt-4">
                    <TouchableOpacity
                      onPress={() => handleCancel(res.id, res.medicineName)}
                      className="flex-1 flex-row items-center justify-center gap-1.5 border border-red-200 py-3 rounded-2xl"
                    >
                      <Ionicons name="close-outline" size={16} color="#dc2626" />
                      <Text className="text-red-600 text-xs font-bold">Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => approveReservation(res.id)}
                      className="flex-1 flex-row items-center justify-center gap-1.5 bg-primary py-3 rounded-2xl"
                    >
                      <Ionicons name="checkmark-done-outline" size={16} color="white" />
                      <Text className="text-white text-xs font-bold">Mock Approve</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {res.status === "Approved" && (
                  <View className="flex-row items-center gap-3 mt-4">
                    <TouchableOpacity
                      onPress={() => handleCompleteOptions(res)}
                      className="flex-[1.5] flex-row items-center justify-center gap-1.5 border border-teal-200 py-3 rounded-2xl bg-teal-50"
                    >
                      <Ionicons name="options-outline" size={16} color="#0f766e" />
                      <Text className="text-primary text-xs font-bold">Complete Options</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => router.push({ pathname: "/reservation/status-timeline", params: { reservationId: res.id } } as never)}
                      className="flex-1 flex-row items-center justify-center gap-1.5 bg-primary py-3 rounded-2xl"
                    >
                      <Ionicons name="time-outline" size={16} color="white" />
                      <Text className="text-white text-xs font-bold">Track</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {res.status === "Paid" && (
                  <View className="flex-row items-center gap-3 mt-4">
                    <TouchableOpacity
                      onPress={() => handleAdvance(res)}
                      className="flex-1 flex-row items-center justify-center gap-1.5 bg-primary py-3 rounded-2xl"
                    >
                      <Ionicons name="play-outline" size={16} color="white" />
                      <Text className="text-white text-xs font-bold">
                        {res.fulfillmentMethod === "Delivery" ? "Start Delivery" : "Ready for Pickup"}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => router.push({ pathname: "/reservation/status-timeline", params: { reservationId: res.id } } as never)}
                      className="flex-1 flex-row items-center justify-center gap-1.5 border border-slate-200 py-3 rounded-2xl"
                    >
                      <Ionicons name="time-outline" size={16} color="#0f766e" />
                      <Text className="text-primary text-xs font-bold">Track</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {res.status === "Preparing" && (
                  <View className="flex-row items-center gap-3 mt-4">
                    <TouchableOpacity
                      onPress={() => handleAdvance(res)}
                      className="flex-1 flex-row items-center justify-center gap-1.5 bg-primary py-3 rounded-2xl"
                    >
                      <Ionicons name="bicycle-outline" size={16} color="white" />
                      <Text className="text-white text-xs font-bold">Out for Delivery</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => router.push({ pathname: "/reservation/status-timeline", params: { reservationId: res.id } } as never)}
                      className="flex-1 flex-row items-center justify-center gap-1.5 border border-slate-200 py-3 rounded-2xl"
                    >
                      <Ionicons name="time-outline" size={16} color="#0f766e" />
                      <Text className="text-primary text-xs font-bold">Track</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {res.status === "Out for Delivery" && (
                  <View className="flex-row items-center gap-3 mt-4">
                    <TouchableOpacity
                      onPress={() => handleAdvance(res)}
                      className="flex-1 flex-row items-center justify-center gap-1.5 bg-primary py-3 rounded-2xl"
                    >
                      <Ionicons name="checkmark-outline" size={16} color="white" />
                      <Text className="text-white text-xs font-bold">Mark Delivered</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => router.push({ pathname: "/reservation/status-timeline", params: { reservationId: res.id } } as never)}
                      className="flex-1 flex-row items-center justify-center gap-1.5 border border-slate-200 py-3 rounded-2xl"
                    >
                      <Ionicons name="time-outline" size={16} color="#0f766e" />
                      <Text className="text-primary text-xs font-bold">Track</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {res.status === "Ready for Pickup" && (
                  <View className="flex-row items-center gap-3 mt-4">
                    <TouchableOpacity
                      onPress={() => handleAdvance(res)}
                      className="flex-1 flex-row items-center justify-center gap-1.5 bg-primary py-3 rounded-2xl"
                    >
                      <Ionicons name="bag-check-outline" size={16} color="white" />
                      <Text className="text-white text-xs font-bold">Mark Collected</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => router.push({ pathname: "/reservation/status-timeline", params: { reservationId: res.id } } as never)}
                      className="flex-1 flex-row items-center justify-center gap-1.5 border border-slate-200 py-3 rounded-2xl"
                    >
                      <Ionicons name="time-outline" size={16} color="#0f766e" />
                      <Text className="text-primary text-xs font-bold">Track</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {(res.status === "Delivered" || res.status === "Collected") && (
                  <View className="bg-emerald-50 border border-emerald-100 rounded-2xl p-3 mt-4 flex-row items-center gap-2">
                    <Ionicons name="checkmark-circle" size={18} color="#059669" />
                    <Text className="text-emerald-700 text-xs font-bold flex-1">
                      {res.status === "Delivered"
                        ? "Your delivery has been completed."
                        : "Your medicine has been collected."}
                    </Text>
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
