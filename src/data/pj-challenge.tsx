import { TCMSResponse } from '@/api/types/CMSTypes'

export interface PjChallengeData {
  submitYourJokeHeading: string
  submitYourJokeSubheading: string
  selectLanguage: string
  selectLanguageDropbox: string
  selectFormat: string
  image: string
  imageClickableHeading: string
  imageClickableSubHeading: string
  imageClickableSubSubHeading: string
  text: string
  audio: string
  video: string
  textClickableHeading: string
  textClickablePlaceholder: string
  textClickableTextLimit: string
  audioClickableHeading: string
  audioClickableSubheading: string
  videoHeading: string
  videoSubHeading: string
  title: string
  titleJokeTitleTextSpace: string
  titleJokeTitleCharacterLimitText: string
  category: string
  termsAndConditions: string
  submitButtonText: string
  allFieldsAreMandatory: string
  imageFileUploadLimit: string | null
  audioFileUploadLimit: string | null
  videoFileUploadLimit: string | null
  fiveJokesPerDay: string
  imageAlert: string
  audioAlert: string
  videoAlert: string
  retryButton: string
  previewYourSubmission: string
  upload_your_audio: string
  record_your_audio: string
  tap_on_the_mic_start_reco: string
  tap_to_stop_reco: string
  record_again: string
}

export const mapPjChallengeData = (
  cmsData: TCMSResponse['data'] | null
): PjChallengeData => {
  const pjChallengeCMS = cmsData?.pj_challenge

  return {
    submitYourJokeHeading:
      pjChallengeCMS?.submit_your_joke_heading ?? 'Submit Your Joke',
    submitYourJokeSubheading:
      pjChallengeCMS?.submit_your_joke_subheading ??
      'Share your creativity with the world',
    selectLanguage: pjChallengeCMS?.select_language ?? 'Select Language',
    selectLanguageDropbox:
      pjChallengeCMS?.select_language_dropbox ?? 'Choose your language',
    selectFormat: pjChallengeCMS?.select_format ?? 'Select Format',
    image: pjChallengeCMS?.image ?? 'Image',
    imageClickableHeading:
      pjChallengeCMS?.image_clickable_heading ?? 'Upload Image',
    imageClickableSubHeading:
      pjChallengeCMS?.image_clickable_sub_heading ??
      'Choose an image for your joke',
    imageClickableSubSubHeading:
      pjChallengeCMS?.image_clickable_sub_sub_heading ?? 'Max size 5MB',
    text: pjChallengeCMS?.text ?? 'Text',
    audio: pjChallengeCMS?.audio ?? 'Audio',
    video: pjChallengeCMS?.video ?? 'Video',
    textClickableHeading:
      pjChallengeCMS?.text_clickable_heading ?? 'Write Your Joke',
    textClickablePlaceholder:
      pjChallengeCMS?.text_clickable_placeholder ?? 'Enter your joke here...',
    textClickableTextLimit:
      pjChallengeCMS?.text_clickable_text_limit ?? '500 characters max',
    audioClickableHeading:
      pjChallengeCMS?.audio_clickable_heading ?? 'Upload Audio',
    audioClickableSubheading:
      pjChallengeCMS?.audio_clickable_subheading ??
      'Record or upload your joke',
    videoHeading: pjChallengeCMS?.video_heading ?? 'Upload Video',
    videoSubHeading:
      pjChallengeCMS?.video_sub_heading ?? 'Share your video joke',
    title: pjChallengeCMS?.title ?? 'Title',
    titleJokeTitleTextSpace:
      pjChallengeCMS?.title_joketitle_text_space ?? 'Joke Title',
    titleJokeTitleCharacterLimitText:
      pjChallengeCMS?.title_joketitle_character_limittext ??
      'Max 30 character limit',
    category: pjChallengeCMS?.category ?? 'Category',
    termsAndConditions:
      pjChallengeCMS?.terms_and_conditions ??
      'I agree to the Terms & Conditions',
    submitButtonText: pjChallengeCMS?.submit_button_text ?? 'Submit',
    allFieldsAreMandatory:
      pjChallengeCMS?.all_fields_are_mandatory ?? 'All fields are mandatory',
    imageFileUploadLimit: pjChallengeCMS?.image_file_upload_limit ?? 'Max 5MB',
    audioFileUploadLimit: pjChallengeCMS?.audio_file_upload_limit ?? 'Max 10MB',
    videoFileUploadLimit: pjChallengeCMS?.video_file_upload_limit ?? 'Max 50MB',
    // ishaan to check this
    fiveJokesPerDay: pjChallengeCMS?.five_jokes_per_day ?? '5 jokes per day',
    imageAlert: pjChallengeCMS?.image_alert ?? 'Max size 5MB',
    audioAlert: pjChallengeCMS?.audio_alert ?? 'Max size 10MB',
    videoAlert: pjChallengeCMS?.video_alert ?? 'Max size 50MB',
    retryButton: pjChallengeCMS?.retry_button ?? 'Retry',
    previewYourSubmission:
      pjChallengeCMS?.preview_your_submission ?? 'Preview Your Submission',
    upload_your_audio: pjChallengeCMS?.upload_your_audio ?? 'Upload Your Audio',
    record_your_audio: pjChallengeCMS?.record_your_audio ?? 'Record Your Audio',
    tap_on_the_mic_start_reco:
      pjChallengeCMS?.tap_on_the_mic_start_reco ??
      'Tap on the mic to start recording',
    tap_to_stop_reco:
      pjChallengeCMS?.tap_to_stop_reco ?? 'Tap to stop recording',
    record_again: pjChallengeCMS?.record_again ?? 'Record Again.'
  }
}

// Default data for SSR/hydration
export const defaultPjChallengeData: PjChallengeData = {
  submitYourJokeHeading: 'Submit Your Joke',
  submitYourJokeSubheading: 'Share your creativity with the world',
  selectLanguage: 'Select Language',
  selectLanguageDropbox: 'Choose your language',
  selectFormat: 'Select Format',
  image: 'Image',
  imageClickableHeading: 'Upload Image',
  imageClickableSubHeading: 'Choose an image for your joke',
  imageClickableSubSubHeading: 'Max size 5MB',
  text: 'Text',
  audio: 'Audio',
  video: 'Video',
  textClickableHeading: 'Write Your Joke',
  textClickablePlaceholder: 'Enter your joke here...',
  textClickableTextLimit: '500 characters max',
  audioClickableHeading: 'Upload Audio',
  audioClickableSubheading: 'Record or upload your joke',
  videoHeading: 'Upload Video',
  videoSubHeading: 'Share your video joke',
  title: 'Title',
  titleJokeTitleTextSpace: 'Joke Title',
  titleJokeTitleCharacterLimitText: '50 characters max',
  category: 'Category',
  termsAndConditions: 'I agree to the Terms & Conditions',
  submitButtonText: 'Submit',
  allFieldsAreMandatory: 'All fields are mandatory',
  imageFileUploadLimit: 'Max 5MB',
  audioFileUploadLimit: 'Max 10MB',
  videoFileUploadLimit: 'Max 50MB',
  fiveJokesPerDay: '5 jokes per day',
  imageAlert: 'Max size 5MB',
  audioAlert: 'Max size 10MB',
  videoAlert: 'Max size 50MB',
  retryButton: 'Retry',
  previewYourSubmission: 'Preview Your Submission',
  upload_your_audio: 'Upload Your Audio',
  record_your_audio: 'Record Your Audio',
  tap_on_the_mic_start_reco: 'Tap on the mic to start recording',
  tap_to_stop_reco: 'Tap to stop recording',
  record_again: 'Record Again.'
}
