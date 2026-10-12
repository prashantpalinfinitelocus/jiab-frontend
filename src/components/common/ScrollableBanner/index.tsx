"use client";

import React, { useEffect, useState } from "react";
import Banner from "@/components/common/Banner/Banner";
import { IBannerProps } from "@/interfaces";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

export type ScrollableBannerItem = Pick<
  IBannerProps,
  "type" | "src" | "msrc" | "alt" | "overlayColor" | "overlayOpacity"
>;

interface ScrollableBannerProps {
  items: ScrollableBannerItem[];
  className?: string;
  showDots?: boolean;
}

const ScrollableBanner: React.FC<ScrollableBannerProps> = ({
  items,
  className = "",
  showDots = true,
}) => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const pageCount = items.length;

  useEffect(() => {
    if (!api) return;
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  // Auto-scroll every 5 seconds; wrap to first slide at the end
  useEffect(() => {
    if (!api || pageCount <= 1) return;
    const intervalId = setInterval(() => {
      const nextIndex = (api.selectedScrollSnap() + 1) % pageCount;
      api.scrollTo(nextIndex);
    }, 5000);
    return () => clearInterval(intervalId);
  }, [api, pageCount]);

  if (!items || items.length === 0) return null;

  if (items.length === 1) {
    const { type, src, msrc, alt, overlayColor, overlayOpacity } = items[0];
    return (
      <Banner
        type={type}
        src={src}
        msrc={msrc}
        alt={alt}
        overlayColor={overlayColor}
        overlayOpacity={overlayOpacity}
        className={className}
      />
    );
  }

  return (
    <div className={`relative ${className}`}>
      <Carousel
        setApi={setApi}
        opts={{
          align: "start",
          loop: false,
        }}
        className=""
      >
        <CarouselContent>
          {items.map((item, index) => (
            <CarouselItem key={index} className="basis-full">
              <Banner
                type={item.type}
                src={item.src}
                msrc={item.msrc}
                alt={item.alt}
                overlayColor={item.overlayColor}
                overlayOpacity={item.overlayOpacity}
                className="h-full"
              />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {showDots && pageCount > 1 && (
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-[10px]">
          {Array.from({ length: pageCount }).map((_, index) => (
            <button
              key={index}
              className={`h-1 rounded-full transition-all duration-300 ${
                index === current ? "w-[24px] bg-black" : "w-[12px] bg-gray-300"
              }`}
              onClick={() => api?.scrollTo(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ScrollableBanner;
 