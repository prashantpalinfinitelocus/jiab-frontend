// lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, Messaging, GetTokenOptions, isSupported } from 'firebase/messaging';
import { getAnalytics, Analytics, logEvent } from 'firebase/analytics';
import { triggerGAEvent } from '@/utils/gTagEvents';
import { GA_EVENTS } from '@/constants';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// // Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Messaging with Web Push support check
let messaging: Messaging | null = null;
let analytics: Analytics | null = null;

const setupMessaging = async (): Promise<Messaging | null> => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }

  try {
    const supported = await isSupported();
    if (supported) {
      messaging = getMessaging(app);
      return messaging;
    } else {
      return null;
    }
  } catch(error) {
    console.error(error);
    return null;
  }
};

const setupAnalytics = (): Analytics | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    analytics = getAnalytics(app);
    return analytics;
  } catch (error) {
    console.warn('Firebase Analytics not available:', error);
    return null;
  }
};

// Initialize messaging and analytics immediately if possible
if (typeof window !== 'undefined') {
  setupMessaging();
  setupAnalytics();
}

// Helper function to log notification clicked event
export const logNotificationClicked = (notificationData?: {
  title?: string;
  route?: string;
  url?: string;
  hasAction?: boolean;
  source?: string;
  action?: string;
  timestamp?: string;
  purpose?: string;
  [key: string]: string | number | boolean | undefined;
}) => {
  // Only trigger sprite_pn_clicked event if purpose is "campaign"
  if (notificationData?.purpose !== 'campaign') {
    return;
  }

  try {
    triggerGAEvent(GA_EVENTS.SPRITE_PN_CLICKED, {
      notification_title: notificationData?.title || 'Unknown',
      notification_route: notificationData?.route || notificationData?.url || '/',
      has_action: notificationData?.hasAction || false,
      timestamp: new Date().toISOString(),
      ...notificationData
    });
  } catch (error) {
    console.error('Error logging sprite_pn_clicked event:', error);
  }
};

export { messaging, analytics, getToken, onMessage, setupMessaging, setupAnalytics, logEvent };
export type { Messaging, Analytics, GetTokenOptions };