export type TEditProfile = {
  avatar_id?: number;
  dob?: string;
  email: string;
  gender?: string;
  name: string;
  is_avatar?: boolean;
};

export type TAddress = {
  address1: string;
  address2: string;
  city: string;
  is_default: boolean;
  nearest_landmark: string;
  pincode: number;
  shipping_mobile: string;
  state: string;
};

export type TAddessId = {
  address_id: number;
};

export interface IAddress extends TAddessId, TAddress {}

type TQuestion = {
  answer_id: number;
  question_id: number;
  language_id?: number;
};

export type TSubmitQuestions = {
  questions: TQuestion[];
  language_id?: number;
};

// Get Question By Text Request
export type TGetQuestionByTextRequest = {
  language_id: number;
  question_text: string;
};

// Get Question By Text Response
export type TQuestionOption = {
  display_order: number;
  id: number;
  option_text: string;
};

export type TQuestionData = {
  id: number;
  language_id: number;
  options: TQuestionOption[];
  ques_point: number;
  question_text: string;
  selected_option: number;
};

export type TGetQuestionByTextResponse = {
  data: TQuestionData;
  message: string;
  status: number;
  success: boolean;
};

// Check Profiling Question Modal Response
export type TCheckProfilingModalData = {
  show_modal: boolean;
};

export type TCheckProfilingModalResponse = {
  data: TCheckProfilingModalData;
  message: string;
  status: number;
  success: boolean;
};

// Update Profiling Question Last Viewed Response
export type TUpdateLastViewedResponse = {
  data: string;
  message: string;
  status: number;
  success: boolean;
};

// Submit Profiling Question Answer Request
export type TProfilingQuestionAnswer = {
  answer_id: number;
  question_id: number;
  question_number?: number;
};

export type TSubmitProfilingAnswersRequest = TProfilingQuestionAnswer[];

// Submit Profiling Question Answer Response
export type TSubmitProfilingAnswersResponse = {
  data: string;
  message: string;
  status: number;
  success: boolean;
};
