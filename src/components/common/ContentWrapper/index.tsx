"use client";
import React from "react";
import { usePathname } from "next/navigation";
import { useNotificationSnackbar } from "@/contexts/NotificationSnackbarContext";

const ContentWrapper: React.FC = () => {
  const pathname = usePathname();
  const { isSnackbarVisible, snackbarHeight } = useNotificationSnackbar();

  // Only show spacing on home route
  if (pathname !== "/" || !isSnackbarVisible) {
    return null;
  }

  return (
    <div
      style={{
        height: `${snackbarHeight}px`,
        transition: "height 0.3s ease",
      }}
    />
  );
};

export default ContentWrapper;

