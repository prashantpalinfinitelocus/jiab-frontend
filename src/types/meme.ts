export interface MemeTemplate {
  id: string;
  type: "GIF" | "Sticker";
  imageURL: string;
  category?: string;
  aspectRatio?: string;
}

export interface MemeImageCardProps {
  item?: any
  onVoteSuccess?: () => void
  /** The viewer's own meme (My Memes): no Report or Vote, and a status badge. */
  isOwn?: boolean
  /** Feed tab the card sits in, for the meme_view GA event. */
  tab?: "latest" | "trending" | "my_memes"
  /** Shows Delete on an own meme; called with its id once the backend removed it. */
  onDeleted?: (memeId: string) => void
}