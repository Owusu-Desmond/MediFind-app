import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View, Platform } from "react-native";
import { useApp } from "@/context/AppContext";

export default function TabsLayout() {
  const { reservations } = useApp();

  const activeReservationsCount = reservations.filter((r) =>
    [
      "Pending Pharmacy Review",
      "Approved",
      "Reserved",
      "Paid",
      "Preparing",
      "Out for Delivery",
      "Ready for Pickup",
    ].includes(r.status)
  ).length;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#0f766e",
        tabBarInactiveTintColor: "#94a3b8",
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "700",
          marginTop: -2,
        },
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopColor: "#e2e8f0",
          borderTopWidth: 1,
          height: Platform.OS === "ios" ? 88 : 64,
          paddingTop: 8,
          paddingBottom: Platform.OS === "ios" ? 28 : 10,
          elevation: 0,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.05,
          shadowRadius: 12,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Explore",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="pharmacies"
        options={{
          title: "Pharmacies",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="storefront-outline" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="reservations"
        options={{
          title: "Reservations",
          tabBarBadge: activeReservationsCount > 0 ? activeReservationsCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: "#0f766e",
            color: "#ffffff",
            fontSize: 10,
            fontWeight: "800",
            minWidth: 18,
            height: 18,
            borderRadius: 9,
            lineHeight: Platform.OS === "android" ? 15 : 18,
          },
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "receipt" : "receipt-outline"} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
