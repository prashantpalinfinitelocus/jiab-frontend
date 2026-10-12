/**
 * GTM DataLayer Push Functions
 * Following Adobe Target Web SDK Integration Guide
 * 
 * Events: page_view_target, link_click_target
 * GTM will read these variables and construct XDM payload
 */

export interface PageViewDataLayerEvent {
  event: 'page_view_target';
  hashedKocid: string;
  brand: string;
  country: string;
  language: string;
  campaignName: string;
  pageName: string;
  server: string;
  pageURL: string;
  domain: string;
}

export interface LinkClickDataLayerEvent {
  event: 'link_click_target';
  hashedKocid: string;
  brand: string;
  country: string;
  language: string;
  campaignName: string;
  domain: string;
  surveyName: string;
  surveyAnswers: string;
  surveyQuestions: string;
  linkName: string;
  linkURL: string;
  linkType: string;
}

/**
 * Push Page View event to dataLayer
 * GTM will fire Adobe Web SDK tag with XDM payload
 */
export const pushPageViewToDataLayer = (data: {
  hashedKocid?: string;
  brand?: string;
  country?: string;
  language?: string;
  campaignName?: string;
  pageName?: string;
  server?: string;
  pageURL?: string;
  domain?: string;
}) => {
  if (typeof window === 'undefined') return;

  window.dataLayer = window.dataLayer || [];
  
  const event: PageViewDataLayerEvent = {
    event: 'page_view_target',
    hashedKocid: data.hashedKocid || '',
    brand: data.brand || 'Sprite',
    country: data.country || 'IN',
    language: data.language || 'en',
    campaignName: data.campaignName || '',
    pageName: data.pageName || '',
    server: data.server || window.location.hostname,
    pageURL: data.pageURL || window.location.href,
    domain: data.domain || window.location.hostname,
  };

  window.dataLayer.push(event);
  
  console.log('📊 DataLayer Page View:', event);
};

/**
 * Push Link Click event to dataLayer
 * GTM will fire Adobe Web SDK tag with XDM payload
 */
export const pushLinkClickToDataLayer = (data: {
  hashedKocid?: string;
  brand?: string;
  country?: string;
  language?: string;
  campaignName?: string;
  domain?: string;
  surveyName?: string;
  surveyAnswers?: string;
  surveyQuestions?: string;
  linkName?: string;
  linkURL?: string;
  linkType?: string;
}) => {
  if (typeof window === 'undefined') return;

  window.dataLayer = window.dataLayer || [];
  
  const event: LinkClickDataLayerEvent = {
    event: 'link_click_target',
    hashedKocid: data.hashedKocid || '',
    brand: data.brand || 'Sprite',
    country: data.country || 'IN',
    language: data.language || 'en',
    campaignName: data.campaignName || '',
    domain: data.domain || window.location.hostname,
    surveyName: data.surveyName || '',
    surveyAnswers: data.surveyAnswers || '',
    surveyQuestions: data.surveyQuestions || '',
    linkName: data.linkName || '',
    linkURL: data.linkURL || window.location.href,
    linkType: data.linkType || 'other',
  };

  window.dataLayer.push(event);
  
  console.log('📊 DataLayer Link Click:', event);
};

/**
 * Helper: Determine link type for GTM
 */
export const determineLinkType = (
  eventSubType: string,
  webInteractionURL?: string
): string => {
  const lowerSubType = (eventSubType || '').toLowerCase();
  
  // Social media links
  if (lowerSubType.startsWith('follow_jiab_')) {
    return 'social';
  }
  
  // Exit links (external domains)
  if (webInteractionURL && typeof window !== 'undefined') {
    try {
      const currentDomain = window.location.hostname;
      const interactionUrl = new URL(webInteractionURL);
      if (interactionUrl.hostname !== currentDomain) {
        return 'exit';
      }
    } catch (e) {
      // Invalid URL, treat as other
    }
  }
  
  return 'other';
};

/**
 * Helper: Format link name for GTM
 * Handles special cases like social media and vote events
 */
export const formatLinkName = (eventSubType: string): string => {
  const lowerSubType = (eventSubType || '').toLowerCase();
  
  // Social media formatting
  if (lowerSubType.startsWith('follow_jiab_')) {
    if (lowerSubType.includes('insta')) return 'Instagram';
    if (lowerSubType.includes('fb') || lowerSubType.includes('facebook')) return 'Facebook';
    if (lowerSubType.includes('yt') || lowerSubType.includes('youtube')) return 'YouTube';
    if (lowerSubType.includes('wa') || lowerSubType.includes('whatsapp')) return 'WhatsApp';
    if (lowerSubType.includes('twitter')) return 'Twitter';
  }
  
  // Vote events - return just "Vote"
  if (lowerSubType.startsWith('vote_')) {
    return 'Vote';
  }
  
  // Default: Replace underscores with spaces and capitalize
  return (eventSubType || '').replace(/_/g, ' ').trim();
};
