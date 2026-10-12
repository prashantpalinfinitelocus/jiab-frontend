// Individual Video Item Component with react-intersection-observer
"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useInView } from "react-intersection-observer";
import { IUserReaction } from "@/api/types/JokeTypes";

import VideoTitleInfo from "@/components/video-carousel/VideoTitleInfo";
import SpicyActions from "@/components/video-carousel/SpicyActions";
import ReelBuyButton from "@/components/ReelBuyButton";

export interface IModifiedJoke {
  id: string;
  url: string;
  title: string;
  thumbnail?: string;
  user_reaction: IUserReaction;
  thumbnail_url: string;
  view_count: number;
  reactionType: string;
  isReacted: boolean;
  artist?: string;
  joke_language?: string;
  is_exhausted?: boolean;
  genre_image?: string;
}

// Define a type for the values of ICONS_NAMES (if not already global or imported appropriately)
// This might be duplicative if ReactionEmojies exports its Reaction type, consider refactoring later.

interface VideoData {
  id: string;
  url: string;
  title: string;
  thumbnail?: string;
  user_reaction: IUserReaction;
  view_count: number;
  reactionType: string;
  isReacted: boolean;
  artist?: string;
  joke_language?: string;
  genreImage?: string;
  like_count?: number;
  share_count?: number;
}

// Mini spinner component overlay
const SpinnerOverlay: React.FC = () => (
  <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-30">
    <div className="w-12 h-12 border-4 border-[#08C270] border-t-transparent rounded-full animate-spin" />
  </div>
);

interface VideoItemProps {
  video: VideoData;
  index: number;
  isActive: boolean;
  isMuted: boolean;
  mobilePageHeight: string;
  onVideoInView: (index: number) => void;
  onVideoOutOfView: (index: number) => void;
  onVideoLoad: (index: number) => void;
  onVideoCanPlay: (index: number) => void;
  onVideoError: (index: number) => void;
  onVideoEnded: (index: number) => void;
  onVideoPlay: (index: number) => void;
  onVideoPause: (index: number) => void;
  onTogglePlay: (index: number) => void;
  onToggleMute: (index: number) => void;
  onVideoRef: (index: number, element: HTMLVideoElement | null) => void;
  isPlaying: boolean;
  isReady: boolean;
  isUserPaused: boolean;
  likesCount?: number;
  viewsCount?: number;
  shareCount?: number;
  isLiked?: boolean;
  onLike?: () => void;
  onShare?: () => void;
  showSpicyActions?: boolean;
  hideGenre?: boolean;
  hideLanguage?: boolean;
  /** When set, current + adjacent indices use preload="auto" to reduce mid-play buffering. */
  activeVideoIndexForPreload?: number;
  /**
   * Wait for `canplaythrough` before marking ready and starting playback (no native autoplay).
   * Reduces play → stall → play from starting with an empty buffer. Other pages keep default behavior.
   */
  waitForCanPlayThrough?: boolean;
}

/** Ignore brief "out of view" blips from strict intersection + mobile snap/resize before pausing. */
const OUT_OF_VIEW_PAUSE_DEBOUNCE_MS = 400;
/** If buffer gate never passes (some mobile/Safari edge cases), still allow UI + play(). */
const CAN_PLAY_THROUGH_FALLBACK_MS = 10_000;
/** Minimum decoded seconds ahead of playhead before showing player / autoplaying (Tadka `waitForCanPlayThrough` only). */
const MIN_BUFFER_AHEAD_BEFORE_PLAY_SEC = 4;

function bufferedSecondsAhead(el: HTMLVideoElement): number {
  if (el.buffered.length === 0) return 0;
  const t = el.currentTime;
  let ahead = 0;
  for (let i = 0; i < el.buffered.length; i++) {
    const start = el.buffered.start(i);
    const end = el.buffered.end(i);
    if (end <= t) continue;
    ahead += end - Math.max(t, start);
  }
  return ahead;
}

function canRevealPlayer(el: HTMLVideoElement, minAheadSec: number): boolean {
  if (el.buffered.length === 0) return false;
  const d = el.duration;
  const lastEnd = el.buffered.end(el.buffered.length - 1);
  if (Number.isFinite(d) && d > 0 && lastEnd >= d - 0.35) {
    return true;
  }
  return bufferedSecondsAhead(el) >= minAheadSec;
}
const VideoItem: React.FC<VideoItemProps> = ({
  video,
  index,
  isActive,
  isMuted,
  mobilePageHeight,
  onVideoInView,
  onVideoOutOfView,
  onVideoLoad,
  onVideoCanPlay,
  onVideoError,
  onVideoEnded,
  onVideoPlay,
  onVideoPause,
  onTogglePlay,
  onToggleMute,
  onVideoRef,
  isPlaying,
  isReady,
  isUserPaused,
  likesCount,
  viewsCount,
  shareCount,
  isLiked,
  onLike,
  onShare,
  showSpicyActions,
  hideGenre = false,
  hideLanguage = false,
  activeVideoIndexForPreload,
  waitForCanPlayThrough = false,
}) => {
  const { ref: intersectionRef, inView } = useInView({
    threshold: 0.5,
    // Looser than -20%: strict margins + snap scroll caused frequent inView flicker → pause → play.
    rootMargin: "-8% 0px -8% 0px",
  });

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canPlayReportedRef = useRef(false);
  const onVideoCanPlayRef = useRef(onVideoCanPlay);
  onVideoCanPlayRef.current = onVideoCanPlay;
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const playGatesRef = useRef({
    isUserPaused,
    isActive,
    inView,
    isReady,
  });
  playGatesRef.current = { isUserPaused, isActive, inView, isReady };

  const reportReadyToParent = useCallback(() => {
    if (canPlayReportedRef.current) return;
    canPlayReportedRef.current = true;
    onVideoCanPlayRef.current(index);
  }, [index]);

  const tryReportBufferedEnough = useCallback(() => {
    if (!waitForCanPlayThrough || canPlayReportedRef.current) return;
    const el = videoRef.current;
    if (!el) return;
    if (canRevealPlayer(el, MIN_BUFFER_AHEAD_BEFORE_PLAY_SEC)) {
      reportReadyToParent();
    }
  }, [waitForCanPlayThrough, reportReadyToParent]);

  const resumeAfterBufferIfNeeded = useCallback(() => {
    if (!waitForCanPlayThrough) return;
    const el = videoRef.current;
    const g = playGatesRef.current;
    if (
      !el ||
      g.isUserPaused ||
      !g.isActive ||
      !g.inView ||
      !g.isReady ||
      !el.paused
    ) {
      return;
    }
    el.play().catch(() => {});
  }, [waitForCanPlayThrough]);

  useEffect(() => {
    canPlayReportedRef.current = false;
  }, [video.url]);

  useEffect(() => {
    if (!waitForCanPlayThrough) return;
    const id = window.setTimeout(() => {
      reportReadyToParent();
    }, CAN_PLAY_THROUGH_FALLBACK_MS);
    return () => window.clearTimeout(id);
  }, [video.url, waitForCanPlayThrough, reportReadyToParent]);

  const combinedRef = useCallback(
    (node: HTMLDivElement | null) => {
      intersectionRef(node);
    },
    [intersectionRef],
  );

  useEffect(() => {
    if (inView) {
      onVideoInView(index);
      return;
    }
    const id = window.setTimeout(() => {
      onVideoOutOfView(index);
    }, OUT_OF_VIEW_PAUSE_DEBOUNCE_MS);
    return () => window.clearTimeout(id);
  }, [inView, index, onVideoInView, onVideoOutOfView]);

  // Auto-play when active + in view (after enough buffer when waitForCanPlayThrough)
  useEffect(() => {
    if (!inView || !isActive || !videoRef.current || isUserPaused) return;
    if (waitForCanPlayThrough && !isReady) return;
    const el = videoRef.current;
    const canTryPlay = waitForCanPlayThrough
      ? el.paused
      : el.paused && el.readyState >= 3;
    if (canTryPlay) {
      el.play().catch(console.error);
    }
  }, [inView, isActive, isUserPaused, isReady, waitForCanPlayThrough]);

  // Update progress bar as video plays
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateProgress = () => {
      if (!isDragging) {
        const progress = (video.currentTime / video.duration) * 100;
        setProgress(progress);
      }
    };

    video.addEventListener("timeupdate", updateProgress);
    return () => video.removeEventListener("timeupdate", updateProgress);
  }, [isDragging]);

  // Handle progress bar interactions
  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    const progressBar = progressBarRef.current;
    if (!video || !progressBar) return;

    const rect = progressBar.getBoundingClientRect();
    const clickPosition = (e.clientX - rect.left) / rect.width;
    const newTime = clickPosition * video.duration;
    video.currentTime = newTime;
    setProgress(clickPosition * 100);
  };

  const handleProgressBarDragStart = () => {
    setIsDragging(true);
  };

  const handleProgressBarDragEnd = () => {
    setIsDragging(false);
  };

  const handleProgressBarDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;

    const video = videoRef.current;
    const progressBar = progressBarRef.current;
    if (!video || !progressBar) return;

    const rect = progressBar.getBoundingClientRect();
    const position = (e.clientX - rect.left) / rect.width;
    const clampedPosition = Math.max(0, Math.min(1, position));
    const newTime = clampedPosition * video.duration;
    video.currentTime = newTime;
    setProgress(clampedPosition * 100);
  };

  return (
    <div
      ref={combinedRef}
      className="video-container relative md:max-h-[calc(100vh-200px)] w-full flex-shrink-0 md:mb-[100px] last:md:mb-0 md:flex md:items-center md:justify-center"
      data-index={index}
      style={{
        scrollSnapAlign: "start",
        scrollSnapStop: "always",
        height:
          typeof window !== "undefined" && window.innerWidth >= 768
            ? "calc(100vh - 200px)"
            : mobilePageHeight,
      }}
    >
      <div className="relative md:w-auto md:h-auto w-full h-full">
        {/* Thumbnail & spinner overlay */}
        {!isReady && (
          <>
            {video.thumbnail && (
              <Image
                src={video.thumbnail}
                alt={video.title}
                fill
                className="md:w-auto md:max-h-[calc(100vh-200px)] md:max-w-[442px] h-full w-full md:object-contain object-cover absolute inset-0"
                sizes="(max-width: 768px) 100vw, 442px"
                style={{ aspectRatio: "9/16" }}
                priority={index === 0}
              />
            )}
            <SpinnerOverlay />
          </>
        )}
        <div className="relative">
          <video
            ref={(el) => {
              videoRef.current = el;
              onVideoRef(index, el);
            }}
            className="md:w-auto md:max-h-[calc(100vh-200px)] md:max-w-[442px] w-full md:object-cover object-cover relative"
            src={video.url}
            playsInline
            muted={isMuted}
            autoPlay={!waitForCanPlayThrough}
            preload={
              waitForCanPlayThrough
                ? "auto"
                : typeof activeVideoIndexForPreload === "number" &&
                    Math.abs(index - activeVideoIndexForPreload) <= 1
                  ? "auto"
                  : isActive
                    ? "auto"
                    : "metadata"
            }
            loop={false}
            poster={video.thumbnail}
            onEnded={() => onVideoEnded(index)}
            onLoadedData={() => onVideoLoad(index)}
            onCanPlay={
              waitForCanPlayThrough
                ? () => {
                    tryReportBufferedEnough();
                    resumeAfterBufferIfNeeded();
                  }
                : () => onVideoCanPlay(index)
            }
            onCanPlayThrough={
              waitForCanPlayThrough
                ? () => tryReportBufferedEnough()
                : undefined
            }
            onProgress={
              waitForCanPlayThrough
                ? () => tryReportBufferedEnough()
                : undefined
            }
            onLoadStart={() => {
              if (index === 0) {
                setTimeout(() => onVideoLoad(index), 2000);
              }
            }}
            onError={() => onVideoError(index)}
            onPlay={() => onVideoPlay(index)}
            onPause={() => onVideoPause(index)}
            style={{
              aspectRatio: "9/16",
              height:
                typeof window !== "undefined" && window.innerWidth >= 768
                  ? "auto"
                  : mobilePageHeight,
            }}
          />
          {/* Gradient overlay */}
          <div className="absolute bottom-0 left-0 w-full md:h-[140px] h-[98px] bg-gradient-to-t from-black to-transparent pointer-events-none" />

          {/* Buy chip + title: column layout so gap is stable (no overlapping absolute siblings).One anchored shell keeps the stack above the progress bar. */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex flex-col gap-2 px-3 pb-[52px] pt-0 md:gap-0.5 xl:gap-2.5 md:pb-8 xl:pb-14">
            <div className="pointer-events-auto self-start">
              <ReelBuyButton isActive={isActive} />
            </div>
            <div className="pointer-events-auto w-full min-w-0 max-w-full">
              <VideoTitleInfo
                title={video.title}
                language={video.joke_language}
                genreImage={video.genreImage}
                hideGenre={hideGenre}
                hideLanguage={hideLanguage}
                showGradient={false}
                className="relative w-full max-w-full translate-x-0"
              />
            </div>
          </div>
          {/* Spicy actions - only for /tadka-hub */}
          {showSpicyActions && (
            <SpicyActions
              className="md:right-[8px] right-[8px]"
              viewsCount={viewsCount ?? video.view_count}
              likesCount={likesCount ?? video.like_count}
              shareCount={shareCount ?? video.share_count}
              isLiked={isLiked ?? video.reactionType === "like"}
              onLike={onLike}
              onShare={onShare}
            />
          )}
          <div
            ref={progressBarRef}
            className="absolute bottom-[12px] left-1/2 -translate-x-1/2 md:[width:calc(100%-30px)] w-[386px] xxs:w-[356px] h-1 bg-[#D1D1D1] cursor-pointer rounded-full"
            onClick={handleProgressBarClick}
            onMouseDown={handleProgressBarDragStart}
            onMouseUp={handleProgressBarDragEnd}
            onMouseLeave={handleProgressBarDragEnd}
            onMouseMove={handleProgressBarDrag}
          >
            <div
              className="h-full bg-white transition-[width] ease-linear duration-75 relative rounded-full"
              style={{ width: `${progress}%` }}
            >
              {/* Draggable dot handle */}
              <div
                className={`
    absolute -right-1 top-1/2 
    w-2 h-2 bg-white rounded-full shadow-md 
    transition-transform duration-200 ease-out z-20
    -translate-y-1/2 -translate-x-1/2
    ${isDragging ? "scale-125" : "scale-100"}
  `}
              />
            </div>
          </div>
        </div>

        {/* Top controls */}
        <div className="absolute top-4 w-full flex justify-between px-4 z-20">
          <button
            onClick={() => onTogglePlay(index)}
            className="w-[40px] h-[40px] rounded-full bg-[#12121240] flex items-center justify-center"
            disabled={!isReady}
          >
            <Image
              src={
                isPlaying && isActive
                  ? "/other-svgs/pause-icon.svg"
                  : "/other-svgs/play-icon.svg"
              }
              alt={isPlaying && isActive ? "Pause" : "Play"}
              width={isPlaying && isActive ? 12 : 20}
              height={isPlaying && isActive ? 12 : 20}
            />
          </button>
          <button
            onClick={() => onToggleMute(index)}
            className="w-[40px] h-[40px] rounded-full bg-[#12121240] flex items-center justify-center"
            disabled={!isReady}
          >
            <Image
              src={
                isMuted
                  ? "/other-svgs/mute-icon.svg"
                  : "/other-svgs/unmute-icon.svg"
              }
              alt={isMuted ? "Unmute" : "Mute"}
              width={20}
              height={20}
              className="text-white"
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoItem;
