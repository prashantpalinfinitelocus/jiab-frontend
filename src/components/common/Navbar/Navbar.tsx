"use client";
import React, { useCallback } from "react";
import { usePathname } from "next/navigation";
import MobileNav from "./Mobile/MobileNav";
import DesktopNav from "./Desktop/DesktopNav";
import NotificationSnackbar from "../NotificationSnackbar/NotificationSnackbar";
import spriteLogo from "../../../../public/header-logo.svg";
import profileImage from "../../../../public/profile-images/profile-image-guest.svg";
import useFCMToken from "@/hooks/useFCMToken";
import { triggerNotificationEvent } from "@/utils/gTagEvents";
import { GA_EVENTS } from "@/constants";

const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { initializeFCM } = useFCMToken();

  const handleRequestPermission = useCallback(async () => {
    // Request notification permission
    if (typeof window !== "undefined" && "Notification" in window) {
      try {
        // Track that browser notification tray was opened
        triggerNotificationEvent(GA_EVENTS.BROWSER_NOTIFICATION_TRAY_OPENED, "default");
        triggerNotificationEvent(GA_EVENTS.MODAL_EVENT_LOGGED, "default", {
          event_action: "browser_tray_opened",
        });
        
        const permission = await Notification.requestPermission();
        
        // Track notification status change
        triggerNotificationEvent(GA_EVENTS.NOTIFICATION_STATUS, permission);
        triggerNotificationEvent(GA_EVENTS.MODAL_EVENT_LOGGED, permission, {
          event_action: "permission_result",
        });
        
        if (permission === "granted") {
          // Initialize FCM after permission is granted
          await initializeFCM();
        }
      } catch (error) {
        console.error("Error requesting notification permission:", error);
      }
    }
  }, [initializeFCM]);

  const handleDismiss = useCallback(() => {
    // Just dismiss the snackbar - no action needed
  }, []);

  return (
    <>
      {/* Mobile nav visible on smaller screens (< md breakpoint) */}
      <div className="block md:hidden">
        <MobileNav spriteLogo={spriteLogo} profileImage={profileImage} />
      </div>

      {/* Desktop nav visible on medium and larger screens (≥ md breakpoint) */}
      <div className="hidden md:block">
        <DesktopNav spriteLogo={spriteLogo} profileImage={profileImage} />
      </div>

      {/* Single NotificationSnackbar instance - only shown on home route */}
      {pathname === "/" && (
        <NotificationSnackbar
          onRequestPermission={handleRequestPermission}
          onDismiss={handleDismiss}
        />
      )}
    </>
  );
};

export default Navbar;
