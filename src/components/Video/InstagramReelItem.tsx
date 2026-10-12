"use client";
import React, { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import SpicyActions from "@/components/video-carousel/SpicyActions";

interface InstagramReelItemProps {
  code: string;
  index: number;
  isActive: boolean;
  mobilePageHeight: string;
  onVideoInView: (index: number) => void;
  viewsCount?: number;
}

const INSTAGRAM_EMBED_HEADER_PX = 54;
/** Height at which a 9:16 reel covers the slot, like object-cover. */
const REEL_HEIGHT = "max(100cqh, 100cqw * 16 / 9)";

/** An Instagram reel in the Tadka Hub feed, filling the same snap slot as a native video. */
const InstagramReelItem: React.FC<InstagramReelItemProps> = ({
  code,
  index,
  isActive,
  mobilePageHeight,
  onVideoInView,
  viewsCount,
}) => {
  const { ref, inView } = useInView({
    threshold: 0.5,
    rootMargin: "-8% 0px -8% 0px",
  });

  useEffect(() => {
    if (inView) onVideoInView(index);
  }, [inView, index, onVideoInView]);

  return (
    <div
      ref={ref}
      // Same desktop width as a native 9:16 video; explicit because size containment drops intrinsic width.
      className="video-container relative md:max-h-[calc(100vh-200px)] w-full md:w-[min(442px,calc((100vh-200px)*9/16))] flex-shrink-0 md:mb-[100px] last:md:mb-0 overflow-hidden bg-black"
      data-index={index}
      style={{
        containerType: "size",
        scrollSnapAlign: "start",
        scrollSnapStop: "always",
        height:
          typeof window !== "undefined" && window.innerWidth >= 768
            ? "calc(100vh - 200px)"
            : mobilePageHeight,
      }}
    >
      {/* Mounted only while active, so a reel stops playing once scrolled away. */}
      {isActive && (
        /*
          Shows only the video: Instagram's embed puts a 54px header above a 4:5 media box
          (height = 1.25 × width) with the 9:16 reel centred in it. Sizing the iframe so that
          box is the reel's cover height, then centring it, crops away everything else.
        */
        <iframe
          src={`https://www.instagram.com/reel/${code}/embed/`}
          title="Sprite India on Instagram"
          className="absolute left-1/2 -translate-x-1/2 border-0"
          style={{
            width: `calc(${REEL_HEIGHT} * 0.8)`,
            height: `calc(${REEL_HEIGHT} + ${INSTAGRAM_EMBED_HEADER_PX}px)`,
            top: `calc((100cqh - ${REEL_HEIGHT}) / 2 - ${INSTAGRAM_EMBED_HEADER_PX}px)`,
          }}
          scrolling="no"
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      )}

      {/* Instagram's view count, shown with our own icon like the native videos,
          and a link to the reel on Instagram. */}
      <SpicyActions
        className="md:right-[8px] right-[8px]"
        viewsCount={viewsCount}
        instagramUrl={`https://www.instagram.com/reel/${code}/`}
      />
    </div>
  );
};

export default React.memo(InstagramReelItem);
