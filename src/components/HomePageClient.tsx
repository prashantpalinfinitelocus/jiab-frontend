"use client";
import { useEffect, useState } from "react";
import Login from "@/components/common/Login";
import OtpModal from "@/components/common/OtpModal";
import Signup from "@/components/common/Signup";
import SurpriseMeLockModal from "@/components/common/SurpriseMeLockModal";
import SurpriseMeModal from "@/components/common/SurpriseMeModal";
import useAppSelector from "@/hooks/useSelector";
import { useCMSData } from "@/data";
import Image from "next/image";

import Header from "@/components/common/Header/Header";
import VideoScroll from "@/components/video-carousel/VideoScroll";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import CircularBoxesModal, {
  BoxIds,
} from "@/components/common/CircularBoxesModal";
import useWindowWidth from "@/hooks/useWindowWidth";
import SvgIcons from "@/components/common/SvgIcons";
import {
  GA_EVENTS,
  ICONS_NAMES,
  SESSION_STORAGE_KEYS,
  CATEGORY_ID_CMS_KEY_MAPPING,
  LANGUAGE_MNEMONICS,
  FLOOD_LIGHT_EVENTS,
  FACEBOOK_PIXEL_EVENTS,
} from "@/constants";
import { updateSurpriseMe, updateLoginModal } from "@/store/auth/auth.slice";
import useAppDispatch from "@/hooks/useDispatch";
import { useGetJokeByMutation } from "@/api/hooks/JokeHooks";
import {
  TADKA_INSTAGRAM_REELS,
  tadkaReelThumbnail,
} from "@/constants/tadkaInstagramReels";
import { IJoke, TGetJokesParams } from "@/api/types/JokeTypes";
import { useLanguage } from "@/hooks/useLanguage";
import {
  triggerFloodLightEvents,
  triggerGAEvent,
  triggerPixelEvents,
} from "@/utils/gTagEvents";
import useAlloyEvents from "@/hooks/useAlloyEvents";
import HomePageJokeSection from "./common/HomePageJokeSection";
import { PJChallenge, ChillGuyBanner } from "./Banners";
import MemeburstBanner from "./Banners/Memeburst";
import HomePageMemeBurst from "./HomePageMemeBurst";
import {
  VideoRowSkeleton,
  CategoriesRowSkeleton,
} from "./common/skeletons/HomePageSkeleton";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useGlobalLoader } from "@/hooks/useGlobalLoader";
import HomePageDesktopOnboarding, {
  DesktopBoxIds,
} from "./common/HomePageDesktopOnboarding";
import { getSessionStorageItem } from "@/utils";
import {
  CoinAnimation,
  useCoinAnimation,
} from "@/components/common/CoinAnimation";
import { useCallback } from "react";
import {
  SocialMediaCDPEventPayload,
  CDPEventPayloadBuilder,
  BaseCDPEventPayload,
} from "@/api/utils/cdpEvents";
import { useSendCDPEvent } from "@/api/hooks/CDPHooks";
import { INFOBIP_WHATSAPP_URL } from "@/config";
import { cn } from "@/lib/utils";
import BuyNowCarousel from "./BuyNowCarousel";
import HomePageYouTube from "./HomePageYouTube";

// The first Instagram reels, shown in the home page Tadka row; each opens Tadka Hub at that reel.
const TADKA_HOME_REELS = TADKA_INSTAGRAM_REELS.slice(0, 3).map(({ code }) => ({
  id: code,
  src: tadkaReelThumbnail(code),
  url: `/tadka-hub?reel=${code}`,
  title: "",
  language: "",
  genreImage: "",
}));

// Videos shown in the home page YouTube section; empty hides the section.
const HOME_YOUTUBE_VIDEOS = [
  { url: "https://youtu.be/aMnZR6Gtvq4", title: "Arshdeep X Samreen" },
  { url: "https://youtu.be/bi5VYKq0X5Y", title: "Kullu X Larissa" },
  { url: "https://youtu.be/PgdAL2WckZs", title: "Shruti X Shantanu" },
];

interface IVideoData {
  id: string;
  src: string;
  url: string;
  title: string;
  language: string;
  genreImage: string;
}

export default function HomePageClient() {
  const {
    otpSent,
    otpVerified,
    loginModal,
    crossModal,
    enableCoachMarks,
    refreshTokenNotVerified,
  } = useAppSelector((state) => state.auth);

  // Get genres from Redux store
  const { genres } = useAppSelector((state) => state.reference);

  const dispatch = useAppDispatch();
  const width = useWindowWidth();

  const [isClient, setIsClient] = useState(false);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsClient(true);
  }, []);

  // Get mapped CMS data using our data layer

  const [videoData, setVideosData] = useState<IVideoData[]>([]);
  const cmsData = useCMSData(mounted);

  // Fetch jokes to populate video carousel dynamically

  const { selectedLanguage } = useLanguage();
  const { trackSocialFollow, trackClick, CDP_EVENT_SUB_TYPES } = useAlloyEvents();
  const isMathilyOdiaKannada =
    selectedLanguage === LANGUAGE_MNEMONICS.KANNADA ||
    selectedLanguage === LANGUAGE_MNEMONICS.ORIYA ||
    selectedLanguage === LANGUAGE_MNEMONICS.MAITHILI;
  const isEnglishHindi =
    selectedLanguage === LANGUAGE_MNEMONICS.ENGLISH ||
    selectedLanguage === LANGUAGE_MNEMONICS.HINDI;
  const { data: jokesResponse, mutate: getJokesData } = useGetJokeByMutation();

  useEffect(() => {
    if (selectedLanguage) {
      const params: TGetJokesParams = {
        limit: 3,
        language: selectedLanguage,
        type: "home",
      };
      getJokesData(params);
    }
  }, [selectedLanguage, getJokesData]);

  useEffect(() => {
    if (jokesResponse?.ok) {
      const newVideosData: IVideoData[] =
        jokesResponse?.data?.map((joke: IJoke) => ({
          id: joke?.id ?? "",
          src: joke?.thumbnail_url ?? "",
          url: `/scroll-and-lol?selected_joke=${encodeURIComponent(
            joke.id
          )}&langId=${selectedLanguage}`,
          title: joke?.title ?? "",
          language: joke?.joke_language ?? "",
          genreImage: joke?.genre_image ?? "",
        })) ?? [];
      setVideosData(newVideosData);
    }
  }, [jokesResponse, selectedLanguage]);

  // const jokesData = jokesResponse?.ok ? (jokesResponse.data as IJoke[]) : [];

  // Transform genres from API to match the expected structure
  const categories =
    genres?.map((genre) => {
      const CATEGORY_ID_CMS_KEY_MAPPING_TYPED =
        CATEGORY_ID_CMS_KEY_MAPPING as Record<number, string>;
      const key = CATEGORY_ID_CMS_KEY_MAPPING_TYPED[genre.id];
      const isValidKey =
        typeof key === "string" && key in cmsData.jokeBoxFilter;

      return {
        id: genre.id.toString(),
        name: isValidKey
          ? (cmsData.jokeBoxFilter[
              key as keyof typeof cmsData.jokeBoxFilter
            ] as string)
          : genre.genre, // fallback to original genre name
        image_url: genre.image_url,
        url: "/pick-mood",
      };
    }) || [];

  // Calculate how many pages we need based on screen size
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(6); // Default to desktop
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Genre-specific surprise me modal state
  const [genreSurpriseModal, setGenreSurpriseModal] = useState<boolean>(false);
  const [selectedGenreId, setSelectedGenreId] = useState<number | undefined>(
    undefined
  );

  // SerialChillerPopup session logic
  const [serialChillerOpen, setSerialChillerOpen] = useState(false);

  // Coin animation hooks
  const {
    isAnimating: isVoteAnimating,
    triggerAnimation: triggerVoteAnimation,
    animationKey: voteAnimationKey,
  } = useCoinAnimation();

  useEffect(() => {
    // Use window check for client-side only
    const handleResize = () => {
      // Set items per page based on screen width
      if (window.innerWidth < 768) {
        setItemsPerPage(4); // Mobile: 4 items
      } else {
        setItemsPerPage(6); // Desktop: 6 items
      }
    };

    // Initial check
    handleResize();

    // Add resize listener
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (width < 768) {
      if (crossModal) {
        setIsModalOpen(true);
      } else {
        setIsModalOpen(false);
      }
    } else {
      setIsModalOpen(false);
    }
  }, [width, crossModal]);

  // Calculate page count
  useEffect(() => {
    setPageCount(Math.ceil(categories.length / itemsPerPage));
  }, [itemsPerPage, categories.length]);

  useEffect(() => {
    if (!api) {
      return;
    }

    api.on("select", () => {
      const selectedIndex = api.selectedScrollSnap();
      const totalItems = categories.length;
      const lastPage = Math.ceil(totalItems / itemsPerPage) - 1;

      // Check if we're at or near the end of the carousel
      if (selectedIndex >= totalItems - itemsPerPage) {
        setCurrent(lastPage);
      } else {
        setCurrent(Math.floor(selectedIndex / itemsPerPage));
      }
    });
  }, [api, itemsPerPage, categories.length]);

  // Function to navigate to a specific page
  const goToPage = (pageIndex: number) => {
    if (!api) return;
    api.scrollTo(pageIndex * itemsPerPage);
  };

  // Function to handle category click - will trigger modal
  const handleCategoryClick = (category: {
    id: string;
    name: string;
    image_url: string;
    url: string;
  }) => {
    // Check if user is authenticated before showing modal
    if (isAuthenticated) {
      setSelectedGenreId(parseInt(category.id));
      setGenreSurpriseModal(true);
      triggerGAEvent(GA_EVENTS.SPRITE_J24_SURPRISE_ME);
      if (category?.name) {
        triggerFloodLightEvents(
          FLOOD_LIGHT_EVENTS.Sprite_JIAB25_SelectMood_Counter,
          {
            u45: category.name,
          }
        );
      }
    } else {
      // Show SurpriseMeLockModal for unauthenticated users
      setSelectedGenreId(parseInt(category.id));
      dispatch(updateLoginModal({ loginModal: true }));
    }
  };

  const { isAuthenticated, isFirstLogin, surpriseMe } = useAppSelector(
    (state) => state.auth
  );
  const { user } = useAppSelector((state) => state.profile);
  const { forceHideLoader } = useGlobalLoader();

  const router = useRouter();
  const { mutate: sendCDPEvent } = useSendCDPEvent();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  useEffect(() => {
    // Show SerialChillerPopup only once after login
    const hasShownSerialChiller =
      getSessionStorageItem(
        SESSION_STORAGE_KEYS.HAS_SHOWN_SERIAL_CHILL_MODAL
      ) === "true";
    if (isAuthenticated && !hasShownSerialChiller) {
      setSerialChillerOpen(true);
    }
  }, [isAuthenticated, enableCoachMarks]);

  // Function to handle successful vote animation
  const handleVoteSuccess = useCallback(() => {
    triggerVoteAnimation();
  }, [triggerVoteAnimation]);

  const handlePJChallengeClick = () => {
    triggerGAEvent(GA_EVENTS.SPRITE_J24_SUBMIT_JOKE);
    triggerFloodLightEvents(
      FLOOD_LIGHT_EVENTS.Sprite_JIAB25_PJChallenge_Counter
    );
    triggerPixelEvents(FACEBOOK_PIXEL_EVENTS.SPRITE_CHALLENGE);
    triggerCDP_PJ_Challenge();
    router.push("/submit-your-joke");
  };

  const closeGenreSurpriseMe = () => {
    forceHideLoader();
    setGenreSurpriseModal(false);
    setSelectedGenreId(undefined);
  };

  const triggerCDPEvent = (eventSubType: string) => {
    if (eventSubType && user?.id) {
      const payload: SocialMediaCDPEventPayload =
        CDPEventPayloadBuilder.buildSocialMediaPayload(
          eventSubType,
          user?.phone_number ?? "",
          user?.email ?? ""
        );
      sendCDPEvent(payload);
    }
  };

  const triggerCDP_PJ_Challenge = () => {
    if (user?.id) {
      const payload: BaseCDPEventPayload =
        CDPEventPayloadBuilder.buildUGCInterestPayload(
          user?.phone_number ?? "",
          user?.email ?? ""
        );
      sendCDPEvent(payload);
    }
  };

  const isTamil = selectedLanguage === "ta";

  // Open login modal if ?login=true is present
  useEffect(() => {
    const loginParam = searchParams?.get("login");
    if (loginParam === "true" && !isAuthenticated && !loginModal) {
      dispatch(updateLoginModal({ loginModal: true }));
    }
  }, [searchParams, isAuthenticated, loginModal, dispatch]);

  // Clear ?login=true from URL when login modal closes
  useEffect(() => {
    const loginParam = searchParams?.get("login");
    if (loginParam === "true" && !loginModal) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("login");
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname);
    }
  }, [loginModal, searchParams, router, pathname]);

  const buyNowItems = [
    {
      id: 1,
      image: "/assets/temp/3-blinkit.png",
      title: "Blinkit",
      floodLightEvent: FLOOD_LIGHT_EVENTS.Sprite_JIAB25_BlinkIt_Counter,
      mobileLink:
        "https://blinkit.onelink.me/z75u/lxnzgoxg?utm_source=display_p&utm_medium=display&utm_campaign=&utm_term=BlinkitBuyOutOnSpriteJIABMobile&utm_content=image",
      webLink:
        "https://blinkit.com/dc/?collection_uuid=OTg3NjU0MzIxMjM0NDI5NzQ=&utm_source=display_p&utm_medium=display&utm_campaign=&utm_term=BlinkitBuyOutOnSpriteJIABweb&utm_content=image",
    },
    {
      id: 2,
      image: "/assets/temp/1-flipkart.png",
      floodLightEvent: FLOOD_LIGHT_EVENTS.Sprite_JIAB25_Flipkart_Counter,
      title: "Flipkart",
      link: "https://www.flipkart.com/grocery/snacks-beverages/soft-drinks/cold-drinks/pr?sid=73z%2Cujs%2Cdfw%2Czxc&otracker%5b%5d=categorytree&otracker%5b%5d=pp_rich_navigation_2_1.navigationCard.RICH_NAVIGATION_Snacks%2B%2526%2BBeverages%2B~Soft%2BDrinks~Aerated%2BDrinks_3FYS7U5BONJL&marketplace=GROCERY&fm=neo%2Fmerchandising&iid=M_ff082628-f373-4ca9-9384-ada0a7063f7e_1_3UF14KMKC2VU_MC.3FYS7U5BONJL&cid=3FYS7U5BONJL&p%5b%5d=facets.brand%255B%255D%3DSprite&ocmpid=BrandAds_Sprite&utm_source=display_p&utm_medium=display&utm_campaign=&utm_term=flipkartbuyOutOnSpriteJIAB&utm_content=image",
    },
    {
      id: 3,
      image: "/assets/temp/2-big-basket.png",
      floodLightEvent: FLOOD_LIGHT_EVENTS.Sprite_JIAB25_BigBasket_Counter,
      title: "Big Basket",
      link: "https://www.bigbasket.com/ps/?q=sprite&utm_source=coke&utm_medium=referral&utm_campaign=coke2home_shopbybrand_Sprite&utm_source=display_p&utm_medium=display&utm_campaign=&utm_term=bigbasketbuyOutOnSpriteJIAB&utm_content=image",
    },
    {
      id: 4,
      image: '/assets/temp/4-swiggy.png',
      floodLightEvent:FLOOD_LIGHT_EVENTS.Sprite_JIAB25_Swiggy_Counter,
      title: 'Swiggy',
      link: 'https://www.swiggy.com/stores/instamart/item/L86AQ309CP?share=true&utm_source=display_p&utm_medium=display&utm_campaign=&utm_term=SwiggyIMbuynowJIABweb&utm_content=image'
    },
    // {
    //   id: 5,
    //   image: "/assets/temp/5-jiomart.png",
    //   title: "JioMart",
    //   floodLightEvent: FLOOD_LIGHT_EVENTS.Sprite_JIAB25_JioMart_Counter,
    //   link: "https://www.jiomart.com/groceries/b/sprite/636?utm_source=display_p&utm_medium=display&utm_campaign=&utm_term=jiomartOutOnSpriteJIAB&utm_content=image",
    // },
    {
      id: 6,
      image: "/assets/temp/6-amazon.png",
      floodLightEvent: FLOOD_LIGHT_EVENTS.Sprite_JIAB25_Amazone_Counter,
      title: "Amazon",
      link: "https://www.amazon.in/stores/page/3D23EFF4-EF2F-4F2C-A540-06234B9E9BEC?ingress=0&visitId=73dc4d1b-6236-4998-8d55-776c1440222d&utm_source=display_p&utm_medium=display&utm_campaign=&utm_term=AmazonBuyOutOnSpriteJIAB&utm_content=image",
    },
  ];

  return (
    <div className="bg-lightGray min-h-screen md:pb-[28px]">
      {/* SerialChillerPopup only once after login */}

      <div className="md:w-[76.57%] mx-auto md:pt-24 pt-20">
        {/* Modals */}
        {/* Never alongside the login flow: both dialogs sit at the same z-index
            and this one renders last, so it covers the login box and swallows
            the clicks meant for it. Its only job is to prompt a sign in, which
            is already on screen - as it is for anyone arriving on a shared
            link, since that opens login itself. */}
        {!isAuthenticated &&
          !loginModal &&
          !otpSent &&
          refreshTokenNotVerified &&
          getSessionStorageItem(SESSION_STORAGE_KEYS.HAS_SHOWN_LOCK_MODAL) !==
            "true" && <SurpriseMeLockModal />}
        {!isAuthenticated && loginModal && <Login />}
        {!isAuthenticated && otpSent && <OtpModal />}
        {isAuthenticated && otpVerified && isFirstLogin && <Signup />}
        {isAuthenticated &&
          !isFirstLogin &&
          surpriseMe &&
          !enableCoachMarks &&
          serialChillerOpen && (
            <SurpriseMeModal
              onClose={() => {
                forceHideLoader(); // Ensure any loading states are cleared
                dispatch(updateSurpriseMe({ surpriseMe: false }));
                setSerialChillerOpen(false);
              }}
            />
          )}

        <ChillGuyBanner />

        {/* YouTube Video */}
        {HOME_YOUTUBE_VIDEOS.length > 0 && (
          <>
            <Header
              title="Truth & Spice"
              className="md:mt-[58px] md:mb-[24px] mt-[20px] mb-[16px]"
            />
            <HomePageYouTube videos={HOME_YOUTUBE_VIDEOS} />
          </>
        )}

        {/* Meme Burst Banner */}
        <div
          className={`meme-burst-section md:mt-[58px] mt-[20px] w-full ${
            isAuthenticated ? "" : "md:mb-[24px] mb-[16px]"
          }`}
        >
          <MemeburstBanner />
        </div>

        {/* Meme Burst Section */}
        {isAuthenticated && (
          <HomePageMemeBurst
            isClient={isClient}
            onVoteSuccess={handleVoteSuccess}
          />
        )}

        {/* Video Scroll */}
        {!isMathilyOdiaKannada && (
          <>
            <Header
              title={cmsData.homePage.scrollAndLolText}
              className="md:mt-[58px] md:mb-[24px] mt-[20px] mb-[16px]"
              viewAllUrl="/scroll-and-lol"
              viewAllButtonText={cmsData.homePage.viewAllButtonText}
              type={false}
            />
            {videoData?.length > 0 ? (
              <div className="video-section">
                <VideoScroll videos={videoData} />
              </div>
            ) : (
              <VideoRowSkeleton />
            )}
          </>
        )}

        {/* PJ Challenge */}
        <div
          className={`challenge-section md:mt-[58px] mt-[20px] mx-4 md:mx-0 ${
            isAuthenticated ? "" : "md:mb-[24px] mb-[16px]"
          }`}
        >
          <PJChallenge
            heading={cmsData.homePage.pjChallengeHeading}
            subheading={cmsData.homePage.pjChallengeSubheading}
            buttonText={cmsData.homePage.pjBannerSubmitButtonText}
            onClick={handlePJChallengeClick}
          />
        </div>

        {/* Pick your mood */}
        {
          <>
            <Header
              title={cmsData.homePage.pickYourMoodHeading}
              className="md:mt-[58px] md:mb-[24px] mt-[20px] mb-[16px]"
              viewAllUrl="/pick-mood"
              viewAllButtonText={cmsData.homePage.viewAllButtonText}
              description={cmsData.homePage.pickYourMoodSubheading}
            />
            {categories.length > 0 ? (
              <div id={BoxIds.PICK_YOUR_MOOD} className="categories-section">
                <span id={DesktopBoxIds.PICK_YOUR_MOOD}></span>
                <Carousel
                  className="md:mx-0 mx-4 flex justify-center"
                  setApi={setApi}
                  opts={{
                    align: "start",
                    loop: false,
                    skipSnaps: true,
                  }}
                >
                  <CarouselContent>
                    {categories.map((category) => (
                      <CarouselItem
                        key={category.id}
                        className="basis-[24%] md:basis-1/6"
                      >
                        <button
                          className="flex flex-col items-center cursor-pointer"
                          onClick={() => {
                            trackClick(CDP_EVENT_SUB_TYPES.GENRE_CLICK)
                            handleCategoryClick(category)
                          }}
                        >
                          <div className="rounded-full bg-white w-[81.7px] h-[81.7px] xxs:w-[60px] xxs:h-[60px] md:w-[140px] md:h-[140px] flex items-center justify-center md:hover:border-2 hover:border hover:border-green transition-all duration-900 md:shadow-lg overflow-hidden shadow-sm">
                            <Image
                              src={category.image_url}
                              alt={category.name}
                              width={80}
                              height={80}
                              className="w-[51.7px] h-[51.7px] xxs:w-[30px] xxs:h-[30px] md:w-[6rem] md:h-[6rem] object-contain"
                            />
                          </div>
                          <p
                            className={cn(
                              "text-center font-medium mt-3 text-xs md:text-[16px]",
                              isTamil &&
                                "md:max-w-[140px] max-w-[80px] text-center text-[8px] md:text-[16px]"
                            )}
                          >
                            {category.name}
                          </p>
                        </button>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                </Carousel>

                {/* Navigation dots - page based */}
                <div className="flex justify-center md:gap-1 gap-[1.77px] md:mb-10 mb-0 md:mt-[30px] mt-[8px]">
                  {Array.from({ length: pageCount }).map((_, index) => {
                    const isActive = index === current;
                    const key = `pagination-dot-${index}`;

                    const classes = [
                      "h-1 rounded-full transition-all duration-300",
                      isActive
                        ? "md:w-[24px] w-[17.73px] bg-black"
                        : "md:w-[12px] w-[8.86px] bg-gray-300",
                    ].join(" ");

                    return (
                      <button
                        key={key}
                        className={classes}
                        onClick={() => goToPage(index)}
                        aria-label={`Go to page ${index + 1}`}
                      />
                    );
                  })}
                </div>
              </div>
            ) : (
              <CategoriesRowSkeleton />
            )}
          </>
        }

        {/* Tadka Hub Video Scroll */}
        {isEnglishHindi && (
          <>
            <Header
              title={cmsData.comic.tadkaHubText}
              className="md:mt-[58px] md:mb-[24px] mt-[20px] mb-[16px]"
              viewAllUrl="/tadka-hub"
              viewAllButtonText={cmsData.homePage.viewAllButtonText}
            />
            <div className="video-section">
              <VideoScroll videos={TADKA_HOME_REELS} hideGenre hideLanguage />
            </div>
          </>
        )}

        {isAuthenticated && (
          <HomePageJokeSection
            isClient={isClient}
            onVoteSuccess={handleVoteSuccess}
          />
        )}

        <div id="buy-now">
          <BuyNowCarousel items={buyNowItems} />
        </div>

        {/* Follow Sprite */}
        <div className="bg-[#313131] text-white pt-[13.19px] mx-4 rounded-lg mb-[90px] block md:hidden mt-[30px]">
          <h2 className="text-center text-md font-medium mb-[13px]">
            {cmsData.homePage.followSprite}
          </h2>
          <div className="flex justify-center gap-6 pb-[16.18px]">
            {[
              {
                id: 1,
                href: "https://www.facebook.com/sprite",
                icon: (
                  <SvgIcons name={ICONS_NAMES.FACEBOOK} className="w-5 h-5" />
                ),
                label: "Facebook",
                eventSubType: CDP_EVENT_SUB_TYPES.FOLLOW_JIAB_FB,
              },
              {
                id: 2,
                href: "https://www.instagram.com/sprite",
                icon: (
                  <SvgIcons name={ICONS_NAMES.INSTAGRAM} className="w-5 h-5" />
                ),
                label: "Instagram",
                eventSubType: CDP_EVENT_SUB_TYPES.FOLLOW_JIAB_INSTA,
              },
              {
                id: 3,
                href: "https://www.youtube.com/sprite",
                icon: (
                  <SvgIcons name={ICONS_NAMES.YOUTUBE} className="w-5 h-5" />
                ),
                label: "YouTube",
                eventSubType: CDP_EVENT_SUB_TYPES.FOLLOW_JIAB_YT,
              },
              {
                id: 4,
                href: `${INFOBIP_WHATSAPP_URL}&text=Hi,+I+am+here+for+Sprite+Joke-In-A-Bottle!+By+pressing+Send+on+this,+I+give+my+consent+to+sharing+my+mobile+number+and+display+name+with+Sprite.`,
                icon: (
                  <SvgIcons name={ICONS_NAMES.WHATSAPP} className="w-5 h-5" />
                ),
                label: "WhatsApp",
                eventSubType: CDP_EVENT_SUB_TYPES.FOLLOW_JIAB_WA,
              },
            ].map((social) => (
              <button
                key={social.id}
                onClick={() => {
                  triggerGAEvent(GA_EVENTS.CLICK);
                  triggerCDPEvent(social.eventSubType);
                  trackSocialFollow(social.eventSubType, social.href);
                  window.open(social.href, "_blank");
                }}
                rel="noopener noreferrer"
                className="bg-white border-none outline-none rounded-full w-[31px] h-[31px] flex items-center justify-center"
                aria-label={`Follow on ${social.label}`}
              >
                {social.icon}
              </button>
            ))}
          </div>
        </div>
      </div>
      {isClient && enableCoachMarks && width < 768 && (
        <CircularBoxesModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
          }}
        />
      )}
      {isClient && enableCoachMarks && width > 768 && (
        <HomePageDesktopOnboarding
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
          }}
        />
      )}

      {/* Genre-specific Surprise Me Modal */}
      {genreSurpriseModal && isAuthenticated && (
        <SurpriseMeModal
          genreId={selectedGenreId}
          category={
            categories?.find(
              (category) => category.id === selectedGenreId?.toString()
            )?.name ?? ""
          }
          pullJoke={true}
          languageId={1}
          onClose={() => {
            closeGenreSurpriseMe();
            setGenreSurpriseModal(false);
          }}
        />
      )}

      {/* Show login modal for unauthenticated users */}
      {genreSurpriseModal && !isAuthenticated && (
        <SurpriseMeLockModal onClose={closeGenreSurpriseMe} forceShow={true} />
      )}

      {/* Coin Animations */}
      <CoinAnimation
        isVisible={isVoteAnimating}
        animationKey={voteAnimationKey}
      />
    </div>
  );
}
