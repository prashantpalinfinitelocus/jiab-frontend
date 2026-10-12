"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

export interface IYouTubeVideo {
  url: string;
  title: string;
}

// Accepts watch, youtu.be, shorts and embed links, or a bare video id.
const YOUTUBE_ORIGINS = ["https://www.youtube.com", "https://www.youtube-nocookie.com"];
const getYouTubeId = (url: string) =>
  url.match(
    /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/,
  )?.[1] ?? (/^[\w-]{11}$/.test(url) ? url : null);

export default function HomePageYouTube({
  videos,
}: {
  videos: IYouTubeVideo[];
}) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const isPlayingRef = useRef(false);
  // Unmuting one video keeps sound on for the rest.
  const soundOnRef = useRef(false);
  const playerStartedRef = useRef(false);
  const unmutingRef = useRef(false);
  const playerStateRef = useRef<number | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  // True once the viewer taps one of YouTube's own buttons.
  const [playerFocused, setPlayerFocused] = useState(false);

  const slides = videos
    .map((video) => ({ ...video, id: getYouTubeId(video.url) }))
    .filter((video): video is IYouTubeVideo & { id: string } => !!video.id);

  useEffect(() => {
    if (!api) return;
    const onSelect = () => setCurrent(api.selectedScrollSnap());
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  // Embla ignores two-finger slides: a trackpad swipe arrives as wheel events,
  // and on touch screens it drops the drag once a second finger lands.
  // Handle both here, moving one video per slide.
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper || !api) return;
    let locked = false;
    let unlockTimer: ReturnType<typeof setTimeout>;
    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
      // Also stops the browser treating the swipe as back/forward.
      event.preventDefault();
      clearTimeout(unlockTimer);
      unlockTimer = setTimeout(() => (locked = false), 200);
      if (locked || Math.abs(event.deltaX) < 10) return;
      locked = true;
      if (event.deltaX > 0) api.scrollNext();
      else api.scrollPrev();
    };

    let touchStart: { x: number; y: number } | null = null;
    const midpoint = (touches: TouchList) => ({
      x: (touches[0].clientX + touches[1].clientX) / 2,
      y: (touches[0].clientY + touches[1].clientY) / 2,
    });
    const onTouchStart = (event: TouchEvent) => {
      touchStart = event.touches.length === 2 ? midpoint(event.touches) : null;
    };
    const onTouchMove = (event: TouchEvent) => {
      if (!touchStart || event.touches.length !== 2) return;
      const point = midpoint(event.touches);
      const dx = point.x - touchStart.x;
      // Leave pinch zoom and vertical moves to the browser.
      if (Math.abs(dx) < 10 || Math.abs(dx) <= Math.abs(point.y - touchStart.y))
        return;
      event.preventDefault();
      if (Math.abs(dx) < 40) return;
      touchStart = null;
      if (dx < 0) api.scrollNext();
      else api.scrollPrev();
    };

    wrapper.addEventListener("wheel", onWheel, { passive: false });
    wrapper.addEventListener("touchstart", onTouchStart, { passive: true });
    wrapper.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => {
      wrapper.removeEventListener("wheel", onWheel);
      wrapper.removeEventListener("touchstart", onTouchStart);
      wrapper.removeEventListener("touchmove", onTouchMove);
      clearTimeout(unlockTimer);
    };
  }, [api]);

  // Track play and sound state, and move on to the next video when one ends.
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (
        !YOUTUBE_ORIGINS.includes(event.origin) ||
        event.source !== iframeRef.current?.contentWindow
      )
        return;
      try {
        const data = JSON.parse(event.data);
        // Until the unmute lands the player still reports its starting mute.
        if (
          data.event === "infoDelivery" &&
          typeof data.info?.muted === "boolean" &&
          playerStartedRef.current &&
          !(data.info.muted && unmutingRef.current)
        ) {
          unmutingRef.current = false;
          soundOnRef.current = !data.info.muted;
        }
        // The state comes in "onStateChange" or only in "infoDelivery",
        // depending on the load, and gets repeated; act on changes only so
        // one ending can't skip a video.
        const state =
          data.event === "onStateChange"
            ? data.info
            : data.event === "infoDelivery"
              ? data.info?.playerState
              : undefined;
        if (typeof state !== "number" || state === playerStateRef.current)
          return;
        playerStateRef.current = state;
        isPlayingRef.current = state === 1;
        if (state === 1 && !playerStartedRef.current) {
          playerStartedRef.current = true;
          // YouTube can switch subtitles on by itself (e.g. from the viewer's
          // saved setting); start every video without them.
          iframeRef.current?.contentWindow?.postMessage(
            JSON.stringify({
              event: "command",
              func: "unloadModule",
              args: ["captions"],
            }),
            "https://www.youtube.com",
          );
          // Each video starts muted so browsers let it autoplay; turn the
          // sound back on if the viewer had it on. This waits for playback,
          // since the player applies its starting mute when it begins.
          if (soundOnRef.current) {
            unmutingRef.current = true;
            iframeRef.current?.contentWindow?.postMessage(
              JSON.stringify({ event: "command", func: "unMute", args: [] }),
              "https://www.youtube.com",
            );
          }
        }
        if (state === 0) api?.scrollNext();
      } catch {
        // Not a player message.
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [api]);

  // Tapping a YouTube button moves focus into the player, and its menus
  // (settings, more videos) open over the middle, where the swipe layer sits.
  // Let taps through to the player until the viewer taps elsewhere on the page.
  useEffect(() => {
    const onBlur = () =>
      // Focus has not moved yet while blur runs.
      setTimeout(() =>
        setPlayerFocused(document.activeElement === iframeRef.current),
      );
    const onFocus = () => setPlayerFocused(false);
    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);
    return () => {
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  const postToPlayer = (message: object) =>
    iframeRef.current?.contentWindow?.postMessage(JSON.stringify(message), "https://www.youtube.com");

  // The player only reports its state once asked to.
  const listenToPlayer = () => {
    playerStartedRef.current = false;
    playerStateRef.current = null;
    setPlayerFocused(false);
    postToPlayer({ event: "listening", id: 1, channel: "widget" });
  };

  const togglePlay = () =>
    postToPlayer({
      event: "command",
      func: isPlayingRef.current ? "pauseVideo" : "playVideo",
      args: [],
    });

  if (slides.length === 0) return null;

  return (
    <div ref={wrapperRef}>
      <Carousel setApi={setApi} opts={{ align: "center", loop: true }}>
        <CarouselContent className="-ml-3 md:-ml-6">
          {slides.map((video, index) => {
            const isActive = index === current;
            return (
              <CarouselItem
                key={video.id}
                className="basis-[85%] md:basis-[70%] pl-3 md:pl-6"
              >
                <div
                  className={cn(
                    "relative w-full aspect-video rounded-[20px] overflow-hidden bg-black transition-opacity duration-300",
                    !isActive && "opacity-50 cursor-pointer",
                  )}
                  onClick={() => !isActive && api?.scrollTo(index)}
                >
                  {/* Browsers only autoplay muted video; YouTube's controls can unmute it */}
                  {isActive ? (
                    <>
                      <iframe
                        ref={iframeRef}
                        src={`https://www.youtube.com/embed/${video.id}?autoplay=1&mute=1&playsinline=1&rel=0&enablejsapi=1`}
                        title={video.title}
                        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                        allowFullScreen
                        onLoad={listenToPlayer}
                        className="absolute inset-0 w-full h-full"
                      />
                      {/* The iframe swallows drags, so this layer catches swipes
                        for the carousel; a tap plays or pauses. It leaves
                        YouTube's buttons uncovered: unmute, captions and
                        settings along the top, fullscreen on the right edge,
                        and along the bottom the time, the progress bar (so
                        the video can be dragged forward), share and more
                        videos. While one of those has focus it steps aside
                        so their menus work. */}
                      <div
                        className={cn(
                          "absolute left-0 top-12 bottom-[76px] md:bottom-[100px] right-[72px] cursor-pointer",
                          playerFocused && "pointer-events-none",
                        )}
                        onClick={togglePlay}
                      />
                    </>
                  ) : (
                    <>
                      <Image
                        src={`https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`}
                        alt={video.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <p className="absolute left-4 bottom-4 md:left-5 md:bottom-5 text-white font-semibold text-sm md:text-xl pr-16">
                        {video.title}
                      </p>
                      <span className="absolute right-4 bottom-4 md:right-5 md:bottom-5 w-8 h-8 md:w-10 md:h-10 rounded-full bg-white flex items-center justify-center">
                        <Play className="w-4 h-4 md:w-5 md:h-5 fill-black" />
                      </span>
                    </>
                  )}
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>
      </Carousel>

      {/* Navigation dots */}
      <div className="flex justify-center gap-2 mt-4 md:mt-6">
        {slides.map((video, index) => (
          <button
            key={video.id}
            className={cn(
              "h-1 rounded-full transition-all duration-300",
              index === current ? "w-[48px] bg-green" : "w-[24px] bg-gray-300",
            )}
            onClick={() => api?.scrollTo(index)}
            aria-label={`Go to video ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
