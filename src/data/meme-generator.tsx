import { TCMSResponse } from "@/api/types/CMSTypes";

export interface MemeGeneratorData {
  memeBurstHeading: string;
  memeBurstSubheading: string;
  createTabHeading: string;
  createTabSubheading: string;
  createTabPlaceholderText: string;
  createTabFilterInactive: string;
  createTabFilterActive: string;
  createTabAllText: string;
  createTabMemelordText: string;
  createTabCrankyText: string;
  createTabGoofyText: string;
  createTabSadText: string;
  createTabGloomyText: string;
  createTabFunnyText: string;
  createTabBadgeGifText: string;
  createTabBadgeStickerText: string;
  myMemesTabHeading: string;
  createTabEmptyHeading: string;
  createTabEmptySubheading: string;
  myMemesTabSubheading: string;
  myMemesTabShareText: string;
  myMemesTabEmptyHeading: string;
  myMemesTabEmptyCta1: string;
  myMemesTabEmptyCta2: string;
  memeBurstEmptyState: string;
  createMemeSubheading: string;
  createMemeSelectText: string;
  createMemeErrorValidation: string;
  createMemeMaxLimit: string;
  createMemeTopTextPlaceholder: string;
  createMemeBottomTextPlaceholder: string;
  createMemeSubmitText: string;
  memePreviewSubheading: string;
  memePreviewSubmissionText: string;
  memePreviewDisclaimerText: string;
  memePreviewRetryCta: string;
  memePreviewSubmitCta: string;
  memePreviewSubmittingCta: string;
}

export const mapMemeGeneratorData = (
  cmsData: TCMSResponse["data"] | null
): MemeGeneratorData => {
  const memeGeneratorCMS = cmsData?.meme_generator;

  return {
    memeBurstHeading: memeGeneratorCMS?.meme_burst_heading ?? "MEME BURST",
    memeBurstSubheading: memeGeneratorCMS?.meme_burst_subheading ?? "Create the LOL, Rule the Scroll",
    createTabHeading: memeGeneratorCMS?.create_tab_heading ?? "Create",
    createTabSubheading: memeGeneratorCMS?.create_tab_subheading ?? "Select a meme of your own choice 👇",
    createTabPlaceholderText: memeGeneratorCMS?.create_tab_placeholder_text ?? "Find something funny",
    createTabFilterInactive: memeGeneratorCMS?.create_tab_filter_inactive ?? "Filter",
    createTabFilterActive: memeGeneratorCMS?.create_tab_filter_active ?? "Filter (1)",
    createTabAllText: memeGeneratorCMS?.create_tab_all_text ?? "All",
    createTabMemelordText: memeGeneratorCMS?.create_tab_memelord_text ?? "Memelord",
    createTabCrankyText: memeGeneratorCMS?.create_tab_cranky_text ?? "Cranky",
    createTabGoofyText: memeGeneratorCMS?.create_tab_goofy_text ?? "Goofy",
    createTabSadText: memeGeneratorCMS?.create_tab_sad_text ?? "Sad",
    createTabGloomyText: memeGeneratorCMS?.create_tab_gloomy_text ?? "Gloomy",
    createTabFunnyText: memeGeneratorCMS?.create_tab_funny_text ?? "Funny",
    createTabBadgeGifText: memeGeneratorCMS?.create_tab_badge_gif_text ?? "GIF",
    createTabBadgeStickerText: memeGeneratorCMS?.create_tab_badge_sticker_text ?? "Sticker",
    createTabEmptyHeading: memeGeneratorCMS?.create_tab_empty_heading ?? "OOPSIE DAISY!",
    createTabEmptySubheading: memeGeneratorCMS?.create_tab_empty_subheading ?? " is currently out of stock in the humour aisle!",
    myMemesTabHeading: memeGeneratorCMS?.my_memes_tab_heading ?? "My Memes",
    myMemesTabSubheading: memeGeneratorCMS?.my_memes_tab_subheading ?? "Look at your rizz👇",
    myMemesTabShareText: memeGeneratorCMS?.my_memes_tab_share_text ?? "Share",
    myMemesTabEmptyHeading: memeGeneratorCMS?.my_memes_tab_empty_heading ?? "Your meme fridge is empty—time to restock. 🥤",
    myMemesTabEmptyCta1: memeGeneratorCMS?.my_memes_tab_empty_cta_1 ?? "Create Meme",
    myMemesTabEmptyCta2: memeGeneratorCMS?.my_memes_tab_empty_cta_2 ?? "My Memes Tab",
    memeBurstEmptyState: memeGeneratorCMS?.meme_burst_empty_state ?? "Meme Burst Empty State",
    createMemeSubheading: memeGeneratorCMS?.create_meme_subheading ?? "Create Meme",
    createMemeSelectText: memeGeneratorCMS?.create_meme_select_text ?? "Create Meme",
    createMemeErrorValidation: memeGeneratorCMS?.create_meme_error_validation ?? "Create Meme",
    createMemeMaxLimit: memeGeneratorCMS?.create_meme_max_limit ?? "Create Meme",
    createMemeTopTextPlaceholder: memeGeneratorCMS?.create_meme_top_text_placeholder ?? "Create Meme",
    createMemeBottomTextPlaceholder: memeGeneratorCMS?.create_meme_bottom_text_placeholder ?? "Create Meme",
    createMemeSubmitText: memeGeneratorCMS?.create_meme_submit_text ?? "Create Meme",
    memePreviewSubheading: memeGeneratorCMS?.meme_preview_subheading ?? "Meme Preview",
    memePreviewSubmissionText: memeGeneratorCMS?.meme_preview_submission_text ?? "Meme Preview",
    memePreviewDisclaimerText: memeGeneratorCMS?.meme_preview_disclaimer_text ?? "Meme Preview",
    memePreviewRetryCta: memeGeneratorCMS?.meme_preview_retry_cta ?? "Meme Preview",
    memePreviewSubmitCta: memeGeneratorCMS?.meme_preview_submit_cta ?? "Meme Preview",
    memePreviewSubmittingCta: memeGeneratorCMS?.meme_preview_submitting_cta ?? "Meme Preview",
  };
}

export const defaultMemeGeneratorData: MemeGeneratorData = {
  memeBurstHeading: "MEME BURST",
  memeBurstSubheading: "Create the LOL, Rule the Scroll",
  createTabHeading: "Create",
  createTabSubheading: "Select a meme of your own choice 👇",
  createTabPlaceholderText: "Find something funny",
  createTabFilterInactive: "Create Tab",
  createTabFilterActive: "Create Tab",
  createTabAllText: "Create Tab",
  createTabMemelordText: "Create Tab",
  createTabCrankyText: "Create Tab",
  createTabGoofyText: "Create Tab",
  createTabSadText: "Create Tab",
  createTabGloomyText: "Create Tab",
  createTabFunnyText: "Create Tab",
  createTabBadgeGifText: "Create Tab",
  createTabBadgeStickerText: "Create Tab",
  myMemesTabHeading: "My Memes Tab",
  createTabEmptyHeading: "Create Tab",
  createTabEmptySubheading: "Create Tab",
  myMemesTabSubheading: "My Memes Tab",
  myMemesTabShareText: "My Memes Tab",
  myMemesTabEmptyHeading: "My Memes Tab",
  myMemesTabEmptyCta1: "My Memes Tab",
  myMemesTabEmptyCta2: "My Memes Tab",
  memeBurstEmptyState: "Meme Burst Empty State",
  createMemeSubheading: "Create Meme",
  createMemeSelectText: "Create Meme",
  createMemeErrorValidation: "Create Meme",
  createMemeMaxLimit: "Create Meme",
  createMemeTopTextPlaceholder: "Create Meme",
  createMemeBottomTextPlaceholder: "Create Meme",
  createMemeSubmitText: "Create Meme",
  memePreviewSubheading: "Meme Preview",
  memePreviewSubmissionText: "Meme Preview",
  memePreviewDisclaimerText: "Meme Preview",
  memePreviewRetryCta: "Meme Preview",
  memePreviewSubmitCta: "Meme Preview",
  memePreviewSubmittingCta: "Meme Preview",
}