import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  Linking,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pharmacy } from "@/context/AppContext";
import { Coordinates, calculateDistance, formatDistance } from "@/utils/distance";
import UniversalMapView from "@/components/UniversalMapView";

interface PharmacyMapProps {
  userLocation: Coordinates | null;
  pharmacies: Pharmacy[];
  selectedPharmacyId?: string | null;
  onSelectPharmacy?: (pharmacy: Pharmacy) => void;
  onRequestLocation?: () => void;
  locationPermission?: "undetermined" | "granted" | "denied";
}

export default function PharmacyMap({
  userLocation,
  pharmacies,
  selectedPharmacyId,
  onSelectPharmacy,
  onRequestLocation,
  locationPermission = "granted",
}: PharmacyMapProps) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(
    selectedPharmacyId || (pharmacies.length > 0 ? pharmacies[0].id : null)
  );

  const activePharmacy = pharmacies.find((p) => p.id === (selectedPharmacyId || selectedId));

  // Default coordinates (Accra Central if GPS not yet retrieved)
  const centerLat = userLocation?.latitude ?? activePharmacy?.lat ?? 5.6037;
  const centerLng = userLocation?.longitude ?? activePharmacy?.lng ?? -0.1870;

  const handleOpenDirections = (pharmacy: Pharmacy) => {
    router.push({
      pathname: "/pharmacy/directions",
      params: { pharmacyId: pharmacy.id },
    } as never);
  };

  // Google Maps Static / Interactive Embed URL
  const markersQuery = [
    // Patient Location Marker (Blue)
    userLocation ? `&markers=color:blue%7Clabel:P%7C${userLocation.latitude},${userLocation.longitude}` : "",
    // Pharmacy Markers (Red/Teal)
    ...pharmacies
      .filter((p) => p.lat && p.lng)
      .map(
        (p) =>
          `&markers=color:teal%7Clabel:${encodeURIComponent(p.name.charAt(0))}%7C${p.lat},${p.lng}`
      ),
  ].join("");

  const mapEmbedUrl = `https://maps.google.com/maps?q=${centerLat},${centerLng}&z=13&output=embed`;

  return (
    <View className="flex-1 bg-slate-100 rounded-3xl overflow-hidden border border-slate-200">
      {/* Map Container */}
      <View className="w-full h-80 relative bg-slate-200 overflow-hidden">
        <UniversalMapView
          userLocation={userLocation}
          pharmacies={pharmacies}
          selectedPharmacyId={selectedPharmacyId || selectedId}
          onSelectPharmacy={(p) => {
            setSelectedId(p.id);
            if (onSelectPharmacy) onSelectPharmacy(p);
          }}
          style={{ flex: 1 }}
        />

        {/* GPS Status Indicator Overlay */}
        <View className="absolute top-4 left-4 right-4 flex-row items-center justify-between pointer-events-box-none">
          <View className="bg-white/90 backdrop-blur-md px-3.5 py-2 rounded-2xl flex-row items-center gap-2 shadow-sm border border-slate-100">
            <View
              className={`w-2.5 h-2.5 rounded-full ${
                userLocation ? "bg-emerald-500" : "bg-amber-500"
              }`}
            />
            <Text className="text-xs font-bold text-slate-800">
              {userLocation
                ? `GPS Active (${userLocation.latitude.toFixed(3)}, ${userLocation.longitude.toFixed(3)})`
                : "Awaiting GPS Location"}
            </Text>
          </View>

          {userLocation && (
            <TouchableOpacity
              onPress={() => {
                if (onRequestLocation) onRequestLocation();
              }}
              className="w-10 h-10 rounded-2xl bg-white/90 backdrop-blur-md items-center justify-center shadow-sm border border-slate-100"
            >
              <Ionicons name="locate" size={20} color="#0f766e" />
            </TouchableOpacity>
          )}
        </View>

        {/* Location Permission Prompt Banner if Denied */}
        {locationPermission === "denied" && (
          <View className="absolute bottom-4 left-4 right-4 bg-amber-500/95 backdrop-blur-md p-3.5 rounded-2xl flex-row items-center justify-between shadow-md">
            <View className="flex-1 mr-2 flex-row items-center gap-2">
              <Ionicons name="location-outline" size={18} color="white" />
              <Text className="text-white text-xs font-bold flex-1">
                Location access is disabled. Enable GPS for real-time distance.
              </Text>
            </View>
            <TouchableOpacity
              onPress={onRequestLocation}
              className="bg-white px-3 py-1.5 rounded-xl"
            >
              <Text className="text-amber-800 text-xs font-bold">Enable</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Interactive Pharmacy Carousel / Selected Card */}
      <View className="p-4 bg-white">
        <View className="flex-row items-center justify-between mb-3 px-1">
          <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Nearby Pharmacies ({pharmacies.length})
          </Text>
          <Text className="text-xs text-primary font-bold">Live GPS Distances</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="gap-3"
          contentContainerStyle={{ paddingRight: 16 }}
        >
          {pharmacies.map((pharmacy) => {
            const isSelected = pharmacy.id === (selectedPharmacyId || selectedId);
            const distKm = userLocation
              ? calculateDistance(
                  userLocation.latitude,
                  userLocation.longitude,
                  pharmacy.lat,
                  pharmacy.lng
                )
              : null;
            const distText = formatDistance(distKm);

            return (
              <TouchableOpacity
                key={pharmacy.id}
                onPress={() => {
                  setSelectedId(pharmacy.id);
                  if (onSelectPharmacy) onSelectPharmacy(pharmacy);
                }}
                className={`p-4 rounded-3xl border w-72 ${
                  isSelected
                    ? "bg-teal-50/70 border-primary shadow-sm"
                    : "bg-slate-50 border-slate-200"
                }`}
              >
                <View className="flex-row items-start justify-between">
                  <View className="flex-1 pr-2">
                    <View className="flex-row items-center gap-1">
                      <Text
                        className="text-sm font-bold text-slate-900"
                        numberOfLines={1}
                      >
                        {pharmacy.name}
                      </Text>
                      {pharmacy.verified && (
                        <Ionicons name="checkmark-circle" size={14} color="#0f766e" />
                      )}
                    </View>
                    <Text
                      className="text-xs text-slate-500 mt-0.5"
                      numberOfLines={1}
                    >
                      {pharmacy.address}
                    </Text>
                  </View>

                  <View className="bg-primary/10 px-2.5 py-1 rounded-xl">
                    <Text className="text-primary text-xs font-bold">
                      {distText}
                    </Text>
                  </View>
                </View>

                {/* Actions */}
                <View className="flex-row items-center gap-2 mt-4">
                  <TouchableOpacity
                    onPress={() => router.push(`/pharmacy/${pharmacy.id}`)}
                    className="flex-1 bg-white border border-slate-200 py-2 rounded-xl items-center justify-center"
                  >
                    <Text className="text-slate-700 text-xs font-bold">
                      View Details
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleOpenDirections(pharmacy)}
                    className="flex-1 bg-primary py-2 rounded-xl flex-row items-center justify-center gap-1"
                  >
                    <Ionicons name="navigate" size={12} color="white" />
                    <Text className="text-white text-xs font-bold">
                      Directions
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}
