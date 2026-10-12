// Reels from instagram.com/sprite_india/reels, newest first, shown in Tadka Hub
// and in the home page Tadka row. Views are copied from Instagram by hand (there
// is no API for them here), so refresh them from the profile's Reels tab now and
// then; they are left out where Instagram does not show them publicly.
// Thumbnails are saved copies, since Instagram's own image links expire.
export const TADKA_INSTAGRAM_REELS: { code: string; views?: number }[] = [
  { code: "DeJy9A-BH8W", views: 3_900_000 },
  { code: "DeE7uPVBPwM", views: 1_300_000 },
  { code: "DeCEEk4BL_F", views: 421_000 },
  { code: "DeB23GYMre-", views: 629_000 },
  { code: "Dd--Pa_Sb2K", views: 441_000 },
  { code: "Dd-2OpgBUem", views: 2_300_000 },
  { code: "Dd84lKlk66w", views: 1_200_000 },
  { code: "Dd6nfs4ODSO", views: 464_000 },
  { code: "Dd6XiictyIB", views: 227_000 },
  { code: "Dd6WGWYheW9", views: 14_700_000 },
  { code: "Dd1ZNVrBQ-R", views: 2_400_000 },
  { code: "Dd0-JcvhRql" },
];

export const tadkaReelThumbnail = (code: string) =>
  `/assets/tadka-reels/${code}.jpg`;
