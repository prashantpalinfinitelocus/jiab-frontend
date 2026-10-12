"use client";
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { usePathname } from "next/navigation";

interface NotificationSnackbarContextType {
  isSnackbarVisible: boolean;
  setIsSnackbarVisible: (visible: boolean) => void;
  snackbarHeight: number;
  setSnackbarHeight: (height: number) => void;
}

const NotificationSnackbarContext = createContext<NotificationSnackbarContextType | undefined>(undefined);

export const useNotificationSnackbar = () => {
  const context = useContext(NotificationSnackbarContext);
  if (!context) {
    throw new Error("useNotificationSnackbar must be used within NotificationSnackbarProvider");
  }
  return context;
};

interface NotificationSnackbarProviderProps {
  children: ReactNode;
}

export const NotificationSnackbarProvider: React.FC<NotificationSnackbarProviderProps> = ({ children }) => {
  const pathname = usePathname();
  const [isSnackbarVisible, setIsSnackbarVisible] = useState(false);
  const [snackbarHeight, setSnackbarHeight] = useState(0);

  // Reset snackbar state when navigating away from home page
  useEffect(() => {
    if (pathname !== "/") {
      setIsSnackbarVisible(false);
      setSnackbarHeight(0);
    }
  }, [pathname]);

  return (
    <NotificationSnackbarContext.Provider
      value={{ isSnackbarVisible, setIsSnackbarVisible, snackbarHeight, setSnackbarHeight }}
    >
      {children}
    </NotificationSnackbarContext.Provider>
  );
};

