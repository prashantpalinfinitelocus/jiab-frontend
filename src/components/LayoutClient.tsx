"use client";

import { ReactNode, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { pageview, triggerNotificationEvent } from "@/utils/gTagEvents";
import QueryClientAndReduxWrapper from "@/components/QueryClientAndReduxWrapper";
import FontProvider from "./FontProvider";
import FCMProvider from "./common/FCMProvider/FCMProvider";
import CMSWrapper from "./common/CMSWrapper";
import InitialDataLoader from "./common/InitialDataLoader";
import ProtectedRoutedWrapper from "./common/ProtectedRoutedWrapper";
import LoginCounterWrapper from "./common/LoginCounterWrapper";
import Navbar from "./common/Navbar/Navbar";
import BuyNowButton from "./BuyNowButton";
import MobileFooter from "./common/Footer/Mobile/MobileFooter";
import DesktopFooter from "./common/Footer/Desktop/DesktopFooter";
import BreakTheIceComponent from "./BreakTheIceComponent";
import MadeYouLolComponent from "./MadeYouLolComponent";
import GlobalLoader from "./common/GlobalLoader";
import { LOGIN_SIGNUP_DIALOG_ID, PORTAL_ID, GA_EVENTS } from "@/constants";
import AdobePageViewEvent from './AdobePageViewEvent'
import AdobeTargetTopOfPage from './AdobeTargetTopOfPage'
import AdobeTargetBottomOfPage from "./AdobeTargetBottomOfPage";
import { ALLOY_DATASTREAM_ID, ALLOY_ORG_ID } from "@/config";
import { NotificationSnackbarProvider } from "@/contexts/NotificationSnackbarContext";
import ContentWrapper from "./common/ContentWrapper";
import { logNotificationClicked } from "@/lib/firebase";

interface LayoutClientProps {
  children: ReactNode;
}

export default function LayoutClient({
  children,
}: Readonly<LayoutClientProps>) {
  const pathname = usePathname();
  const router = useRouter();
  const hasTrackedSession = useRef(false);

  // Track user_session on initial load with notification permission status
  useEffect(() => {
    if (typeof window !== "undefined" && !hasTrackedSession.current) {
      const notificationPermission =
        "Notification" in window ? Notification.permission : "default";

      triggerNotificationEvent(GA_EVENTS.USER_SESSION, notificationPermission);
      triggerNotificationEvent(
        GA_EVENTS.NOTIFICATION_STATUS,
        notificationPermission
      );
      hasTrackedSession.current = true;
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      pageview(window.location.pathname);
    }
  }, [pathname]);

  // Configure Adobe Alloy
  useEffect(() => {
    if (window !== undefined) {
      window.alloy?.('configure', {
        datastreamId: ALLOY_DATASTREAM_ID,
        orgId: ALLOY_ORG_ID
      })
    }
  }, []);

  // Listen for navigation messages from the service worker
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    const handler = (event: MessageEvent) => {
      const { action, url, type, data } = (event?.data || {}) as {
        action?: string;
        url?: string;
        type?: string;
        data?: any;
      };

      // Handle notification click analytics from background
      if (type === "NOTIFICATION_CLICKED" && data) {
        logNotificationClicked(data);
      }

      // Handle navigation
      if (action === "navigate" && typeof url === "string" && url.length > 0) {
        try {
          const u = new URL(url, window.location.origin);
          const path =
            u.origin === window.location.origin
              ? u.pathname + u.search + u.hash
              : url;
          router.push(path);
        } catch {
          const finalUrl =
            url.startsWith("/") || url.startsWith("http") ? url : `/${url}`;
          window.location.href = finalUrl;
        }
      }
    };

    navigator.serviceWorker.addEventListener("message", handler);
    return () =>
      navigator.serviceWorker.removeEventListener("message", handler);
  }, [router]);

  return (
    <QueryClientAndReduxWrapper>
      <NotificationSnackbarProvider>
        <AdobeTargetTopOfPage />
      <FontProvider />
        <AdobePageViewEvent />
      <FCMProvider>
          <CMSWrapper>
            <InitialDataLoader>
              <ProtectedRoutedWrapper>
                <LoginCounterWrapper>
                  <Navbar />
                  <ContentWrapper />
                  {children}
                  {/* Show Buy Now button only when not on /scroll-and-lol or /notification */}
                  {!pathname.includes('/scroll-and-lol') &&
                !pathname.includes('/create-memes') &&
                    !pathname.includes('/notifications')
                    && !pathname.includes('/tadka-hub')
                    && <BuyNowButton />}

                  {/* Mobile Footer */}
                  <div className='block lg:hidden'>
                    <MobileFooter />
                  </div>

                  {/* Desktop Footer - visible on screens 900px and above (lg breakpoint) */}
                  <div className='hidden lg:block'>
                    {!pathname.includes('/scroll-and-lol') && <DesktopFooter />}
                  </div>
                  <div id={PORTAL_ID}></div>
                  <div id={LOGIN_SIGNUP_DIALOG_ID}></div>
                </LoginCounterWrapper>
              </ProtectedRoutedWrapper>
            </InitialDataLoader>
            <BreakTheIceComponent />
            <MadeYouLolComponent />
          </CMSWrapper>
        </FCMProvider>
        {/* Global Loading Component */}
        <GlobalLoader />
      </NotificationSnackbarProvider>
      <AdobeTargetBottomOfPage/>
    </QueryClientAndReduxWrapper>
  );
}
