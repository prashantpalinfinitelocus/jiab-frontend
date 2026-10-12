"use client";
import React, { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import EmptyStateImage from "../../../public/assets/images/empty-state-my-memes.png";
import { useRouter } from 'next/navigation';
import MemeImageCard from '@/components/common/MemeImageCard';
import GreenCTA from '@/components/GreenCTA';
import { useGetUserMemesQuery, IMemeItem } from '@/api';

interface MyMemesProps {
  onCreateMeme?: () => void;
}

const MyMemes = ({ onCreateMeme }: MyMemesProps) => {
  const router = useRouter();
  const [memes, setMemes] = useState<IMemeItem[]>([]);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const { mutate: fetchUserMemes, isPending } = useGetUserMemesQuery({ limit: 12 });
  const handleCreateMeme = () => {
    if (onCreateMeme) {
      onCreateMeme();
    }
  };

  const handleExploreMemes = () => {
    // Navigate to explore memes page
    router.push('/meme-burst');
  };

  const loadMemes = useCallback((nextCursor?: string) => {
    fetchUserMemes(
      { cursor: nextCursor },
      {
        onSuccess: (response: { ok: boolean; data?: { items: IMemeItem[]; cursor?: string } }) => {
          if (response?.ok && response?.data) {
            const items: IMemeItem[] = response.data.items || [];
            setMemes((prev) => {
              const nextMemes = [...prev, ...items];
              return nextMemes;
            });
            const newCursor = response.data.cursor || undefined;
            setCursor(newCursor);
            // Show Load More only if there is a next cursor and total items > 6
            setHasMore(!!newCursor && (items.length > 0));
          }
        },
      }
    );
  }, [fetchUserMemes]);

  useEffect(() => {
    loadMemes();
  }, [loadMemes]);

  return (
    <>
      {memes.length === 0 && !isPending ? (
        <div className="flex flex-col justify-center items-center w-[343px] mx-auto md:mt-[168px] mt-[50px]">
          <Image 
            src={EmptyStateImage.src} 
            alt="my-memes-empty" 
            width={EmptyStateImage.width} 
            height={EmptyStateImage.height} 
            className="md:h-[335px] h-[281px] md:w-[343px] w-[288px] rounded-[10px] md:mb-[36px] mb-[24px]" 
          />
          <div className="md:text-[24px] text-[14px] font-[500] text-center leading-[100%] text-black md:mb-[36px] mb-[24px]">
          Your meme fridge is empty—time to restock. 🥤
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col gap-4 w-full max-w-[280px]">
            <button
              onClick={handleCreateMeme}
              className="w-full py-3 px-6 bg-green text-white font-[600] text-[16px] rounded-[25px] hover:bg-green/90 transition-colors duration-200"
            >
              Create Meme
            </button>
            <button
              onClick={handleExploreMemes}
              className="w-full py-3 px-6 bg-green text-white font-[600] text-[16px] rounded-[25px] hover:bg-green/90 transition-colors duration-200"
            >
              Explore Memes
            </button>
          </div>
        </div>
      ) : (
        <div className="py-[16px] md:py-[24px] w-full">
          <div className="grid xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-[16px] xl:gap-x-[60px] md:gap-x-[45px] md:gap-y-[24px]">
            {memes.map((meme) => (
              <MemeImageCard key={meme.id} item={meme} />
            ))}
          </div>

          {hasMore && memes.length > 6 && (
            <div className="flex justify-center items-center md:mt-[32px] mt-[16px]">
              <GreenCTA
                text="Load More"
                disabled={isPending}
                className="leading-tight"
                paddingClass="px-[36px] py-[8px] md:py-[8px] md:px-[16px] border-[1px]"
                fontSize="md:text-[16px] text-[14px]"
                fontWeight="font-[700]"
                onClick={() => loadMemes(cursor)}
              />
            </div>
          )}
        </div>
      )}
    </>
  )
}

export default MyMemes