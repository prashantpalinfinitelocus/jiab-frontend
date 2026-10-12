"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import ScreenWrapper from "@/components/common/ScreenWrapper";
import { CoinAnimation, useCoinAnimation } from "@/components/common/CoinAnimation";
import MemeImageCard from "@/components/common/MemeImageCard";
import { useGetMemeFeedQuery, IMemeItem } from "@/api";
import { useLanguage } from "@/hooks/useLanguage";
import { convertLanguageMnemonicToId } from "@/utils/languageUtils";
import GreenCTA from "@/components/GreenCTA";
import { useCMSData } from "@/data";
import AktivGroteskText from "@/components/common/AktivGroteskText";
import UgcPageLoader from "@/components/UgcPageLoader";
import {useRouter, useSearchParams} from "next/navigation";
import MemeFilter from "@/components/common/MemeFilter";

interface ApiResponse {
  ok: boolean;
  data?: {
    items: IMemeItem[];
    cursor?: string;
  };
}

const PAGE_SIZE = 6;
// Cap how far a shared link will page through the feed looking for its meme.
const SHARED_MEME_MAX_PAGES = 10;

const MemeBurstPage = () => {
  const { isAnimating, triggerAnimation, animationKey } = useCoinAnimation();
  const { selectedLanguage } = useLanguage();
  const [filterLanguage, setFilterLanguage] = useState<string>("");
  const cmsData = useCMSData();
  const router = useRouter();
  const searchParams = useSearchParams();
  const sharedMemeId = searchParams.get("selected_meme") || "";
  const [initialLoading, setInitialLoading] = useState(true);
  const [memeData, setMemeData] = useState<IMemeItem[]>([]);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState<string>("");
  const sharedMemeHandledRef = useRef(false);
  const sharedMemePagesLoadedRef = useRef(0);

  const effectiveLanguage = filterLanguage || selectedLanguage;
  const languageId = convertLanguageMnemonicToId(effectiveLanguage);
  
  const { mutate: fetchMemes, isPending } = useGetMemeFeedQuery({
    language: languageId,
    limit: PAGE_SIZE,
    q: search || undefined,
    trending: false,
  });

  const loadInitialMemes = useCallback(() => {
    fetchMemes(
      { language: languageId, limit: PAGE_SIZE, q: search || undefined, trending: false },
      {
        onSuccess: (response: ApiResponse) => {
          if (response?.ok && response?.data) {
            const items = response.data.items || [];
            const nextCursor = response.data.cursor;
            setMemeData(items);
            setCursor(nextCursor);
            // Show CTA only if we likely have a next page
            const likelyHasMore = !!nextCursor && items.length === PAGE_SIZE;
            setHasMore(likelyHasMore);
            setInitialLoading(false);
          }
        },
      }
    );
  }, [fetchMemes, languageId, search]);

  useEffect(() => {
    // Reset list when language changes from filter
    setMemeData([]);
    setCursor(undefined);
    setHasMore(true);
    setInitialLoading(true);
    sharedMemeHandledRef.current = false;
    sharedMemePagesLoadedRef.current = 0;
    loadInitialMemes();
  }, [loadInitialMemes, languageId]);

  const loadMore = useCallback(() => {
    if (isPending) return;
    // Optimistically hide CTA on click (as requested). We'll re-enable if API proves more pages exist
    setHasMore(false);

    // If no next cursor, nothing to fetch
    if (!cursor) return;

    fetchMemes(
      { language: languageId, limit: PAGE_SIZE, cursor, q: search || undefined, trending: false },
      {
        onSuccess: (response: ApiResponse) => {
          if (response?.ok && response?.data) {
            const newItems = response.data.items || [];
            const nextCursor = response.data.cursor;
            const cursorUnchanged = nextCursor === cursor;
            setMemeData((prev) => [...prev, ...newItems]);
            setCursor(nextCursor);
            // Determine if we've reached the end
            const reachedEnd = !nextCursor || newItems.length < PAGE_SIZE || cursorUnchanged || newItems.length === 0;
            setHasMore(!reachedEnd);
          } else {
            setHasMore(false);
          }
        },
        onError: () => {
          setHasMore(false);
        },
      }
    );
  }, [cursor, isPending, fetchMemes, languageId, search]);

  // A shared link (/meme-burst?selected_meme=<id>) lands on the feed, so walk
  // forward through the pages until that meme is loaded, then scroll to it.
  useEffect(() => {
    if (!sharedMemeId || sharedMemeHandledRef.current || memeData.length === 0) return;

    if (memeData.some((meme) => meme.id === sharedMemeId)) {
      sharedMemeHandledRef.current = true;
      // Wait for the card to be painted before scrolling to it.
      requestAnimationFrame(() => {
        document
          .getElementById(`meme-${sharedMemeId}`)
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
      return;
    }

    if (isPending || !cursor) return;
    if (sharedMemePagesLoadedRef.current >= SHARED_MEME_MAX_PAGES) {
      sharedMemeHandledRef.current = true;
      return;
    }
    sharedMemePagesLoadedRef.current += 1;
    loadMore();
  }, [sharedMemeId, memeData, cursor, isPending, loadMore]);

  const handleVoteSuccess = useCallback(() => {
    // Trigger common coin animation and refresh the feed after vote
    triggerAnimation();
    loadInitialMemes();
  }, [triggerAnimation, loadInitialMemes]);

  return (
    <ScreenWrapper>
      <UgcPageLoader
        isVisible={
          initialLoading || (isPending && memeData.length === 0)
        }
      />

      <div>
      <div className='flex flex-col gap-[4px] md:gap-[12px]'>
          <div className='flex justify-between items-center'>
            <AktivGroteskText
              fontSize='text-[16px] md:text-[30px] uppercase'
              fontWeight='font-[700]'
              text={`Meme Burst`}
            />
            <button
              onClick={() => {
                router.push('/hall-of-lame')
              }}
            >
              <AktivGroteskText
                fontSize='text-[12px] md:text-[20px]'
                fontWeight='font-[400]'
                className='text-[#11A64B] '
                text={cmsData?.jokeBox?.hallOfLameNextPageSwitchText}
              />
            </button>
          </div>
          <div className='flex flex-col md:flex-row justify-between gap-[16px] md:gap-0'>
            <AktivGroteskText
              fontSize='text-[12px] md:text-[20px]'
              fontWeight='font-[400]'
              text={`Your vibe, your meme-tribe.`}
            />
            <MemeFilter
              filter={cmsData?.jokeBox?.filter}
              onApply={(filters) => {
                setFilterLanguage(filters.language || "");
              }}
              onSearchChange={(value) => {
                setSearch(value);
              }}
            />
          </div>
        </div>

        <div className="py-[16px] md:py-[24px]">
          <div className="grid xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-[16px] xl:gap-x-[60px] md:gap-x-[45px] md:gap-y-[24px]">
            {memeData?.map((meme) => (
              <div
                key={meme.id}
                id={`meme-${meme.id}`}
                className={
                  meme.id === sharedMemeId
                    ? "rounded-[5px] ring-[2px] ring-[#11A64B]"
                    : undefined
                }
              >
                <MemeImageCard
                  item={meme}
                  onVoteSuccess={handleVoteSuccess}
                />
              </div>
            ))}
          </div>

          {memeData?.length === 0 && !isPending && (
            <div className="flex justify-center items-center md:mt-[32px] mt-[16px]">
              <AktivGroteskText
                text={cmsData?.jokeBox?.noMoreData || "No memes found"}
                fontSize="text-[16px]"
                fontWeight="font-[700]"
              />
            </div>
          )}

          {hasMore && (
            <div className="flex justify-center items-center md:mt-[32px] mt-[16px]">
              <GreenCTA
                text={cmsData?.jokeBox?.loadMoreButtonText || "Load More"}
                disabled={isPending}
                className="leading-tight"
                paddingClass="px-[36px] py-[8px] md:py-[8px] md:px-[16px] border-[1px]"
                fontSize="md:text-[16px] text-[14px]"
                fontWeight="font-[700]"
                onClick={loadMore}
              />
            </div>
          )}
        </div>
      </div>
      <CoinAnimation isVisible={isAnimating} animationKey={animationKey} />
    </ScreenWrapper>
  );
};

export default MemeBurstPage;
