// 061020252213g
importScripts(
  "https://www.gstatic.com/firebasejs/10.11.1/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.11.1/firebase-messaging-compat.js"
);


const CONFIG = {
  // Firebase web API keys are public client identifiers (shipped to every browser); access is restricted by referrer/API in Google Cloud.
  apiKey: "REPLACE_WITH_FIREBASE_WEB_API_KEY", // gitleaks:allow nosemgrep
  authDomain: "ai0015455-sfa-prod.firebaseapp.com",
  projectId: "ai0015455-sfa-prod",
  storageBucket: "ai0015455-sfa-prod.firebasestorage.app",
  messagingSenderId: "612123389966",
  appId: "1:612123389966:web:f3cb55a76fed9d763e0c5f",
  measurementId: "G-XVQHGE950K"
};


firebase.initializeApp(CONFIG);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  // Notify main app to update notification cache
  self.clients
    .matchAll({ includeUncontrolled: true, type: "window" })
    .then((clients) => {
      clients.forEach((client) => {
        client.postMessage({
          type: "NOTIFICATION_RECEIVED",
          payload: payload,
        });
      });
    });

  try {
    let notificationTitle = "New Notification";
    let notificationBody = "You have a new message!";
    // Always use local assets for icon and badge
    let notificationIcon = "/icons/icon-192x192.png";
    let notificationImage; // large image for body (web push)
    let notificationBadge = "/icons/icon-72x72.png";
    let clickAction = "/";
    let hasAction = false;
    let route = null;
    let purpose = null;
    let additionalData = {};

    if (payload.notification) {
      notificationTitle = payload.notification.title || notificationTitle;
      notificationBody = payload.notification.body || notificationBody;
      // Keep local icon; ignore backend-provided icon
      // Some backends may pass body_image_url at root notification as non-standard
      notificationImage = payload.notification.body_image_url || notificationImage;
      clickAction =
        payload.notification.click_action ||
        payload.fcmOptions?.link ||
        clickAction;
      hasAction = payload.notification.HasAction || false;
      route = payload.notification.Route || null;
      purpose = payload.notification.purpose || null;
    } else if (payload.data) {
      notificationTitle =
        payload.data.title ||
        payload.data.notification_title ||
        notificationTitle;
      notificationBody =
        payload.data.body ||
        payload.data.notification_text ||
        payload.data.message ||
        notificationBody;
      // Keep local icon; ignore backend-provided icon values

      // Use body_image_url for large notification image (big picture style)
      notificationImage = payload.data.body_image_url || notificationImage;

      // Handle HasAction and Route from backend (support snake_case & camelCase)
      const hasActionCandidates = [
        payload.data.HasAction,
        payload.data.has_action,
        payload.notification?.HasAction,
        payload.notification?.has_action,
      ];
      hasAction = hasActionCandidates.some((v) => v === true || v === "true");

      route =
        payload.data.Route ||
        payload.data.route ||
        payload.notification?.Route ||
        payload.notification?.route ||
        null;

      purpose =
        payload.data.purpose ||
        payload.data.Purpose ||
        payload.notification?.purpose ||
        payload.notification?.Purpose ||
        null;

      // Prefer provided route when available; otherwise, use common link fields
      if (route) {
        clickAction = route;
      } else {
        clickAction =
          payload.data.click_action ||
          payload.data.url ||
          payload.data.link ||
          clickAction;
      }

      additionalData = { ...payload.data };
    }

    const notificationOptions = {
      body: notificationBody,
      icon: notificationIcon,
      badge: notificationBadge,
      image: notificationImage,
      tag: "jiab-notification-" + Date.now(),
      requireInteraction: false,
      silent: false,
      timestamp: Date.now(),
      data: {
        url: clickAction,
        hasAction: hasAction,
        route: route,
        purpose: purpose,
        originalPayload: payload,
        ...additionalData,
      },
      actions: hasAction
        ? [
            {
              action: "open",
              title: "Open",
              icon: notificationIcon,
            },
            {
              action: "close",
              title: "Close",
              icon: notificationIcon,
            },
          ]
        : [],
    };

    return self.registration.showNotification(
      notificationTitle,
      notificationOptions
    );
  } catch (error) {
    return self.registration.showNotification("New Notification", {
      body: "You have a new message (error in processing)",
      icon: "/icons/icon-192x192.png",
      badge: "/icons/icon-72x72.png",
      tag: "jiab-notification-error",
      data: {
        url: "/",
        hasAction: false,
        route: null,
        purpose: null,
        error: error.message,
        originalPayload: payload,
      },
    });
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const notificationData = event.notification.data || {};
  const route = notificationData.route;
  const targetUrl = notificationData.url || "/";
  const action = event.action;

  if (action === "close") {
    return;
  }

  // Determine raw target and convert to absolute URL
  const raw = route || targetUrl || "/";
  const finalUrl = new URL(
    raw.startsWith("http") ? raw : (raw.startsWith("/") ? raw : `/${raw}`),
    self.location.origin
  ).href;

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Send analytics event to all clients for logging
        const analyticsData = {
          type: "NOTIFICATION_CLICKED",
          data: {
            title: event.notification.title || "Unknown",
            route: route || targetUrl || "/",
            hasAction: notificationData.hasAction || false,
            source: "background",
            action: action,
            timestamp: new Date().toISOString(),
            ...notificationData
          }
        };
        
        clientList.forEach((client) => {
          client.postMessage(analyticsData);
        });

        if (clientList.length > 0) {
          // Focus a visible client if possible
          const visible = clientList.find((c) => c.visibilityState === "visible") || clientList[0];
          if (visible && "focus" in visible) {
            visible.focus();
          }
          // Broadcast navigate intent to all tabs
          clientList.forEach((c) => c.postMessage({ action: "navigate", url: finalUrl }));
          return;
        }

        // If no existing clients, open a new window with absolute URL
        return clients.openWindow(finalUrl);
      })
      .catch((error) => {
        console.error(
          "[firebase-messaging-sw.js] Error handling notification click:",
          error
        );
      })
  );
});

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", () => {
  // Ensure control of clients as soon as SW activates
  clients.claim();
});

self.addEventListener("message", (event) => {
  // Only pages served from this origin may message the service worker.
  if (event.origin && event.origin !== self.location.origin) return;
  if (event?.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
    return;
  }

  // Handle navigate broadcast from foreground page
  try {
    const incoming = event?.data || {};
    if (incoming && incoming.action === "navigate" && incoming.url) {
      const raw = incoming.url;
      const absoluteUrl = new URL(
        raw.startsWith("http") ? raw : (raw.startsWith("/") ? raw : `/${raw}`),
        self.location.origin
      ).href;
      event.waitUntil(
        clients
          .matchAll({ type: "window", includeUncontrolled: true })
          .then((clientList) => {
            clientList.forEach((c) => c.postMessage({ action: "navigate", url: absoluteUrl }));
          })
      );
    }
  } catch {}
});

self.addEventListener("error", (event) => {
  console.error(
    "[firebase-messaging-sw.js] Service worker error:",
    event.error
  );
});

self.addEventListener("unhandledrejection", () => {});
