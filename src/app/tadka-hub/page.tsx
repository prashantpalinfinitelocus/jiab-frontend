"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Header from "@/components/common/Header/Header";
import { useCMSData } from "@/data";
import { useSearchParams } from "next/navigation";
import { usePostReelReaction } from "@/api/hooks/JokeHooks";
import { useLanguage } from "@/hooks/useLanguage";
import { IUserReaction } from "@/api/types/JokeTypes";
import {
  useViewGludeinJokes,
  useSendGluedinUserReaction,
} from "@/api/hooks/GluedinHooks";
import VideoItem from "@/components/Video/index";
import InstagramReelItem from "@/components/Video/InstagramReelItem";
import { VideoData } from "@/interfaces/scroll-and-lol";
import { LoadingSpinner } from "@/components/VideoLoader";
import { TADKA_INSTAGRAM_REELS } from "@/constants/tadkaInstagramReels";

const instagramReels: VideoData[] = TADKA_INSTAGRAM_REELS.map(
  ({ code, views }) => ({
    id: `instagram-${code}`,
    url: `https://www.instagram.com/reel/${code}/`,
    title: "",
    user_reaction: { laugh: 0, neutral: 0, sad: 0, like: 0, share: 0 },
    view_count: 0,
    reactionType: "",
    isReacted: false,
    instagramCode: code,
    instagramViews: views,
  }),
);

const TadkaHubPage: React.FC = () => {
  // Reel to open at, from a home page Tadka row card (?reel=<code>).
  const reelParam = useSearchParams().get("reel");
  const openedReelRef = useRef(false);
  const { selectedLanguage: globalLanguage } = useLanguage();
  const videoLanguage = globalLanguage;
  const [footerHeight, setFooterHeight] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [languageChangeKey, setLanguageChangeKey] = useState(0);
  const [activeVideoIndex, setActiveVideoIndex] = useState<number>(0);
  const [videoPlayStates, setVideoPlayStates] = useState<boolean[]>([]);
  const [userPausedVideos, setUserPausedVideos] = useState<boolean[]>([]);
  const [videoReady, setVideoReady] = useState<boolean[]>([]);
  /** Default true so programmatic autoplay works after refresh (browser policy). User can unmute after gesture. */
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDesktopRef = useRef(false);
  /** Mirrors activeVideoIndex for intersection handlers; updated synchronously in scrollToVideo. */
  const activeVideoIndexRefForInView = useRef(0);
  const inViewActiveCommitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  /** Brief adjacent-card inView blips were pausing the current slide via pause-all-others. */
  const IN_VIEW_ACTIVE_SWITCH_MS = 200;

  useEffect(() => {
    activeVideoIndexRefForInView.current = activeVideoIndex;
  }, [activeVideoIndex]);
  const [currentVideoData, setCurrentVideoData] = useState<VideoData | null>(
    null,
  );
  // track exhaust video in view if needed in future

  const { mutate: postReelReaction, data: postReelReactionData } =
    usePostReelReaction();
  const [completlyPlayedVideoIndex, setCompletlyPlayedVideoIndex] =
    useState<number>(-1);
  const { mutate: sendGluedinUserReaction, data: sendGluedinUserReactionData } =
    useSendGluedinUserReaction();
  const { mutate: viewGludeinJokes, data: viewGludeinJokesData } =
    useViewGludeinJokes();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (inViewActiveCommitTimerRef.current) {
      clearTimeout(inViewActiveCommitTimerRef.current);
      inViewActiveCommitTimerRef.current = null;
    }
    // Stop and clear all currently playing videos
    videoRefs.current.forEach((video) => {
      if (video) {
        video.pause();
        video.currentTime = 0;
        video.src = ""; // Clear video source to stop loading
      }
    });

    // Reset all video-related state
    setVideos([]);
    setVideoPlayStates([]);
    setUserPausedVideos([]);
    setVideoReady([]);
    setActiveVideoIndex(0);
    setCurrentVideoData(null);
    setIsLoading(true);

    // Clear video refs array
    videoRefs.current = [];

    // Increment key to force re-render and reset intersection observer
    setLanguageChangeKey((prev) => prev + 1);

    // Safety timeout to prevent infinite loading
    const safetyTimeout = setTimeout(() => {
      setIsLoading(false);
    }, 10000); // 10 second timeout

    return () => clearTimeout(safetyTimeout);
  }, [videoLanguage]);

  // Tadka Hub shows only the Instagram reels. Runs after the reset above.
  useEffect(() => {
    setVideos(instagramReels);
    setIsLoading(false);
  }, [videoLanguage]);

  // Jump straight to the reel picked on the home page, once the feed is shown.
  useEffect(() => {
    const container = containerRef.current;
    if (openedReelRef.current || !reelParam || isLoading || !container) return;
    const index = videos.findIndex((v) => v.instagramCode === reelParam);
    const target = container.querySelectorAll(".video-container")[index];
    if (index < 1 || !target) return;
    openedReelRef.current = true;
    container.scrollTop +=
      target.getBoundingClientRect().top - container.getBoundingClientRect().top;
    activeVideoIndexRefForInView.current = index;
    setActiveVideoIndex(index);
  }, [reelParam, isLoading, videos]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const cmsData = useCMSData(mounted);

  // Calculate viewport height and footer height for mobile
  useEffect(() => {
    const updateViewportHeight = () => {
      // Use window.innerHeight for better iOS support
      setViewportHeight(window.innerHeight);
    };

    const calculateFooterHeight = () => {
      // Try to find mobile footer first
      const mobileFooter =
        document.querySelector('[data-footer="mobile"]') ||
        document.querySelector(".bg-white.w-full.h-\\[71px\\]") ||
        document.querySelector(".fixed.bottom-0") ||
        document.querySelector("#mobile-footer");

      if (mobileFooter && mobileFooter instanceof HTMLElement) {
        setFooterHeight(mobileFooter.offsetHeight);
      } else {
        // Fallback to default mobile footer height
        setFooterHeight(71);
      }
    };

    // Calculate on mount and resize
    updateViewportHeight();
    calculateFooterHeight();

    window.addEventListener("resize", () => {
      updateViewportHeight();
      calculateFooterHeight();
    });

    // Handle iOS viewport changes
    window.addEventListener("orientationchange", () => {
      setTimeout(() => {
        updateViewportHeight();
        calculateFooterHeight();
      }, 100);
    });

    // Use ResizeObserver for more accurate detection
    const resizeObserver = new ResizeObserver(() => {
      updateViewportHeight();
      calculateFooterHeight();
    });

    const footer =
      document.querySelector('[data-footer="mobile"]') ||
      document.querySelector(".bg-white.w-full.h-\\[71px\\]") ||
      document.querySelector(".fixed.bottom-0") ||
      document.querySelector("#mobile-footer");

    if (footer) {
      resizeObserver.observe(footer);
    }

    return () => {
      window.removeEventListener("resize", updateViewportHeight);
      window.removeEventListener("orientationchange", updateViewportHeight);
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    const checkDesktop = () => {
      isDesktopRef.current = window.innerWidth >= 768;
    };
    checkDesktop();
    window.addEventListener("resize", checkDesktop);
    return () => {
      window.removeEventListener("resize", checkDesktop);
    };
  }, []);

  // Playback starts from VideoItem after canplaythrough (waitForCanPlayThrough); avoid early play() on empty buffer.

  // Initialize play/pause arrays when videos are loaded
  useEffect(() => {
    if (videos?.length) {
      setVideoPlayStates((prev) => {
        if (prev.length === videos.length) return prev; // already init
        const arr = new Array(videos.length).fill(true); // Set all videos to play by default
        return arr;
      });
      setUserPausedVideos((prev) => {
        if (prev.length === videos.length) return prev;
        return new Array(videos.length).fill(false);
      });
      setVideoReady((prev) => {
        if (prev.length === videos.length) return prev;
        return new Array(videos.length).fill(false);
      });
    }
  }, [videos.length]);

  const scrollToVideo = (direction: "up" | "down") => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const videoElements = Array.from(
      container.querySelectorAll(".video-container"),
    );

    // Calculate the new target index (videos.length is the end page index)
    const lastIndex = Math.max(0, videos.length - 1);
    const newIndex =
      direction === "up"
        ? Math.max(0, activeVideoIndex - 1)
        : Math.min(lastIndex, activeVideoIndex + 1);

    // Get the target element
    const targetElement = videoElements[newIndex];
    if (!targetElement) return;

    // Scroll only the feed. scrollIntoView would also scroll the page, since
    // the feed sits below the header and title.
    container.scrollTo({
      top:
        container.scrollTop +
        targetElement.getBoundingClientRect().top -
        container.getBoundingClientRect().top,
      behavior: "smooth",
    });

    if (inViewActiveCommitTimerRef.current) {
      clearTimeout(inViewActiveCommitTimerRef.current);
      inViewActiveCommitTimerRef.current = null;
    }

    activeVideoIndexRefForInView.current = newIndex;
    setActiveVideoIndex(newIndex);
    videoRefs.current.forEach((video, idx) => {
      if (video && idx !== newIndex) {
        video.pause();
      }
    });
  };

  // Video event handlers
  const handleVideoInView = useCallback((index: number) => {
    if (inViewActiveCommitTimerRef.current) {
      clearTimeout(inViewActiveCommitTimerRef.current);
      inViewActiveCommitTimerRef.current = null;
    }

    if (index === activeVideoIndexRefForInView.current) {
      videoRefs.current.forEach((video, idx) => {
        if (video && idx !== index) {
          video.pause();
        }
      });
      return;
    }

    inViewActiveCommitTimerRef.current = setTimeout(() => {
      inViewActiveCommitTimerRef.current = null;
      activeVideoIndexRefForInView.current = index;
      setActiveVideoIndex(index);
      videoRefs.current.forEach((video, idx) => {
        if (video && idx !== index) {
          video.pause();
        }
      });
    }, IN_VIEW_ACTIVE_SWITCH_MS);
  }, []);

  const handleVideoOutOfView = useCallback((index: number) => {
    // Pause video when it goes out of view
    const video = videoRefs.current[index];
    if (video) {
      video.pause();
    }

    // Reset play states
    setVideoPlayStates((prev) => {
      const newStates = [...prev];
      newStates[index] = false;
      return newStates;
    });

    // Reset user pause state
    setUserPausedVideos((prev) => {
      const newStates = [...prev];
      newStates[index] = false;
      return newStates;
    });
    // Do not set activeVideoIndex to -1: intersection can fire many "out" events at once and
    // desync isActive from the video that is still in view, causing play/pause races.
  }, []);

  // Handle video ref callback
  const handleVideoRef = useCallback(
    (index: number, element: HTMLVideoElement | null) => {
      if (element) {
        videoRefs.current[index] = element;
      }
    },
    [],
  );

  // Removed separate video load handler; handled in canplay

  // Handle video ready to play
  const handleVideoCanPlay = (index: number) => {
    if (index === 0) {
      setIsLoading(false);
    }
    setVideoReady((prev) => {
      const newArr = [...prev];
      newArr[index] = true;
      return newArr;
    });
  };

  // Handle video error
  const handleVideoError = (index: number) => {
    // Still mark as "loaded" to prevent infinite loading
    if (index === 0) {
      setIsLoading(false);
    }
    setVideoReady((prev) => {
      const newArr = [...prev];
      newArr[index] = true;
      return newArr;
    });
  };

  // Like handler for GluedIn (always send 'like')
  const handleLike = (index: number) => {
    const videoId = videos[index]?.id;
    const isAlreadyLiked = videos[index]?.reactionType === "like";
    if (!videoId || isAlreadyLiked) return;
    sendGluedinUserReaction({
      assetId: videoId,
      reactionType: "like",
      increaseComicCoin: false,
    });
  };

  // Share handler: builds /tadka-hub?selected_joke={assetId}&langId={mnemonic}
  const handleShare = (index: number) => {
    const videoId = videos[index]?.id;
    if (!videoId) return;
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const shareUrl = `${origin}/tadka-hub?selected_joke=${videoId}&langId=${videoLanguage}`;
    // send 'share' to gluedin
    sendGluedinUserReaction({
      assetId: videoId,
      reactionType: "share",
      increaseComicCoin: false,
    });
    if (navigator.share) {
      navigator
        .share({
          title: "Tadka Hub",
          text: "Check this amazing video",
          url: shareUrl,
        } as never)
        .catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl).catch(() => {});
    }
  };

  useEffect(() => {
    if (sendGluedinUserReactionData?.ok && activeVideoIndex !== -1) {
      const currentVideoId = videos[activeVideoIndex]?.id;
      const reactionType = sendGluedinUserReactionData?.data?.reactionType;
      postReelReaction({
        assetId: currentVideoId,
        reaction: reactionType,
      });
      setVideos((prev: VideoData[]) => {
        const newArr = [...prev];
        const currentVideoIndexData = newArr.findIndex(
          (video: VideoData) => video.id === currentVideoId,
        );
        if (currentVideoIndexData !== -1) {
          const current = newArr[currentVideoIndexData];
          if (reactionType === "like") {
            newArr[currentVideoIndexData] = {
              ...current,
              isReacted: true,
              reactionType: reactionType,
              like_count: (current.like_count ?? 0) + 1,
            };
          } else {
            newArr[currentVideoIndexData] = {
              ...current,
              isReacted: prev?.[activeVideoIndex]?.isReacted,
              reactionType: prev?.[activeVideoIndex]?.reactionType,
              user_reaction: {
                ...current?.user_reaction,
                [reactionType]:
                  (current?.user_reaction?.[
                    reactionType as keyof IUserReaction
                  ] ?? 0) + 1,
              },
            };
          }
          setCurrentVideoData(newArr[currentVideoIndexData]);
          return newArr;
        }
        return newArr;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sendGluedinUserReactionData]);

  const togglePlay = (index: number) => {
    if (index === activeVideoIndex) {
      const video = videoRefs.current[index];
      if (!video) return;

      // Get current actual video state
      const isCurrentlyPlaying = !video.paused;
      const newPlayState = !isCurrentlyPlaying;

      // Update states immediately
      setVideoPlayStates((prev) => {
        const newStates = [...prev];
        newStates[index] = newPlayState;
        return newStates;
      });

      // Track user-initiated pause/play
      setUserPausedVideos((prev) => {
        const newUserPausedStates = [...prev];
        newUserPausedStates[index] = !newPlayState; // If not playing, then user paused
        return newUserPausedStates;
      });

      // Apply video state change
      if (newPlayState) {
        video.play().catch(console.error);
      } else {
        video.pause();
      }
    }
  };

  // No coin animation on this page

  const toggleMute = (index: number) => {
    if (index === activeVideoIndex) {
      if (videoRefs.current[index]) {
        videoRefs.current[index].muted = !isMuted;
        setIsMuted(!isMuted);
      }
    }
  };

  // Handle video play/pause events
  const handleVideoPlay = (index: number) => {
    setVideoPlayStates((prev) => {
      const newStates = [...prev];
      newStates[index] = true;
      return newStates;
    });
  };

  const handleVideoPause = (index: number) => {
    setVideoPlayStates((prev) => {
      const newStates = [...prev];
      newStates[index] = false;
      return newStates;
    });
  };

  const handleVideoEnded = (index: number) => {
    setCompletlyPlayedVideoIndex(index);

    // Auto-advance to the next video if available
    const nextIndex = Math.min(index + 1, Math.max(0, videos.length - 1));
    if (nextIndex !== index) {
      // Smooth scroll to the next video container
      scrollToVideo("down");

      // Update play state arrays
      setVideoPlayStates((prev) => {
        const newStates = [...prev];
        if (newStates[index] !== undefined) newStates[index] = false;
        if (newStates[nextIndex] !== undefined) newStates[nextIndex] = false;
        return newStates;
      });
      setUserPausedVideos((prev) => {
        const newStates = [...prev];
        if (newStates[nextIndex] !== undefined) newStates[nextIndex] = false;
        return newStates;
      });
      // Next clip plays via VideoItem once canplaythrough / isReady; avoid play() before buffer is ready.
    }
  };

  // End-of-feed module removed

  useEffect(() => {
    if (
      completlyPlayedVideoIndex < videos.length &&
      completlyPlayedVideoIndex !== -1
    ) {
      const getCurrentVideoId = videos[completlyPlayedVideoIndex]?.id ?? "";
      viewGludeinJokes({
        assetIds: [getCurrentVideoId],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completlyPlayedVideoIndex]);

  useEffect(() => {
    if (viewGludeinJokesData?.ok && completlyPlayedVideoIndex !== -1) {
      const currentVideoId = videos[completlyPlayedVideoIndex]?.id;
      setVideos((prev: VideoData[]) => {
        const newArr = [...prev];
        const currentVideoIndexData = newArr.findIndex(
          (video: VideoData) => video.id === currentVideoId,
        );
        if (currentVideoIndexData !== -1) {
          newArr[currentVideoIndexData] = {
            ...newArr[currentVideoIndexData],
            view_count: newArr[currentVideoIndexData]?.view_count + 1,
          };
          return newArr;
        }
        return newArr;
      });
      setCompletlyPlayedVideoIndex(-1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewGludeinJokesData]);

  useEffect(() => {
    if (videos.length > 0) {
      const currentVideoId = videos[activeVideoIndex]?.id ?? "";
      const currentVideoData = videos.find(
        (video: VideoData) => video.id === currentVideoId,
      );
      if (currentVideoData) {
        setCurrentVideoData(currentVideoData);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeVideoIndex, videos]);

  // Ensure currentVideoData is set for the first video immediately when videos load
  useEffect(() => {
    if (videos.length > 0 && !currentVideoData && activeVideoIndex === 0) {
      const firstVideoData = videos[0];
      if (firstVideoData) {
        setCurrentVideoData(firstVideoData);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videos.length, currentVideoData]);

  // Removed language selection handler as end-of-feed module is removed

  // Calculate mobile page height accounting for footer
  const mobilePageHeight =
    viewportHeight > 0 ? `${viewportHeight - footerHeight}px` : "100vh";

  return (
    <div className="md:w-full md:h-screen md:pt-[100px] pt-0 flex flex-col justify-center items-center bg-[url('/assets/images/scroll-and-lol-bg.png')] bg-cover bg-center bg-fixed overflow-hidden">
      {isLoading ? (
        <></>
      ) : (
        <div className="w-full container md:block hidden">
          <Header
            title={cmsData.comic.tadkaHubText}
            textTransform="uppercase"
          />
        </div>
      )}

      <div
        className="relative md:w-fit md:h-full w-full"
        style={{
          height:
            typeof window !== "undefined" && window.innerWidth >= 768
              ? "100vh"
              : mobilePageHeight,
        }}
      >
        {isLoading ? (
          <LoadingSpinner mobileHeight={mobilePageHeight} />
        ) : (
          <div
            key={languageChangeKey}
            ref={containerRef}
            className="relative md:max-h-[calc(100vh-200px)] w-full overflow-y-scroll overflow-x-hidden snap-y snap-mandatory scroll-smooth scrollbar-hide md:gap-[30px]"
            style={{
              scrollSnapType: "y mandatory",
              scrollBehavior: "smooth",
              overscrollBehaviorX: "none",
              height:
                typeof window !== "undefined" && window.innerWidth >= 768
                  ? "100vh"
                  : mobilePageHeight,
            }}
          >
            {videos.map((video, index) =>
              video.instagramCode ? (
                <InstagramReelItem
                  key={video.id}
                  code={video.instagramCode}
                  index={index}
                  isActive={activeVideoIndex === index}
                  mobilePageHeight={mobilePageHeight}
                  onVideoInView={handleVideoInView}
                  viewsCount={video.instagramViews}
                />
              ) : (
              <VideoItem
                key={video.id}
                video={video}
                index={index}
                isActive={activeVideoIndex === index}
                isMuted={isMuted}
                mobilePageHeight={mobilePageHeight}
                onVideoInView={handleVideoInView}
                onVideoOutOfView={handleVideoOutOfView}
                onVideoLoad={() => {}}
                onVideoCanPlay={handleVideoCanPlay}
                onVideoError={handleVideoError}
                onVideoEnded={handleVideoEnded}
                onVideoPlay={handleVideoPlay}
                onVideoPause={handleVideoPause}
                onTogglePlay={togglePlay}
                onToggleMute={toggleMute}
                onVideoRef={handleVideoRef}
                isPlaying={videoPlayStates[index]}
                isReady={videoReady[index]}
                isUserPaused={userPausedVideos[index]}
                onLike={() => handleLike(index)}
                onShare={() => handleShare(index)}
                likesCount={videos[index]?.like_count ?? 0}
                viewsCount={videos[index]?.view_count ?? 0}
                shareCount={videos[index]?.share_count ?? 0}
                isLiked={(videos[index]?.reactionType ?? "") === "like"}
                showSpicyActions
                hideLanguage={true}
                activeVideoIndexForPreload={activeVideoIndex}
                waitForCanPlayThrough
              />
              ),
            )}
          </div>
        )}
      </div>

      {/* Scroll buttons - only visible when not loading */}
      {!isLoading && (
        <div className="hidden md:flex flex-col gap-4 absolute bottom-[97.32px] md:right-[20px] lg:right-[100px] transform z-20">
          <button
            onClick={() => scrollToVideo("up")}
            className={`w-[64px] h-[64px] rounded-full border-2 border-green flex items-center justify-center transition-all duration-300 ${
              activeVideoIndex === 0 ? "opacity-50" : ""
            }`}
            aria-label="Scroll up"
            disabled={activeVideoIndex === 0}
          >
            <Image
              src="/other-svgs/up-arrow.svg"
              alt="Scroll up"
              width={25}
              height={25}
              className={activeVideoIndex === 0 ? "opacity-50" : ""}
            />
          </button>
          <button
            onClick={() => scrollToVideo("down")}
            className={`w-[64px] h-[64px] rounded-full border-2 border-green flex items-center justify-center transition-all duration-300 ${
              activeVideoIndex === Math.max(0, videos.length - 1)
                ? "opacity-50"
                : ""
            }`}
            aria-label="Scroll down"
            disabled={activeVideoIndex === Math.max(0, videos.length - 1)}
          >
            <Image
              src="/other-svgs/down-arrow.svg"
              alt="Scroll down"
              width={25}
              height={25}
              className={`${
                activeVideoIndex === Math.max(0, videos.length - 1)
                  ? "opacity-50"
                  : ""
              }`}
            />
          </button>
        </div>
      )}
      {/* No CoinAnimation on Tadka Hub */}
    </div>
  );
};

export default TadkaHubPage;
