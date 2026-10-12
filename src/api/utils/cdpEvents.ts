import { CDP_CLIENT_ID } from "@/config";

// CDP Event Types
export const CDP_EVENT_TYPES = {
  PAGE_VIEW: "Page_view",
  CLICK: "Click",
  SELECT: "Select",
  ONLOAD: "On Load",
} as const;

export const QUESTION_ID_ANSWER_MAPPING: Record<number, string> = {
  308: "Consume_Monthly",
  309: "Consume_Occasional",
  310: "Consume_Never",
  311: "Consume_Weekly",
  312: "ConsiderNextTime_4",
  313: "ConsiderNextTime_3",
  314: "ConsiderNextTime_2",
  315: "ConsiderNextTime_1",
  316: "BrandPerception_3",
  317: "BrandPerception_2",
  318: "BrandPerception_1",
  319: "BrandPerception_0",
  320: "BrandPerception_-1",
  321: "BrandPerception_-2",
  322: "BrandPerception_-3",
};

// CDP Event Sub Types
export const CDP_EVENT_SUB_TYPES = {
  // Landing Page Events
  LANDING_PAGE_LOAD_FROM_WA: "LandingPage_Load_fromWA",
  LANDING_PAGE_LOAD: "LandingPage_Load",

  // Authentication Events
  SUBMIT_REG: "Submit_Reg",
  LOGIN: "Login",

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
  VIEW_JOKE: "view",
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
  SCROLL_LOL_HAHA: "Haha_Reaction",
  SCROLL_LOL_MEH: "Meh_Reaction",
  SCROLL_LOL_GRR: "Grr_Reaction",
  SCROLL_LOL_VIEW: "View",
} as const;

// Progressive Profiling & Buy Now Event Sub Types
export const PROGRESSIVE_PROFILING_SUB_TYPES = {
  BOTTLE_COUNT_SKIP: "ConsumptionCount_Skip",
  GENRE_PREFERENCE_SKIP: "ComedyGenrePreference_Skip",
  DAYPART_SKIP: "ConsumptionDaypartPreference_Skip",
  BUY_NOW: "Buy_Now",
} as const;

// Profiling – Bottle Count (Q1): slider value (1-6, where 6 = "6+") -> event_sub_type
export const BOTTLE_COUNT_SUB_TYPE_BY_COUNT: Record<number, string> = {
  1: "ConsumptionCount_1",
  2: "ConsumptionCount_2",
  3: "ConsumptionCount_3",
  4: "ConsumptionCount_4",
  5: "ConsumptionCount_5",
  6: "ConsumptionCount_6Plus",
};
export const MAX_BOTTLE_COUNT = 6;

// Normalizes free-text option labels (CMS copy, UI keys) for lookup: lowercase, no spaces
export const normalizeProfilingOptionKey = (value: string): string =>
  (value || "").trim().toLowerCase().replace(/\s+/g, "");

// Profiling – Humor/Genre Preference (Q2): CMS-driven option text -> event_sub_type
export const GENRE_PREFERENCE_SUB_TYPE_BY_GENRE: Record<string, string> = {
  cricket: "ComedyGenrePreference_Cricket",
  animals: "ComedyGenrePreference_Animals",
  foods: "ComedyGenrePreference_Foods",
  food: "ComedyGenrePreference_Foods",
  wedding: "ComedyGenrePreference_Wedding",
  college: "ComedyGenrePreference_College",
  office: "ComedyGenrePreference_Office",
  family: "ComedyGenrePreference_Family",
  friends: "ComedyGenrePreference_Friends",
  finance: "ComedyGenrePreference_Finance",
  childhood: "ComedyGenrePreference_Childhood",
  relationship: "ComedyGenrePreference_Relationship",
  relationships: "ComedyGenrePreference_Relationship",
  self: "ComedyGenrePreference_Self",
  adulting: "ComedyGenrePreference_Adulting",
  observation: "ComedyGenrePreference_Observation",
};

// Profiling – Daypart Preference (Q3): option index sorted by display_order -> event_sub_type
export const DAYPART_SUB_TYPE_BY_INDEX: string[] = [
  "ConsumptionDaypartPreference_Morning",
  "ConsumptionDaypartPreference_Noon",
  "ConsumptionDaypartPreference_Evening",
];

// Buy Now: UI partner key / CMS title -> canonical CDP partner_name
export const BUY_NOW_PARTNER_NAME_MAP: Record<string, string> = {
  amazon: "amazon",
  blinkit: "blinkit",
  swiggy: "instamart",
  instamart: "instamart",
  bb: "bigbasket",
  bigbasket: "bigbasket",
  flipkart: "flipkart",
};

// Social Media Platforms
export const SOCIAL_MEDIA_PLATFORMS = {
  TWITTER: "Twitter",
  FACEBOOK: "Facebook",
  WHATSAPP: "WhatsApp",
  INSTAGRAM: "Instagram",
  YOUTUBE: "YouTube",
} as const;

// Language Codes
export const LANGUAGE_CODES = {
  ENGLISH: "EN",
  HINDI: "HI",
} as const;

// Joke Categories
export const JOKE_CATEGORIES = {
  WEDDING: "Wedding",
  FOOD: "Food",
  TRAFFIC: "Traffic",
} as const;

// Joke Formats
export const JOKE_FORMATS = {
  AUDIO: "Audio",
  VIDEO: "Video",
  IMAGE: "Image",
  TEXT: "Text",
} as const;

// Communication Preferences
export const COMMUNICATION_PREFERENCES = {
  SMS_MESSAGE: "communication_preferences/sms_message",
  PHONE_CALL: "communication_preferences/phone_call",
  EMAIL: "communication_preferences/email",
  WHATSAPP: "communication_preferences/whatsapp",
} as const;

// Base CDP Event Payload Interface
export interface BaseCDPEventPayload {
  event_type: string;
  event_sub_type: string;
  brand_name: string;
  ip_address?: string;
  phone_e164?: string;
  email?: string;
}

export enum ReactionType {
  HAHA = "haha",
  MEH = "meh",
  GRR = "grr",
}

// Helper function to convert from types ReactionType to CDP ReactionType
export const convertReactionType = (reactionType: string): ReactionType => {
  switch (reactionType) {
    case "laugh":
      return ReactionType.HAHA;
    case "neutral":
      return ReactionType.MEH;
    case "sad":
      return ReactionType.GRR;
    default:
      return ReactionType.HAHA;
  }
};

// Extended CDP Event Payload Interfaces
export interface LandingPageCDPEventPayload extends BaseCDPEventPayload {
  phone_e164?: string;
  email?: string;
  geo_country_code?: string;
  geo_state_province_code?: string;
  geo_city_name?: string;
  geo_postal_code?: string;
  referrer?: string;
}

export interface RegistrationCDPEventPayload extends BaseCDPEventPayload {
  email: string;
  first_name: string;
  targeting_age_from: string;
  [COMMUNICATION_PREFERENCES.SMS_MESSAGE]: number;
  [COMMUNICATION_PREFERENCES.PHONE_CALL]: number;
  [COMMUNICATION_PREFERENCES.EMAIL]: number;
  [COMMUNICATION_PREFERENCES.WHATSAPP]: number;
  geo_country_code: string;
  geo_state_province_code: string;
  geo_city_name: string;
  geo_postal_code: string;
}

export interface LoginCDPEventPayload extends BaseCDPEventPayload {
  geo_country_code: string;
  geo_state_province_code: string;
  geo_city_name: string;
  geo_postal_code: string;
}

export interface LanguageCDPEventPayload extends BaseCDPEventPayload {
  language_code: string;
}

export type SocialMediaCDPEventPayload = BaseCDPEventPayload;

export interface ReactionCDPEventPayload extends BaseCDPEventPayload {
  joke_id?: string;
}

export interface UGCSubmissionCDPEventPayload extends BaseCDPEventPayload {
  language_code: string;
  first_name: string;
}

export type JokeCategoryCDPEventPayload = BaseCDPEventPayload;

export interface UGCFilterCDPEventPayload extends BaseCDPEventPayload {
  language_code: string;
}

export type ReferralCompletedCDPEventPayload = BaseCDPEventPayload;

export interface AddressCDPEventPayload extends BaseCDPEventPayload {
  address_line1: string;
  address_line2: string;
  address_city: string;
  address_state: string;
  geo_postal_code: string;
}

export interface ProfileCDPEventPayload extends BaseCDPEventPayload {
  first_name: string;
  email: string;
  dob: string;
  gender: string;
}

export interface QuestionCDPPayload extends BaseCDPEventPayload {}

export interface TransactionCodeCDPEventPayload extends BaseCDPEventPayload {}

// Progressive Profiling & Buy Now Events
// NOTE: these payloads carry ONLY brand_name, event_sub_type, event_type,
// phone_e164 (and partner_name for Buy Now) — no client_id/email/ip_address —
// per the approved sample payload spec. Do not add fields here without re-confirming.
export interface ProgressiveProfilingCDPEventPayload extends BaseCDPEventPayload {}

export interface BuyNowCDPEventPayload extends ProgressiveProfilingCDPEventPayload {
  partner_name: string;
}

// CDP Event Payload Builders
export class CDPEventPayloadBuilder {
  private static instance: CDPEventPayloadBuilder;
  private static readonly CLIENT_ID = CDP_CLIENT_ID;
  private static readonly BRAND_NAME = "Sprite";

  public static getInstance(): CDPEventPayloadBuilder {
    if (!CDPEventPayloadBuilder.instance) {
      CDPEventPayloadBuilder.instance = new CDPEventPayloadBuilder();
    }
    return CDPEventPayloadBuilder.instance;
  }

  private static getBasePayload(
    eventType: string,
    eventSubType: string,
    phoneNumber: string,
    email: string
  ): BaseCDPEventPayload {
    return {
      event_type: eventType,
      event_sub_type: eventSubType,
      brand_name: this.BRAND_NAME,
      phone_e164: `+91${phoneNumber}`,
      email: email,
    };
  }

  // Landing Page Events
  public static buildLandingPageFromWAPayload(data: {
    geo_country_code?: string;
    geo_state_province_code?: string;
    geo_city_name?: string;
    geo_postal_code?: string;
    referrer?: string;
    ip_address?: string;
    phone_e164: string;
    email: string;
  }): LandingPageCDPEventPayload {
    return {
      ...this.getBasePayload(
        CDP_EVENT_TYPES.PAGE_VIEW,
        CDP_EVENT_SUB_TYPES.LANDING_PAGE_LOAD_FROM_WA,
        data.phone_e164,
        data.email
      ),
      ...data,
    };
  }

  public static buildLandingPagePayload(data: {
    geo_country_code?: string;
    geo_state_province_code?: string;
    geo_city_name?: string;
    geo_postal_code?: string;
    ip_address?: string;
    phone_e164: string;
    email: string;
  }): LandingPageCDPEventPayload {
    return {
      ...this.getBasePayload(
        CDP_EVENT_TYPES.PAGE_VIEW,
        CDP_EVENT_SUB_TYPES.LANDING_PAGE_LOAD,
        data.phone_e164,
        data.email
      ),
      geo_country_code: data.geo_country_code,
      geo_state_province_code: data.geo_state_province_code,
      geo_city_name: data.geo_city_name,
      geo_postal_code: data.geo_postal_code,
      ip_address: data.ip_address,
    };
  }

  // Registration Event
  public static buildRegistrationPayload(data: {
    first_name: string;
    geo_country_code: string;
    geo_state_province_code: string;
    geo_city_name: string;
    geo_postal_code: string;
    ip_address?: string;
    phone_e164: string;
    email: string;
  }): RegistrationCDPEventPayload {
    return {
      ...this.getBasePayload(
        CDP_EVENT_TYPES.CLICK,
        CDP_EVENT_SUB_TYPES.SUBMIT_REG,
        data.phone_e164,
        data.email
      ),
      email: data.email,
      first_name: data.first_name,
      targeting_age_from: "18",
      [COMMUNICATION_PREFERENCES.SMS_MESSAGE]: 1,
      [COMMUNICATION_PREFERENCES.PHONE_CALL]: 1,
      [COMMUNICATION_PREFERENCES.EMAIL]: 1,
      [COMMUNICATION_PREFERENCES.WHATSAPP]: 1,
      geo_country_code: data.geo_country_code,
      geo_state_province_code: data.geo_state_province_code,
      geo_city_name: data.geo_city_name,
      geo_postal_code: data.geo_postal_code,
      ip_address: data.ip_address,
    };
  }

  // Login Event
  public static buildLoginPayload(data: {
    phone_e164: string;
    geo_country_code: string;
    geo_state_province_code: string;
    geo_city_name: string;
    geo_postal_code: string;
    email: string;
    ip_address?: string;
  }): LoginCDPEventPayload {
    return {
      ...this.getBasePayload(
        CDP_EVENT_TYPES.CLICK,
        CDP_EVENT_SUB_TYPES.LOGIN,
        data.phone_e164,
        data.email
      ),
      geo_country_code: data.geo_country_code,
      geo_state_province_code: data.geo_state_province_code,
      geo_city_name: data.geo_city_name,
      geo_postal_code: data.geo_postal_code,
      ip_address: data.ip_address,
    };
  }

  // Push Consent Event
  public static buildPushConsentPayload(data: {
    phone_e164: string;
    email: string;
  }): BaseCDPEventPayload {
    return this.getBasePayload(
      CDP_EVENT_TYPES.CLICK,
      CDP_EVENT_SUB_TYPES.CONSENT_PUSH,
      data.phone_e164,
      data.email
    );
  }

  // Language Change Event
  public static buildLanguageChangePayload(
    languageCode: string,
    phone_e164: string,
    email: string
  ): LanguageCDPEventPayload {
    return {
      ...this.getBasePayload(
        CDP_EVENT_TYPES.SELECT,
        CDP_EVENT_SUB_TYPES.CHANGE_LANGUAGE,
        phone_e164,
        email
      ),
      language_code: languageCode,
    };
  }

  // Social Media Events
  public static buildSocialMediaPayload(
    eventSubType: string,
    phone_e164: string,
    email: string
  ): SocialMediaCDPEventPayload {
    return {
      ...this.getBasePayload(
        CDP_EVENT_TYPES.CLICK,
        eventSubType,
        phone_e164,
        email
      ),
    };
  }

  // Reaction Events
  public static buildReactionPayload(
    jokeId: string,
    reactionType: string,
    phone_e164: string,
    email: string
  ): ReactionCDPEventPayload {
    const cdpReactionType = convertReactionType(reactionType);
    const eventSubTypeMap = {
      [ReactionType.HAHA]: `${CDP_EVENT_SUB_TYPES.HAHA_REACTION}_${jokeId}`,
      [ReactionType.MEH]: `${CDP_EVENT_SUB_TYPES.MEH_REACTION}_${jokeId}`,
      [ReactionType.GRR]: `${CDP_EVENT_SUB_TYPES.GRR_REACTION}_${jokeId}`,
    };

    return {
      ...this.getBasePayload(
        CDP_EVENT_TYPES.CLICK,
        eventSubTypeMap[cdpReactionType],
        phone_e164,
        email
      ),
    };
  }

  // Surprise Me Event
  public static buildSurpriseMePayload(
    phone_e164: string,
    email: string
  ): BaseCDPEventPayload {
    return this.getBasePayload(
      CDP_EVENT_TYPES.CLICK,
      CDP_EVENT_SUB_TYPES.SURPRISE_ME,
      phone_e164,
      email
    );
  }

  // Referral Events
  public static buildReferFriendPayload(
    phone_e164: string,
    email: string
  ): BaseCDPEventPayload {
    return this.getBasePayload(
      CDP_EVENT_TYPES.CLICK,
      CDP_EVENT_SUB_TYPES.REFER_FRIEND,
      phone_e164,
      email
    );
  }

  public static buildUseInviteCodePayload(
    phone_e164: string,
    email: string
  ): BaseCDPEventPayload {
    return this.getBasePayload(
      CDP_EVENT_TYPES.CLICK,
      CDP_EVENT_SUB_TYPES.USE_INVITE_CODE,
      phone_e164,
      email
    );
  }

  public static buildReferralCompletedPayload(
    phoneNumber: string,
    phone_e164: string,
    email: string
  ): ReferralCompletedCDPEventPayload {
    return {
      ...this.getBasePayload(
        CDP_EVENT_TYPES.CLICK,
        `${CDP_EVENT_SUB_TYPES.REFERRAL_COMPLETED}_${phoneNumber}`,
        phone_e164,
        email
      ),
    };
  }

  // UGC Events
  public static buildUGCInterestPayload(
    phone_e164: string,
    email: string
  ): BaseCDPEventPayload {
    return this.getBasePayload(
      CDP_EVENT_TYPES.CLICK,
      CDP_EVENT_SUB_TYPES.INTEREST_UGC_SUBMISSION,
      phone_e164,
      email
    );
  }

  public static buildUGCSubmissionPayload(data: {
    format: string;
    languageCode: string;
    firstName: string;
    phone_e164: string;
    email: string;
  }): UGCSubmissionCDPEventPayload {
    const eventSubTypeMap = {
      [JOKE_FORMATS.AUDIO]: `${CDP_EVENT_SUB_TYPES.SUBMIT_AUDIO_JOKE}_Language_Genre`,
      [JOKE_FORMATS.VIDEO]: `${CDP_EVENT_SUB_TYPES.SUBMIT_VIDEO_JOKE}_Language_Genre`,
      [JOKE_FORMATS.IMAGE]: `${CDP_EVENT_SUB_TYPES.SUBMIT_IMAGE_JOKE}_Language_Genre`,
      [JOKE_FORMATS.TEXT]: `${CDP_EVENT_SUB_TYPES.SUBMIT_TEXT_JOKE}_Language_Genre`,
    };

    return {
      ...this.getBasePayload(
        CDP_EVENT_TYPES.CLICK,
        eventSubTypeMap[data.format as keyof typeof eventSubTypeMap],
        data.phone_e164,
        data.email
      ),
      language_code: data.languageCode.toUpperCase(),
      first_name: data.firstName,
    };
  }

  // Joke Events
  public static buildPullJokePayload(
    category: string,
    phone_e164: string,
    email: string
  ): JokeCategoryCDPEventPayload {
    return {
      ...this.getBasePayload(
        CDP_EVENT_TYPES.CLICK,
        `${CDP_EVENT_SUB_TYPES.PULL_JOKE}_${category}`,
        phone_e164,
        email
      ),
    };
  }

  public static buildViewJokePayload(
    jokeId: string,
    phone_e164: string,
    email: string
  ): ReactionCDPEventPayload {
    return {
      ...this.getBasePayload(
        CDP_EVENT_TYPES.CLICK,
        `${CDP_EVENT_SUB_TYPES.VIEW_JOKE}_${jokeId}`,
        phone_e164,
        email
      ),
    };
  }

  public static buildVoteJokePayload(
    jokeId: string,
    phone_e164: string,
    email: string
  ): ReactionCDPEventPayload {
    return {
      ...this.getBasePayload(
        CDP_EVENT_TYPES.CLICK,
        `${CDP_EVENT_SUB_TYPES.VOTE_JOKE}_${jokeId}`,
        phone_e164,
        email
      ),
    };
  }

  // UGC Filter Event
  public static buildUGCFilterPayload(
    languageCode: string,
    phone_e164: string,
    email: string,
    language?: string,
    category?: string
  ): UGCFilterCDPEventPayload {
    return {
      ...this.getBasePayload(
        CDP_EVENT_TYPES.CLICK,
        `${CDP_EVENT_SUB_TYPES.UGC_FILTER}_${language ?? ""}_${category ?? ""}`,
        phone_e164,
        email
      ),
      language_code: languageCode.toUpperCase() ?? "",
    };
  }

  // Report Event
  public static buildJokeReportedPayload(
    phone_e164: string,
    email: string
  ): BaseCDPEventPayload {
    return this.getBasePayload(
      CDP_EVENT_TYPES.ONLOAD,
      CDP_EVENT_SUB_TYPES.JOKE_REPORTED,
      phone_e164,
      email
    );
  }

  // Profile Events
  public static buildEditProfilePayload(data: {
    first_name: string;
    email: string;
    dob: string;
    gender: string;
    phone_e164: string;
  }): ProfileCDPEventPayload {
    return {
      ...this.getBasePayload(
        CDP_EVENT_TYPES.CLICK,
        CDP_EVENT_SUB_TYPES.EDIT_PROFILE,
        data.phone_e164,
        data.email
      ),
      first_name: data.first_name,
      email: data.email,
      dob: data.dob,
      gender: data.gender,
    };
  }

  // Address Events
  public static buildAddAddressPayload(data: {
    address_line1: string;
    address_line2: string;
    address_city: string;
    address_state: string;
    geo_postal_code: string;
    phone_e164: string;
    email: string;
  }): AddressCDPEventPayload {
    return {
      ...this.getBasePayload(
        CDP_EVENT_TYPES.CLICK,
        CDP_EVENT_SUB_TYPES.ADD_ADDRESS,
        data.phone_e164,
        data.email
      ),
      address_line1: data.address_line1,
      address_line2: data.address_line2,
      address_city: data.address_city,
      address_state: data.address_state,
      geo_postal_code: data.geo_postal_code,
    };
  }

  public static buildUpdateAddressPayload(data: {
    address_line1: string;
    address_line2: string;
    address_city: string;
    address_state: string;
    geo_postal_code: string;
    phone_e164: string;
    email: string;
  }): AddressCDPEventPayload {
    return {
      ...this.getBasePayload(
        CDP_EVENT_TYPES.CLICK,
        CDP_EVENT_SUB_TYPES.UPDATE_ADDRESS,
        data.phone_e164,
        data.email
      ),
      address_line1: data.address_line1,
      address_line2: data.address_line2,
      address_city: data.address_city,
      address_state: data.address_state,
      geo_postal_code: data.geo_postal_code,
    };
  }

  // Consumption Question Events
  public static buildQuestionPayload(
    optionId: number,
    phoneNumber: string,
    email: string
  ): QuestionCDPPayload {
    const eventSubType = QUESTION_ID_ANSWER_MAPPING[optionId];
    return {
      ...this.getBasePayload(
        CDP_EVENT_TYPES.CLICK,
        eventSubType,
        phoneNumber,
        email
      ),
    };
  }

  // Transaction Code Event
  public static buildTransactionCodePayload(
    phoneNumber: string,
    email: string
  ): TransactionCodeCDPEventPayload {
    return {
      ...this.getBasePayload(
        CDP_EVENT_TYPES.CLICK,
        CDP_EVENT_SUB_TYPES.SUBMIT_TRANSACTION_CODE,
        phoneNumber,
        email
      ),
    };
  }

  // Scroll & LOL Events
  public static buildScrollLOLReactionPayload(
    jokeId: string,
    reactionType: "haha" | "meh" | "grr",
    phone_e164: string,
    email: string
  ): ReactionCDPEventPayload {
    const eventSubTypeMap = {
      haha: `${CDP_EVENT_SUB_TYPES.SCROLL_LOL_HAHA}${jokeId}`,
      meh: `${CDP_EVENT_SUB_TYPES.SCROLL_LOL_MEH}${jokeId}`,
      grr: `${CDP_EVENT_SUB_TYPES.SCROLL_LOL_GRR}${jokeId}`,
    };

    return {
      ...this.getBasePayload(
        CDP_EVENT_TYPES.CLICK,
        eventSubTypeMap[reactionType],
        phone_e164,
        email
      ),
    };
  }

  public static buildScrollLOLViewPayload(
    jokeId: string,
    phone_e164: string,
    email: string
  ): ReactionCDPEventPayload {
    return {
      ...this.getBasePayload(
        CDP_EVENT_TYPES.CLICK,
        `${CDP_EVENT_SUB_TYPES.SCROLL_LOL_VIEW}${jokeId}`,
        phone_e164,
        email
      ),
    };
  }

  // Progressive Profiling & Buy Now Events — dedicated minimal base payload
  // (intentionally does NOT reuse getBasePayload: no client_id/email/ip_address is sent)
  private static getProgressiveProfilingBasePayload(
    eventSubType: string,
    phoneNumber: string
  ): ProgressiveProfilingCDPEventPayload {
    return {
      event_type: CDP_EVENT_TYPES.CLICK,
      event_sub_type: eventSubType,
      brand_name: this.BRAND_NAME,
      phone_e164: `+91${phoneNumber}`,
    };
  }

  // Profiling – Bottle Count (Q1)
  public static buildBottleCountPayload(
    bottleCount: number,
    phoneNumber: string
  ): ProgressiveProfilingCDPEventPayload {
    const eventSubType =
      BOTTLE_COUNT_SUB_TYPE_BY_COUNT[bottleCount] ??
      BOTTLE_COUNT_SUB_TYPE_BY_COUNT[MAX_BOTTLE_COUNT];
    return this.getProgressiveProfilingBasePayload(eventSubType, phoneNumber);
  }

  public static buildBottleCountSkipPayload(
    phoneNumber: string
  ): ProgressiveProfilingCDPEventPayload {
    return this.getProgressiveProfilingBasePayload(
      PROGRESSIVE_PROFILING_SUB_TYPES.BOTTLE_COUNT_SKIP,
      phoneNumber
    );
  }

  // Profiling – Humor/Genre Preference (Q2)
  public static buildGenrePreferencePayload(
    genreOptionText: string,
    phoneNumber: string
  ): ProgressiveProfilingCDPEventPayload {
    const normalized = normalizeProfilingOptionKey(genreOptionText);
    const eventSubType =
      GENRE_PREFERENCE_SUB_TYPE_BY_GENRE[normalized] ??
      PROGRESSIVE_PROFILING_SUB_TYPES.GENRE_PREFERENCE_SKIP;
    return this.getProgressiveProfilingBasePayload(eventSubType, phoneNumber);
  }

  public static buildGenrePreferenceSkipPayload(
    phoneNumber: string
  ): ProgressiveProfilingCDPEventPayload {
    return this.getProgressiveProfilingBasePayload(
      PROGRESSIVE_PROFILING_SUB_TYPES.GENRE_PREFERENCE_SKIP,
      phoneNumber
    );
  }

  // Profiling – Daypart Preference (Q3)
  public static buildDaypartPreferencePayload(
    optionIndex: number,
    phoneNumber: string
  ): ProgressiveProfilingCDPEventPayload {
    const eventSubType =
      DAYPART_SUB_TYPE_BY_INDEX[optionIndex] ??
      PROGRESSIVE_PROFILING_SUB_TYPES.DAYPART_SKIP;
    return this.getProgressiveProfilingBasePayload(eventSubType, phoneNumber);
  }

  public static buildDaypartPreferenceSkipPayload(
    phoneNumber: string
  ): ProgressiveProfilingCDPEventPayload {
    return this.getProgressiveProfilingBasePayload(
      PROGRESSIVE_PROFILING_SUB_TYPES.DAYPART_SKIP,
      phoneNumber
    );
  }

  // Buy Now – 'Buy Sprite®' CTA Tapped
  public static buildBuyNowPayload(
    partnerKey: string,
    phoneNumber: string
  ): BuyNowCDPEventPayload {
    const normalized = normalizeProfilingOptionKey(partnerKey);
    const partnerName = BUY_NOW_PARTNER_NAME_MAP[normalized] ?? normalized;
    return {
      ...this.getProgressiveProfilingBasePayload(
        PROGRESSIVE_PROFILING_SUB_TYPES.BUY_NOW,
        phoneNumber
      ),
      partner_name: partnerName,
    };
  }
}
