import { TCMSResponse } from "@/api/types/CMSTypes";

export interface ScrollAndLolData {
  scrollAndLolHeading: string;
  scrollAndLolLastPageContent: string;
  scrollAndLolLastPageContentHeading: string;
  scrollAndLolLastPageContentSubheading: string;
  breakingNews: string;
  serialChiller: string;
  exhaustHeading: string;
  exhaustSubheading: string;
  genreHeading: string;
  genreValidation: string;
  genreCtaPrimary: string;
  genreCtaSecondary: string;
  mneHeading: string;
  mneMorning: string;
  mneNoon: string;
  mneEvening: string;
  mneValidation: string;
  mneCtaPrimary: string;
  mneCtaSecondary: string;
  bottleHeading: string;
  bottleValidation: string;
  bottleCtaPrimary: string;
  bottleCtaSecondary: string;
  ctaPendingState: string;
}

export const mapScrollAndLolData = (
  cmsData: TCMSResponse["data"] | null
): ScrollAndLolData => {
  const scrollAndLolCMS = cmsData?.scroll_and_lol;

  return {
    scrollAndLolHeading:
      scrollAndLolCMS?.Scroll_and_LOL_heading ?? "Scroll & LOL",
    scrollAndLolLastPageContent:
      scrollAndLolCMS?.Scroll_and_LOL_lastpage_content ?? "That's all for now!",
    scrollAndLolLastPageContentHeading:
      scrollAndLolCMS?.Scroll_and_LOL_lastpage_content_heading ??
      "You've reached the end",
    scrollAndLolLastPageContentSubheading:
      scrollAndLolCMS?.Scroll_and_LOL_lastpage_content_subheading ??
      "Check back later for more content",
    breakingNews:
      scrollAndLolCMS?.Scroll_and_LOL_lastpage_content_heading ??
      "BREAKING NEWS",
    serialChiller:
      scrollAndLolCMS?.Scroll_and_LOL_lastpage_content_subheading ??
      "We have a 'Serial Chiller' on the loose, and it's you!",
    exhaustHeading:
      scrollAndLolCMS?.exhaust_heading ??
      "You've LOL-ed your way through all our jokes in this language.",
    exhaustSubheading:
      scrollAndLolCMS?.exhaust_sub_heading ??
      "Switch languages to scroll through more HaHa-amazing Jokes!",
    genreHeading: scrollAndLolCMS?.genre_heading ?? "What kind of jokes give you the biggest LOLs?",
    genreValidation: scrollAndLolCMS?.genre_validation ?? "Please select a genre",
    genreCtaPrimary: scrollAndLolCMS?.genre_cta_primary ?? "Submit",
    genreCtaSecondary: scrollAndLolCMS?.genre_cta_secondary ?? "Skip",
    mneHeading: scrollAndLolCMS?.mne_heading ?? "When does Sprite® usually make its way into your day?",
    mneMorning: scrollAndLolCMS?.mne_morning ?? "Morning",
    mneNoon: scrollAndLolCMS?.mne_noon ?? "Noon",
    mneEvening: scrollAndLolCMS?.mne_evening ?? "Evening",
    mneValidation: scrollAndLolCMS?.mne_validation ?? "Select an option",
    mneCtaPrimary: scrollAndLolCMS?.mne_cta_primary ?? "Submit",
    mneCtaSecondary: scrollAndLolCMS?.mne_cta_secondary ?? "Skip",
    bottleHeading: scrollAndLolCMS?.bottle_heading ?? "Quick check: How many Sprite® bottles did you enjoy in the past week?",
    bottleValidation: scrollAndLolCMS?.bottle_validation ?? "Select a number to submit",
    bottleCtaPrimary: scrollAndLolCMS?.bottle_cta_primary ?? "Submit",
    bottleCtaSecondary: scrollAndLolCMS?.bottle_cta_secondary ?? "I’m yet to try Sprite",
    ctaPendingState: scrollAndLolCMS?.cta_pending_state ?? "Submitting...",
  };
};

// Default data for SSR/hydration
export const defaultScrollAndLolData: ScrollAndLolData = {
  scrollAndLolHeading: "Scroll & LOL",
  scrollAndLolLastPageContent: "That's all for now!",
  scrollAndLolLastPageContentHeading: "You've reached the end",
  scrollAndLolLastPageContentSubheading: "Check back later for more content",
  breakingNews: "BREAKING NEWS",
  serialChiller: "We have a 'Serial Chiller' on the loose, and it's you!",
  exhaustHeading:
    "You've LOL-ed your way through all our jokes in this language.",
  exhaustSubheading:
    "Switch languages to scroll through more HaHa-amazing Jokes!",
  genreHeading: "What kind of jokes give you the biggest LOLs?",
  genreValidation: "Please select a genre",
  genreCtaPrimary: "Submit",
  genreCtaSecondary: "Skip",
  mneHeading: "When does Sprite® usually make its way into your day?",
  mneMorning: "Morning",
  mneNoon: "Noon",
  mneEvening: "Evening",
  mneValidation: "Select an option",
  mneCtaPrimary: "Submit",
  mneCtaSecondary: "Skip",
  bottleHeading: "Quick check: How many Sprite® bottles did you enjoy in the past week?",
  bottleValidation: "Select a number to submit",
  bottleCtaPrimary: "Submit",
  bottleCtaSecondary: "I’m yet to try Sprite",
  ctaPendingState: "Submitting...",
};
