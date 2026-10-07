import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useApp, Reservation } from "@/context/AppContext";
import { formatReservationDateTime, formatRelativeTime } from "@/utils/date";

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
    case "Expired":
      return "Cancelled";
    default:
      return "Pending Pharmacy Review";
  }
};

export default function ReservationsScreen() {
  const router = useRouter();
  const {
    reservations,
    cancelReservation,
    clearReservation,
    clearAllFinishedReservations,
    refreshReservations,
  } = useApp();
  const [activeTab, setActiveTab] = useState<string>("All");
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshReservations();
    setRefreshing(false);
  };

  const filtered = activeTab === "All"
    ? reservations
    : reservations.filter((r) => reservationGroup(r.status) === activeTab);

  const clearableReservations = reservations.filter((r) =>
    ["Delivered", "Collected", "Cancelled", "Expired"].includes(r.status)
  );
  const hasClearable = clearableReservations.length > 0;

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
      case "Expired":
        return { bg: "bg-stone-100", border: "border-stone-200", text: "text-stone-700", icon: "timer-outline" as const, dot: "bg-stone-500" };
      default:
        return { bg: "bg-teal-50", border: "border-teal-100", text: "text-teal-700", icon: "receipt-outline" as const, dot: "bg-teal-500" };
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

  const handleClearSingle = (id: string, name: string) => {
    Alert.alert(
      "Clear Reservation",
      `Remove reservation for "${name}" from your list?`,
      [
        { text: "Keep", style: "cancel" },
        { text: "Clear", style: "destructive", onPress: () => clearReservation(id) },
      ]
    );
  };

  const handleClearAllFinished = () => {
    Alert.alert(
      "Clear Finished Reservations",
      "Remove all delivered, collected, cancelled, and expired reservations from your list?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Clear All", style: "destructive", onPress: () => clearAllFinishedReservations() },
      ]
    );
  };

  const handleCompleteOptions = (reservation: Reservation) => {
    router.push({
      pathname: "/reservation/fulfillment-method",
      params: { medicineId: reservation.medicineId, reservationId: reservation.id },
    } as never);
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
      <StatusBar style="dark" />
      {/* Header */}
      <View className="px-6 pt-4 pb-2 flex-row items-center justify-between">
        <View className="flex-1 pr-2">
          <Text className="text-2xl font-bold text-slate-800">My Reservations</Text>
          <Text className="text-xs text-slate-400 font-semibold mt-1">
            Track and manage your medicine reservations
          </Text>
        </View>
        {hasClearable && (
          <TouchableOpacity
            onPress={handleClearAllFinished}
            className="flex-row items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-2xl shadow-xs active:bg-slate-100"
          >
            <Ionicons name="trash-outline" size={14} color="#64748b" />
            <Text className="text-[11px] font-bold text-slate-600">Clear Finished</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Status Tabs */}
      <View className="h-12 my-2">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="px-4"
          contentContainerStyle={{ paddingRight: 24, alignItems: "center" }}
          style={{ flexGrow: 0 }}
        >
          {STATUS_TABS.map((tab) => {
            const count = tab === "All"
              ? reservations.length
              : reservations.filter((r) => reservationGroup(r.status) === tab).length;
            return (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                className={`mr-2 px-4 py-2 rounded-2xl flex-row items-center gap-1.5 border ${activeTab === tab
                  ? "bg-primary border-primary"
                  : "bg-white border-slate-200"
                  }`}
              >
                <Text
                  className={`text-xs font-bold ${activeTab === tab ? "text-white" : "text-slate-600"
                    }`}
                >
                  {tab}
                </Text>
                <View
                  className={`px-1.5 py-0.5 rounded-full min-w-[18px] items-center ${activeTab === tab ? "bg-white/20" : "bg-slate-100"
                    }`}
                >
                  <Text
                    className={`text-[9px] font-bold ${activeTab === tab ? "text-white" : "text-slate-500"
                      }`}
                  >
                    {count}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Reservations List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1 px-6"
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 24 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0f766e" colors={["#0f766e"]} />
        }
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
            const isClearable = ["Delivered", "Collected", "Cancelled", "Expired"].includes(res.status);

            return (
              <View
                key={res.id}
                className="bg-white rounded-3xl p-5 mb-3 border border-slate-100 shadow-sm"
              >
                {/* Top row */}
                <View className="flex-row items-start justify-between mb-2">
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

                {/* Date and Time row */}
                <View className="flex-row items-center gap-1.5 mb-3 bg-slate-50/80 px-2.5 py-1.5 rounded-xl self-start border border-slate-100">
                  <Ionicons name="calendar-outline" size={12} color="#64748b" />
                  <Text className="text-[11px] font-semibold text-slate-600">
                    {formatReservationDateTime(res.date)}
                  </Text>
                  {formatRelativeTime(res.date) ? (
                    <Text className="text-[10px] font-bold text-slate-400 ml-1">
                      ({formatRelativeTime(res.date)})
                    </Text>
                  ) : null}
                </View>

                {/* Info grid */}
                <View className="bg-slate-50 rounded-2xl p-3.5 flex-row flex-wrap gap-y-2">
                  <View className="w-1/2 flex-row items-center gap-2">
                    <Ionicons name="barcode-outline" size={14} color="#64748b" />
                    <View>
                      <Text className="text-[9px] text-slate-400 font-bold uppercase">Code</Text>
                      <Text className="text-xs text-slate-800 font-extrabold">{res.reservationCode || res.refNumber}</Text>
                    </View>
                  </View>
                  <View className="w-1/2 flex-row items-center gap-2">
                    <Ionicons name="card-outline" size={14} color="#64748b" />
                    <View>
                      <Text className="text-[9px] text-slate-400 font-bold uppercase">Payment</Text>
                      <Text
                        className={`text-xs font-bold ${
                          res.paymentStatus === "PAID"
                            ? "text-emerald-600"
                            : res.status === "Pending Pharmacy Review" || !res.paymentMethod
                            ? "text-slate-500"
                            : "text-amber-600"
                        }`}
                      >
                        {res.paymentStatus === "PAID"
                          ? `PAID • ${res.paymentMethod === "PAYSTACK" ? "Paystack" : "Cash"}`
                          : res.status === "Pending Pharmacy Review"
                          ? "Pending Review"
                          : !res.paymentMethod
                          ? "Awaiting Selection"
                          : `UNPAID • ${res.paymentMethod === "PAYSTACK" ? "Paystack" : "Cash"}`}
                      </Text>
                    </View>
                  </View>
                  <View className="w-1/2 flex-row items-center gap-2">
                    <Ionicons name="cash-outline" size={14} color="#64748b" />
                    <View>
                      <Text className="text-[9px] text-slate-400 font-bold uppercase">Total</Text>
                      <Text className="text-xs text-slate-800 font-extrabold">GH₵ {(res.totalPrice || 15.0).toFixed(2)}</Text>
                    </View>
                  </View>
                  <View className="w-1/2 flex-row items-center gap-2">
                    <Ionicons name={res.fulfillmentMethod === "Delivery" ? "bicycle-outline" : "storefront-outline"} size={14} color="#64748b" />
                    <View>
                      <Text className="text-[9px] text-slate-400 font-bold uppercase">Mode</Text>
                      <Text className="text-xs text-slate-700 font-bold">{res.fulfillmentMethod} ({res.quantity}x)</Text>
                    </View>
                  </View>
                </View>

                {/* Actions */}
                {res.status === "Pending Pharmacy Review" && (
                  <View className="mt-4">
                    <View className="bg-amber-50/80 border border-amber-100/80 rounded-2xl p-3 mb-3 flex-row items-center gap-2">
                      <Ionicons name="time-outline" size={16} color="#d97706" />
                      <Text className="text-amber-800 text-[11px] font-semibold flex-1">
                        Awaiting review & confirmation from {res.pharmacyName}.
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleCancel(res.id, res.medicineName)}
                      className="flex-row items-center justify-center gap-1.5 border border-red-200 bg-red-50/30 py-3 rounded-2xl"
                    >
                      <Ionicons name="close-outline" size={16} color="#dc2626" />
                      <Text className="text-red-600 text-xs font-bold">Cancel Reservation</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {(res.status === "Approved" || res.status === "Reserved") && (
                  <View className="mt-4">
                    <View className="bg-emerald-50/80 border border-emerald-100/80 rounded-2xl p-3 mb-3 flex-row items-center gap-2">
                      <Ionicons name="checkmark-circle-outline" size={16} color="#059669" />
                      <Text className="text-emerald-800 text-[11px] font-semibold flex-1">
                        {res.paymentStatus === "PAID"
                          ? "✓ Payment confirmed! Medicine reservation is active."
                          : "Reservation approved! Please select fulfillment & payment method."}
                      </Text>
                    </View>
                    <View className="flex-row items-center gap-3">
                      {res.paymentStatus === "PAID" ? (
                        <TouchableOpacity
                          onPress={() => router.push({ pathname: "/reservation/status-timeline", params: { reservationId: res.id } } as never)}
                          className="flex-1 flex-row items-center justify-center gap-1.5 bg-primary py-3 rounded-2xl shadow-sm"
                        >
                          <Ionicons name="time-outline" size={16} color="white" />
                          <Text className="text-white text-xs font-bold">Track Status Timeline</Text>
                        </TouchableOpacity>
                      ) : (
                        <>
                          <TouchableOpacity
                            onPress={() => handleCompleteOptions(res)}
                            className="flex-[1.5] flex-row items-center justify-center gap-1.5 bg-primary py-3 rounded-2xl shadow-sm"
                          >
                            <Ionicons name="card-outline" size={16} color="white" />
                            <Text className="text-white text-xs font-bold">Choose Mode & Pay</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => router.push({ pathname: "/reservation/status-timeline", params: { reservationId: res.id } } as never)}
                            className="flex-1 flex-row items-center justify-center gap-1.5 border border-slate-200 py-3 rounded-2xl"
                          >
                            <Ionicons name="time-outline" size={16} color="#0f766e" />
                            <Text className="text-primary text-xs font-bold">Track</Text>
                          </TouchableOpacity>
                        </>
                      )}
                    </View>
                  </View>
                )}

                {["Paid", "Preparing", "Out for Delivery", "Ready for Pickup"].includes(res.status) && (
                  <View className="flex-row items-center gap-3 mt-4">
                    <TouchableOpacity
                      onPress={() => router.push({ pathname: "/reservation/status-timeline", params: { reservationId: res.id } } as never)}
                      className="flex-1 flex-row items-center justify-center gap-1.5 bg-primary py-3 rounded-2xl"
                    >
                      <Ionicons name="time-outline" size={16} color="white" />
                      <Text className="text-white text-xs font-bold">Track Status Timeline</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {(res.status === "Delivered" || res.status === "Collected") && (
                  <View className="mt-4">
                    <View className="bg-emerald-50 border border-emerald-100 rounded-2xl p-3 flex-row items-center gap-2">
                      <Ionicons name="checkmark-circle" size={18} color="#059669" />
                      <Text className="text-emerald-700 text-xs font-bold flex-1">
                        {res.status === "Delivered"
                          ? "Your delivery has been completed."
                          : "Your medicine has been collected."}
                      </Text>
                    </View>
                    <View className="flex-row items-center gap-2 mt-3">
                      <TouchableOpacity
                        onPress={() => router.push({ pathname: "/reservation/status-timeline", params: { reservationId: res.id } } as never)}
                        className="flex-1 flex-row items-center justify-center gap-1.5 border border-slate-200 py-3 rounded-2xl bg-white"
                      >
                        <Ionicons name="receipt-outline" size={16} color="#0f766e" />
                        <Text className="text-primary text-xs font-bold">View Timeline</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleClearSingle(res.id, res.medicineName)}
                        className="flex-row items-center justify-center gap-1.5 border border-slate-200 bg-slate-50 py-3 px-4 rounded-2xl"
                      >
                        <Ionicons name="trash-outline" size={16} color="#64748b" />
                        <Text className="text-slate-600 text-xs font-bold">Clear</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {(res.status === "Cancelled" || res.status === "Expired") && (
                  <View className="mt-4">
                    <View className="bg-red-50 border border-red-100 rounded-2xl p-3 gap-1">
                      <View className="flex-row items-center gap-2">
                        <Ionicons name="close-circle" size={18} color="#dc2626" />
                        <Text className="text-red-700 text-xs font-bold flex-1">
                          {res.status === "Expired"
                            ? "This reservation has expired."
                            : "This reservation was cancelled."}
                        </Text>
                      </View>
                      {res.rejectionReason && (
                        <View className="ml-6 bg-red-100/50 rounded-xl px-2.5 py-1.5 mt-0.5">
                          <Text className="text-red-800 text-[11px] font-semibold leading-relaxed">
                            Reason: {res.rejectionReason}
                          </Text>
                        </View>
                      )}
                    </View>
                    <TouchableOpacity
                      onPress={() => handleClearSingle(res.id, res.medicineName)}
                      className="mt-2.5 flex-row items-center justify-center gap-1.5 border border-red-200 bg-red-50/40 py-2.5 rounded-2xl"
                    >
                      <Ionicons name="trash-outline" size={15} color="#dc2626" />
                      <Text className="text-red-600 text-xs font-bold">Clear from History</Text>
                    </TouchableOpacity>
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

