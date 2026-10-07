import React from "react";
import { useNotifications, useApp } from "./AppContext";

export { useNotifications };

// Passthrough provider for backward compatibility
export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};
