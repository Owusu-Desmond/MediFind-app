import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  Linking,
  ScrollView,
  Image,
  Dimensions,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useApp, Pharmacy } from "@/context/AppContext";
import { calculateDistance, formatDistance } from "@/utils/distance";
import UniversalMapView from "@/components/UniversalMapView";

const { width } = Dimensions.get("window");

export default function MedLocatorDirectionsScreen() {
  const { pharmacyId } = useLocalSearchParams<{ pharmacyId?: string }>();
  const { pharmacies, userLocation, requestLocationAccess, locationPermission } = useApp();
  const router = useRouter();

  // Find target pharmacy, defaulting to first pharmacy or matching ID
  const initialPharmacy =
    pharmacies.find((p) => p.id === pharmacyId) || (pharmacies.length > 0 ? pharmacies[0] : null);
  
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(initialPharmacy);
  const [isSearchingArea, setIsSearchingArea] = useState(false);

  useEffect(() => {
    if (pharmacyId) {
      const match = pharmacies.find((p) => p.id === pharmacyId);
      if (match) setSelectedPharmacy(match);
    }
  }, [pharmacyId, pharmacies]);

  const targetLat = selectedPharmacy?.lat ?? 5.6358;
  const targetLng = selectedPharmacy?.lng ?? -0.1554;
  const userLat = userLocation?.latitude ?? 5.6500;
  const userLng = userLocation?.longitude ?? -0.1500;

  // Calculate live distance
  const distKm = userLocation && selectedPharmacy
    ? calculateDistance(userLocation.latitude, userLocation.longitude, selectedPharmacy.lat, selectedPharmacy.lng)
    : selectedPharmacy?.distanceKm ?? null;
  const distText = formatDistance(distKm);

  // Is this the closest pharmacy?
  const isNearest =
    pharmacies.length > 0 &&
    (selectedPharmacy?.id === pharmacies[0].id ||
      (distKm !== null && distKm < 1.0));

  const handleSearchThisArea = () => {
    setIsSearchingArea(true);
    setTimeout(() => {
      setIsSearchingArea(false);
    }, 800);
  };

  const handleCall = () => {
    if (selectedPharmacy?.phone) {
      Linking.openURL(`tel:${selectedPharmacy.phone.replace(/\s+/g, "")}`);
    }
  };

  const handleStartTurnByTurn = () => {
    if (!selectedPharmacy) return;
    if (selectedPharmacy.lat && selectedPharmacy.lng) {
      const url = userLocation
        ? `https://www.google.com/maps/dir/?api=1&origin=${userLocation.latitude},${userLocation.longitude}&destination=${selectedPharmacy.lat},${selectedPharmacy.lng}&travelmode=driving`
        : `https://www.google.com/maps/dir/?api=1&destination=${selectedPharmacy.lat},${selectedPharmacy.lng}&travelmode=driving`;
      Linking.openURL(url);
    } else {
      const query = encodeURIComponent(`${selectedPharmacy.name}, ${selectedPharmacy.address}`);
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
    }
  };

  // Google Maps Embed showing route / target
  const mapEmbedUrl = `https://maps.google.com/maps?q=${targetLat},${targetLng}&z=14&output=embed`;

  return (
    <SafeAreaView className="flex-1 bg-slate-100" edges={["top"]}>
      {/* Top Header Bar */}
      <View className="px-5 py-3 bg-white/95 backdrop-blur-md border-b border-slate-100 flex-row items-center justify-between z-20">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-2xl items-center justify-center bg-slate-50 border border-slate-100"
        >
          <Ionicons name="arrow-back" size={22} color="#0f766e" />
        </TouchableOpacity>

        <Text className="text-xl font-extrabold text-teal-900 tracking-tight">
          MedLocator
        </Text>

        <TouchableOpacity className="w-10 h-10 rounded-2xl items-center justify-center bg-slate-50 border border-slate-100">
          <Ionicons name="notifications-outline" size={20} color="#0f766e" />
        </TouchableOpacity>
      </View>

      {/* Main Map View Area */}
      <View className="flex-1 relative bg-slate-200 overflow-hidden">
        <UniversalMapView
          userLocation={userLocation}
          pharmacies={pharmacies}
          selectedPharmacyId={selectedPharmacy?.id}
          onSelectPharmacy={(p) => setSelectedPharmacy(p)}
          style={{ flex: 1 }}
        />

        {/* Floating Top Pill: "Search this area" */}
        <View className="absolute top-4 left-0 right-0 items-center z-20">
          <TouchableOpacity
            onPress={handleSearchThisArea}
            activeOpacity={0.85}
            className="bg-white/95 backdrop-blur-md px-5 py-2.5 rounded-full flex-row items-center gap-2 shadow-md border border-slate-100"
          >
            <Ionicons
              name="refresh-outline"
              size={16}
              color="#0f766e"
              className={isSearchingArea ? "animate-spin" : ""}
            />
            <Text className="text-teal-900 font-bold text-xs">
              {isSearchingArea ? "Updating area..." : "Search this area"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Floating GPS Recenter Button */}
        <View className="absolute bottom-6 right-5 flex-col gap-2.5 z-20">
          <TouchableOpacity
            onPress={requestLocationAccess}
            activeOpacity={0.85}
            className="w-12 h-12 rounded-2xl bg-white/95 backdrop-blur-md items-center justify-center shadow-lg border border-slate-100"
          >
            <Ionicons name="locate" size={22} color="#0f766e" />
          </TouchableOpacity>
        </View>

        {/* Floating Pharmacy Switcher Chips on Map */}
        <View className="absolute bottom-6 left-5 right-20 z-20">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-2">
            {pharmacies.map((p) => {
              const isSelected = p.id === selectedPharmacy?.id;
              return (
                <TouchableOpacity
                  key={p.id}
                  onPress={() => setSelectedPharmacy(p)}
                  className={`px-3.5 py-2 rounded-2xl flex-row items-center gap-1.5 shadow-md border ${
                    isSelected
                      ? "bg-teal-900 border-teal-800"
                      : "bg-white/95 backdrop-blur-md border-slate-100"
                  }`}
                >
                  <Ionicons
                    name="storefront"
                    size={14}
                    color={isSelected ? "white" : "#0f766e"}
                  />
                  <Text
                    className={`text-xs font-bold ${
                      isSelected ? "text-white" : "text-slate-800"
                    }`}
                  >
                    {p.name.split(" ")[0]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>

      {/* Bottom Sheet Card */}
      {selectedPharmacy && (
        <View className="bg-white rounded-t-[36px] pt-3 pb-8 px-6 shadow-2xl border-t border-slate-100 z-30">
          {/* Handle Bar */}
          <View className="w-12 h-1.5 bg-slate-200 rounded-full self-center mb-4" />

          {/* Card Top: Badges, Name, Rating & Thumbnail */}
          <View className="flex-row items-start justify-between gap-4">
            <View className="flex-1">
              {/* Badges Row */}
              <View className="flex-row items-center gap-2 mb-1.5">
                {isNearest && (
                  <View className="bg-teal-400 px-2.5 py-0.5 rounded-lg">
                    <Text className="text-[10px] font-extrabold text-teal-950 uppercase tracking-wide">
                      NEAREST
                    </Text>
                  </View>
                )}
                <Text className="text-xs font-bold text-slate-600">
                  {distText} away
                </Text>
              </View>

              {/* Pharmacy Title */}
              <Text
                className="text-xl font-extrabold text-teal-950 tracking-tight"
                numberOfLines={1}
              >
                {selectedPharmacy.name}
              </Text>

              {/* Stars & Reviews */}
              <View className="flex-row items-center gap-1 mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons
                    key={star}
                    name="star"
                    size={13}
                    color={star <= Math.round(selectedPharmacy.rating) ? "#f59e0b" : "#e2e8f0"}
                  />
                ))}
                <Text className="text-xs text-slate-500 font-semibold ml-1">
                  ({selectedPharmacy.reviews} reviews)
                </Text>
              </View>
            </View>

            {/* Pharmacy Storefront Thumbnail */}
            <View className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-100 items-center justify-center overflow-hidden shadow-sm">
              <Ionicons name="medkit" size={28} color="#0f766e" />
            </View>
          </View>

          {/* Details Row: Hours & Insurance/Verification */}
          <View className="flex-row items-center gap-6 mt-4 pt-3 border-t border-slate-100">
            <View className="flex-row items-center gap-1.5">
              <Ionicons name="time-outline" size={16} color="#0f766e" />
              <Text className="text-xs font-bold text-slate-700">
                {selectedPharmacy.openHours ? selectedPharmacy.openHours.split(":")[0] : "Open until 9:00 PM"}
              </Text>
            </View>

            <View className="flex-row items-center gap-1.5">
              <Ionicons name="shield-checkmark" size={16} color="#0f766e" />
              <Text className="text-xs font-bold text-slate-700">
                {selectedPharmacy.verified ? "Insured & Verified" : "Registered"}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="flex-row items-center gap-3 mt-5">
            <TouchableOpacity
              onPress={handleStartTurnByTurn}
              activeOpacity={0.85}
              className="flex-1 bg-teal-900 py-3.5 rounded-2xl flex-row items-center justify-center gap-2 shadow-sm"
            >
              <Ionicons name="navigate" size={16} color="white" />
              <Text className="text-white text-xs font-extrabold tracking-wide">
                Start Route
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push(`/pharmacy/${selectedPharmacy.id}`)}
              activeOpacity={0.85}
              className="flex-1 bg-white border border-teal-900/30 py-3.5 rounded-2xl flex-row items-center justify-center gap-1.5"
            >
              <Ionicons name="storefront-outline" size={16} color="#0f766e" />
              <Text className="text-teal-900 text-xs font-extrabold">
                View Pharmacy
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleCall}
              activeOpacity={0.85}
              className="w-12 h-12 bg-slate-50 border border-slate-200 rounded-2xl items-center justify-center"
            >
              <Ionicons name="call" size={18} color="#0f766e" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
