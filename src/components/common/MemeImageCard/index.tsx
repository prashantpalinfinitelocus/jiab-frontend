import React, { useEffect, useRef, useState } from "react";
import { MemeImageCardProps } from "@/types/meme";
import { generateImageurl, buildMemeShareUrl } from "@/utils";
import { ICONS_NAMES, LOCAL_IMAGES, LANGUAGE_NAMES } from "@/constants";
import { cn } from "@/lib/utils";
import AktivGroteskText from "../AktivGroteskText";
import SvgIcons from "../SvgIcons";
import SurpriseMeCTA from "@/components/SurpriseMeCTA";
import GreenCTA from "@/components/GreenCTA";
import ReportPopupComponent from "../ReportPopupComponent";
import { useCMSData } from "@/data";
import { useLanguage } from "@/hooks/useLanguage";
import { usePostMemeReaction, useVoteMeme, useIncrementMemeView, MemeStatus } from "@/api";
 
import useAppSelector from "@/hooks/useSelector";

interface ReactionCounts {
  happy: number;
  neutral: number;
  sad: number;
}

const MemeImageCard: React.FC<MemeImageCardProps> = ({
  item,
  onVoteSuccess,
}) => {
  const memeImageCardRef = useRef<HTMLDivElement>(null);
  const { user } = useAppSelector((state) => state.profile);
  const [localReactionCounts, setLocalReactionCounts] = useState<ReactionCounts>(
    item?.reactionCounts || { happy: 0, neutral: 0, sad: 0 }
  );
  const [localReactionClick, setLocalReactionClick] = useState<ReactionCounts>(
    item?.reactionClick || { happy: 0, neutral: 0, sad: 0 }
  );

  const userImage = item?.avatarImage || user?.userImage || user?.profile_picture || "/profile-images/profile-image-guest.svg";

  const { homePage, jokeBox } = useCMSData();
  const { selectedLanguage } = useLanguage();
  const isTamil = selectedLanguage === "ta";

  const { mutate: postReaction, isPending: isReacting } = usePostMemeReaction();
  const { mutate: voteMeme, isPending: isVoting } = useVoteMeme();
  const { mutate: incrementMemeView } = useIncrementMemeView();

  const [localViewCount, setLocalViewCount] = useState<number>(item?.viewCount ?? 0);
  const hasViewIncrementedRef = useRef<boolean>(false);
  const [reportPopup, setReportPopup] = useState<boolean>(false);
  const [shareStatus, setShareStatus] = useState<
    "copied" | "copiedNoImage" | "failed" | null
  >(null);

  useEffect(() => {
    if (!memeImageCardRef.current || hasViewIncrementedRef.current) return;

    const element = memeImageCardRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !hasViewIncrementedRef.current) {
            hasViewIncrementedRef.current = true;
            if (item?.id) {
              incrementMemeView(item.id, {
                onSuccess: (response: unknown) => {
                  const countFromResponse =
                    typeof (response as { data?: { viewCount?: unknown } })?.data?.viewCount === "number"
                      ? (response as { data?: { viewCount: number } }).data!.viewCount
                      : undefined;
                  const next = typeof countFromResponse === "number" ? countFromResponse : localViewCount + 1;
                  setLocalViewCount(next);
                },
                onError: () => {
                  setLocalViewCount((prev) => prev + 1);
                },
              });
            }
            observer.unobserve(element);
          }
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(element);
    return () => {
      observer.unobserve(element);
      observer.disconnect();
    };
  }, [incrementMemeView, item?.id, localViewCount]);

  useEffect(() => {
    if (!shareStatus) return;
    const timer = setTimeout(() => setShareStatus(null), 2000);
    return () => clearTimeout(timer);
  }, [shareStatus]);

  // Check if user can react (all reactionClick values are 0)
  const canReact =
    localReactionClick.happy === 0 &&
    localReactionClick.neutral === 0 &&
    localReactionClick.sad === 0;

  // Find which reaction is active (has value 1)
  const getActiveReaction = () => {
    if (localReactionClick.happy === 1) return "happy";
    if (localReactionClick.neutral === 1) return "neutral";
    if (localReactionClick.sad === 1) return "sad";
    return null;
  };
  const activeReaction = getActiveReaction();

  const handleReaction = (reactionType: "happy" | "neutral" | "sad") => {
    if (!canReact || isReacting) return;

    postReaction(
      { memeId: item?.id, reaction: reactionType },
      {
        onSuccess: () => {
          // Update local state
          setLocalReactionClick({
            happy: reactionType === "happy" ? 1 : 0,
            neutral: reactionType === "neutral" ? 1 : 0,
            sad: reactionType === "sad" ? 1 : 0,
          });
          setLocalReactionCounts((prev) => ({
            ...prev,
            [reactionType]: prev[reactionType] + 1,
          }));
          
          

          if (onVoteSuccess) {
            onVoteSuccess();
          }
        },
      }
    );
  };

  // Get opacity class based on reaction state
  const getReactionOpacity = (reactionType: "happy" | "neutral" | "sad") => {
    if (activeReaction === reactionType) {
      return "opacity-100";
    }
    if (activeReaction) {
      return "opacity-40";
    }
    return "opacity-100";
  };

  const handleVote = () => {
    if (isVoting || item?.hasVoted) return;
    voteMeme(
      { asset_id: item?.id },
      {
        onSuccess: () => {
          
          if (onVoteSuccess) onVoteSuccess();
        },
      }
    );
  };

  // Only an approved meme can be shared: an unapproved one is in no public
  // list, so its link would land the recipient on the bare feed. Feed items
  // carry no status at all - the feed serves approved memes only - so a
  // missing status counts as shareable.
  const canShare =
    item?.status === undefined || item?.status === MemeStatus.Approved;

  const copyShareLink = async (url: string): Promise<boolean> => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        return true;
      }
    } catch {
      // Permission denied or the tab lost focus - try the legacy path below.
    }

    // navigator.clipboard does not exist on plain-http origins at all, so keep
    // the old execCommand path for those.
    try {
      const field = document.createElement("textarea");
      field.value = url;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.top = "0";
      field.style.opacity = "0";
      document.body.appendChild(field);
      field.select();
      const copied = document.execCommand("copy");
      field.remove();
      return copied;
    } catch {
      return false;
    }
  };

  const inferTypeFromUrl = (url: string): string => {
    const path = url.split("?")[0].split("#")[0].toLowerCase();
    if (path.endsWith(".gif")) return "image/gif";
    if (path.endsWith(".png")) return "image/png";
    if (path.endsWith(".webp")) return "image/webp";
    return "image/jpeg";
  };

  // Read the meme through our own proxy: the asset sits on a bucket that sends
  // no CORS headers, so a direct fetch is blocked and there are no bytes to
  // attach. Returns null on any failure - the caller falls back to a link.
  const fetchMemeFile = async (): Promise<File | null> => {
    if (!item?.assetUrl || !item?.id) return null;

    try {
      const response = await fetch(
        `/api/proxy-image?url=${encodeURIComponent(item.assetUrl)}`
      );
      if (!response.ok) {
        console.warn(
          `[share] proxy-image returned ${response.status}; sharing the link only`
        );
        return null;
      }

      const blob = await response.blob();
      // A GIF meme must go out labelled as a GIF: chat apps trust the type and
      // filename, so calling it a JPEG would deliver a still frame instead of
      // the animation. Fall back to the asset path's extension when the
      // response carries no usable type of its own.
      const type =
        blob.type && blob.type !== "application/octet-stream"
          ? blob.type
          : inferTypeFromUrl(item.assetUrl);
      // Name the file after the meme rather than the asset path: those paths
      // can end in "/.jpg", and a leading dot makes a hidden file the share
      // sheet refuses.
      const ext = type.split("/")[1] || "jpg";
      return new File([blob], `meme-${item.id}.${ext}`, { type });
    } catch (error) {
      console.warn("[share] could not read the meme asset:", error);
      return null;
    }
  };

  const handleShare = async () => {
    // Send the picture and a way back to it: the meme itself as a file so chat
    // apps render it, with the /meme-burst link in the message text so the
    // recipient can still open it on the feed and react and vote. The link
    // rides in `text` because targets drop the `url` field once a file is
    // attached. The asset URL itself is never shared - it is a signed storage
    // link around 2000 characters long.
    if (!item?.id) return;

    const shareUrl = buildMemeShareUrl(item.id);
    const title = `Meme by ${item?.username || "User"}`;

    // Desktop browsers cannot share files at all, so skip the proxy round-trip
    // there rather than making the share sheet wait on bytes nothing will use.
    const file =
      typeof navigator.canShare === "function" ? await fetchMemeFile() : null;
    if (file && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({
          title,
          text: `Check out this meme!\n${shareUrl}`,
          files: [file],
        });
        return;
      } catch (error) {
        // Dismissing the share sheet is a choice, not a failure - stop here.
        if ((error as Error)?.name === "AbortError") return;
        // Anything else falls through to the link-only share below, so the
        // click still does something.
      }
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: "Check out this meme!",
          url: shareUrl,
        });
        return;
      } catch (error) {
        // Dismissing the share sheet is a choice, not a failure - stop here.
        if ((error as Error)?.name === "AbortError") return;
        // Anything else (no share target, permission denied) falls through to
        // the copy path so the click still does something.
      }
    }

    // Desktop browsers mostly have no share sheet, so copying is the real
    // outcome there. It has to be visible: a silent copy reads as a dead button.
    // Say when the meme itself could not go with it, rather than reporting the
    // same "Link copied" whether the image was attached or silently dropped -
    // navigator.share does not exist outside a secure context, so a phone on a
    // plain-http dev server lands here with no way to send the picture.
    if (!navigator.share) {
      console.warn(
        "[share] navigator.share is unavailable" +
          (window.isSecureContext ? "" : " - this origin is not a secure context (HTTPS required)")
      );
    }
    const copied = await copyShareLink(shareUrl);
    if (!copied) {
      setShareStatus("failed");
      return;
    }
    setShareStatus(file ? "copied" : "copiedNoImage");
  };

  return (
    <div
      ref={memeImageCardRef}
      style={{
        backgroundImage: `url(${generateImageurl(LOCAL_IMAGES.UGC_CARD_BG)})`,
      }}
      className="relative bg-cover bg-no-repeat w-full flex-grow-1 p-[16px] md:px-[12px] flex flex-col justify-between gap-[10px] md:rounded-[10px] rounded-[5px]"
    >
      {shareStatus && (
        <div
          role="status"
          className="absolute z-10 left-1/2 -translate-x-1/2 bottom-[64px] px-[12px] py-[6px] rounded-full bg-black/80 pointer-events-none"
        >
          <AktivGroteskText
            text={
              shareStatus === "copied"
                ? "Link copied"
                : shareStatus === "copiedNoImage"
                ? "Link copied (image not attached)"
                : "Could not copy link"
            }
            fontSize="text-[12px]"
            fontWeight="font-[700]"
            className="text-white whitespace-nowrap"
          />
        </div>
      )}
      <div className="flex justify-between items-center md:items-start">
        <div className="flex w-full items-start gap-[12px]">
          <div className="min-w-[30px] max-w-[30px] md:max-w-[30px] md:min-w-[28px] min-h-[30px] max-h-[30px] md:min-h-[28px] md:max-h-[28px] flex items-end justify-center rounded-full ">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={userImage}
              alt="User Avatar"
              className="w-full h-full object-cover relative border-none outline-none"
            />
          </div>
          <div className="flex flex-col gap-[6.58px] md:gap-[1.58px] w-full">
            <div className="flex justify-between items-center flex-grow">
              <div className="flex items-center gap-[6px]">
                <AktivGroteskText
                  text={item?.username && item?.language ? `${item.username}, ${LANGUAGE_NAMES[item.language] || item.language}` : "User, English"}
                  fontSize="text-[12.44px]"
                  fontWeight="font-[500]"
                />
              </div>
              <div className="flex gap-[6px]">
                <button
                  className="cursor-pointer flex gap-[6px] border-none outline-none"
                  onClick={() => setReportPopup(true)}
                >
                  <AktivGroteskText
                    text="Report"
                    fontSize="text-[12px] text-[#FD0202]"
                    fontWeight="font-[400]"
                  />
                  <SvgIcons
                    name={ICONS_NAMES.REPORT}
                    className="w-[20px] h-[20px]"
                  />
                </button>
              </div>
            </div>
            <AktivGroteskText
              text={homePage.jokeDisclaimerText}
              fontSize="text-[10px] md:text-[12px]"
              fontWeight="font-[400]"
              className="text-[#313131]  block"
            />
          </div>
        </div>
      </div>
      <div className="relative">
        <div
          style={{
            backgroundImage: `url('/assets/temp/backdrop-image-ugc.png')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
          className={`relative w-full h-[278px] md:h-[340px] flex items-center justify-center gap-[34px] rounded-t-[5px] overflow-hidden`}
        >
          {item?.assetUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item?.assetUrl}
              alt="Meme"
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="text-gray-400">No image</div>
          )}
        </div>
        <div className="bg-white border-x-[1px] border-b-[1px] border-[#D9D9D9] rounded-b-[5px] p-[8px] flex justify-between">
          <div className="flex gap-[10px] md:gap-[8px]">
            <div className={cn(getReactionOpacity("happy"))}>
              <SurpriseMeCTA
                isReacted={activeReaction === "happy"}
                name={ICONS_NAMES.FUNNY}
                text={localReactionCounts?.happy?.toString() ?? "0"}
                onClick={() => handleReaction("happy")}
                isMeme={true}
                disabled={!canReact || isReacting}
              />
            </div>
            <div className={cn(getReactionOpacity("neutral"))}>
              <SurpriseMeCTA
                isReacted={activeReaction === "neutral"}
                name={ICONS_NAMES.MAD}
                text={localReactionCounts?.neutral?.toString() ?? "0"}
                onClick={() => handleReaction("neutral")}
                disabled={!canReact || isReacting}
                isMeme={true}
              />
            </div>
            <div className={cn(getReactionOpacity("sad"))}>
              <SurpriseMeCTA
                isReacted={activeReaction === "sad"}
                name={ICONS_NAMES.ANGRY}
                text={localReactionCounts?.sad?.toString() ?? "0"}
                onClick={() => handleReaction("sad")}
                disabled={!canReact || isReacting}
                isMeme={true}
              />
            </div>
            {canShare && (
              <SurpriseMeCTA
                isReacted={false}
                name={ICONS_NAMES.SHARE}
                text={`Share`}
                onClick={() => { void handleShare(); }}
              />
            )}
          </div>
          <div className="flex gap-[12px]">
            <div className="flex items-center gap-[8px]">
              <GreenCTA
                onClick={handleVote}
                text={item?.hasVoted ? jokeBox.voted : jokeBox.vote}
                disabled={(item?.hasVoted ?? false) || isVoting}
                className="leading-tight flex items-center justify-center"
                paddingClass={cn(
                  "px-[26px] py-[8px] md:px-[21px] md:py-[7px]",
                  isTamil && "px-[26px] py-[8px] md:px-[16px] md:py-[7px]"
                )}
                fontSize={cn(
                  "text-[12px] md:text-[16px]",
                  isTamil && "text-[11px] md:text-[10px]"
                )}
                fontWeight="font-[700]"
              />
              <SurpriseMeCTA
                isReacted={false}
                name={ICONS_NAMES.VIEWS}
                text={localViewCount?.toString() ?? "0"}
                onClick={() => {}}
                isMeme={true}
              />
            </div>
          </div>
        </div>
      </div>

      <ReportPopupComponent
        setOpen={setReportPopup}
        userId={user?.id ?? ""}
        actingUserId={""}
        open={reportPopup}
        assetId={item?.id ?? ""}
        onClose={() => setReportPopup(false)}
      />
      
    </div>
  );
};

export default MemeImageCard;
