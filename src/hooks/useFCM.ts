import { useEffect, useState } from "react";
import { messaging, getToken, onMessage, setupMessaging, logNotificationClicked } from "@/lib/firebase";

import { useQueryClient } from "@tanstack/react-query";
import { keys } from "@/api/utils";
import { isSupported } from "firebase/messaging";

export interface FCMHookResult {
  token: string | null;
  permission: NotificationPermission | null;
  isSupported: boolean;
  requestPermission: () => Promise<boolean>;
  getRegistrationToken: () => Promise<string | null>;
  testNotificationUpdate: () => void;
}

export const useFCM = (): FCMHookResult => {
  const [token, setToken] = useState<string | null>(null);
  const [permission, setPermission] = useState<NotificationPermission | null>(
    null
  );
  const [isFCMSupported, setIsFCMSupported] = useState<boolean>(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    // Check if FCM is supported
    const checkSupport = async () => {
      if (typeof window !== "undefined") {
        try {
          const supported = await isSupported();
          const basicSupport =
            "Notification" in window &&
            "serviceWorker" in navigator &&
            "PushManager" in window;

          const fullSupport = supported && basicSupport;
          setIsFCMSupported(fullSupport);

          if (fullSupport) {
            setPermission(Notification.permission);
          }
        } catch (error) {
          setIsFCMSupported(false);
        }
      }
    };

    checkSupport();

    // Listen for messages from service worker with smart invalidation
    const handleServiceWorkerMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === "NOTIFICATION_RECEIVED") {
        // Smart invalidation - only invalidate what's needed
        // Always invalidate count as it's lightweight and always changes
        queryClient.invalidateQueries({
          queryKey: [...keys.notifications.getNotificationCount()],
        });

        // Only invalidate notification list if user is currently viewing notifications
        // This prevents unnecessary API calls when user isn't actively viewing the list
        const currentPath =
          typeof window !== "undefined" ? window.location.pathname : "";
        if (currentPath.includes("/notifications")) {
          queryClient.invalidateQueries({
            queryKey: [...keys.notifications.getNotifications()],
          });
        }
      } else if (event.data && event.data.type === "NOTIFICATION_CLICKED") {
        // Handle notification click analytics from service worker
        logNotificationClicked(event.data.data);
      } else if (event.data && event.data.action === "navigate") {
        // Handle navigation request from service worker (notification click)
        const { url, hasAction, route } = event.data;

        if (hasAction !== false && url && typeof window !== "undefined") {

          // Use Next.js router for navigation
          if (window.location.pathname !== url) {
            window.location.href = url;
          }
        }
      }
    };

    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener(
        "message",
        handleServiceWorkerMessage
      );

      return () => {
        navigator.serviceWorker.removeEventListener(
          "message",
          handleServiceWorkerMessage
        );
      };
    }
  }, [queryClient]);

  const requestPermission = async (): Promise<boolean> => {
    try {
      if (typeof window === "undefined" || !("Notification" in window)) {
        return false;
      }

      if (!isFCMSupported) {
        return false;
      }

      const permission = await Notification.requestPermission();
      setPermission(permission);

      if (permission === "granted") {
        await getRegistrationToken();
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  };

  const getRegistrationToken = async (): Promise<string | null> => {
    try {
      if (typeof window === "undefined") {
        return null;
      } // 🚫 prevent SSR crash

      // Ensure messaging is initialized with Web Push support check
      const messagingInstance = messaging || (await setupMessaging());
      if (!messagingInstance) {
        return null;
      }

      // Register service worker
      const registration = await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js"
      );
      const currentToken = await getToken(messagingInstance, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
        serviceWorkerRegistration: registration,
      });

      if (currentToken) {
        setToken(currentToken);
        return currentToken;
      } else {
        return null;
      }
    } catch (error) {
      return null;
    }
  };

  // Set up foreground message listener with smart invalidation
  useEffect(() => {
    const setupListener = async () => {
      if (permission === "granted" && isFCMSupported) {
        // Ensure messaging is available
        const messagingInstance = messaging || (await setupMessaging());
        if (!messagingInstance) return;

        const unsubscribe = onMessage(messagingInstance, (payload) => {
          // Smart invalidation based on current context
          // Always invalidate count as it's lightweight and always changes
          queryClient.invalidateQueries({
            queryKey: [...keys.notifications.getNotificationCount()],
          });

          // Only invalidate notification list if user is currently viewing notifications
          // This prevents unnecessary API calls and improves performance
          const currentPath =
            typeof window !== "undefined" ? window.location.pathname : "";
          if (currentPath.includes("/notifications")) {
            queryClient.invalidateQueries({
              queryKey: [...keys.notifications.getNotifications()],
            });
          }

          // Handle foreground message
          if (payload.notification) {
            // You can show a custom notification or update UI
            const notificationTitle =
              payload.notification.title ?? "New Message";

            const data: Record<string, unknown> = (payload as any).data || {};
            const imageFromData = (data as any).body_image_url;

            const notificationOptions: NotificationOptions & { image?: string } = {
              body: payload.notification.body ?? "You have a new message!",
              // Always use local icon for consistency with SW
              icon: "/icons/icon-192x192.png",
              // Use body_image_url for large image in supported browsers
              image: imageFromData || undefined,
              tag: "jiab-foreground-notification",
            };

            // Show browser notification even when app is in foreground
            if (
              "Notification" in window &&
              Notification.permission === "granted"
            ) {
              const n = new Notification(notificationTitle, notificationOptions);
              const route = (data as any).route || (data as any).Route;
              const fallbackUrl = (data as any).click_action || (data as any).url || (data as any).link || "/";
              const target = route || fallbackUrl;
              const purpose = (data as any).purpose || (data as any).Purpose || null;
              n.onclick = () => {
                // Log notification clicked event to Firebase Analytics
                logNotificationClicked({
                  title: notificationTitle,
                  route: target,
                  hasAction: (data as any).hasAction || (data as any).HasAction || false,
                  purpose: purpose,
                  source: 'foreground',
                  ...data
                });

                try {
                  window.focus();
                } catch {}
                if (typeof target === "string" && target.length > 0) {
                  const raw = target;
                  const finalUrl = (() => {
                    try {
                      return new URL(
                        raw.startsWith("http") ? raw : (raw.startsWith("/") ? raw : `/${raw}`),
                        window.location.origin
                      ).href;
                    } catch {
                      return raw;
                    }
                  })();
                  if ("serviceWorker" in navigator) {
                    navigator.serviceWorker.controller?.postMessage({ action: "navigate", url: finalUrl });
                  } else {
                    window.location.href = finalUrl;
                  }
                }
              };
            }
          }
        });

        return () => unsubscribe();
      }
    };

    setupListener();
  }, [permission, isFCMSupported, queryClient]);

  // Smart test function for manual invalidation
  const testNotificationUpdate = () => {
    // Always invalidate count
    queryClient.invalidateQueries({
      queryKey: [...keys.notifications.getNotificationCount()],
    });

    // Only invalidate notification list if user is currently viewing notifications
    const currentPath =
      typeof window !== "undefined" ? window.location.pathname : "";
    if (currentPath.includes("/notifications")) {
      queryClient.invalidateQueries({
        queryKey: [...keys.notifications.getNotifications()],
      });
    }
  };

  return {
    token,
    permission,
    isSupported: isFCMSupported,
    requestPermission,
    getRegistrationToken,
    testNotificationUpdate,
  };
};
