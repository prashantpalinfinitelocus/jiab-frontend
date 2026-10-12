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
}