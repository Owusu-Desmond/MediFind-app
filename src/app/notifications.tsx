import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useNotifications } from "@/context/AppContext";
import { BackendNotification } from "@/services/api";

function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSec < 60) return "Just now";
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;
    return date.toLocaleDateString("en-GB", { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

function getNotificationConfig(type: string, priority?: string) {
  switch (type) {
    case "RESERVATION_APPROVED":
      return {
        icon: "checkmark-circle" as const,
        color: "#059669",
        bg: "bg-emerald-50",
        border: "border-emerald-200",
      };
    case "MEDICINE_READY_PICKUP":
      return {
        icon: "medkit" as const,
        color: "#0f766e",
        bg: "bg-teal-50",
        border: "border-teal-200",
      };
    case "DELIVERY_STATUS_CHANGED":
      return {
        icon: "car" as const,
        color: "#d97706",
        bg: "bg-amber-50",
        border: "border-amber-200",
      };
    case "PAYMENT_SUCCESS":
      return {
        icon: "card" as const,
        color: "#059669",
        bg: "bg-emerald-50",
        border: "border-emerald-200",
      };
    case "PAYMENT_FAILED":
    case "RESERVATION_REJECTED":
      return {
        icon: "alert-circle" as const,
        color: "#dc2626",
        bg: "bg-rose-50",
        border: "border-rose-200",
      };
    case "RESERVATION_CANCELLED":
    case "RESERVATION_EXPIRED":
      return {
        icon: "time" as const,
        color: "#64748b",
        bg: "bg-slate-100",
        border: "border-slate-200",
      };
    case "RESERVATION_CREATED":
    default:
      return {
        icon: "notifications" as const,
        color: "#0284c7",
        bg: "bg-sky-50",
        border: "border-sky-200",
      };
  }
}

export default function NotificationsScreen() {
  const router = useRouter();
  const {
    notifications,
    unreadCount,
    loading,
    refreshing,
    refreshNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
    clearAllNotifications,
  } = useNotifications();

  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "unread") return !n.is_read;
    return true;
  });

  const handleNotificationPress = async (item: BackendNotification) => {
    if (!item.is_read) {
      await markNotificationRead(item.id);
    }

    if (item.reference_type === "reservation" && item.reference_id) {
      router.push({
        pathname: "/reservation/status-timeline",
        params: { reservationId: item.reference_id },
      } as any);
    }
  };

  const handleDeleteItem = (item: BackendNotification) => {
    Alert.alert(
      "Delete Notification",
      "Are you sure you want to remove this notification?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteNotification(item.id),
        },
      ]
    );
  };

  const handleClearPrompt = () => {
    if (notifications.length === 0) return;

    Alert.alert(
      "Clear Notifications",
      "Would you like to clear read notifications or remove all notifications?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear Read Only",
          onPress: () => clearAllNotifications(true),
        },
        {
          text: "Clear All",
          style: "destructive",
          onPress: () => clearAllNotifications(false),
        },
      ]
    );
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)/home");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <StatusBar style="dark" />
      {/* Header */}
      <View className="px-5 pt-3 pb-4 bg-white border-b border-slate-200">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <TouchableOpacity
              onPress={handleBack}
              className="w-10 h-10 rounded-xl bg-slate-100 items-center justify-center"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="arrow-back" size={20} color="#334155" />
            </TouchableOpacity>
            <View>
              <Text className="text-slate-900 text-lg font-bold">Notifications</Text>
              <Text className="text-slate-500 text-xs">
                {unreadCount > 0 ? `${unreadCount} unread alert${unreadCount > 1 ? "s" : ""}` : "All caught up"}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center gap-2">
            {unreadCount > 0 && (
              <TouchableOpacity
                onPress={markAllNotificationsRead}
                className="px-2.5 py-1.5 rounded-lg bg-teal-50 border border-teal-200"
              >
                <Text className="text-teal-700 text-xs font-semibold">Mark all read</Text>
              </TouchableOpacity>
            )}

            {notifications.length > 0 && (
              <TouchableOpacity
                onPress={handleClearPrompt}
                className="w-8 h-8 rounded-lg bg-slate-100 items-center justify-center"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="trash-outline" size={16} color="#64748b" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Tab switcher */}
        <View className="flex-row bg-slate-100 rounded-xl p-1 mt-4">
          <TouchableOpacity
            onPress={() => setActiveTab("all")}
            className={`flex-1 py-2 rounded-lg items-center justify-center ${
              activeTab === "all" ? "bg-white border border-slate-200" : ""
            }`}
          >
            <Text
              className={`text-xs font-bold ${
                activeTab === "all" ? "text-slate-900" : "text-slate-500"
              }`}
            >
              All ({notifications.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab("unread")}
            className={`flex-1 py-2 rounded-lg items-center justify-center ${
              activeTab === "unread" ? "bg-white border border-teal-200" : ""
            }`}
          >
            <Text
              className={`text-xs font-bold ${
                activeTab === "unread" ? "text-teal-700" : "text-slate-500"
              }`}
            >
              Unread ({unreadCount})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Notifications List Container */}
      <View className="flex-1 bg-slate-50">
        {loading && notifications.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#0f766e" />
            <Text className="text-slate-400 text-xs mt-3">Loading notifications...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredNotifications}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={refreshNotifications}
                tintColor="#0f766e"
              />
            }
            ListEmptyComponent={
              <View className="items-center justify-center py-20 px-6">
                <View className="w-16 h-16 rounded-full bg-slate-100 items-center justify-center mb-4">
                  <Ionicons name="notifications-off-outline" size={30} color="#94a3b8" />
                </View>
                <Text className="text-slate-800 text-base font-bold">No Notifications</Text>
                <Text className="text-slate-400 text-xs text-center mt-1">
                  {activeTab === "unread"
                    ? "You have read all your notifications."
                    : "Status updates regarding reservations and payments will appear here."}
                </Text>
              </View>
            }
            renderItem={({ item }) => {
              const config = getNotificationConfig(item.notification_type, item.priority);
              return (
                <TouchableOpacity
                  onPress={() => handleNotificationPress(item)}
                  activeOpacity={0.7}
                  className={`mb-3 p-4 rounded-2xl border ${
                    !item.is_read
                      ? "border-teal-300 bg-teal-50"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <View className="flex-row items-start gap-3">
                    <View
                      className={`w-10 h-10 rounded-xl items-center justify-center border ${config.bg} ${config.border}`}
                    >
                      <Ionicons name={config.icon} size={20} color={config.color} />
                    </View>

                    <View className="flex-1">
                      <View className="flex-row items-center justify-between gap-1">
                        <Text
                          className={`text-sm flex-1 ${
                            !item.is_read ? "font-bold text-slate-900" : "font-semibold text-slate-700"
                          }`}
                          numberOfLines={1}
                        >
                          {item.title}
                        </Text>
                        <Text className="text-[11px] text-slate-400 shrink-0">
                          {formatRelativeTime(item.created_at)}
                        </Text>
                      </View>

                      <Text className="text-xs text-slate-600 mt-1 leading-5">
                        {item.message}
                      </Text>

                      <View className="flex-row items-center justify-between mt-2.5">
                        {item.reference_type === "reservation" ? (
                          <View className="flex-row items-center gap-1">
                            <Text className="text-[11px] font-bold text-teal-700">
                              View Order Details
                            </Text>
                            <Ionicons name="chevron-forward" size={12} color="#0f766e" />
                          </View>
                        ) : (
                          <View />
                        )}

                        {/* Delete notification button */}
                        <TouchableOpacity
                          onPress={() => handleDeleteItem(item)}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          className="p-1 rounded-md"
                        >
                          <Ionicons name="trash-outline" size={14} color="#94a3b8" />
                        </TouchableOpacity>
                      </View>
                    </View>

                    {!item.is_read && (
                      <View className="w-2.5 h-2.5 rounded-full bg-teal-600 mt-1.5" />
                    )}
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

