export interface IMemeReactionCounts {
  happy: number;
  neutral: number;
  sad: number;
}

export interface IMemeReactionClick {
  happy: number;
  neutral: number;
  sad: number;
}

export interface IMemeItem {
  assetUrl: string;
  avatarImage: string;
  hasVoted: boolean;
  id: string;
  language: string;
  reactionClick: IMemeReactionClick;
  reactionCounts: IMemeReactionCounts;
  username: string;
  /** The creator, so a viewer's own memes can be told apart in the feed. */
  userId?: string;
  viewCount: number;
}

export interface IMemeFeedResponse {
  cursor: string | null;
  items: IMemeItem[];
}

export interface IGetMemeFeedParams {
  language?: number;
  q?: string;
  limit?: number;
  cursor?: string;
  trending?: boolean;
}

// User memes
export interface IUserMemeItem extends IMemeItem {
  createdAt: string;
  status: number;
}

export interface IUserMemesResponse {
  cursor?: string | null;
  items: IUserMemeItem[];
}

// Moderation status returned by GET /memes/user
export enum MemeStatus {
  Pending = 1,
  Approved = 2,
  Plagiarized = 3,
  Rejected = 4,
}

export interface IGetUserMemesParams {
  status?: MemeStatus;
  limit?: number;
  cursor?: string;
}

export interface IMemeReaction {
  memeId: string;
  reaction: "happy" | "neutral" | "sad";
}

export interface IMemeReactionResponse {
  message: string;
  show_coin_animation: boolean;
}

export interface IMemeVoteRequest {
  asset_id: string;
}

export interface IMemeVoteResponse {
  message: string;
  show_coin_animation: boolean;
}

// Template types
export interface ITemplateItem {
  id: string;
  url: string;
  type?: string; // e.g., "gifs", "stickers", "videos", etc.
}

export type TemplateType = "all" | "gifs" | "stickers";

export interface IGetTrendingTemplatesParams {
  limit?: number;
  offset?: number;
  rating?: string;
  bundle?: string;
  type?: TemplateType;
}

export interface ITrendingTemplatesResponse {
  templates: ITemplateItem[];
}

// Autocomplete types
export interface IAutocompleteSuggestion {
  name: string;
}

export interface IGetAutocompleteParams {
  q: string;
  limit?: number;
  offset?: number;
  type?: TemplateType;
}

export interface IAutocompleteResponse {
  suggestions: IAutocompleteSuggestion[];
}

// Search types
export interface ISearchTemplatesParams {
  q: string;
  limit?: number;
  offset?: number;
  rating?: string;
  lang?: string;
  bundle?: string;
  type?: TemplateType;
}

export interface ISearchTemplatesResponse {
  templates: ITemplateItem[];
}

// Submit meme types
export interface ISubmitMemeRequest {
  language_id: number;
  template_id: string;
  text1?: string;
  text2?: string;
  asset: File | Blob;
}

export interface ISubmitMemeResponse {
  memeId: string;
  status: string;
}

