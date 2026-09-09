import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "@/context/AppContext";

// Conditionally import WebView on native platforms
let WebView: any = null;
if (Platform.OS !== "web") {
  try {
    WebView = require("react-native-webview").WebView;
  } catch (e) {
    console.warn("react-native-webview not loaded", e);
  }
}

export default function PaystackCheckoutScreen() {
  const router = useRouter();
  const { reservationId, fulfillmentMethod, address } = useLocalSearchParams<{
    reservationId?: string;
    fulfillmentMethod?: "Pickup" | "Delivery";
    address?: string;
  }>();

  const { initializePaystackPayment, verifyPaystackPayment, reservations } = useApp();

  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [authUrl, setAuthUrl] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);
  const [isMock, setIsMock] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reservation = reservations.find((r) => r.id === reservationId);

  useEffect(() => {
    let isMounted = true;

    if (reservation?.paymentStatus === "PAID" || reservation?.status === "Paid") {
      router.replace({
        pathname: "/reservation/status-timeline",
        params: { reservationId },
      } as never);
      return;
    }

    async function initPayment() {
      if (!reservationId) return;
      try {
        setLoading(true);
        setError(null);
        const res = await initializePaystackPayment(reservationId);
        if (isMounted) {
          setAuthUrl(res.authorization_url);
          setReference(res.reference);
          setIsMock(res.is_mock);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || "Failed to initialize Paystack payment");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    initPayment();

    return () => {
      isMounted = false;
    };
  }, [reservationId, reservation?.paymentStatus, reservation?.status]);

  const handleVerify = async (refToVerify: string) => {
    if (verifying) return;
    setVerifying(true);
    try {
      const success = await verifyPaystackPayment(refToVerify);
      if (success) {
        Alert.alert(
          "Payment Successful",
          "Your reservation payment has been verified successfully!",
          [
            {
              text: "View Reservation",
              onPress: () => {
                router.replace({
                  pathname: "/reservation/status-timeline",
                  params: { reservationId },
                } as never);
              },
            },
          ]
        );
      } else {
        Alert.alert("Payment Incomplete", "Payment was not completed or verification failed.");
      }
    } catch (err: any) {
      Alert.alert("Verification Error", err.message || "Failed to verify payment with server");
    } finally {
      setVerifying(false);
    }
  };

  const handleNavigationStateChange = (navState: any) => {
    const { url } = navState;
    if (!url) return;

    // Intercept Paystack callback or success redirects
    if (url.includes("callback") || url.includes("trxref=") || url.includes("reference=")) {
      let extractedRef = reference;
      const match = url.match(/[?&](?:reference|trxref)=([^&]+)/);
      if (match && match[1]) {
        extractedRef = decodeURIComponent(match[1]);
      }
      if (extractedRef) {
        handleVerify(extractedRef);
      }
    }
  };

  // Close or Cancel
  const handleCancel = () => {
    Alert.alert(
      "Cancel Payment?",
      "Are you sure you want to exit? Your reservation will remain saved but unpaid.",
      [
        { text: "Continue Payment", style: "cancel" },
        {
          text: "Exit",
          style: "destructive",
          onPress: () => router.replace("/(tabs)/reservations" as never),
        },
      ]
    );
  };

  if (loading || verifying) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center px-6">
        <View className="w-20 h-20 rounded-3xl bg-teal-50 items-center justify-center mb-6">
          <Ionicons name="card" size={40} color="#0f766e" />
        </View>
        <ActivityIndicator size="large" color="#0f766e" />
        <Text className="text-xl font-bold text-slate-900 mt-4 text-center">
          {verifying ? "Verifying Payment..." : "Connecting to Paystack..."}
        </Text>
        <Text className="text-slate-500 text-xs mt-2 text-center max-w-xs">
          {verifying
            ? "Confirming your transaction securely with Paystack."
            : "Initializing secure split payment gateway."}
        </Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center px-6">
        <View className="w-16 h-16 rounded-full bg-rose-50 items-center justify-center mb-4">
          <Ionicons name="alert-circle" size={36} color="#e11d48" />
        </View>
        <Text className="text-lg font-bold text-slate-900 text-center mb-2">Payment Setup Error</Text>
        <Text className="text-slate-500 text-xs text-center mb-6 px-4">{error}</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-primary px-6 py-3 rounded-2xl"
        >
          <Text className="text-white font-bold text-xs">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // If running in Mock mode or Web without iframe support
  if (isMock || Platform.OS === "web" || !WebView) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50">
        <View className="flex-row items-center justify-between px-6 py-4 bg-white border-b border-slate-100">
          <TouchableOpacity onPress={handleCancel} className="p-2">
            <Ionicons name="close" size={24} color="#64748b" />
          </TouchableOpacity>
          <Text className="text-sm font-bold text-slate-800">Paystack Checkout (Test)</Text>
          <View className="w-8" />
        </View>

        <View className="flex-1 p-6 items-center justify-center">
          <View className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm w-full max-w-sm items-center">
            <View className="w-16 h-16 rounded-2xl bg-teal-50 items-center justify-center mb-4">
              <Ionicons name="shield-checkmark" size={32} color="#0f766e" />
            </View>

            <Text className="text-lg font-bold text-slate-900">Pay with Paystack</Text>
            <Text className="text-xs text-slate-500 text-center mt-1">
              Secured split payout to {reservation?.pharmacyName || "Pharmacy"}
            </Text>

            <View className="w-full bg-slate-50 rounded-2xl p-4 my-6 space-y-2">
              <View className="flex-row justify-between">
                <Text className="text-xs text-slate-400 font-semibold">Medicine:</Text>
                <Text className="text-xs font-bold text-slate-800">{reservation?.medicineName || "Medicine"}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-xs text-slate-400 font-semibold">Quantity:</Text>
                <Text className="text-xs font-bold text-slate-800">{reservation?.quantity || 1} unit(s)</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-xs text-slate-400 font-semibold">Reference:</Text>
                <Text className="text-xs font-bold text-slate-800">{reference}</Text>
              </View>
              <View className="flex-row justify-between pt-2 border-t border-slate-200">
                <Text className="text-xs font-bold text-slate-700">Total Amount:</Text>
                <Text className="text-sm font-extrabold text-primary">
                  GH₵ {(reservation?.totalPrice || 15.0).toFixed(2)}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => reference && handleVerify(reference)}
              className="w-full bg-primary py-4 rounded-2xl items-center shadow-md mb-3"
            >
              <Text className="text-white font-bold text-sm">Authorize Payment (GH₵ {(reservation?.totalPrice || 15.0).toFixed(2)})</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleCancel}
              className="w-full py-3 items-center"
            >
              <Text className="text-slate-400 font-semibold text-xs">Cancel and Pay at Pharmacy Later</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Native WebView checkout
  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-slate-100">
        <TouchableOpacity onPress={handleCancel} className="p-2">
          <Ionicons name="close" size={24} color="#0f766e" />
        </TouchableOpacity>
        <Text className="text-xs font-bold text-slate-700">Secured by Paystack</Text>
        <TouchableOpacity
          onPress={() => reference && handleVerify(reference)}
          className="bg-teal-50 px-3 py-1.5 rounded-lg border border-teal-100"
        >
          <Text className="text-primary font-bold text-xs">I Have Paid</Text>
        </TouchableOpacity>
      </View>

      {authUrl && (
        <WebView
          source={{ uri: authUrl }}
          onNavigationStateChange={handleNavigationStateChange}
          startInLoadingState={true}
          renderLoading={() => (
            <View className="absolute inset-0 bg-white items-center justify-center">
              <ActivityIndicator size="large" color="#0f766e" />
              <Text className="text-xs text-slate-400 font-semibold mt-3">Loading checkout...</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}
