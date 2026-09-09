import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "@/context/AppContext";

export default function StatusTimelineScreen() {
  const router = useRouter();
  const { reservations, refreshReservations } = useApp();
  const { reservationId } = useLocalSearchParams<{ reservationId?: string }>();
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    refreshReservations();
  }, [reservationId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshReservations();
    setRefreshing(false);
  };

  const reservation = reservations.find((item) => item.id === reservationId);

  const isPaid =
    reservation?.paymentStatus?.toUpperCase() === "PAID" ||
    reservation?.status === "Paid" ||
    Boolean(reservation?.paidAt);

  const isPaystack =
    reservation?.paymentMethod?.toUpperCase() === "PAYSTACK" ||
    reservation?.paymentMethod === "Pay Online";

  let steps: { title: string; desc: string }[] = [];
  
  if (reservation?.fulfillmentMethod === "Delivery") {
    steps = [
      { title: "Pending Pharmacy Review", desc: "Awaiting pharmacy confirmation" },
      { title: "Approved", desc: "Reservation verified by pharmacy" },
      ...(isPaystack ? [{ title: "Paid", desc: "Online payment confirmed via Paystack" }] : []),
      { title: "Preparing", desc: "Pharmacy is packaging your medicine" },
      { title: "Out for Delivery", desc: "Courier dispatched to your address" },
      { title: "Delivered", desc: "Order delivered to patient" },
    ];
  } else {
    steps = [
      { title: "Pending Pharmacy Review", desc: "Awaiting pharmacy confirmation" },
      { title: "Approved", desc: "Medicine reserved at pharmacy" },
      ...(isPaystack ? [{ title: "Paid", desc: "Online payment confirmed via Paystack" }] : []),
      { title: "Ready for Pickup", desc: "Ready for collection at pharmacy counter" },
      { title: "Collected", desc: "Medicine handed over to patient" },
    ];
  }

  const isStepDone = (stepTitle: string): boolean => {
    if (!reservation) return false;
    const status = reservation.status;

    if (stepTitle === "Pending Pharmacy Review") {
      return status !== "Pending Pharmacy Review" || isPaid;
    }
    if (stepTitle === "Approved") {
      return (
        ["Approved", "Reserved", "Paid", "Preparing", "Ready for Pickup", "Out for Delivery", "Delivered", "Collected"].includes(status) ||
        isPaid
      );
    }
    if (stepTitle === "Paid") {
      return isPaid;
    }
    if (stepTitle === "Preparing") {
      return ["Preparing", "Out for Delivery", "Delivered", "Collected"].includes(status);
    }
    if (stepTitle === "Ready for Pickup") {
      return ["Ready for Pickup", "Collected", "Delivered"].includes(status);
    }
    if (stepTitle === "Out for Delivery") {
      return ["Out for Delivery", "Delivered", "Collected"].includes(status);
    }
    if (stepTitle === "Delivered" || stepTitle === "Collected") {
      return ["Delivered", "Collected"].includes(status);
    }
    return false;
  };

  const currentStepIndex = steps.findIndex((step) => !isStepDone(step.title));
  const activeIndex = currentStepIndex === -1 ? steps.length - 1 : currentStepIndex;

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 36 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0f766e" colors={["#0f766e"]} />
        }
      >
        {/* Header */}
        <View className="px-6 pt-4 pb-2">
          <View className="flex-row items-center justify-between mb-4">
            <TouchableOpacity
              onPress={() => {
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.replace("/(tabs)/reservations");
                }
              }}
              className="w-10 h-10 rounded-xl bg-white border border-slate-200 items-center justify-center shadow-sm"
            >
              <Ionicons name="arrow-back" size={20} color="#0f766e" />
            </TouchableOpacity>
            <Text className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Order Tracking</Text>
            <View className="w-10" />
          </View>
          <Text className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em]">Reservation</Text>
          <Text className="text-slate-900 text-2xl font-bold mt-1">Status & Confirmation</Text>
          {reservation ? (
            <Text className="text-slate-500 text-sm mt-1 leading-relaxed">
              {reservation.medicineName} • {reservation.pharmacyName}
            </Text>
          ) : null}
        </View>

        {reservation && (
          <>
            {reservation.status === "Cancelled" && (
              <View className="mx-6 mt-3 bg-red-50 border border-red-200 rounded-3xl p-5 shadow-sm">
                <View className="flex-row items-center gap-2 mb-1">
                  <Ionicons name="close-circle" size={20} color="#dc2626" />
                  <Text className="text-red-800 font-bold text-base">Reservation Cancelled</Text>
                </View>
                <Text className="text-red-700 text-xs mt-1 leading-relaxed">
                  This reservation was cancelled by the pharmacy.
                </Text>
                {reservation.rejectionReason && (
                  <View className="bg-white/80 rounded-2xl p-3 mt-3 border border-red-100">
                    <Text className="text-[10px] uppercase font-bold text-red-500 tracking-wider">Reason Provided</Text>
                    <Text className="text-slate-800 text-xs font-semibold mt-0.5 leading-relaxed">
                      {reservation.rejectionReason}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Reservation Code & Payment Summary Card */}
            <View className="mx-6 mt-3 bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
              <View className="flex-row items-center justify-between pb-4 border-b border-slate-100">
                <View>
                  <Text className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Reservation Code</Text>
                  <Text className="text-2xl font-black text-slate-800 mt-0.5 tracking-wider">
                    {reservation.reservationCode || reservation.refNumber}
                  </Text>
                </View>
                <View
                  className={`px-3 py-1.5 rounded-full flex-row items-center gap-1.5 border ${
                    isPaid
                      ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                      : "bg-amber-50 border-amber-100 text-amber-700"
                  }`}
                >
                  <View className={`w-2 h-2 rounded-full ${isPaid ? "bg-emerald-500" : "bg-amber-500"}`} />
                  <Text className={`text-[11px] font-extrabold ${isPaid ? "text-emerald-700" : "text-amber-700"}`}>
                    {isPaid ? "PAID" : "PAYMENT PENDING"}
                  </Text>
                </View>
              </View>

              {/* Payment Details Grid */}
              <View className="pt-4 grid grid-cols-2 gap-y-3">
                <View className="flex-row justify-between items-center">
                  <Text className="text-xs text-slate-400 font-semibold">Payment Method:</Text>
                  <Text className="text-xs font-bold text-slate-700">
                    {isPaystack ? "Pay Online (Paystack)" : "Pay at Pharmacy (Cash)"}
                  </Text>
                </View>

                <View className="flex-row justify-between items-center">
                  <Text className="text-xs text-slate-400 font-semibold">Total Amount:</Text>
                  <Text className="text-sm font-extrabold text-primary">
                    GH₵ {(reservation.totalPrice || 15.0).toFixed(2)}
                  </Text>
                </View>

                <View className="flex-row justify-between items-center">
                  <Text className="text-xs text-slate-400 font-semibold">Quantity:</Text>
                  <Text className="text-xs font-bold text-slate-700">{reservation.quantity} unit(s)</Text>
                </View>

                {reservation.fulfillmentAddress && (
                  <View className="flex-row justify-between items-center">
                    <Text className="text-xs text-slate-400 font-semibold">Delivery Address:</Text>
                    <Text className="text-xs font-bold text-slate-700 max-w-[180px]" numberOfLines={1}>
                      {reservation.fulfillmentAddress}
                    </Text>
                  </View>
                )}

                {!isPaid && (
                  <View className="bg-amber-50 rounded-2xl p-3 mt-2 flex-row items-start gap-2 border border-amber-100">
                    <Ionicons name="information-circle" size={16} color="#d97706" />
                    <Text className="text-[11px] font-semibold text-amber-800 flex-1 leading-relaxed">
                      Present your reservation code <Text className="font-bold">{reservation.reservationCode || reservation.refNumber}</Text> at {reservation.pharmacyName} to pay GH₵ {(reservation.totalPrice || 15.0).toFixed(2)} and collect your medicine.
                    </Text>
                  </View>
                )}
              </View>

              {/* Pay Now button if online and unpaid */}
              {!isPaid && isPaystack && (
                <TouchableOpacity
                  onPress={() => {
                    router.push({
                      pathname: "/reservation/paystack-checkout",
                      params: { reservationId: reservation.id },
                    } as never);
                  }}
                  className="mt-4 bg-primary py-3.5 rounded-2xl items-center flex-row justify-center gap-2 shadow-sm"
                >
                  <Ionicons name="card-outline" size={18} color="white" />
                  <Text className="text-white font-bold text-xs">Complete Paystack Payment</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Status Timeline Card */}
            <View className="mx-6 mt-4 bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
              <Text className="text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-4">
                Fulfillment Timeline
              </Text>
              <View className="gap-5">
                {steps.map((step, index) => {
                  const isDone = isStepDone(step.title);
                  const isCurrent = index === activeIndex;
                  return (
                    <View key={step.title} className="flex-row items-start gap-4">
                      <View className="items-center">
                        <View
                          className={`w-9 h-9 rounded-2xl items-center justify-center ${
                            isDone ? "bg-primary" : "bg-slate-100"
                          }`}
                        >
                          {isDone ? (
                            <Ionicons name="checkmark" size={18} color="white" />
                          ) : (
                            <Text className="text-xs font-bold text-slate-400">{index + 1}</Text>
                          )}
                        </View>
                        {index < steps.length - 1 && (
                          <View className={`w-0.5 h-6 my-1 ${isDone ? "bg-primary" : "bg-slate-100"}`} />
                        )}
                      </View>
                      <View className="flex-1 pt-1">
                        <Text className={`font-bold text-sm ${isDone ? "text-slate-900" : "text-slate-400"}`}>
                          {step.title}
                        </Text>
                        <Text className="text-slate-400 text-xs mt-0.5 leading-relaxed">{step.desc}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
