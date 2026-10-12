"use client";
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from "react";
import Image from "next/image";
import Header from "@/components/common/Header/Header";
import ReactionEmojies from "@/components/ReactionEmojies";
import { useCMSData } from "@/data";
import { useSearchParams } from "next/navigation";
import {
  useActivateConsumption,
  useGetJokes,
  usePostReelReaction,
} from "@/api/hooks/JokeHooks";
import {
  useCheckProfilingQuestionModal,
  useGetQuestionByText,
  useSubmitProfilingQuestionAnswers,
  useUpdateProfilingQuestionLastViewed,
} from "@/api/hooks/ProfileHooks";
import { TQuestionOption } from "@/api/types/ProfileTypes";
import { useLanguage } from "@/hooks/useLanguage";
import { IUserReaction } from "@/api/types/JokeTypes";
import {
  useSendGluedinUserReaction,
  useViewGludeinJokes,
} from "@/api/hooks/GluedinHooks";
import {
  CDPEventPayloadBuilder,
  ReactionCDPEventPayload,
} from "@/api/utils/cdpEvents";
import useAppSelector from "@/hooks/useSelector";
import { useSendCDPEvent } from "@/api/hooks/CDPHooks";
import ExhaustVideo from "@/components/ExhaustVideo";
import {
  CoinAnimation,
  useCoinAnimation,
} from "@/components/common/CoinAnimation";
import VideoItem from "@/components/Video/index";
import {
  VideoData,
  SelectedReactionData,
  IModifiedJoke,
  ErrorResponse,
} from "@/interfaces/scroll-and-lol";
import { LoadingSpinner } from "@/components/VideoLoader";
import { triggerPixelEvents } from "@/utils/gTagEvents";
import { FACEBOOK_PIXEL_EVENTS } from "@/constants";
import BottleCountQuestion from "@/components/ProgressiveProfiling/BottleCountQuestion";
import PostLoginQuestion from "@/components/ProgressiveProfiling/PostLoginQuestion";
import PostSurpriseMeQuestion from "@/components/ProgressiveProfiling/PostSurpriseMeQuestion";
import useAlloyEvents from "@/hooks/useAlloyEvents";


// Wrapper component to detect when profiling question is in viewport
interface ProfilingQuestionWrapperProps {
  questionType: string;
  onInView: (questionType: string) => void;
  onOutOfView: () => void;
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  dataIndex?: string;
}

const ProfilingQuestionWrapper: React.FC<ProfilingQuestionWrapperProps> = ({
  questionType,
  onInView,
  onOutOfView,
  children,
  className,
  style,
  dataIndex,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasBeenInView, setHasBeenInView] = useState(false);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            onInView(questionType);
            setHasBeenInView(true);
          } else if (hasBeenInView) {
            onOutOfView();
          }
        });
      },
      {
        threshold: 0.5, // Consider in view when 50% visible
        rootMargin: "0px",
      },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [questionType, onInView, onOutOfView, hasBeenInView]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={style}
      data-index={dataIndex}
    >
      {children}
    </div>
  );
};

const ScrollAndLol: React.FC = () => {
  // Get selected joke id from query params
  const searchParams = useSearchParams();
  const selectedJokesParam = searchParams.get("selected_joke") || undefined;
  const initialLang = searchParams.get("langId") || "";
  const { selectedLanguage: globalLanguage } = useLanguage();
  const [videoLanguage, setVideoLanguage] = useState(globalLanguage);
  const [footerHeight, setFooterHeight] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);
  const { data: jokesResponse, isLoading: jokesLoading } = useGetJokes({
    limit: 15,
    selected_joke: selectedJokesParam,
    language: videoLanguage,
    type: "scroll",
    initialLang,
  });
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [languageChangeKey, setLanguageChangeKey] = useState(0);
  const [showSerialChillerForError, setShowSerialChillerForError] =
    useState(false);
  const { genres } = useAppSelector((state) => state.reference);
  const [activeVideoIndex, setActiveVideoIndex] = useState<number>(0);
  const [videoPlayStates, setVideoPlayStates] = useState<boolean[]>([]);
  const [userPausedVideos, setUserPausedVideos] = useState<boolean[]>([]);
  const [videoReady, setVideoReady] = useState<boolean[]>([]);
  const [quotaExhausted, setQuotaExhausted] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDesktopRef = useRef(false);
  const [currentVideoData, setCurrentVideoData] = useState<VideoData | null>(
    null,
  );
  const { isAnimating, triggerAnimation, animationKey } = useCoinAnimation();
  const [isExhaustVideoInView, setIsExhaustVideoInView] = useState(false);
  const [bottleQuestionId, setBottleQuestionId] = useState<number | null>(null);
  const [bottleQuestionOptions, setBottleQuestionOptions] = useState<
    Array<{ id: number; option_text: string; display_order: number }>
  >([]);
  // Set to true to force show for testing, false to use API logic
  const FORCE_SHOW_BOTTLE_QUESTION = false;
  const [showBottleQuestion, setShowBottleQuestion] = useState(
    FORCE_SHOW_BOTTLE_QUESTION,
  );

  // Post Surprise Me Question (question_number: 2) - appears at 4th place (index 3)
  const [postSurpriseMeQuestionId, setPostSurpriseMeQuestionId] = useState<
    number | null
  >(null);
  const [postSurpriseMeOptions, setPostSurpriseMeOptions] = useState<
    TQuestionOption[]
  >([]);
  const [showPostSurpriseMeAt4th, setShowPostSurpriseMeAt4th] = useState(false);

  // Post Login Question (question_number: 3) - appears at 3rd place (index 2)
  const [postLoginQuestionId, setPostLoginQuestionId] = useState<number | null>(
    null,
  );
  const [postLoginOptions, setPostLoginOptions] = useState<TQuestionOption[]>(
    [],
  );
  const [showPostLoginAt3rd, setShowPostLoginAt3rd] = useState(false);

  // Track if any profiling question is currently active and blocking
  const [isProfilingQuestionActive, setIsProfilingQuestionActive] =
    useState(false);

  // Track which profiling question is currently in view
  const [profilingQuestionInView, setProfilingQuestionInView] = useState<
    string | null
  >(null);

  // Bottle Count Question hooks (question_number: 1)
  const getQuestionByText = useGetQuestionByText();
  const { data: checkModalData } = useCheckProfilingQuestionModal(
    bottleQuestionId ?? 0,
    bottleQuestionId !== null,
    1, // question_number = 1 for BottleCount
  );
  const updateLastViewed = useUpdateProfilingQuestionLastViewed();
  const submitBottleAnswers = useSubmitProfilingQuestionAnswers();

  // Post Surprise Me Question hooks (question_number: 2)
  // Only check if question 1 returned show_modal: false
  const getPostSurpriseMeQuestion = useGetQuestionByText();
  const shouldCheckPostSurpriseMe =
    postSurpriseMeQuestionId !== null &&
    checkModalData?.ok &&
    checkModalData.data?.show_modal === false;
  const { data: checkPostSurpriseMeModalData } = useCheckProfilingQuestionModal(
    postSurpriseMeQuestionId ?? 0,
    shouldCheckPostSurpriseMe,
    2, // question_number = 2 for PostSurpriseMe
  );
  const updatePostSurpriseMeLastViewed = useUpdateProfilingQuestionLastViewed();
  const submitPostSurpriseMeAnswers = useSubmitProfilingQuestionAnswers();

  // Post Login Question hooks (question_number: 3)
  // Only check if question 2 returned show_modal: false
  const getPostLoginQuestion = useGetQuestionByText();
  const shouldCheckPostLogin =
    postLoginQuestionId !== null &&
    checkPostSurpriseMeModalData?.ok &&
    checkPostSurpriseMeModalData.data?.show_modal === false;
  const { data: checkPostLoginModalData } = useCheckProfilingQuestionModal(
    postLoginQuestionId ?? 0,
    shouldCheckPostLogin,
    3, // question_number = 3 for PostLogin
  );
  const updatePostLoginLastViewed = useUpdateProfilingQuestionLastViewed();
  const submitPostLoginAnswers = useSubmitProfilingQuestionAnswers();

  const { mutate: postReelReaction, data: postReelReactionData } =
    usePostReelReaction();
  const [completlyPlayedVideoIndex, setCompletlyPlayedVideoIndex] =
    useState<number>(-1);
  const { user } = useAppSelector((state) => state.profile);
  const { mutate: sendCDPEvent } = useSendCDPEvent();
  const { mutate: sendGluedinUserReaction, data: sendGluedinUserReactionData } =
    useSendGluedinUserReaction();
  const { mutate: viewGludeinJokes, data: viewGludeinJokesData } =
    useViewGludeinJokes();
  const { mutate: activateConsumption } = useActivateConsumption();
  const [mounted, setMounted] = useState(false);
  const { trackClick, CDP_EVENT_SUB_TYPES, trackPageView, trackScrollLOLView } = useAlloyEvents();

  useEffect(() => {
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
    setShowSerialChillerForError(false); // Reset error state on language change

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

  useEffect(() => {
    if (jokesResponse?.ok) {
      const jokesArr = jokesResponse.data as IModifiedJoke[];
      const newData = jokesArr.map((joke) => ({
        id: joke.id,
        url: joke.url, // assuming backend returns direct video URL here
        title: joke.title ?? "",
        thumbnail: joke.thumbnail_url,
        user_reaction: joke.user_reaction ?? { laugh: 0, neutral: 0, sad: 0 },
        view_count: joke.view_count ?? 0,
        reactionType: joke.reactionType ?? "",
        isReacted: joke.isReacted ?? false,
        artist: joke.artist ?? "Unknown Artist",
        joke_language: joke.joke_language ?? videoLanguage,
        genreImage: joke.genre_image ?? genres?.[0]?.image_url ?? "",
      }));
      setVideos(newData);
      const checkQuotaExhausted = jokesArr?.[0]?.is_exhausted;
      setQuotaExhausted(checkQuotaExhausted ?? false);
      setShowSerialChillerForError(false); // Reset error state on successful response

      // If no videos returned, hide loading
      if (newData.length === 0) {
        setIsLoading(false);
      }
    } else if (jokesResponse && !jokesResponse.ok) {
      // Check if the error code is 1013
      const errorResponse = jokesResponse as ErrorResponse;
      if (errorResponse?.code === 1013) {
        setShowSerialChillerForError(true);
        setVideos([]); // Clear videos array
      }
      // If API returns error, also hide loading
      setIsLoading(false);
    }
  }, [jokesResponse, videoLanguage]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch all progressive profiling questions on mount
  useEffect(() => {
    if (mounted && user?.id) {
      // Fetch Bottle Count question (question_number: 1)
      getQuestionByText.mutate(
        {
          question_text:
            "How many Sprite® bottles did you enjoy in the past week?",
          language_id: 1,
        },
        {
          onSuccess: (response) => {
            if (response?.ok && response.data?.id) {
              setBottleQuestionId(response.data.id);
              // Store options for mapping bottle count to option id
              if (response.data?.options) {
                setBottleQuestionOptions(response.data.options);
              }
            }
          },
        },
      );

      // Fetch Post Surprise Me question (question_number: 2)
      getPostSurpriseMeQuestion.mutate(
        {
          question_text: "What kind of jokes give you the biggest LOLs?",
          language_id: 1,
        },
        {
          onSuccess: (response) => {
            if (response?.ok && response.data?.id) {
              setPostSurpriseMeQuestionId(response.data.id);
              if (response.data?.options) {
                setPostSurpriseMeOptions(response.data.options);
              }
            }
          },
        },
      );

      // Fetch Post Login question (question_number: 3)
      getPostLoginQuestion.mutate(
        {
          question_text:
            "When does Sprite® usually make its way into your day?",
          language_id: 1,
        },
        {
          onSuccess: (response) => {
            if (response?.ok && response.data?.id) {
              setPostLoginQuestionId(response.data.id);
              if (response.data?.options) {
                setPostLoginOptions(response.data.options);
              }
            }
          },
        },
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, user?.id]);

  // Check if bottle question modal should be shown (question_number: 1)
  useEffect(() => {
    if (FORCE_SHOW_BOTTLE_QUESTION) {
      return;
    }

    if (
      checkModalData?.ok &&
      checkModalData.data?.show_modal === true &&
      checkModalData.data?.question_number === 1
    ) {
      setShowBottleQuestion(true);
    } else if (checkModalData?.ok) {
      setShowBottleQuestion(false);
    }
  }, [checkModalData, FORCE_SHOW_BOTTLE_QUESTION]);

  // Cascading check for Post Surprise Me at 4th place (question_number: 2)
  useEffect(() => {
    if (
      checkPostSurpriseMeModalData?.ok &&
      checkPostSurpriseMeModalData.data?.show_modal === true &&
      checkPostSurpriseMeModalData.data?.question_number === 2
    ) {
      setShowPostSurpriseMeAt4th(true);
    } else if (
      checkPostSurpriseMeModalData?.ok &&
      !checkPostSurpriseMeModalData.data?.show_modal
    ) {
      setShowPostSurpriseMeAt4th(false);
    }
  }, [checkPostSurpriseMeModalData]);

  // Cascading check for Post Login at 3rd place (question_number: 3)
  useEffect(() => {
    if (
      checkPostLoginModalData?.ok &&
      checkPostLoginModalData.data?.show_modal === true &&
      checkPostLoginModalData.data?.question_number === 3
    ) {
      setShowPostLoginAt3rd(true);
    } else if (
      checkPostLoginModalData?.ok &&
      !checkPostLoginModalData.data?.show_modal
    ) {
      setShowPostLoginAt3rd(false);
    }
  }, [checkPostLoginModalData]);

  const cmsData = useCMSData(mounted);

  // Update isProfilingQuestionActive based on which question is in view
  useEffect(() => {
    setIsProfilingQuestionActive(profilingQuestionInView !== null);
  }, [profilingQuestionInView]);

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

  // Hide loader once API data fetched and videos are processed
  useEffect(() => {
    if (!jokesLoading && videos && videos.length > 0) {
      // Allow loader to disappear after small delay so first video can load
      const timeout = setTimeout(() => setIsLoading(false), 500);
      return () => clearTimeout(timeout);
    }
  }, [jokesLoading, videos]);

  // Force play first video on page load
  useEffect(() => {
    if (!isLoading && videos.length > 0 && videoRefs.current[0]) {
      const playFirstVideo = async () => {
        try {
          const video = videoRefs.current[0];
          if (video) {
            video.muted = false; // Ensure video is not muted
            setIsMuted(false);
            // Try multiple times to start playback
            for (let i = 0; i < 3; i++) {
              try {
                await video.play();
                break; // If successful, exit the loop
              } catch (error) {
                console.error(error);
                await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1s between attempts
              }
            }
            // Update play states
            setVideoPlayStates((prev) => {
              const newStates = [...prev];
              newStates[0] = true;
              return newStates;
            });
          }
        } catch (error) {
          console.error("Failed to autoplay video:", error);
        }
      };

      playFirstVideo();
    }
  }, [isLoading, videos.length]);

  // Auto-play first video when component mounts and loading is complete
  useEffect(() => {
    if (!isLoading && videoRefs.current[0] && videos.length > 0) {
      const firstVideo = videoRefs.current[0];

      // Ensure activeVideoIndex is set to 0 first
      setActiveVideoIndex(0);

      // Then set video play states
      setVideoPlayStates((prev) => {
        const newStates = [...prev];
        newStates[0] = true;
        return newStates;
      });

      // Finally start playing the video
      firstVideo.currentTime = 0;
      firstVideo.play().catch(console.error);
    }
  }, [isLoading, videos.length]);

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
        const newStates = new Array(videos.length).fill(true); // Set all videos as ready by default
        return newStates;
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
    const newIndex =
      direction === "up"
        ? Math.max(0, activeVideoIndex - 1)
        : Math.min(videos.length, activeVideoIndex + 1);

    // Get the target element
    const targetElement = videoElements[newIndex];
    if (!targetElement) return;

    // Scroll to the target element
    targetElement.scrollIntoView({ behavior: "smooth" });

    // Update the active video index
    setActiveVideoIndex(newIndex);
  };

  // Video event handlers
  const handleVideoInView = useCallback((index: number) => {
    setActiveVideoIndex(index);

    // Pause all other videos
    videoRefs.current.forEach((video, idx) => {
      if (video && idx !== index) {
        video.pause();
        video.currentTime = 0;
      }
    });
  }, []);

  const handleVideoOutOfView = useCallback((index: number) => {
    // Pause video when it goes out of view
    const video = videoRefs.current[index];
    if (video) {
      video.pause();
      video.currentTime = 0;
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
    setActiveVideoIndex((prev) => (prev === index ? -1 : prev));
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

  // Handle video load to hide loading spinner
  const handleVideoLoad = (index: number) => {
    // Hide loading when first video is loaded
    if (index === 0) {
      setIsLoading(false);
    }
  };

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

  const triggerCDPEvent = useCallback(
    (reactionType: string, jokeId: string) => {
      if (reactionType && jokeId && user?.id) {
        const payload: ReactionCDPEventPayload =
          CDPEventPayloadBuilder.buildReactionPayload(
            jokeId,
            reactionType,
            user?.phone_number ?? "",
            user?.email ?? "",
          );
        sendCDPEvent(payload);
      }
    },
    [sendCDPEvent, user?.id],
  );

  const triger_CDP_View_Scroll_LOL = (jokeId: string) => {
    if (jokeId && user?.id) {
      const payload: ReactionCDPEventPayload =
        CDPEventPayloadBuilder.buildViewJokePayload(
          jokeId,
          user?.phone_number ?? "",
          user?.email ?? "",
        );
      sendCDPEvent(payload);
    }
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

  // Handler for when an emoji is selected
  const handleEmojiSelect = (reaction: SelectedReactionData) => {
    // Prevent reactions while still loading or if no active video
    if (
      isLoading ||
      activeVideoIndex === undefined ||
      activeVideoIndex === null ||
      !videos[activeVideoIndex]
    ) {
      console.warn("Reaction blocked: Component not fully initialized", {
        isLoading,
        activeVideoIndex,
        videosCount: videos.length,
        hasActiveVideo: !!videos[activeVideoIndex],
      });
      return;
    }

    const payload = {
      assetId: videos[activeVideoIndex]?.id ?? "",
      reactionType: reaction.name,
    };
    sendGluedinUserReaction(payload);
  };

  useEffect(() => {
    if (sendGluedinUserReactionData?.ok && activeVideoIndex !== -1) {
      const currentVideoId = videos[activeVideoIndex]?.id;
      const reactionType = sendGluedinUserReactionData?.data?.reactionType;
      triggerCDPEvent(reactionType, currentVideoId);
      
      // Track Scroll & LOL Alloy events based on reaction type
      if (reactionType === "laugh") {
        trackClick(CDP_EVENT_SUB_TYPES.SCROLL_LOL_HAHA);
      } else if (reactionType === "neutral") {
        trackClick(CDP_EVENT_SUB_TYPES.SCROLL_LOL_MEH);
      } else if (reactionType === "sad") {
        trackClick(CDP_EVENT_SUB_TYPES.SCROLL_LOL_GRR);
      }
      
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
          newArr[currentVideoIndexData] = {
            ...newArr[currentVideoIndexData],
            isReacted: true,
            reactionType: reactionType,
            user_reaction: {
              ...newArr[currentVideoIndexData]?.user_reaction,
              [reactionType]:
                (newArr[currentVideoIndexData]?.user_reaction?.[
                  reactionType as keyof IUserReaction
                ] ?? 0) + 1,
            },
          };
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

  useEffect(() => {
    if (postReelReactionData?.ok) {
      // Small delay to ensure DOM is stable before triggering animation
      setTimeout(() => {
        triggerAnimation();
      }, 100);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postReelReactionData]);

  const toggleMute = (index: number) => {
    if (index === activeVideoIndex) {
      if (videoRefs.current[index]) {
        videoRefs.current[index]!.muted = !isMuted;
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
  };

  // Serial Chiller End of Feed Page Component
  const SerialChillerEndPage: React.FC = () => {
    return (
      <div
        className="w-full flex flex-col justify-center items-center bg-white text-black text-center px-6"
        style={{
          height:
            typeof window !== "undefined" && window.innerWidth >= 768
              ? "100vh"
              : mobilePageHeight,
        }}
      >
        <div className="w-[279px] flex flex-col items-center">
          {/* Breaking News Header */}
          <h1 className="font-bold text-black md:text-[25px] text-[20px] mb-[15px] text-center">
            {cmsData?.scrollAndLol?.breakingNews}
          </h1>

          {/* Main Message */}
          <h2 className="font-bold text-black md:text-[15px] text-[13px] leading-relaxed mb-6">
            {cmsData?.scrollAndLol?.serialChiller}
          </h2>

          {/* Subtitle */}
          <p className="font-normal text-black md:text-[14px] text-[13px] leading-relaxed">
            {cmsData?.scrollAndLol?.scrollAndLolLastPageContent}
          </p>
        </div>
      </div>
    );
  };

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
      triger_CDP_View_Scroll_LOL(currentVideoId);
      trackPageView(CDP_EVENT_SUB_TYPES.SCROLL_LOL_VIEW);
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
      triggerPixelEvents(FACEBOOK_PIXEL_EVENTS.SPRITE_MY_VIDEOS);
      const currentVideoId = videos[activeVideoIndex]?.id ?? "";
      const currentVideoData = videos.find(
        (video: VideoData) => video.id === currentVideoId,
      );
      if (currentVideoData) {
        setCurrentVideoData(currentVideoData);
        trackScrollLOLView();
        activateConsumption({ joke_id: currentVideoId });
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

  // Handler for language selection from ExhaustVideo
  const handleLanguageSelect = (langCode: string) => {
    // Update only the local video language state, not the global website language
    setVideoLanguage(langCode);
  };

  // Handlers for profiling question in view state
  const handleProfilingQuestionInView = useCallback((questionType: string) => {
    setProfilingQuestionInView(questionType);
  }, []);

  const handleProfilingQuestionOutOfView = useCallback(() => {
    setProfilingQuestionInView(null);
  }, []);

  // Handler for submitting bottle count
  const handleBottleSubmit = (count: number) => {
    if (bottleQuestionId) {
      // Find the option id based on the count (bottle count 1-7 maps to display_order)
      const selectedOption = bottleQuestionOptions.find(
        (option) => option.display_order === count,
      );

      if (selectedOption) {
        // Submit answer with the correct option id
        submitBottleAnswers.mutate(
          [
            {
              question_id: bottleQuestionId,
              answer_id: selectedOption.id,
              question_number: 1,
            },
          ],
          {
            onSuccess: () => {
              if (user?.id) {
                sendCDPEvent(
                  CDPEventPayloadBuilder.buildBottleCountPayload(
                    count,
                    user?.phone_number ?? ""
                  )
                );
              }
              setShowBottleQuestion(false);
              setProfilingQuestionInView(null);
            },
          },
        );
      }
    }
  };

  // Handler for skipping bottle question (I'm yet to try Sprite)
  const handleBottleSkip = () => {
    if (bottleQuestionId) {
      updateLastViewed.mutate({ questionId: bottleQuestionId, questionNumber: 1 });
    }
    if (user?.id) {
      sendCDPEvent(
        CDPEventPayloadBuilder.buildBottleCountSkipPayload(user?.phone_number ?? "")
      );
    }
    setShowBottleQuestion(false);
    setProfilingQuestionInView(null);
  };

  // Handler for submitting Post Surprise Me answer (at 4th place)
  const handlePostSurpriseMeSubmit = (optionId: number) => {
    if (postSurpriseMeQuestionId) {
      submitPostSurpriseMeAnswers.mutate(
        [
          {
            question_id: postSurpriseMeQuestionId,
            answer_id: optionId,
            question_number: 2,
          },
        ],
        {
          onSuccess: () => {
            if (user?.id) {
              const selectedGenreOption = postSurpriseMeOptions.find(
                (option) => option.id === optionId
              );
              sendCDPEvent(
                CDPEventPayloadBuilder.buildGenrePreferencePayload(
                  selectedGenreOption?.option_text ?? "",
                  user?.phone_number ?? ""
                )
              );
            }
            setShowPostSurpriseMeAt4th(false);
            setProfilingQuestionInView(null);
          },
        },
      );
    }
  };

  // Handler for skipping Post Surprise Me question
  const handlePostSurpriseMeSkip = () => {
    if (postSurpriseMeQuestionId) {
      updatePostSurpriseMeLastViewed.mutate({
        questionId: postSurpriseMeQuestionId,
        questionNumber: 2
      });
    }
    if (user?.id) {
      sendCDPEvent(
        CDPEventPayloadBuilder.buildGenrePreferenceSkipPayload(user?.phone_number ?? "")
      );
    }
    setShowPostSurpriseMeAt4th(false);
    setProfilingQuestionInView(null);
  };

  // Handler for submitting Post Login answer (at 3rd place)
  const handlePostLoginSubmit = (optionId: number) => {
    if (postLoginQuestionId) {
      submitPostLoginAnswers.mutate(
        [
          {
            question_id: postLoginQuestionId,
            answer_id: optionId,
            question_number: 3,
          },
        ],
        {
          onSuccess: () => {
            if (user?.id) {
              const sortedDaypartOptions = [...postLoginOptions].sort(
                (a, b) => a.display_order - b.display_order
              );
              const daypartIndex = sortedDaypartOptions.findIndex(
                (option) => option.id === optionId
              );
              sendCDPEvent(
                CDPEventPayloadBuilder.buildDaypartPreferencePayload(
                  daypartIndex,
                  user?.phone_number ?? ""
                )
              );
            }
            setShowPostLoginAt3rd(false);
            setProfilingQuestionInView(null);
          },
        },
      );
    }
  };

  // Handler for skipping Post Login question
  const handlePostLoginSkip = () => {
    if (postLoginQuestionId) {
      updatePostLoginLastViewed.mutate({
        questionId: postLoginQuestionId,
        questionNumber: 3
      });
    }
    if (user?.id) {
      sendCDPEvent(
        CDPEventPayloadBuilder.buildDaypartPreferenceSkipPayload(user?.phone_number ?? "")
      );
    }
    setShowPostLoginAt3rd(false);
    setProfilingQuestionInView(null);
  };

  // Calculate mobile page height accounting for footer
  const mobilePageHeight =
    viewportHeight > 0 ? `${viewportHeight - footerHeight}px` : "100vh";

  // Block keyboard scrolling when profiling question is active
  useEffect(() => {
    if (!isProfilingQuestionActive) return;

    const preventScroll = (e: KeyboardEvent) => {
      const scrollKeys = [
        "ArrowUp",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
        "PageUp",
        "PageDown",
        "Home",
        "End",
        " ",
      ];
      if (scrollKeys.includes(e.key)) {
        e.preventDefault();
      }
    };

    const preventWheel = (e: WheelEvent) => {
      e.preventDefault();
    };

    document.addEventListener("keydown", preventScroll);
    document.addEventListener("wheel", preventWheel, { passive: false });

    return () => {
      document.removeEventListener("keydown", preventScroll);
      document.removeEventListener("wheel", preventWheel);
    };
  }, [isProfilingQuestionActive]);

  return (
    <div className="md:w-full md:h-screen md:pt-[100px] pt-0 flex flex-col justify-center items-center bg-[url('/assets/images/scroll-and-lol-bg.png')] bg-cover bg-center bg-fixed overflow-hidden">
      {isLoading ? (
        <></>
      ) : (
        <div className="w-full container md:block hidden">
          <Header
            title={cmsData?.scrollAndLol?.scrollAndLolHeading}
            textTransform="capitalize"
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
          <>
            <div
              key={languageChangeKey}
              ref={containerRef}
              className={`relative md:max-h-[calc(100vh-200px)] w-full overflow-x-hidden snap-y snap-mandatory scroll-smooth scrollbar-hide md:gap-[30px] ${
                isProfilingQuestionActive
                  ? "overflow-y-hidden"
                  : "overflow-y-scroll"
              }`}
              style={{
                scrollSnapType: "y mandatory",
                scrollBehavior: "smooth",
                overscrollBehaviorX: "none",
                height:
                  typeof window !== "undefined" && window.innerWidth >= 768
                    ? "100vh"
                    : mobilePageHeight,
                pointerEvents: isProfilingQuestionActive ? "none" : "auto",
                touchAction: isProfilingQuestionActive ? "none" : "auto",
              }}
            >
              {videos.map((video, index) => {
                // Show Post Login Question at index 2 (3rd place) if question_number: 3
                if (index === 2 && showPostLoginAt3rd) {
                  return (
                    <ProfilingQuestionWrapper
                      key={`post-login-${video.id}`}
                      questionType="post-login"
                      onInView={handleProfilingQuestionInView}
                      onOutOfView={handleProfilingQuestionOutOfView}
                      className="video-container relative md:max-h-[calc(100vh-200px)] w-full flex-shrink-0 md:mb-[100px] last:md:mb-0 md:flex md:items-center md:justify-center"
                      dataIndex="post-login-question"
                      style={{
                        scrollSnapAlign: "start",
                        scrollSnapStop: "always",
                        height:
                          typeof window !== "undefined" &&
                          window.innerWidth >= 768
                            ? "calc(100vh - 200px)"
                            : mobilePageHeight,
                        pointerEvents: "auto",
                      }}
                    >
                      <PostLoginQuestion
                        options={postLoginOptions}
                        onSubmit={handlePostLoginSubmit}
                        onSkip={handlePostLoginSkip}
                        isSubmitting={submitPostLoginAnswers.isPending}
                      />
                    </ProfilingQuestionWrapper>
                  );
                }

                // Show Post Surprise Me Question at index 3 (4th place) if question_number: 2
                if (index === 3 && showPostSurpriseMeAt4th) {
                  return (
                    <ProfilingQuestionWrapper
                      key={`post-surprise-me-${video.id}`}
                      questionType="post-surprise-me"
                      onInView={handleProfilingQuestionInView}
                      onOutOfView={handleProfilingQuestionOutOfView}
                      className="video-container relative md:max-h-[calc(100vh-200px)] w-full flex-shrink-0 md:mb-[100px] last:md:mb-0 md:flex md:items-center md:justify-center"
                      dataIndex="post-surprise-me-question"
                      style={{
                        scrollSnapAlign: "start",
                        scrollSnapStop: "always",
                        height:
                          typeof window !== "undefined" &&
                          window.innerWidth >= 768
                            ? "calc(100vh - 200px)"
                            : mobilePageHeight,
                        pointerEvents: "auto",
                      }}
                    >
                      <PostSurpriseMeQuestion
                        options={postSurpriseMeOptions}
                        genres={genres}
                        onSubmit={handlePostSurpriseMeSubmit}
                        onSkip={handlePostSurpriseMeSkip}
                        isLoading={getPostSurpriseMeQuestion.isPending}
                        isSubmitting={submitPostSurpriseMeAnswers.isPending}
                      />
                    </ProfilingQuestionWrapper>
                  );
                }

                // Show Bottle Count Question at its existing position if question_number: 1
                if (index === 3 && showBottleQuestion) {
                  return (
                    <ProfilingQuestionWrapper
                      key={`bottle-question-${video.id}`}
                      questionType="bottle-count"
                      onInView={handleProfilingQuestionInView}
                      onOutOfView={handleProfilingQuestionOutOfView}
                      className="video-container relative md:max-h-[calc(100vh-200px)] w-full flex-shrink-0 md:mb-[100px] last:md:mb-0 md:flex md:items-center md:justify-center"
                      dataIndex="bottle-question"
                      style={{
                        scrollSnapAlign: "start",
                        scrollSnapStop: "always",
                        height:
                          typeof window !== "undefined" &&
                          window.innerWidth >= 768
                            ? "calc(100vh - 200px)"
                            : mobilePageHeight,
                        pointerEvents: "auto",
                      }}
                    >
                      <BottleCountQuestion
                        onSubmit={handleBottleSubmit}
                        onSkip={handleBottleSkip}
                      />
                    </ProfilingQuestionWrapper>
                  );
                }

                return (
                  <VideoItem
                    key={video.id}
                    video={video}
                    index={index}
                    isActive={activeVideoIndex === index}
                    isMuted={isMuted}
                    mobilePageHeight={mobilePageHeight}
                    onVideoInView={handleVideoInView}
                    onVideoOutOfView={handleVideoOutOfView}
                    onVideoLoad={handleVideoLoad}
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
                    activeVideoIndexForPreload={activeVideoIndex}
                  />
                );
              })}

              {/* Serial Chiller End Page as part of scroll sequence */}
              <div
                className="video-container relative md:max-h-[calc(100vh-200px)] w-full flex-shrink-0 md:mb-[100px] last:md:mb-0 md:flex md:items-center md:justify-center"
                data-index={videos.length}
                style={{
                  scrollSnapAlign: "start",
                  scrollSnapStop: "always",
                  height:
                    typeof window !== "undefined" && window.innerWidth >= 768
                      ? "calc(100vh - 200px)"
                      : mobilePageHeight,
                }}
              >
                {showSerialChillerForError ? (
                  <SerialChillerEndPage />
                ) : // <BottleCountQuestion />

                // <PostSurpriseMeQuestion
                //       options={postSurpriseMeOptions}
                //       genres={genres}
                //       onSubmit={handlePostSurpriseMeSubmit}
                //       onSkip={handlePostSurpriseMeSkip}
                //       isLoading={getPostSurpriseMeQuestion.isPending}
                //       isSubmitting={submitPostSurpriseMeAnswers.isPending}
                //     />
                //     <PostLoginQuestion
                //     options={postLoginOptions}
                //     onSubmit={handlePostLoginSubmit}
                //     onSkip={handlePostLoginSkip}
                //     isSubmitting={submitPostLoginAnswers.isPending}
                //   />
                !quotaExhausted ? (
                  <ExhaustVideo
                    selectedLanguage={videoLanguage}
                    onLanguageSelect={handleLanguageSelect}
                    headerText={cmsData?.scrollAndLol?.exhaustHeading}
                    subText={cmsData?.scrollAndLol?.exhaustSubheading}
                    onInView={setIsExhaustVideoInView}
                  />
                ) : (
                  <SerialChillerEndPage />
                  // <BottleCountQuestion />
                  // <PostSurpriseMeQuestion
                  //       options={postSurpriseMeOptions}
                  //       genres={genres}
                  //       onSubmit={handlePostSurpriseMeSubmit}
                  //       onSkip={handlePostSurpriseMeSkip}
                  //       isLoading={getPostSurpriseMeQuestion.isPending}
                  //       isSubmitting={submitPostSurpriseMeAnswers.isPending}
                  //     />

                  //   <PostLoginQuestion
                  //   options={postLoginOptions}
                  //   onSubmit={handlePostLoginSubmit}
                  //   onSkip={handlePostLoginSkip}
                  //   isSubmitting={submitPostLoginAnswers.isPending}
                  // />
                )}
              </div>
            </div>

            {/* Reaction Emojis - only visible when fully initialized and not on end page or exhaust video */}
            {!isLoading &&
              activeVideoIndex !== undefined &&
              activeVideoIndex !== null &&
              activeVideoIndex < videos.length &&
              currentVideoData &&
              activeVideoIndex !== -1 && (
                <div
                  className="absolute right-[10px] md:bottom-[12vh] md:right-[clamp(-8rem,0vw,-3rem)] z-20 md:scale-[clamp(0.7,1.2vh,1.2)] origin-bottom-right md:mb-0"
                  style={{
                    bottom:
                      typeof window !== "undefined" && window.innerWidth >= 768
                        ? "12vh"
                        : `${footerHeight - 10}px`,
                  }}
                >
                  <ReactionEmojies
                    key={currentVideoData?.id}
                    videoId={currentVideoData?.id}
                    onEmojiSelect={handleEmojiSelect}
                    userReaction={currentVideoData?.user_reaction}
                    reactionType={currentVideoData?.reactionType}
                    isReacted={currentVideoData?.isReacted}
                    viewCount={currentVideoData?.view_count}
                  />
                </div>
              )}
          </>
        )}
      </div>

      {/* Scroll buttons - only visible when not loading and no profiling question is active */}
      {!isLoading && (
        <div className="hidden md:flex flex-col gap-4 absolute bottom-[97.32px] md:right-[20px] lg:right-[100px] transform z-20">
          <button
            onClick={() => scrollToVideo("up")}
            className={`w-[64px] h-[64px] rounded-full border-2 border-green flex items-center justify-center transition-all duration-300 ${
              activeVideoIndex === 0 || isProfilingQuestionActive
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
            aria-label="Scroll up"
            disabled={activeVideoIndex === 0 || isProfilingQuestionActive}
          >
            <Image
              src="/other-svgs/up-arrow.svg"
              alt="Scroll up"
              width={25}
              height={25}
              className={
                activeVideoIndex === 0 || isProfilingQuestionActive
                  ? "opacity-50"
                  : ""
              }
            />
          </button>
          <button
            onClick={() => scrollToVideo("down")}
            className={`w-[64px] h-[64px] rounded-full border-2 border-green flex items-center justify-center transition-all duration-300 ${
              activeVideoIndex === videos.length || isProfilingQuestionActive
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
            aria-label="Scroll down"
            disabled={
              activeVideoIndex === videos.length || isProfilingQuestionActive
            }
          >
            <Image
              src="/other-svgs/down-arrow.svg"
              alt="Scroll down"
              width={25}
              height={25}
              className={`${
                activeVideoIndex === videos.length || isProfilingQuestionActive
                  ? "opacity-50"
                  : ""
              }`}
            />
          </button>
        </div>
      )}
      <CoinAnimation isVisible={isAnimating} animationKey={animationKey} />
    </div>
  );
};

export default ScrollAndLol;
