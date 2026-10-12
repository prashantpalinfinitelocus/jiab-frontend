"use client";
import React, { useState, useEffect, useRef } from "react";
import { useNotificationSnackbar } from "@/contexts/NotificationSnackbarContext";
import { triggerNotificationEvent } from "@/utils/gTagEvents";
import { GA_EVENTS } from "@/constants";
import useAppSelector from "@/hooks/useSelector";

interface NotificationSnackbarProps {
  onRequestPermission: () => void;
  onDismiss: () => void;
}

const NotificationSnackbar: React.FC<NotificationSnackbarProps> = ({
  onRequestPermission,
  onDismiss,
}) => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { setIsSnackbarVisible, setSnackbarHeight } = useNotificationSnackbar();
  const [permissionState, setPermissionState] =
    useState<NotificationPermission | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const snackbarRef = useRef<HTMLDivElement>(null);
  const [hasTrackedView, setHasTrackedView] = useState(false);
  const previousPermissionRef = useRef<NotificationPermission | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      const currentPermission = Notification.permission;

      // Track if user followed unblock instructions (permission changed from denied to granted)
      if (
        previousPermissionRef.current === "denied" &&
        currentPermission === "granted"
      ) {
        triggerNotificationEvent(
          GA_EVENTS.INSTRUCTION_FOLLOWED,
          currentPermission
        );
        triggerNotificationEvent(
          GA_EVENTS.MODAL_EVENT_LOGGED,
          currentPermission,
          {
            event_action: "instruction_followed",
          }
        );
      }

      previousPermissionRef.current = currentPermission;
      setPermissionState(currentPermission);

      const hasShownThisSession = sessionStorage.getItem(
        "notificationSnackbarShown"
      );

      if (
        isAuthenticated &&
        (currentPermission === "default" || currentPermission === "denied") &&
        !hasShownThisSession
      ) {
        setIsVisible(true);
        setIsSnackbarVisible(true);
      }
    }
  }, [setIsSnackbarVisible, isAuthenticated]);

  // Track sticky_view when modal becomes visible
  useEffect(() => {
    if (isVisible && !hasTrackedView && permissionState) {
      // Track sticky_view event
      triggerNotificationEvent(GA_EVENTS.STICKY_VIEW, permissionState);

      // Track modal_event_logged for analytics
      triggerNotificationEvent(GA_EVENTS.MODAL_EVENT_LOGGED, permissionState, {
        event_action: "view",
      });

      // Track instruction_followed when blocked snackbar appears
      if (permissionState === "denied") {
        triggerNotificationEvent(
          GA_EVENTS.INSTRUCTION_FOLLOWED,
          permissionState
        );
        triggerNotificationEvent(
          GA_EVENTS.MODAL_EVENT_LOGGED,
          permissionState,
          {
            event_action: "instruction_followed",
          }
        );
      }

      setHasTrackedView(true);
    }
  }, [isVisible, permissionState, hasTrackedView]);

  useEffect(() => {
    if (!isVisible || !snackbarRef.current) {
      setSnackbarHeight(0);
      return;
    }

    const measureHeight = () => {
      if (snackbarRef.current) {
        const isMobile = window.innerWidth < 768; // md breakpoint

        // For mobile, use fixed heights
        if (isMobile) {
          if (permissionState !== "denied") {
            setSnackbarHeight(48); // Not blocked state
          } else {
            setSnackbarHeight(68); // Blocked state
          }
        } else {
          // Desktop: use actual height + spacing
          const actualHeight =
            snackbarRef.current.getBoundingClientRect().height;
          setSnackbarHeight(actualHeight + 80);
        }
      }
    };

    // Measure after render
    const timeoutId = setTimeout(measureHeight, 0);

    // Re-measure on window resize
    window.addEventListener("resize", measureHeight);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", measureHeight);
    };
  }, [isVisible, permissionState, setSnackbarHeight]);

  const handleYesClick = () => {
    // Track allow CTA clicked
    if (permissionState) {
      triggerNotificationEvent(
        GA_EVENTS.STICKY_ALLOW_CTA_CLICKED,
        permissionState
      );
      triggerNotificationEvent(GA_EVENTS.MODAL_EVENT_LOGGED, permissionState, {
        event_action: "allow_clicked",
      });
    }

    // Mark as shown in session storage
    sessionStorage.setItem("notificationSnackbarShown", "true");
    setIsVisible(false);
    setIsSnackbarVisible(false);
    onRequestPermission();
  };

  const handleNoClick = () => {
    // Track maybe later clicked
    if (permissionState) {
      triggerNotificationEvent(
        GA_EVENTS.STICKY_MAYBELATER_CLICKED,
        permissionState
      );
      triggerNotificationEvent(GA_EVENTS.MODAL_EVENT_LOGGED, permissionState, {
        event_action: "maybe_later_clicked",
      });
    }

    // Mark as shown in session storage
    sessionStorage.setItem("notificationSnackbarShown", "true");
    setIsVisible(false);
    setIsSnackbarVisible(false);
    onDismiss();
  };

  const handleCloseClick = () => {
    // Track modal closed
    if (permissionState) {
      triggerNotificationEvent(GA_EVENTS.STICKY_CLOSED, permissionState);
      triggerNotificationEvent(GA_EVENTS.MODAL_EVENT_LOGGED, permissionState, {
        event_action: "closed",
      });
    }

    // Mark as shown in session storage
    sessionStorage.setItem("notificationSnackbarShown", "true");
    setIsVisible(false);
    setIsSnackbarVisible(false);
    onDismiss();
  };

  if (!isAuthenticated) {
    return null;
  }

  if (!isVisible) {
    return null;
  }

  // Render blocked state
  if (permissionState === "denied") {
    return (
      <>
        {/* Desktop Version - Blocked */}
        <div
          ref={snackbarRef}
          className="hidden md:block w-full bg-green fixed top-[72px] left-0 right-0 z-40"
        >
          <div className="flex items-center justify-center gap-[6px] py-[16px] relative">
            <p className="font-aktiv font-bold text-[20px] text-white leading-normal">
              <span>Notifications are blocked! </span>
              <span className="font-normal">To turn them on, go to </span>
              <span className="font-bold">
                Browser Settings &gt; Notifications &gt; Allow Notifications
              </span>
            </p>
            <button
              onClick={handleCloseClick}
              className="absolute right-[16px] top-1/2 -translate-y-1/2 w-[44px] h-[44px] flex items-center justify-center"
              aria-label="Close notification"
            >
              <div className="w-[20px] h-[20px] relative">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M18 2L2 18"
                    stroke="white"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M2 2L18 18"
                    stroke="white"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Version - Blocked */}
        <div
          ref={snackbarRef}
          className="block md:hidden w-full bg-green fixed top-[63.45px] left-0 right-0 z-40"
        >
          <div className="flex flex-col gap-[10px] p-[12px] relative">
            <div className="flex items-start justify-between w-full">
              <p className="font-aktiv text-[13px] text-white leading-[20px] w-[332px] whitespace-pre-wrap">
                <span className="font-bold">Notifications are blocked! </span>
                <span className="font-normal">To turn them on, go to </span>
                <span className="font-bold">
                  Browser Settings &gt; Notifications &gt; Allow Notifications
                </span>
              </p>
              <button
                onClick={handleCloseClick}
                className="flex items-center gap-[9px] p-[1.5px]"
                aria-label="Close notification"
              >
                <div className="w-[9px] h-[9px] relative">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M10.5 1.5L1.5 10.5"
                      stroke="white"
                      stroke-width="0.75"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M1.5 1.5L10.5 10.5"
                      stroke="white"
                      stroke-width="0.75"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </div>
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Render default state (permission request)
  return (
    <>
      {/* Desktop Version - Default */}
      <div
        ref={snackbarRef}
        className="hidden md:block w-full bg-green fixed top-[72px] left-0 right-0 z-40"
      >
        <div className="flex items-center justify-center gap-[24px] py-[16px] relative">
          <div className="flex gap-[6px] items-start font-aktiv text-[20px] text-white leading-normal">
            <p className="font-bold">Don&apos;t miss the next laugh! </p>
            <p className="font-bold">Turn on notifications!</p>
          </div>
          <div className="flex gap-[12px] items-center">
            <button
              onClick={handleYesClick}
              className="bg-white text-black font-aktiv font-bold text-[16px] leading-[16px] py-[10px] rounded-[100px] h-[36px] w-[160px] flex items-center justify-center"
            >
              Yes, Notify Me
            </button>
            <button
              onClick={handleNoClick}
              className="bg-[#41B766] text-white font-aktiv font-normal text-[16px] leading-[16px] py-[10px] rounded-[100px] h-[36px] w-[160px] flex items-center justify-center"
            >
              Nahh, Not Now
            </button>
          </div>
          <button
            onClick={handleCloseClick}
            className="absolute right-[16px] top-1/2 -translate-y-1/2 w-[44px] h-[44px] flex items-center justify-center"
            aria-label="Close notification"
          >
            <div className="w-[20px] h-[20px] relative">
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M18 2L2 18"
                  stroke="white"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M2 2L18 18"
                  stroke="white"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Version - Default */}
      <div
        ref={snackbarRef}
        className="block md:hidden w-full bg-green fixed top-[63.45px] left-0 right-0 z-40"
      >
        <div className="flex flex-col gap-[8px] items-center justify-center px-[12px] py-[8px] relative">
          <div className="flex gap-[16px] items-center justify-center w-full">
            <div className="flex flex-col items-center w-full text-white">
              <p className="font-aktiv font-bold text-[12px] leading-[15.6px] w-full">
                Don&apos;t miss the next laugh!
              </p>
              <p className="font-aktiv font-medium text-[12px] leading-[15.6px] w-full">
                Turn on notifications!
              </p>
            </div>
            <div className="flex flex-col gap-[12px] items-center w-full mr-[16px]">
              <div className="flex items-center justify-center w-full gap-[8px]">
                <button
                  onClick={handleNoClick}
                  className="bg-[#41B766] text-white font-aktiv font-normal text-[10px] leading-[100%] py-[8px] rounded-[100px] h-[28px] w-[72px] flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  Not Now
                </button>
                <button
                  onClick={handleYesClick}
                  className="bg-white text-black font-aktiv font-bold text-[10px] leading-[100%] py-[8px] rounded-[100px] h-[28px] w-[72px] flex items-center justify-center hover:bg-[#0f9543] transition-colors"
                >
                  Notify Me
                </button>
              </div>
            </div>
          </div>
          <button
            onClick={handleCloseClick}
            className="absolute right-0 top-[0.5px] w-[44px] h-[44px] flex items-center justify-center"
            aria-label="Close notification"
          >
            <div className="w-[12px] h-[12px] relative">
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10.5 1.5L1.5 10.5"
                  stroke="white"
                  stroke-width="0.75"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M1.5 1.5L10.5 10.5"
                  stroke="white"
                  stroke-width="0.75"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
          </button>
        </div>
      </div>
    </>
  );
};

export default NotificationSnackbar;
