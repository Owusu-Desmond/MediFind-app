import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Linking,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useApp, Pharmacy } from "@/context/AppContext";

export default function PharmaciesScreen() {
  const {
    pharmacies,
    savedPharmacies,
    toggleSavePharmacy,
    refreshData,
    userLocation,
    locationPermission,
    requestLocationAccess,
  } = useApp();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  const handleDirections = (pharmacy: Pharmacy) => {
    router.push({
      pathname: "/pharmacy/directions",
      params: { pharmacyId: pharmacy.id },
    } as never);
  };

  const handleCall = (phone: string) => {
    if (phone) {
      Linking.openURL(`tel:${phone.replace(/\s+/g, "")}`);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
      {/* Header with Title and Mode Switcher */}
      <View className="px-6 pt-4 pb-3">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-slate-800">Nearby Pharmacies</Text>
            <Text className="text-xs text-slate-400 font-semibold mt-1">
              Verified network sorted by live proximity
            </Text>
          </View>

          {/* View Mode Toggle: List vs Map */}
          <View className="bg-slate-200/80 p-1 rounded-2xl flex-row items-center">
            <View className="px-3 py-1.5 rounded-xl flex-row items-center gap-1 bg-white shadow-sm">
              <Ionicons name="list" size={14} color="#0f766e" />
              <Text className="text-xs font-bold text-primary">List</Text>
            </View>

            <TouchableOpacity
              onPress={() => {
                const firstPharmacy = pharmacies.length > 0 ? pharmacies[0] : null;
                router.push({
                  pathname: "/pharmacy/directions",
                  params: firstPharmacy ? { pharmacyId: firstPharmacy.id } : {},
                } as never);
              }}
              activeOpacity={0.7}
              className="px-3 py-1.5 rounded-xl flex-row items-center gap-1"
            >
              <Ionicons name="map" size={14} color="#64748b" />
              <Text className="text-xs font-bold text-slate-600">Map</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Location Status Bar */}
        {locationPermission !== "granted" && (
          <View className="mt-3 bg-amber-50 border border-amber-200/80 rounded-2xl p-3 flex-row items-center justify-between">
            <View className="flex-row items-center gap-2 flex-1 mr-2">
              <Ionicons name="location" size={16} color="#d97706" />
              <Text className="text-amber-800 text-[11px] font-semibold flex-1">
                Enable GPS location to calculate exact distance and find closest pharmacies.
              </Text>
            </View>
            <TouchableOpacity
              onPress={requestLocationAccess}
              className="bg-amber-600 px-3 py-1.5 rounded-xl"
            >
              <Text className="text-white text-xs font-bold">Enable GPS</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Main Content Area */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1 px-6"
        contentContainerStyle={{ paddingBottom: 24, paddingTop: 4 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#0f766e"
            colors={["#0f766e"]}
          />
        }
      >
        {pharmacies.length === 0 ? (
          <View className="items-center py-20">
            <View className="w-16 h-16 rounded-3xl bg-slate-100 items-center justify-center mb-4">
              <Ionicons name="storefront-outline" size={32} color="#cbd5e1" />
            </View>
            <Text className="text-slate-400 font-bold text-sm">No pharmacies available</Text>
            <Text className="text-slate-300 text-xs mt-1 text-center">
              There are currently no registered pharmacies.
            </Text>
          </View>
        ) : (
          pharmacies.map((pharmacy) => {
            const isSaved = savedPharmacies.includes(pharmacy.id);

            return (
              <TouchableOpacity
                key={pharmacy.id}
                onPress={() => router.push(`/pharmacy/${pharmacy.id}`)}
                activeOpacity={0.7}
                className="bg-white rounded-3xl p-5 mb-3 border border-slate-100 shadow-sm"
              >
                {/* Top row: icon + info + save */}
                <View className="flex-row items-start gap-4">
                  {/* Pharmacy Image / Logo */}
                  {pharmacy.imageUrl || pharmacy.logoUrl ? (
                    <Image
                      source={{ uri: pharmacy.imageUrl || pharmacy.logoUrl }}
                      className="w-14 h-14 rounded-2xl bg-slate-100"
                      resizeMode="cover"
                    />
                  ) : (
                    <View
                      className={`w-14 h-14 rounded-2xl items-center justify-center ${
                        pharmacy.verified ? "bg-teal-50" : "bg-slate-100"
                      }`}
                    >
                      <Ionicons
                        name="storefront"
                        size={26}
                        color={pharmacy.verified ? "#0f766e" : "#94a3b8"}
                      />
                    </View>
                  )}

                  <View className="flex-1">
                    <View className="flex-row items-start justify-between">
                      <View className="flex-1 pr-2">
                        <View className="flex-row items-center gap-1.5">
                          <Text
                            className="text-base font-bold text-slate-800"
                            numberOfLines={1}
                          >
                            {pharmacy.name}
                          </Text>
                          {pharmacy.verified && (
                            <Ionicons name="checkmark-circle" size={14} color="#0f766e" />
                          )}
                        </View>
                        <Text
                          className="text-xs text-slate-400 font-semibold mt-0.5"
                          numberOfLines={1}
                        >
                          {pharmacy.address}
                        </Text>
                      </View>

                      <TouchableOpacity
                        onPress={(e) => {
                          e.stopPropagation();
                          toggleSavePharmacy(pharmacy.id);
                        }}
                        className="w-9 h-9 rounded-xl items-center justify-center"
                      >
                        <Ionicons
                          name={isSaved ? "bookmark" : "bookmark-outline"}
                          size={20}
                          color={isSaved ? "#0f766e" : "#94a3b8"}
                        />
                      </TouchableOpacity>
                    </View>

                    {/* Metadata row with real distance */}
                    <View className="flex-row items-center mt-3 gap-4 flex-wrap">
                      <View className="flex-row items-center gap-1 bg-teal-50/80 px-2 py-0.5 rounded-lg">
                        <Ionicons name="location" size={12} color="#0f766e" />
                        <Text className="text-xs text-primary font-bold">
                          {pharmacy.distance}
                        </Text>
                      </View>
                      <View className="flex-row items-center gap-1">
                        <Ionicons name="star" size={13} color="#f59e0b" />
                        <Text className="text-xs font-bold text-slate-700">
                          {pharmacy.rating} ({pharmacy.reviews})
                        </Text>
                      </View>
                      <View className="flex-row items-center gap-1">
                        <Ionicons name="time-outline" size={13} color="#64748b" />
                        <Text className="text-xs text-slate-500 font-semibold">
                          {pharmacy.openHours.split(":")[0]}
                        </Text>
                      </View>
                    </View>

                    {/* Status + Action */}
                    <View className="flex-row items-center justify-between mt-4">
                      <View
                        className={`flex-row items-center gap-1.5 px-3 py-1.5 rounded-full ${pharmacy.isOpen
                            ? "bg-emerald-50 border border-emerald-100"
                            : "bg-red-50 border border-red-100"
                          }`}
                      >
                        <View
                          className={`w-1.5 h-1.5 rounded-full ${pharmacy.isOpen ? "bg-emerald-500" : "bg-red-500"
                            }`}
                        />
                        <Text
                          className={`text-[10px] font-bold ${pharmacy.isOpen ? "text-emerald-700" : "text-red-700"
                            }`}
                        >
                          {pharmacy.isOpen ? "Open Now" : "Closed"}
                        </Text>
                      </View>

                      <View className="flex-row items-center gap-2">
                        <TouchableOpacity
                          onPress={(e) => {
                            e.stopPropagation();
                            handleCall(pharmacy.phone);
                          }}
                          className="flex-row items-center gap-1 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl"
                        >
                          <Ionicons name="call-outline" size={14} color="#0f766e" />
                          <Text className="text-xs font-bold text-primary">Call</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={(e) => {
                            e.stopPropagation();
                            handleDirections(pharmacy);
                          }}
                          className="flex-row items-center gap-1 bg-primary px-3 py-2 rounded-xl"
                        >
                          <Ionicons name="navigate-outline" size={14} color="white" />
                          <Text className="text-xs font-bold text-white">Directions</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
