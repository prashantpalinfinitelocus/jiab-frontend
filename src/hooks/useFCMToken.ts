import { useEffect, useState, useCallback } from "react";
import { messaging, getToken, onMessage, setupMessaging, logNotificationClicked } from "@/lib/firebase";
import { useRegisterDevice } from "@/api/hooks/NotificationHooks";
import useAppSelector from "@/hooks/useSelector";
import { useQueryClient } from "@tanstack/react-query";
import { keys } from "@/api/utils";

interface FCMTokenState {
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isRegistered: boolean;
  permissionStatus: NotificationPermission | null;
  serviceWorkerRegistered: boolean;
  isAuthenticated: boolean;
}

interface ErrorWithResponse {
  response?: {
    status?: number;
    data?: {
      message?: string;
    };
  };
}

interface ExtendedNotificationOptions extends NotificationOptions {
  image?: string
}

const useFCMToken = () => {
  const { isAuthenticated, token: authToken } = useAppSelector(
    (state) => state.auth
  );
  const queryClient = useQueryClient();

  const [fcmState, setFcmState] = useState<FCMTokenState>({
    token: null,
    isLoading: false,
    error: null,
    isRegistered: false,
    permissionStatus: null,
    serviceWorkerRegistered: false,
    isAuthenticated: false,
  });

  const registerDeviceMutation = useRegisterDevice();

  // Update authentication state
  useEffect(() => {
    setFcmState((prev) => ({ ...prev, isAuthenticated }));
  }, [isAuthenticated]);

  const checkServiceWorkerRegistration =
    useCallback(async (): Promise<boolean> => {
      try {
        if (typeof window === "undefined") {
          return false;
        } // 🚫 prevent SSR crash

        if ("serviceWorker" in navigator) {
          await navigator.serviceWorker.register("/firebase-messaging-sw.js");
          setFcmState((prev) => ({ ...prev, serviceWorkerRegistered: true }));
          return true;
        } else {
          setFcmState((prev) => ({
            ...prev,
            error: "Service Worker not supported",
            serviceWorkerRegistered: false,
          }));
          return false;
        }
      } catch {
        setFcmState((prev) => ({
          ...prev,
          error: "Service Worker registration failed",
          serviceWorkerRegistered: false,
        }));
        return false;
      }
    }, []);

  const setupForegroundMessageListener = useCallback(async () => {
    // Ensure messaging is available before setting up listener
    const messagingInstance = messaging || (await setupMessaging());
    if (!messagingInstance) return;

    const isMobileAgent = () => {
      if (typeof navigator === "undefined") return false;
      const ua = navigator.userAgent || "";
      return /Android|iPhone|iPad|iPod|Mobile|Silk|Kindle|BlackBerry|Opera Mini|IEMobile/i.test(
        ua
      );
    };

    const unsubscribe = onMessage(messagingInstance, (payload) => {
      // Smart invalidation based on current context
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

      // Foreground notification: desktop can use window Notification; mobile should use SW showNotification
      if (
        typeof window !== "undefined" &&
        Notification?.permission === "granted"
      ) {
        const notificationTitle =
          payload.notification?.title || "New Notification";
        const data = payload.data || {};
        const imageFromData = (data as any).body_image_url;

        const notificationOptions: ExtendedNotificationOptions = {
          body: payload.notification?.body || "You have a new message!",
          // Always use local icon; ignore backend-provided icon
          icon: "/icons/icon-192x192.png",
          // Use body_image_url for large image if provided
          image: imageFromData || undefined,
          badge: "/icons/icon-72x72.png",
          tag: "jiab-foreground-notification",
          requireInteraction: false,
          data: payload.data,
        };

        const preferSW = isMobileAgent();

        if (!preferSW && "Notification" in window) {
          try {
            // Desktop Chrome allows this while page visible
            // Some environments will throw Illegal constructor
            // eslint-disable-next-line no-new
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
            return;
          } catch {
            // fallthrough to SW path
          }
        }

        if ("serviceWorker" in navigator) {
          void navigator.serviceWorker.ready
            .then((reg) =>
              reg.showNotification(notificationTitle, notificationOptions)
            )
            .catch(() => {
              // no-op
            });
        }
      }
    });

    return unsubscribe;
  }, [queryClient]);

  const generateFCMToken = useCallback(async (): Promise<string | null> => {
    try {
      setFcmState((prev) => ({ ...prev, isLoading: true, error: null }));

      // Ensure messaging is initialized with Web Push support check
      const messagingInstance = messaging || (await setupMessaging());
      if (!messagingInstance) {
        setFcmState((prev) => ({
          ...prev,
          error:
            "Firebase messaging not available or not supported on this device/browser",
          isLoading: false,
        }));
        return null;
      }

      // Check service worker registration first
      const swRegistered = await checkServiceWorkerRegistration();
      if (!swRegistered) {
        setFcmState((prev) => ({ ...prev, isLoading: false }));
        return null;
      }

      // Check if notification permission is already granted (don't request it)
      const currentPermission =
        typeof window !== "undefined" && "Notification" in window
          ? Notification.permission
          : "denied";
      
      setFcmState((prev) => ({ ...prev, permissionStatus: currentPermission }));
      
      if (currentPermission !== "granted") {
        setFcmState((prev) => ({
          ...prev,
          error: "Notification permission not granted",
          isLoading: false,
        }));
        return null;
      }

      // Generate FCM token
      const serviceWorkerRegistration = await navigator.serviceWorker.ready;
      const token = await getToken(messagingInstance, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
        serviceWorkerRegistration,
      });

      if (token) {
        setFcmState((prev) => ({
          ...prev,
          token,
          isLoading: false,
          error: null,
        }));

        // Store token in localStorage for persistence
        localStorage.setItem("fcm_token", token);

        // Setup foreground message listener
        await setupForegroundMessageListener();

        return token;
      } else {
        setFcmState((prev) => ({
          ...prev,
          error: "Failed to generate FCM token",
          isLoading: false,
        }));
        return null;
      }
    } catch (error) {
      setFcmState((prev) => ({
        ...prev,
        error: `Failed to generate FCM token: ${error}`,
        isLoading: false,
      }));
      return null;
    }
  }, [
    checkServiceWorkerRegistration,
    setupForegroundMessageListener,
  ]);

  const registerDeviceWithToken = useCallback(
    async (token: string): Promise<boolean> => {
      // Check authentication before attempting registration
      if (!isAuthenticated || !authToken) {
        setFcmState((prev) => ({
          ...prev,
          error: "User not authenticated. Please login first.",
        }));
        return false;
      }

      try {
        const result = await registerDeviceMutation.mutateAsync({
          device_token: token,
        });

        if (result.ok) {
          setFcmState((prev) => ({ ...prev, isRegistered: true }));
          localStorage.setItem("device_registered", "true");
          localStorage.setItem("device_registered_for_user", authToken); // Store which user this was registered for
          return true;
        } else {
          setFcmState((prev) => ({
            ...prev,
            error:
              "message" in result
                ? (result.message as string)
                : "Device registration failed",
          }));
          return false;
        }
      } catch (error) {
        let errorMessage = "Device registration failed";

        // Handle specific authentication errors
        if (error && typeof error === "object" && "response" in error) {
          const responseError = error as ErrorWithResponse;
          if (
            responseError.response?.status === 401 ||
            responseError.response?.status === 403
          ) {
            errorMessage = "Authentication failed. Please login again.";
          } else if (responseError.response?.data?.message) {
            errorMessage = responseError.response.data.message;
          }
        }

        setFcmState((prev) => ({
          ...prev,
          error: errorMessage,
        }));
        return false;
      }
    },
    [isAuthenticated, authToken, registerDeviceMutation.mutateAsync]
  );

  const initializeFCM = useCallback(async () => {
    // Don't initialize if user is not authenticated
    if (!isAuthenticated || !authToken) {
      setFcmState((prev) => ({
        ...prev,
        error: "Please login to enable push notifications",
      }));
      return;
    }

    // Check current permission status
    const currentPermission =
      typeof window !== "undefined" && "Notification" in window
        ? Notification.permission
        : ("denied" as NotificationPermission);
    setFcmState((prev) => ({ ...prev, permissionStatus: currentPermission }));

    // Check if already registered for this user
    const isAlreadyRegistered =
      localStorage.getItem("device_registered") === "true";
    const registeredForUser = localStorage.getItem(
      "device_registered_for_user"
    );
    const existingToken = localStorage.getItem("fcm_token");

    // If registered for a different user, clear the registration
    if (
      isAlreadyRegistered &&
      registeredForUser &&
      registeredForUser !== authToken
    ) {
      localStorage.removeItem("device_registered");
      localStorage.removeItem("device_registered_for_user");
      localStorage.removeItem("fcm_token");
    }

    // Check if already properly registered for current user
    if (
      isAlreadyRegistered &&
      registeredForUser === authToken &&
      existingToken &&
      currentPermission === "granted"
    ) {
      setFcmState((prev) => ({
        ...prev,
        token: existingToken,
        isRegistered: true,
        permissionStatus: currentPermission,
      }));

      // Still setup foreground listener
      setupForegroundMessageListener();

      // Verify service worker is registered
      await checkServiceWorkerRegistration();

      return;
    }

    // ONLY generate token if permission is already granted
    // Don't automatically request permission - let user click "Yes, Notify Me" first
    if (currentPermission === "granted") {
      const token = await generateFCMToken();
      if (token) {
        await registerDeviceWithToken(token);
      }
    }
  }, [
    isAuthenticated,
    authToken,
    generateFCMToken,
    registerDeviceWithToken,
    checkServiceWorkerRegistration,
    setupForegroundMessageListener,
  ]);

  const refreshToken = async () => {
    // Clear existing data
    localStorage.removeItem("fcm_token");
    localStorage.removeItem("device_registered");
    localStorage.removeItem("device_registered_for_user");
    setFcmState({
      token: null,
      isLoading: false,
      error: null,
      isRegistered: false,
      permissionStatus: null,
      serviceWorkerRegistered: false,
      isAuthenticated,
    });

    // Generate new token and register
    await initializeFCM();
  };

  const testNotification = () => {
    if (
      typeof window === "undefined" ||
      Notification?.permission !== "granted"
    ) {
      return;
    }

    const title = "Test Notification";
    const options: ExtendedNotificationOptions = {
      body: "This is a test notification from your app!",
      icon: "/icons/icon-192x192.png",
      badge: "/icons/icon-72x72.png",
      image: "/home-page/banner-bottom.png",
      tag: "test-notification",
    };

    const ua =
      typeof navigator !== "undefined" ? navigator.userAgent || "" : "";
    const isMobile =
      /Android|iPhone|iPad|iPod|Mobile|Silk|Kindle|BlackBerry|Opera Mini|IEMobile/i.test(
        ua
      );

    if (!isMobile && "Notification" in window) {
      try {
        // eslint-disable-next-line no-new
        new Notification(title, options);
        return;
      } catch {
        // fallthrough to SW path
      }
    }

    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker.ready
        .then((reg) => reg.showNotification(title, options))
        .catch(() => {
          // no-op
        });
    }
  };

  // Initialize FCM when authentication state changes
  useEffect(() => {
    if (typeof window !== "undefined" && isAuthenticated && authToken) {
      initializeFCM();
    } else if (!isAuthenticated) {
      // Clear FCM state when user logs out
      setFcmState((prev) => ({
        ...prev,
        token: null,
        isRegistered: false,
        error: "Please login to enable push notifications",
      }));
    }
  }, [isAuthenticated, authToken, initializeFCM]);

  return {
    ...fcmState,
    initializeFCM,
    refreshToken,
    testNotification,
    isRegistering: registerDeviceMutation.isPending,
  };
};

export default useFCMToken;
