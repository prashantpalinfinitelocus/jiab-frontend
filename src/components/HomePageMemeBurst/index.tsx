import React, { useEffect, useState, useCallback } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import Header from "@/components/common/Header/Header";
import { useCMSData } from "@/data";
import useWindowWidth from "@/hooks/useWindowWidth";
import MemeImageCard from "../common/MemeImageCard";
import { useGetMemeFeedQuery, IMemeItem } from "@/api";
import { useLanguage } from "@/hooks/useLanguage";
import { convertLanguageMnemonicToId } from "@/utils/languageUtils";

interface ApiResponse {
  ok: boolean;
  data?: {
    items: IMemeItem[];
    cursor?: string;
  };
}

const HomePageMemeBurst = ({
  isClient,
  onVoteSuccess,
}: {
  isClient: boolean;
  onVoteSuccess?: () => void;
}) => {
  const cmsData = useCMSData();
  const width = useWindowWidth();
  const { selectedLanguage } = useLanguage();

  const [jokeBoxApi, setJokeBoxApi] = useState<CarouselApi>();
  const [activeTab, setActiveTab] = useState<"Latest" | "Trending">("Latest");
  const [jokeBoxCurrent, setJokeBoxCurrent] = useState(0);
  const [jokeBoxPageCount, setJokeBoxPageCount] = useState(3);
  const [memeData, setMemeData] = useState<IMemeItem[]>([]);

  const languageId = convertLanguageMnemonicToId(selectedLanguage);
  
  const { mutate: fetchMemes } = useGetMemeFeedQuery({
    language: languageId,
    limit: 6,
    trending: activeTab === "Trending",
  });

  // Fetch memes when component mounts or language changes
  const loadMemes = useCallback(() => {
    fetchMemes(
      { language: languageId, limit: 6, trending: activeTab === "Trending" },
      {
        onSuccess: (response: ApiResponse) => {
          if (response?.ok && response?.data) {
            setMemeData(response.data.items || []);
          }
        },
      }
    );
  }, [fetchMemes, languageId, activeTab]);

  // Initial load is handled by the activeTab/language effect below

  useEffect(() => {
    if (!jokeBoxApi) {
      return;
    }

    jokeBoxApi.on("select", () => {
      setJokeBoxCurrent(jokeBoxApi.selectedScrollSnap());
    });
  }, [jokeBoxApi]);

  const goToJokeBoxPage = (pageIndex: number) => {
    if (!jokeBoxApi) return;
    jokeBoxApi.scrollTo(pageIndex);
  };

  useEffect(() => {
    if (width > 768) {
      setJokeBoxPageCount(2);
    } else {
      setJokeBoxPageCount(6);
    }
  }, [width]);

  useEffect(() => {
    if (activeTab) {
      setJokeBoxCurrent(0);
      // Refetch when tab changes to update trending vs latest
      loadMemes();
    }
  }, [activeTab, loadMemes]);

  useEffect(() => {
    if (jokeBoxApi) {
      jokeBoxApi.scrollTo(jokeBoxCurrent);
    }
  }, [jokeBoxCurrent, jokeBoxApi]);

  const handleVoteSuccess = useCallback(() => {
    // Refresh memes after vote
    if (onVoteSuccess) {
      onVoteSuccess();
    }
    loadMemes();
  }, [onVoteSuccess, loadMemes]);

  return (
    <>
      {/* Joke Box */}
      <Header
        title={cmsData.homePage.memeBurstHeading}
        className="md:mt-[58px] md:mb-[24px] mt-[20px] mb-[16px]"
        viewAllUrl="/meme-burst"
        viewAllButtonText={cmsData.homePage.viewAllButtonText}
        description={cmsData.homePage.memeBurstSubheading}
      />
      {isClient && (
        <div className="md:mx-0 mx-4 mt-[20px] mb-[20px]">
          <div className="flex justify-center w-full">
            <div className="flex items-center bg-white rounded-full mb-4 p-1 relative">
              <div
                className={`absolute transition-all duration-300 ease-in-out top-1 h-[calc(100%-8px)] rounded-full bg-green ${
                  activeTab === "Latest"
                    ? "left-1 right-[50%]"
                    : "left-[50%] right-1"
                }`}
              />
              <button
                onClick={() => setActiveTab("Latest")}
                className={`min-w-[80px] px-6 h-[36px] flex items-center justify-center rounded-full text-sm font-medium transition-all duration-200 relative z-10 flex-1 ${
                  activeTab === "Latest"
                    ? "text-white"
                    : "text-gray-600 hover:text-black"
                }`}
              >
                {cmsData.homePage.latestButtonText}
              </button>
              <button
                onClick={() => setActiveTab("Trending")}
                className={`min-w-[80px] px-6 h-[36px] flex items-center justify-center rounded-full text-sm font-medium transition-all duration-200 relative z-10 flex-1 ${
                  activeTab === "Trending"
                    ? "text-white"
                    : "text-gray-600 hover:text-black"
                }`}
              >
                {cmsData.homePage.trendingButtonText}
              </button>
            </div>
          </div>

          <div className="flex justify-start overflow-x-scroll scrollbar-hide md:gap-[8px] gap-4">
            {memeData.length > 0 && width < 768 && (
              <Carousel
                setApi={setJokeBoxApi}
                opts={{
                  align: "start",
                  loop: false,
                  skipSnaps: true,
                  slidesToScroll: 1,
                }}
                className="w-full"
              >
                <CarouselContent className="w-full">
                  {memeData.map((item) => (
                    <CarouselItem key={item.id} className="basis-auto">
                      <div className="max-w-[350px] flex mx-auto h-full">
                        <MemeImageCard
                          item={item}
                          onVoteSuccess={handleVoteSuccess}
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            )}
            {memeData.length > 0 && width >= 768 && (
              <Carousel
                setApi={setJokeBoxApi}
                opts={{
                  align: "start",
                  loop: true,
                  skipSnaps: false,
                  slidesToScroll: width > 768 ? 3 : 1,
                }}
                className="w-full"
              >
                <CarouselContent className="w-full">
                  {memeData.map((item) => (
                    <CarouselItem key={item.id} className="basis-1/3">
                      <div className="w-full flex mx-auto h-full">
                        <MemeImageCard
                          item={item}
                          onVoteSuccess={handleVoteSuccess}
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            )}
          </div>
          {memeData?.length > 3 && (
            <div className="flex justify-center md:gap-2 gap-[1.77px] mt-[8px]">
              {Array.from({ length: jokeBoxPageCount }, (_, pageIndex) => (
                <button
                  key={`meme-slide-page-${pageIndex}-${jokeBoxPageCount}`}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    pageIndex === jokeBoxCurrent
                      ? "w-[17.73px] bg-black"
                      : "w-[8.86px] bg-gray-300"
                  }`}
                  onClick={() => goToJokeBoxPage(pageIndex)}
                  aria-label={`Go to meme page ${pageIndex + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default HomePageMemeBurst;
