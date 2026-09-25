/**
 * Date and time formatting utilities for MediFind
 */

export function formatReservationDateTime(dateString?: string | null): string {
  if (!dateString) return "";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;

    const formattedDate = d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    const formattedTime = d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    return `${formattedDate} • ${formattedTime}`;
  } catch {
    return dateString || "";
  }
}

export function formatReservationDate(dateString?: string | null): string {
  if (!dateString) return "";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;

    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateString || "";
  }
}

export function formatReservationTime(dateString?: string | null): string {
  if (!dateString) return "";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "";

    return d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return "";
  }
}

export function formatRelativeTime(dateString?: string | null): string {
  if (!dateString) return "";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "";

    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSec < 60) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;

    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
    });
  } catch {
    return "";
  }
}

export interface PickupSlot {
  id: string;
  title: string;
  subtitle: string;
  badge?: string;
  icon?: "flash-outline" | "time-outline" | "sunny-outline" | "moon-outline" | "calendar-outline";
}

export function parseOpeningHours(hoursStr?: string): {
  is24Hours: boolean;
  openHour: number;
  closeHour: number;
  description: string;
} {
  const defaultSchedule = {
    is24Hours: false,
    openHour: 8,
    closeHour: 21,
    description: hoursStr || "Mon–Sat: 8:00 AM – 9:00 PM",
  };

  if (!hoursStr) return defaultSchedule;

  const lower = hoursStr.toLowerCase();
  if (lower.includes("24") || lower.includes("24/7") || lower.includes("24 hours")) {
    return {
      is24Hours: true,
      openHour: 0,
      closeHour: 24,
      description: "Open 24/7",
    };
  }

  let openHour = 8;
  let closeHour = 21;

  const match = hoursStr.match(/(\d{1,2})(?::\d{2})?\s*(am|pm)?\s*[-–—to]+\s*(\d{1,2})(?::\d{2})?\s*(am|pm)?/i);
  if (match) {
    let startH = parseInt(match[1], 10);
    const startAmPm = match[2]?.toLowerCase();
    let endH = parseInt(match[3], 10);
    const endAmPm = match[4]?.toLowerCase();

    if (startAmPm === "pm" && startH < 12) startH += 12;
    if (startAmPm === "am" && startH === 12) startH = 0;

    if (endAmPm === "pm" && endH < 12) endH += 12;
    if (endAmPm === "am" && endH === 12) endH = 0;

    if (!endAmPm && endH <= 12 && startH <= 12) {
      endH += 12;
    }

    if (startH >= 0 && startH <= 23) openHour = startH;
    if (endH >= 0 && endH <= 24) closeHour = endH;
  }

  return {
    is24Hours: false,
    openHour,
    closeHour,
    description: hoursStr,
  };
}

export function isPharmacyOpen(hoursStr?: string): boolean {
  const schedule = parseOpeningHours(hoursStr);
  if (schedule.is24Hours) return true;

  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTime = currentHour + currentMinute / 60;

  return currentTime >= schedule.openHour && currentTime < schedule.closeHour;
}

export function generatePickupSlots(hoursStr?: string): PickupSlot[] {
  const schedule = parseOpeningHours(hoursStr);
  const now = new Date();
  const currentHour = now.getHours();

  const slots: PickupSlot[] = [];

  const formatHour = (h: number): string => {
    if (h === 0 || h === 24) return "12:00 AM";
    if (h === 12) return "12:00 PM";
    if (h > 12) return `${h - 12}:00 PM`;
    return `${h}:00 AM`;
  };

  const openTimeFormatted = formatHour(schedule.openHour);
  const closeTimeFormatted = formatHour(schedule.closeHour);

  if (schedule.is24Hours) {
    slots.push({
      id: "asap",
      title: "As soon as approved",
      subtitle: "Ready in 1–2 hours • Pharmacy is Open 24/7",
      badge: "Fastest",
      icon: "flash-outline",
    });

    const next3Hours = (currentHour + 3) % 24;
    slots.push({
      id: "today_later",
      title: `Today · ${formatHour(currentHour + 1)} - ${formatHour(next3Hours)}`,
      subtitle: "Flexible pickup window today",
      icon: "time-outline",
    });

    slots.push({
      id: "tomorrow_morning",
      title: "Tomorrow Morning · 8:00 AM - 12:00 PM",
      subtitle: "Collect anytime tomorrow morning",
      icon: "sunny-outline",
    });

    slots.push({
      id: "tomorrow_afternoon",
      title: "Tomorrow Afternoon · 2:00 PM - 6:00 PM",
      subtitle: "Collect anytime tomorrow afternoon",
      icon: "moon-outline",
    });

    return slots;
  }

  // Standard pharmacy hours
  const isCurrentlyOpen = currentHour >= schedule.openHour && currentHour < schedule.closeHour;
  const hoursUntilClose = schedule.closeHour - currentHour;

  if (isCurrentlyOpen) {
    slots.push({
      id: "asap",
      title: "As soon as approved",
      subtitle: `Ready in 1–2 hours • Pharmacy closes at ${closeTimeFormatted}`,
      badge: "Fastest",
      icon: "flash-outline",
    });

    if (hoursUntilClose >= 3) {
      const startSlot = currentHour + 2;
      slots.push({
        id: "today_evening",
        title: `Today · ${formatHour(startSlot)} - ${closeTimeFormatted}`,
        subtitle: `Pick up before ${closeTimeFormatted} closing`,
        icon: "time-outline",
      });
    } else if (hoursUntilClose >= 1) {
      slots.push({
        id: "today_closing",
        title: `Today · Before ${closeTimeFormatted}`,
        subtitle: `Closing in ~${hoursUntilClose} hour(s)`,
        icon: "time-outline",
      });
    }

    slots.push({
      id: "tomorrow_morning",
      title: `Tomorrow Morning · ${openTimeFormatted} - 12:00 PM`,
      subtitle: `Opens tomorrow at ${openTimeFormatted}`,
      icon: "sunny-outline",
    });

    slots.push({
      id: "tomorrow_afternoon",
      title: `Tomorrow Afternoon · 1:00 PM - ${formatHour(Math.min(18, schedule.closeHour))}`,
      subtitle: `Available until ${closeTimeFormatted}`,
      icon: "moon-outline",
    });
  } else {
    const isEarlyMorning = currentHour < schedule.openHour;

    if (isEarlyMorning) {
      slots.push({
        id: "today_open",
        title: `Today Morning · ${openTimeFormatted} - 12:00 PM`,
        subtitle: `Opens today at ${openTimeFormatted}`,
        badge: "Earliest",
        icon: "sunny-outline",
      });

      slots.push({
        id: "today_afternoon",
        title: `Today Afternoon · 1:00 PM - ${formatHour(Math.min(18, schedule.closeHour))}`,
        subtitle: `Available until ${closeTimeFormatted}`,
        icon: "time-outline",
      });
    } else {
      slots.push({
        id: "tomorrow_open",
        title: `Tomorrow Morning · ${openTimeFormatted} - 12:00 PM`,
        subtitle: `Opens tomorrow at ${openTimeFormatted}`,
        badge: "Earliest",
        icon: "sunny-outline",
      });

      slots.push({
        id: "tomorrow_afternoon",
        title: `Tomorrow Afternoon · 1:00 PM - ${formatHour(Math.min(18, schedule.closeHour))}`,
        subtitle: `Available until ${closeTimeFormatted}`,
        icon: "moon-outline",
      });

      if (schedule.closeHour >= 19) {
        slots.push({
          id: "tomorrow_evening",
          title: `Tomorrow Evening · 5:00 PM - ${closeTimeFormatted}`,
          subtitle: `Pick up before ${closeTimeFormatted} closing`,
          icon: "time-outline",
        });
      }
    }
  }

  return slots;
}
