import React, { useRef, useMemo } from "react";
import { View, Platform, StyleSheet, ActivityIndicator } from "react-native";
import { WebView } from "react-native-webview";
import { Pharmacy } from "@/context/AppContext";
import { Coordinates } from "@/utils/distance";

interface UniversalMapViewProps {
  userLocation: Coordinates | null;
  pharmacies: Pharmacy[];
  selectedPharmacyId?: string | null;
  onSelectPharmacy?: (pharmacy: Pharmacy) => void;
  style?: any;
}

export default function UniversalMapView({
  userLocation,
  pharmacies,
  selectedPharmacyId,
  onSelectPharmacy,
  style,
}: UniversalMapViewProps) {
  const webViewRef = useRef<WebView>(null);
  const googleMapsApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  const activePharmacy = pharmacies.find((p) => p.id === selectedPharmacyId) || pharmacies[0];

  const centerLat = activePharmacy?.lat ?? userLocation?.latitude ?? 5.6037;
  const centerLng = activePharmacy?.lng ?? userLocation?.longitude ?? -0.1870;

  // Generate interactive Map HTML (using Google Maps JS if API Key is present, or OpenStreetMap fallback)
  const htmlContent = useMemo(() => {
    const validPharmacies = pharmacies.filter((p) => p.lat && p.lng);

    const pharmaciesDataJson = JSON.stringify(
      validPharmacies.map((p) => ({
        id: p.id,
        name: p.name,
        address: p.address,
        lat: p.lat,
        lng: p.lng,
        distance: p.distance,
        rating: p.rating,
        isSelected: p.id === selectedPharmacyId,
      }))
    );

    const userLocJson = JSON.stringify(userLocation);

    // If Google Maps API key is configured, use official Google Maps JavaScript API
    if (googleMapsApiKey) {
      return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <style>
    html, body, #map {
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0;
      background: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
  </style>
  <script src="https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&v=weekly"></script>
</head>
<body>
  <div id="map"></div>
  <script>
    const center = { lat: ${centerLat}, lng: ${centerLng} };
    const map = new google.maps.Map(document.getElementById("map"), {
      center: center,
      zoom: 14,
      disableDefaultUI: true,
      zoomControl: false,
      styles: [
        { featureType: "poi.business", stylers: [{ visibility: "off" }] },
        { featureType: "transit", elementType: "labels.icon", stylers: [{ visibility: "off" }] }
      ]
    });

    const pharmacies = ${pharmaciesDataJson};
    const userLoc = ${userLocJson};

    // 1. User location marker (pulsing blue dot)
    if (userLoc && userLoc.latitude && userLoc.longitude) {
      new google.maps.Marker({
        position: { lat: userLoc.latitude, lng: userLoc.longitude },
        map: map,
        title: "Your Location",
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: "#0284c7",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 3,
        }
      });
    }

    // 2. Pharmacy markers
    pharmacies.forEach(p => {
      const isSelected = p.isSelected;
      const marker = new google.maps.Marker({
        position: { lat: p.lat, lng: p.lng },
        map: map,
        title: p.name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: isSelected ? 16 : 13,
          fillColor: isSelected ? "#115e59" : "#0f766e",
          fillOpacity: 1,
          strokeColor: isSelected ? "#2dd4bf" : "#ffffff",
          strokeWeight: isSelected ? 3 : 2,
        },
        label: {
          text: "+",
          color: "#ffffff",
          fontWeight: "bold",
          fontSize: isSelected ? "14px" : "12px"
        }
      });

      marker.addListener("click", () => {
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: "SELECT_PHARMACY", pharmacyId: p.id }));
        }
      });
    });

    // 3. Real street driving route between User and Selected Pharmacy
    if (userLoc && userLoc.latitude && ${activePharmacy && activePharmacy.lat ? "true" : "false"}) {
      const directionsService = new google.maps.DirectionsService();
      const directionsRenderer = new google.maps.DirectionsRenderer({
        map: map,
        suppressMarkers: true,
        preserveViewport: false,
        polylineOptions: {
          strokeColor: "#0f766e",
          strokeWeight: 5,
          strokeOpacity: 0.9,
        }
      });

      const origin = { lat: userLoc.latitude, lng: userLoc.longitude };
      const destination = { lat: ${centerLat}, lng: ${centerLng} };

      directionsService.route({
        origin: origin,
        destination: destination,
        travelMode: google.maps.TravelMode.DRIVING
      }, (response, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          directionsRenderer.setDirections(response);
        } else {
          // Fallback to real street geometry via OSRM routing
          fetch("https://router.project-osrm.org/route/v1/driving/" + userLoc.longitude + "," + userLoc.latitude + ";" + ${centerLng} + "," + ${centerLat} + "?overview=full&geometries=geojson")
            .then(res => res.json())
            .then(data => {
              if (data.routes && data.routes[0] && data.routes[0].geometry) {
                const coords = data.routes[0].geometry.coordinates.map(pt => ({ lat: pt[1], lng: pt[0] }));
                new google.maps.Polyline({
                  path: coords,
                  geodesic: true,
                  strokeColor: "#0f766e",
                  strokeOpacity: 0.9,
                  strokeWeight: 5,
                  map: map
                });
              }
            })
            .catch(() => {});
        }
      });
    }
  </script>
</body>
</html>
      `;
    }

    // OpenStreetMap clean tile fallback (zero watermark, no CartoDB requirement)
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    html, body, #map {
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0;
      background: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    .custom-pharma-icon {
      background: #0f766e;
      border: 3px solid #ffffff;
      border-radius: 50%;
      color: #ffffff;
      width: 36px !important;
      height: 36px !important;
      margin-left: -18px !important;
      margin-top: -18px !important;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(15, 118, 110, 0.35);
      cursor: pointer;
      transition: transform 0.2s ease;
    }
    .custom-pharma-icon.selected {
      background: #115e59;
      border-color: #2dd4bf;
      transform: scale(1.22);
      box-shadow: 0 6px 18px rgba(17, 94, 89, 0.5);
      z-index: 999 !important;
    }
    .custom-user-icon {
      background: #0284c7;
      border: 3px solid #ffffff;
      border-radius: 50%;
      width: 20px !important;
      height: 20px !important;
      margin-left: -10px !important;
      margin-top: -10px !important;
      box-shadow: 0 0 0 6px rgba(2, 132, 199, 0.25);
    }
    .pharma-label-tooltip {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 4px 8px;
      font-weight: 700;
      font-size: 11px;
      color: #0f172a;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    const center = [${centerLat}, ${centerLng}];
    const map = L.map('map', {
      zoomControl: false,
      attributionControl: false
    }).setView(center, 14);

    // Clean OpenStreetMap standard tiles (No watermarks / No CartoDB API key requirement)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    const pharmacies = ${pharmaciesDataJson};
    const userLoc = ${userLocJson};
    const markers = {};

    // 1. Plot User Location if available
    if (userLoc && userLoc.latitude && userLoc.longitude) {
      const userIcon = L.divIcon({
        className: 'custom-user-icon',
        iconSize: [20, 20],
      });
      L.marker([userLoc.latitude, userLoc.longitude], { icon: userIcon })
        .addTo(map)
        .bindTooltip("You are here", { permanent: false, direction: 'top' });
    }

    // 2. Plot Pharmacies
    pharmacies.forEach(p => {
      const isSelected = p.isSelected;
      const pharmaIcon = L.divIcon({
        className: 'custom-pharma-icon' + (isSelected ? ' selected' : ''),
        html: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>',
        iconSize: [36, 36]
      });

      const marker = L.marker([p.lat, p.lng], { icon: pharmaIcon }).addTo(map);
      markers[p.id] = marker;

      marker.bindTooltip(p.name, {
        permanent: isSelected,
        direction: 'bottom',
        className: 'pharma-label-tooltip'
      });

      marker.on('click', () => {
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'SELECT_PHARMACY', pharmacyId: p.id }));
        }
      });
    });

    // 3. Draw real street driving route from User to Selected Pharmacy
    if (userLoc && userLoc.latitude && ${activePharmacy && activePharmacy.lat ? "true" : "false"}) {
      fetch("https://router.project-osrm.org/route/v1/driving/" + userLoc.longitude + "," + userLoc.latitude + ";" + ${centerLng} + "," + ${centerLat} + "?overview=full&geometries=geojson")
        .then(res => res.json())
        .then(data => {
          if (data.routes && data.routes[0] && data.routes[0].geometry) {
            const latlngs = data.routes[0].geometry.coordinates.map(pt => [pt[1], pt[0]]);
            L.polyline(latlngs, {
              color: '#0f766e',
              weight: 5,
              opacity: 0.85,
            }).addTo(map);
          }
        })
        .catch(() => {
          const directLine = [
            [userLoc.latitude, userLoc.longitude],
            [${centerLat}, ${centerLng}]
          ];
          L.polyline(directLine, {
            color: '#0f766e',
            weight: 4,
            opacity: 0.8,
            dashArray: '8, 8'
          }).addTo(map);
        });
    }
  </script>
</body>
</html>
    `;
  }, [pharmacies, userLocation, selectedPharmacyId, centerLat, centerLng, googleMapsApiKey]);

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === "SELECT_PHARMACY" && onSelectPharmacy) {
        const found = pharmacies.find((p) => p.id === data.pharmacyId);
        if (found) onSelectPharmacy(found);
      }
    } catch { }
  };

  const mapEmbedUrl = googleMapsApiKey
    ? `https://www.google.com/maps/embed/v1/place?key=${googleMapsApiKey}&q=${centerLat},${centerLng}&zoom=14`
    : `https://maps.google.com/maps?q=${centerLat},${centerLng}&z=14&output=embed`;

  return (
    <View style={[styles.container, style]}>
      {Platform.OS === "web" ? (
        <iframe
          title="Interactive Map"
          width="100%"
          height="100%"
          style={{ border: 0, width: "100%", height: "100%" }}
          loading="lazy"
          allowFullScreen
          src={mapEmbedUrl}
        />
      ) : (
        <WebView
          ref={webViewRef}
          originWhitelist={["*"]}
          source={{ html: htmlContent }}
          style={styles.webView}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          renderLoading={() => (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0f766e" />
            </View>
          )}
          onMessage={handleMessage}
          scalesPageToFit={true}
          scrollEnabled={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    height: "100%",
    overflow: "hidden",
    backgroundColor: "#e2e8f0",
  },
  webView: {
    flex: 1,
    backgroundColor: "transparent",
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#f8fafc",
    alignItems: "center",
    justifyContent: "center",
  },
});
