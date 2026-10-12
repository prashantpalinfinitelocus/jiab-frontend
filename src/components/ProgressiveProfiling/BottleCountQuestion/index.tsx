"use client";

import React, { useState, useEffect, useRef } from "react";
import { AnimatedBottle } from "./AnimatedBottle";
import { triggerGAEvent } from "@/utils/gTagEvents";
import { GA_EVENTS } from "@/constants";
import { useCMSData } from "@/data";

interface BottleCountQuestionProps {
  onSubmit?: (count: number) => void;
  onSkip?: () => void;
  className?: string;
}

const BottleCountQuestion: React.FC<BottleCountQuestionProps> = ({
  onSubmit,
  onSkip,
  className = "",
}) => {
  const [selectedBottle, setSelectedBottle] = useState<number | null>(null);
  const [sliderValue, setSliderValue] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationDirection, setAnimationDirection] = useState<"normal" | "reverse">("normal");
  const [showValidation, setShowValidation] = useState(false);
  const lastPercentageRef = useRef<number>(0);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])
  const cmsData = useCMSData(mounted)
  const progProfData = cmsData.scrollAndLol;

  const bottles = [
    { id: 1, label: "1" },
    { id: 2, label: "2" },
    { id: 3, label: "3" },
    { id: 4, label: "4" },
    { id: 5, label: "5" },
    { id: 6, label: "6+" },
  ];

  const getBottleFillPercentage = (bottleId: number) => {
    if (selectedBottle === null || selectedBottle === 0) {
      return 0;
    }
    if (bottleId <= selectedBottle) {
      return 100;
    }
    return 0;
  };

  useEffect(() => {
    const currentPercentage = selectedBottle ? (selectedBottle / 6) * 100 : 0;
    
    setIsAnimating(true);

    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }

    if (currentPercentage > lastPercentageRef.current) {

      setAnimationDirection("normal");
    } else if (currentPercentage < lastPercentageRef.current) {
      setAnimationDirection("reverse");
    }

    lastPercentageRef.current = currentPercentage;

    animationTimeoutRef.current = setTimeout(() => {
      setIsAnimating(false);
    }, 600);

    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, [selectedBottle]);

  const handleBottleClick = (bottleId: number) => {
    const isFilled = selectedBottle !== null && bottleId <= selectedBottle;
    const newValue = isFilled ? bottleId - 1 : bottleId;
    
    setSliderValue(newValue);
    setSelectedBottle(newValue);
    if (newValue > 0) {
      setShowValidation(false);
      triggerGAEvent(GA_EVENTS.SPRITE_J24_BOTTLE_COUNT_SELECT, {
        bottle_count: newValue
      });
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setSliderValue(value);
    setSelectedBottle(value);
    if (value > 0) {
      setShowValidation(false);
      triggerGAEvent(GA_EVENTS.SPRITE_J24_BOTTLE_COUNT_SELECT, {
        bottle_count: value
      });
    }
  };

  const handleSubmit = () => {
    if (selectedBottle === null || selectedBottle === 0) {
      setShowValidation(true);
      return;
    }
    triggerGAEvent(GA_EVENTS.SPRITE_J24_BOTTLE_COUNT_SUBMIT, {
      bottle_count: selectedBottle
    });
    if (onSubmit) {
      onSubmit(selectedBottle);
    }
  };

  const handleSkipClick = () => {
    triggerGAEvent(GA_EVENTS.SPRITE_J24_BOTTLE_COUNT_SKIP);
    if (onSkip) {
      onSkip();
    }
  };

  return (
    <>
      <style jsx global>{`
        @keyframes seamlessWave {
          0% { transform: translateX(0); }
          100% { transform: translateX(-160.5px); }
        }

        ${bottles.map((bottle) => `
          .wave-horizontal-group-${bottle.id} {
            animation: seamlessWave 1.5s linear infinite;
            animation-play-state: paused;
          }
        `).join('\n')}
      `}</style>

      <div
        className={`flex justify-center min-h-[calc(100vh-71px)] md:min-h-auto ${className}`}
      >
      <div className="flex flex-col gap-[20px] md:gap-6 justify-center items-center w-full md:max-w-[442px] md:h-auto bg-white px-[24px] md:py-[43.5px] md:px-[32px]">
        <h2 className="font-aktiv font-bold text-[16px] md:text-[20px] leading-[24px] md:leading-[30px] text-black text-center w-full whitespace-pre-wrap px-4 md:px-0">
          {progProfData.bottleHeading}
        </h2>

        <div className="flex flex-col gap-[20px] md:gap-[40px] items-center w-full">
          <div className="flex flex-col gap-[20px] md:gap-[20px] items-center w-full">
            <div className="flex items-center justify-center gap-[80px] md:gap-[80px]">
              {bottles.slice(0, 3).map((bottle) => (
                <AnimatedBottle
                  key={bottle.id}
                  label={bottle.label}
                  bottleId={bottle.id}
                  fillPercentage={getBottleFillPercentage(bottle.id)}
                  isAnimating={isAnimating}
                  animationDirection={animationDirection}
                  ariaLabel={`${bottle.label} bottle${bottle.id > 1 ? "s" : ""}`}
                  onClick={() => handleBottleClick(bottle.id)}
                />
              ))}
            </div>
            <div className="flex items-center justify-center gap-[80px] md:gap-[80px]">
              {bottles.slice(3, 6).map((bottle) => (
                <AnimatedBottle
                  key={bottle.id}
                  label={bottle.label}
                  bottleId={bottle.id}
                  fillPercentage={getBottleFillPercentage(bottle.id)}
                  isAnimating={isAnimating}
                  animationDirection={animationDirection}
                  ariaLabel={`${bottle.label} bottles`}
                  onClick={() => handleBottleClick(bottle.id)}
                />
              ))}
            </div>
          </div>
          <div className="relative w-full h-[36px] md:h-[44px]">
            <div className="absolute bg-[#ccc] h-[16px] md:h-[20px] left-0 rounded-[100px] top-[10px] md:top-[12px] w-full" />

            <div
              className="absolute bg-[#ffe200] h-[16px] md:h-[20px] left-0 rounded-[100px] top-[10px] md:top-[12px] transition-all"
              style={{
                width: `${(sliderValue / 6) * 100}%`,
              }}
            />
            <input
              type="range"
              min="0"
              max="6"
              value={sliderValue}
              onChange={handleSliderChange}
              className="absolute left-0 top-0 w-full h-[36px] md:h-[44px] opacity-0 cursor-pointer z-10"
            />
            <div
              className="absolute size-[36px] md:size-[44px] top-0 pointer-events-none transition-all"
              style={{
                left: `calc(${(sliderValue / 6) * 100}% - ${sliderValue === 0 ? 0 : 18}px)`,
              }}
            >
              <div className={`w-full h-full rounded-full border-4 border-white transition-colors duration-300 ${
                sliderValue === 0 ? "bg-[#ccc]" : "bg-[#ffe200]"
              }`} />
            </div>
          </div>
        </div>

        {showValidation && (
          <div className="text-center text-red text-[12px] md:text-[14px] leading-[16px] md:leading-[18px] mt-[1px] mb-[6px] md:-mt-[24px] md:mb-0">
            {progProfData.bottleValidation}
          </div>
        )}

        <div className={`flex flex-col gap-3 w-full px-4 md:px-0 ${showValidation ? "" : ""}`}>
          <button
            onClick={handleSubmit}
            disabled={showValidation}
            className={`w-full h-[40px] md:h-[46px] rounded-[100px] font-aktiv font-bold text-[14px] md:text-[16px] leading-[16px] transition-all ${
              !showValidation
                ? "bg-[#11a64b] text-white hover:bg-[#0f9543]"
                : "bg-[#11a64b]/50 text-white/70 cursor-not-allowed"
            }`}
          >
            {progProfData.bottleCtaPrimary}
          </button>

          <button
            onClick={handleSkipClick}
            className="w-full h-[40px] md:h-[46px] rounded-[100px] bg-[rgba(118,118,128,0.12)] font-aktiv font-bold text-[14px] md:text-[16px] leading-[16px] text-[#121212] hover:bg-[rgba(118,118,128,0.18)] transition-all"
          >
            {progProfData.bottleCtaSecondary}
          </button>
        </div>
      </div>
    </div>
    </>
  );
};

export default BottleCountQuestion;
