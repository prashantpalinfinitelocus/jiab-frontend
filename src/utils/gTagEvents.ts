import { FLOODLIGHT_ID } from "@/config";

export const pageview = (url: string) => {
  if (typeof window !== "undefined") {
    console.log("Google Analytics Pageview:", { page_path: url });
    window.gtag?.("event", "page_view", {
      page_path: url,
    });
  }
};

export const triggerGAEvent = (eventName: string, payload?: any) => {
  if (typeof window !== "undefined") {
    if (payload) {
      console.log("Google Analytics Event:", eventName, payload);
      window.gtag?.("event", eventName, payload);
    } else {
      console.log("Google Analytics Event:", eventName);
      window.gtag?.("event", eventName);
    }
  }
};

export const triggerFloodLightEvents = (eventCatId: string, options?: any) => {
  if (
    typeof window !== "undefined" &&
    eventCatId !== "" &&
    FLOODLIGHT_ID !== ""
  ) {
    console.log("Floodlight Event:", eventCatId, { send_to: `${FLOODLIGHT_ID}/sprit0/${eventCatId}+unique`, ...options });
    window.gtag?.("event", "conversion", {
      allow_custom_scripts: true,
      send_to: `${FLOODLIGHT_ID}/sprit0/${eventCatId}+unique`,
      ...(options || {}),
    });
  }
};

export const triggerPixelEvents = (eventName: string) => {
  if (window !== undefined && eventName !== "") {
    console.log("Facebook Pixel Event:", eventName);
    window?.fbq?.("track", eventName);
  }
};

/**
 * Gets device type based on user agent and screen size
 */
export const getDeviceType = (): string => {
  if (typeof window === "undefined") return "unknown";
  
  const ua = navigator.userAgent || "";
  const width = window.innerWidth;
  
  // Check for mobile/tablet patterns
  if (/Android|iPhone|iPad|iPod|Mobile|Silk|Kindle|BlackBerry|Opera Mini|IEMobile/i.test(ua)) {
    if (/iPad|Tablet/i.test(ua) || width >= 768) {
      return "tablet";
    }
    return "mobile";
  }
  
  return "desktop";
};

/**
 * Gets browser name from user agent
 */
export const getBrowserName = (): string => {
  if (typeof window === "undefined") return "unknown";
  
  const ua = navigator.userAgent || "";
  
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Opera") || ua.includes("OPR")) return "Opera";
  if (ua.includes("Edg")) return "Edge";
  if (ua.includes("Chrome")) return "Chrome";
  if (ua.includes("Safari")) return "Safari";
  
  return "unknown";
};

/**
 * Gets user location from localStorage
 */
export const getUserLocation = (): string => {
  if (typeof window === "undefined") return "";
  
  try {
    const geoData = localStorage.getItem("userGeolocation");
    if (geoData) {
      const parsed = JSON.parse(geoData);
      // Create a meaningful location string from available data
      const parts = [];
      if (parsed.geo_city_name) parts.push(parsed.geo_city_name);
      if (parsed.geo_state_province_code) parts.push(parsed.geo_state_province_code);
      if (parsed.geo_country_code) parts.push(parsed.geo_country_code);
      
      return parts.join(", ");
    }
  } catch (error) {
    console.error("Error reading location from localStorage:", error);
  }
  
  return "";
};

/**
 * Gets notification event params (user_browser, device_type, location)
 * Location is optional and will be empty if not available
 */
export const getNotificationEventParams = (notificationStatus?: NotificationPermission) => {
  const params: Record<string, any> = {
    user_browser: getBrowserName(),
    device_type: getDeviceType(),
    location: getUserLocation(),
  };
  
  if (notificationStatus) {
    params.notification_status = notificationStatus;
  }
  
  return params;
};

/**
 * Triggers a notification-related GA event with standard params
 */
export const triggerNotificationEvent = (
  eventName: string,
  notificationStatus?: NotificationPermission,
  additionalParams?: Record<string, any>
) => {
  const baseParams = getNotificationEventParams(notificationStatus);
  const params = additionalParams ? { ...baseParams, ...additionalParams } : baseParams;

  console.log("Notification Event:", eventName, params);
  triggerGAEvent(eventName, params);
};

/**
 * Pushes the sso_login_success event directly to the GTM dataLayer.
 * event_timestamp and gtm.uniqueEventId are populated by GTM itself.
 */
export const triggerSSOLoginSuccessEvent = (userId: string, pageType: string) => {
  if (typeof window === "undefined") return;

  window.dataLayer = window.dataLayer || [];

  const payload = {
    event: "sso_login_success",
    source: "sso",
    logged_in: true,
    user_id: userId,
    page_type: pageType,
    page_location: window.location.href,
    device_category: getDeviceType(),
  };

  console.log("GTM DataLayer Event:", payload);
  window.dataLayer.push(payload);
};
