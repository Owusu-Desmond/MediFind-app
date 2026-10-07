import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// Configure foreground notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

class MobileNotificationService {
  private hasRequested = false;
  private notifiedIds = new Set<string | number>();

  /**
   * Request push/local notification permissions from the OS
   */
  async registerForNotificationsAsync(): Promise<boolean> {
    try {
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("medifind-alerts", {
          name: "MediFind Health Alerts",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#0f766e",
          sound: "default",
        });
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      this.hasRequested = true;
      return finalStatus === "granted";
    } catch (e) {
      console.warn("[Notifications] Failed to register notification permissions:", e);
      return false;
    }
  }

  /**
   * Trigger an instant real phone notification banner + sound
   */
  async triggerLocalNotification(
    title: string,
    body: string,
    data?: Record<string, any>,
    identifier?: string | number
  ) {
    try {
      // Deduplicate if needed
      if (identifier) {
        if (this.notifiedIds.has(identifier)) return;
        this.notifiedIds.add(identifier);
      }

      if (!this.hasRequested) {
        await this.registerForNotificationsAsync();
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data || {},
          sound: "default",
          ...(Platform.OS === "android" ? { channelId: "medifind-alerts" } : {}),
        },
        trigger: null, // trigger immediately
      });
    } catch (e) {
      console.warn("[Notifications] Failed to schedule notification:", e);
    }
  }
}

export const mobileNotifications = new MobileNotificationService();
