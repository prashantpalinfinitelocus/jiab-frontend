import { LOCAL_STORAGE_KEYS } from "@/api";

export const triggerAlloyEvents = (payload: Record<string, unknown>) => {
  if (window !== undefined && payload) {
    console.log("Adobe Event → DataLayer:", payload);
    
    // New - GA with ADOBE
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'adobe_alloy_event', 
      alloyPayload: payload        
    });
    
  }
};

export interface CreatePayLoadProps {
  eventType: string;
  eventSubType: string;
  hashedKocid?: string;
  languageCode?: string;
  webPageName: string;
  survey?: Record<string, unknown>;
  webInteractionURL?: string;
  previousPath?: string;
}

export const PageView = "web.webpagedetails.pageViews";
export const LinkClicks = "web.webinteraction.linkClicks";

export const routesToName = {
  "/": "Home",
  "/contest": "Contest",
  "/my-profile": "My Profile",
  "/send-reminder": "Send Reminder",
  "/leaderboard": "Leaderboard",
  "/pick-mood": "Pick Mood",
  "/hall-of-lame": "Hall of Lame",
  "/scroll-and-lol": "Scroll and LOL",
  "/profile": "Profile",
  "/user-generated-jokes": "User Generated Jokes",
  "/my-wallet": "My Wallet",
  "/submit-your-joke": "Submit Your Joke",
  "/claim-form": "Claim Form",
  "/notifications": "Notifications",
  "/terms_conditions": "Terms and Conditions",
  "/privacy_policy": "Privacy Policy",
  "/faqs": "FAQs",
  "/sitemap": "Sitemap",
  "/refresh-rings": "Refresh Rings",
};

export const CDP_EVENT_TYPES = {
  PAGE_VIEW: "Page_view",
  CLICK: "Click",
  SELECT: "Select",
  ONLOAD: "On Load",
  VIEW: "View",
};

export const CDP_EVENT_SUB_TYPES = {
  // Landing Page Events
  LANDING_PAGE_LOAD_FROM_WA: "LandingPage_Load_fromWA",
  LANDING_PAGE_LOAD: "LandingPage_Load",

  // Authentication Events
  SUBMIT_REG: "Submit_Reg",
  LOGIN: "Login",
  LOGOUT: "Logout",

  // Consent Events
  CONSENT_PUSH: "Consent_Push",

  // Language Events
  CHANGE_LANGUAGE: "Change_Language",

  // Social Media Events
  FOLLOW_JIAB_TWITTER: "Follow_JIAB_Twitter",
  FOLLOW_JIAB_FB: "Follow_JIAB_FB",
  FOLLOW_JIAB_WA: "Follow_JIAB_WA",
  FOLLOW_JIAB_INSTA: "Follow_JIAB_Insta",
  FOLLOW_JIAB_YT: "Follow_JIAB_YT",

  // Reaction Events
  HAHA_REACTION: "Haha_Reaction",
  MEH_REACTION: "Meh_Reaction",
  GRR_REACTION: "Grr_Reaction",

  // Surprise Me Events
  SURPRISE_ME: "Surprise_Me",
  SURPRISE_ME_LOCKED: "Surprise_Me_Popup_Locked",
  SURPRISE_ME_POPUP_OPENED: "Surprise_Me_Popup_Unlocked",

  // Referral Events
  REFER_FRIEND: "Refer_Friend",
  USE_INVITE_CODE: "Use_Invite_Code",
  REFERRAL_COMPLETED: "Referral_Completed",

  // UGC Events
  INTEREST_UGC_SUBMISSION: "Interest_UGC_Submission",
  SUBMIT_AUDIO_JOKE: "Submit_Audio_Joke",
  SUBMIT_VIDEO_JOKE: "Submit_Video_Joke",
  SUBMIT_IMAGE_JOKE: "Submit_Image_Joke",
  SUBMIT_TEXT_JOKE: "Submit_Text_Joke",

  // Joke Events
  PULL_JOKE: "Pull_Joke",
  VIEW_JOKE: "View",
  VOTE_JOKE: "vote",

  // UGC Filter Events
  UGC_FILTER: "UGC",

  // Report Events
  JOKE_REPORTED: "Joke_Reported",

  // Profile Events
  EDIT_PROFILE: "Edit_Profile",
  ADD_ADDRESS: "Add_Address",
  UPDATE_ADDRESS: "Update_Address",

  // Transaction Events
  SUBMIT_TRANSACTION_CODE: "Submit_Transaction_Code",

  // Scroll & LOL Events
  SCROLL_LOL_HAHA: "Scroll_LOL_Haha_Reaction",
  SCROLL_LOL_MEH: "Scroll_LOL_Meh_Reaction",
  SCROLL_LOL_GRR: "Scroll_LOL_Grr_Reaction",
  SCROLL_LOL_VIEW: "Scroll_LOL_View",

  // Referral
  REFERRAL_CLICK: "Referral_Initiated",

  // Genre (Pick your mood)
  GENRE_CLICK: "Genre_Preference_Selected",
  REPORT_JOKES: "Ugc_Joke_Reported"
};

export const createAlloyPayLoad = ({
  eventType,
  eventSubType,
  hashedKocid = "",
  languageCode = "en",
  webPageName,
  survey = null,
  webInteractionURL,
  previousPath = "",
}: CreatePayLoadProps) => {
  if (window !== undefined) {
    // Normalize event type to match TSD names used by Alloy
    const newHashKocID = localStorage.getItem(LOCAL_STORAGE_KEYS.KOCID) ?? "";
    const normalizedEventType =
      eventType === "Click"
        ? LinkClicks
        : eventType === "Page_view"
        ? PageView
        : eventType; // already specific constant (e.g., LinkClicks/PageView)

    const isClickEvent = normalizedEventType === LinkClicks;
    const isPageViewEvent = normalizedEventType === PageView;
    const isLanguageChangeEvent = eventSubType === CDP_EVENT_SUB_TYPES.CHANGE_LANGUAGE;
    
    // Determine interaction type
    const getWebInteractionType = (): string => {
      const lowerSubType = (eventSubType || "").toLowerCase();
      
      if (lowerSubType.startsWith("follow_jiab_")) {
        return "social";
      }
      
      if (webInteractionURL && typeof window !== 'undefined') {
        try {
          const currentDomain = window.location.hostname;
          const interactionUrl = new URL(webInteractionURL);
          if (interactionUrl.hostname !== currentDomain) {
            return "exit";
          }
        } catch (e) {}
      }
      
      return "other";
    };
    
    // Format social media names
    const getSocialMediaName = (subType: string): string => {
      const lowerSubType = (subType || "").toLowerCase();
      
      if (lowerSubType.startsWith("follow_jiab_")) {
        if (lowerSubType.includes("insta")) return "Instagram";
        if (lowerSubType.includes("fb") || lowerSubType.includes("facebook"))
          return "Facebook";
        if (lowerSubType.includes("yt") || lowerSubType.includes("youtube"))
          return "YouTube";
        if (lowerSubType.includes("wa") || lowerSubType.includes("whatsapp"))
          return "WhatsApp";
        if (lowerSubType.includes("twitter")) return "Twitter";
      }
      
      // For vote events with format "vote_{jokeId}_{jokeName}", return only "Vote"
      if (lowerSubType.startsWith("vote_")) {
        // const parts = (subType || "").split("_");
        // if (parts.length >= 2) {
        //   const jokeId = parts[1];
        //   const jokeName = parts.slice(2).join(" ");
        //   return jokeName ? `Vote, ${jokeName}, ${jokeId}` : `Vote, ${jokeId}`;
        // }
        return "Vote";
      }
      
      return (subType || "").replace(/_/g, " ").trim();
    };
    
    const formattedInteractionName = getSocialMediaName(eventSubType);

    return {
      personalization: {
        includeRenderedPropositions: true
      },
      xdm: {
        eventType: normalizedEventType,
        _cocacola: {
          brand: "Sprite",
          ...(survey && {
            survey: survey,
          }),
          ...(newHashKocID &&
            newHashKocID !== "" && {
              Identities: {
                hashedKocid: newHashKocID,
              },
            }),

          customAttributes: {
            country: "IN",
            language: languageCode,
          },
        },
        web: {
          webReferrer: {
            URL: previousPath 
              ? `${window.location.origin}${previousPath}` 
              : (document.referrer || window.location.origin),
          },
          webPageDetails: {
            name: webPageName,
            server: window.location.hostname,
            URL: window.location.href,
            ...(isPageViewEvent && {
              pageViews: {
                value: 1,
              },
            }),
          },
          ...(eventSubType !== "" && {
            webInteraction: {
              name: isLanguageChangeEvent ? "selected" : isClickEvent ? formattedInteractionName : eventSubType,
              URL: webInteractionURL || window.location.href,
              type: getWebInteractionType(),
              ...(isClickEvent && {
                linkClicks: { value: 1 },
              }),
            },
          }),
        },
        environment: {
          domain: window.location.hostname,
        },
        ...(newHashKocID &&
          newHashKocID !== "" && {
            identityMap: {
              hashedKocid: [
                {
                  id: newHashKocID,
                  authenticatedState: "authenticated",
                  primary: false,
                },
              ],
            },
          }),
      },
    };
  }
};
