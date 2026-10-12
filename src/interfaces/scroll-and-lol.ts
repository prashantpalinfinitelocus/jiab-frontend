import { IUserReaction } from "@/api/types/JokeTypes";
import { ICONS_NAMES } from "@/constants";

// Define a type for the values of ICONS_NAMES (if not already global or imported appropriately)
// This might be duplicative if ReactionEmojies exports its Reaction type, consider refactoring later.
export type IconName = (typeof ICONS_NAMES)[keyof typeof ICONS_NAMES];

export interface SelectedReactionData {
  icon: IconName;
  count: string;
  name: string;
}

export interface VideoData {
  id: string;
  url: string;
  title: string;
  thumbnail?: string;
  user_reaction: IUserReaction;
  view_count: number;
  like_count?: number;
  share_count?: number;
  reactionType: string;
  isReacted: boolean;
  artist?: string;
  joke_language?: string;
  genreImage?: string;
  /** Set for Instagram reels, which play in an embed instead of the native player. */
  instagramCode?: string;
  /** Instagram's view count for a reel, when it is public. */
  instagramViews?: number;
}


export interface IModifiedJoke {
  id: string;
  url: string;
  title: string;
  thumbnail?: string;
  user_reaction: IUserReaction;
  thumbnail_url: string;
  view_count: number;
  like_count?: number;
  share_count?: number;
  reactionType: string;
  isReacted: boolean;
  artist?: string;
  joke_language?: string;
  is_exhausted?: boolean;
  genre_image?: string;
}

export interface ErrorResponse {
  ok: false;
  data: unknown[];
  message: string;
  code?: number;
}
