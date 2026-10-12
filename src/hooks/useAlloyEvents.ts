import { useRef } from "react";
import { usePathname } from "next/navigation";
import {
  CDP_EVENT_TYPES,
  CDP_EVENT_SUB_TYPES,
  routesToName,
  PageView,
} from "../utils/alloyEvents";
import { 
  pushLinkClickToDataLayer, 
  determineLinkType,
  formatLinkName 
} from "../utils/gtmDataLayer";
import useAppSelector from "./useSelector";
import { LOCAL_STORAGE_KEYS } from "@/api";

interface TrackEventProps {
  eventType: string;
  eventSubType: string;
  webPageName?: string;
  survey?: Record<string, unknown>;
  webInteractionURL?: string;
}

const useAlloyEvents = () => {
  const { selectedLanguage } = useAppSelector((state) => state.language);
  const pathname = usePathname();

  // Remove haskocid state, always pull from latest kocidData

  // Deduplicate identical events fired within a short window (protect against scroll storms)
  const recentEventsRef = useRef<Map<string, number>>(new Map());
  const DEDUPE_WINDOW_MS = 1200;

  const trackEvent = ({
    eventType,
    eventSubType,
    survey,
    webInteractionURL,
  }: TrackEventProps) => {
    const key = `${eventType}::${eventSubType}`;
    const now = Date.now();
    const last = recentEventsRef.current.get(key) ?? 0;
    if (now - last < DEDUPE_WINDOW_MS) {
      return; // ignore duplicate burst
    }
    recentEventsRef.current.set(key, now);

    const hashedKocid = localStorage.getItem(LOCAL_STORAGE_KEYS.KOCID) ?? "";
    
    // Push to GTM dataLayer (flat structure per GTM guide)
    pushLinkClickToDataLayer({
      hashedKocid,
      brand: 'Sprite',
      country: 'IN',
      language: selectedLanguage ?? 'en',
      campaignName: '', // Can be extracted from URL params if needed
      domain: typeof window !== 'undefined' ? window.location.hostname : '',
      surveyName: survey?.name || '',
      surveyAnswers: survey?.questionnaire?.[0]?.answers || '',
      surveyQuestions: survey?.questionnaire?.[0]?.questions || '',
      linkName: formatLinkName(eventSubType),
      linkURL: webInteractionURL || (typeof window !== 'undefined' ? window.location.href : ''),
      linkType: determineLinkType(eventSubType, webInteractionURL),
    });
  };

  const trackPageView = (eventSubType: string) => {
    trackEvent({
      eventType: CDP_EVENT_TYPES.PAGE_VIEW,
      eventSubType,
    });
  };

  const trackClick = (eventSubType: string, webInteractionURL?: string) => {
    trackEvent({
      eventType: CDP_EVENT_TYPES.CLICK,
      eventSubType,
      webInteractionURL,
    });
  };

  const trackClickWithSurvey = (
    eventSubType: string,
    survey: Record<string, unknown>
  ) => {
    trackEvent({
      eventType: CDP_EVENT_TYPES.CLICK,
      eventSubType,
      survey,
    });
  };

  const trackSelect = (eventSubType: string) => {
    trackEvent({
      eventType: CDP_EVENT_TYPES.SELECT,
      eventSubType,
    });
  };

  const trackOnLoad = (eventSubType: string) => {
    trackEvent({
      eventType: CDP_EVENT_TYPES.ONLOAD,
      eventSubType,
    });
  };

  // Convenience methods for common events
  const trackLogin = () => {
    trackEvent({
      eventType: CDP_EVENT_TYPES.CLICK,
      eventSubType: CDP_EVENT_SUB_TYPES.LOGIN,
    });
  };

  const trackHahaReaction = (jokeId: string) => {
    trackEvent({
      eventType: CDP_EVENT_TYPES.CLICK,
      eventSubType: `${CDP_EVENT_SUB_TYPES.HAHA_REACTION}_${jokeId}`,
    });
  };

  const trackMehReaction = (jokeId: string) => {
    trackEvent({
      eventType: CDP_EVENT_TYPES.CLICK,
      eventSubType: `${CDP_EVENT_SUB_TYPES.MEH_REACTION}_${jokeId}`,
    });
  };

  const trackGrrReaction = (jokeId: string) => {
    trackEvent({
      eventType: CDP_EVENT_TYPES.CLICK,
      eventSubType: `${CDP_EVENT_SUB_TYPES.GRR_REACTION}_${jokeId}`,
    });
  };

  const trackScrollLOLView = () => {
    trackEvent({
      eventType: CDP_EVENT_TYPES.VIEW,
      eventSubType: CDP_EVENT_SUB_TYPES.SCROLL_LOL_VIEW,
    });
  };

  const trackSurpriseMe = () => {
    trackEvent({
      eventType: CDP_EVENT_TYPES.CLICK,
      eventSubType: CDP_EVENT_SUB_TYPES.SURPRISE_ME,
    });
  };
  

  const trackReferFriend = () => {
    trackEvent({
      eventType: CDP_EVENT_TYPES.CLICK,
      eventSubType: CDP_EVENT_SUB_TYPES.REFER_FRIEND,
    });
  };

  const trackVoteJoke = (jokeId: string, jokeName: string) => {
    const sanitizedJokeName = jokeName
      ? `_${jokeName
          .replace(/[^a-zA-Z0-9]/g, "_")
          .replace(/_+/g, "_")
          .replace(/^_|_$/g, "")}`
      : "";
    trackEvent({
      eventType: CDP_EVENT_TYPES.CLICK,
      eventSubType: `${CDP_EVENT_SUB_TYPES.VOTE_JOKE}_${jokeId}${sanitizedJokeName}`,
    });
  };

  const trackViewJoke = (jokeId: string) => {
    trackEvent({
      eventType: CDP_EVENT_TYPES.CLICK,
      eventSubType: CDP_EVENT_SUB_TYPES.VIEW_JOKE,
    });
  };

  const trackSubmitJoke = (
    jokeType: "audio" | "video" | "image" | "text",
    language: string,
    category: string
  ) => {
    const eventSubType =
      jokeType === "audio"
        ? `${CDP_EVENT_SUB_TYPES.SUBMIT_AUDIO_JOKE}_${language}_${category}`
        : jokeType === "video"
        ? `${CDP_EVENT_SUB_TYPES.SUBMIT_VIDEO_JOKE}_${language}_${category}`
        : jokeType === "image"
        ? `${CDP_EVENT_SUB_TYPES.SUBMIT_IMAGE_JOKE}_${language}_${category}`
        : `${CDP_EVENT_SUB_TYPES.SUBMIT_TEXT_JOKE}_${language}_${category}`;

    trackEvent({
      eventType: CDP_EVENT_TYPES.CLICK,
      eventSubType,
    });
  };

  const trackSocialFollow = (
    eventSubType: string,
    webInteractionURL?: string
  ) => {
    trackEvent({
      eventType: CDP_EVENT_TYPES.CLICK,
      eventSubType,
      webInteractionURL,
    });
  };

  const trackClickWithURL = (
    eventSubType: string,
    webInteractionURL: string
  ) => {
    trackEvent({
      eventType: CDP_EVENT_TYPES.CLICK,
      eventSubType,
      webInteractionURL,
    });
  };

  return {
    // Core tracking methods
    trackPageView,
    trackEvent,
    trackClick,
    trackSelect,
    trackOnLoad,

    // Convenience methods for specific events
    trackLogin,
    trackHahaReaction,
    trackMehReaction,
    trackGrrReaction,
    trackSurpriseMe,
    trackReferFriend,
    trackVoteJoke,
    trackViewJoke,
    trackSubmitJoke,
    trackScrollLOLView,
    trackSocialFollow,
    trackClickWithSurvey,
    trackClickWithURL,

    // Constants for reference
    CDP_EVENT_TYPES,
    CDP_EVENT_SUB_TYPES,
    PageView,
  };
};

export default useAlloyEvents;
