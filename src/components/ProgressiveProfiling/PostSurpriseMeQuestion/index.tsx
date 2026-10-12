"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { TQuestionOption } from "@/api/types/ProfileTypes";
import { IGenre } from "@/store/reference";
import { triggerGAEvent } from "@/utils/gTagEvents";
import { GA_EVENTS } from "@/constants";
import useAppSelector from "@/hooks/useSelector";
import { useCMSData } from "@/data";

interface PostSurpriseMeQuestionProps {
  options: TQuestionOption[];
  genres: IGenre[];
  selectedOptionId?: number | null;
  onSubmit?: (optionId: number) => void;
  onSkip?: () => void;
  isLoading?: boolean;
  isSubmitting?: boolean;
  className?: string;
}

const PostSurpriseMeQuestion: React.FC<PostSurpriseMeQuestionProps> = ({
  options,
  genres,
  selectedOptionId: initialSelectedOptionId = null,
  onSubmit,
  onSkip,
  isLoading = false,
  isSubmitting = false,
  className = "",
}) => {
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(
    initialSelectedOptionId
  );
  const [showValidation, setShowValidation] = useState(false);
  const mountTimeRef = useRef<number>(Date.now());
  const { user } = useAppSelector((state) => state.profile);

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])
  const cmsData = useCMSData(mounted);
  const progProfData = cmsData.scrollAndLol;

  // Generate a simple session_id (you may want to use a more robust solution)
  const sessionIdRef = useRef<string>(
    typeof window !== "undefined" 
      ? sessionStorage.getItem("ga_session_id") || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      : `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("ga_session_id", sessionIdRef.current);
    }
  }, []);

  // Helper function to find genre image by matching option text to genre name
  const getGenreImageForOption = (optionText: string): string | null => {
    const matchingGenre = genres.find(
      (genre: IGenre) =>
        genre.genre.toLowerCase() === optionText.toLowerCase() ||
        genre.genre.toLowerCase().includes(optionText.toLowerCase()) ||
        optionText.toLowerCase().includes(genre.genre.toLowerCase())
    );
    return matchingGenre?.image_url || null;
  };

  // Track modal viewed on mount
  useEffect(() => {
    if (!isLoading) {
      const visitCount = typeof window !== "undefined" 
        ? parseInt(sessionStorage.getItem("visit_count") || "1", 10)
        : 1;

      triggerGAEvent(GA_EVENTS.SPRITE_J24_HUMOR_PREF_VIEWED, {
        session_id: sessionIdRef.current,
        user_id: user?.id || null,
        visit_count: visitCount,
        joke_order_index: 4,
        humor_preference: null,
        ui_surface: "modal",
        session_profile_question_type: "Q1",
        profile_question_shown_in_session: true
      });
    }
  }, [isLoading, user?.id]);

  const handleSelectOption = (optionId: number) => {
    setSelectedOptionId(optionId);
    setShowValidation(false);
  };

  const handleSubmit = () => {
    if (!selectedOptionId) {
      setShowValidation(true);
      return;
    }

    // Calculate response time
    const responseTimeMs = Date.now() - mountTimeRef.current;
    const visitCount = typeof window !== "undefined" 
      ? parseInt(sessionStorage.getItem("visit_count") || "1", 10)
      : 1;

    // Find selected option text for humor preference
    const selectedOption = options.find(opt => opt.id === selectedOptionId);
    const selectedHumorPref = selectedOption?.option_text?.toLowerCase() || "unknown";

    // Track submit event
    triggerGAEvent(GA_EVENTS.SPRITE_J24_HUMOR_PREF_SUBMIT, {
      session_id: sessionIdRef.current,
      user_id: user?.id || null,
      visit_count: visitCount,
      joke_order_index: 4,
      humor_preference: null,
      ui_surface: "modal",
      session_profile_question_type: "Q1",
      profile_question_shown_in_session: true,
      selected_humor_preference: selectedHumorPref,
      response_time_ms: responseTimeMs,
      previous_humor_preference: null,
      is_first_submission: true
    });

    if (onSubmit) {
      onSubmit(selectedOptionId);
    }
  };

  const handleSkip = () => {
    // Calculate response time
    const responseTimeMs = Date.now() - mountTimeRef.current;
    const visitCount = typeof window !== "undefined" 
      ? parseInt(sessionStorage.getItem("visit_count") || "1", 10)
      : 1;

    // Track skip event
    triggerGAEvent(GA_EVENTS.SPRITE_J24_HUMOR_PREF_SKIP, {
      session_id: sessionIdRef.current,
      user_id: user?.id || null,
      visit_count: visitCount,
      joke_order_index: 4,
      humor_preference: null,
      ui_surface: "modal",
      session_profile_question_type: "Q1",
      profile_question_shown_in_session: true,
      skip_reason: "Maybelater",
      response_time_ms: responseTimeMs
    });

    if (onSkip) {
      onSkip();
    }
  };

  return (
    <div className={`flex justify-center min-h-[calc(100vh-71px)] md:min-h-0 ${className}`}>
      <div className="flex flex-col gap-[20px] md:gap-[24px] justify-center items-center w-full max-w-full md:max-w-[442px] md:h-auto bg-white px-[24px] py-0 md:px-[32px] md:py-[45px]">
        {/* Question */}
        <h2 className="font-aktiv font-bold text-[14px] md:text-[20px] leading-[21px] md:leading-[30px] text-black text-center max-w-[271px] md:max-w-[358px] whitespace-pre-wrap">
          {progProfData.genreHeading}
        </h2>

        {/* Options Grid */}
        <div className="flex flex-col gap-2 md:gap-6 w-full">
          {/* Skeleton Loading State */}
          {isLoading && (
            <div className="grid grid-cols-4 md:grid-cols-4 gap-x-[20px] md:gap-x-6 gap-y-2 md:gap-y-6 justify-items-center w-full">
              {Array.from({ length: 14 }).map((_, index) => (
                <div
                  key={`skeleton-${index}`}
                  className="flex flex-col items-center gap-1"
                >
                  <div className="w-[50px] h-[50px] md:w-[78px] md:h-[78px] rounded-full bg-gray-200 animate-pulse" />
                  <div className="w-[40px] md:w-[50px] h-[13px] md:h-[16px] rounded bg-gray-200 animate-pulse" />
                </div>
              ))}
            </div>
          )}

          {/* Actual Options */}
          {!isLoading && (
            <div className="grid grid-cols-4 md:grid-cols-4 gap-x-[20px] md:gap-x-6 gap-y-2 md:gap-y-6 justify-items-center w-full">
              {options
                .sort((a, b) => a.display_order - b.display_order)
                .map((option: TQuestionOption) => {
                  const genreImage = getGenreImageForOption(option.option_text);
                  return (
                    <button
                      key={option.id}
                      onClick={() => handleSelectOption(option.id)}
                      className="flex flex-col items-center gap-1 group"
                      aria-label={option.option_text}
                    >
                      <div
                        className={`relative flex items-center justify-center bg-[#F9F9F9] w-[50px] h-[50px] md:w-[78px] md:h-[78px] rounded-full overflow-hidden transition-all ${
                          selectedOptionId === option.id
                            ? "ring-[1px] md:ring-[1px] ring-green"
                            : "hover:ring-[1px] hover:ring-green"
                        }`}
                      >
                        {genreImage && genreImage !== "" && (
                          <Image
                            src={genreImage}
                            alt={option.option_text}
                            width={78}
                            height={78}
                            className="w-full md:h-[48px] h-[30.77px] object-contain"
                          />
                        )}
                      </div>
                      <span className="font-aktiv font-medium text-[10px] md:text-[12px] leading-[13px] md:leading-[16px] text-black text-center">
                        {option.option_text}
                      </span>
                    </button>
                  );
                })}
            </div>
          )}
        </div>

        {showValidation && (
          <div className="text-center text-red text-[12px] md:text-[14px] leading-[16px] md:leading-[18px] -mt-[8px]">
            {progProfData.genreValidation}
          </div>
        )}

        {/* Buttons */}
        <div
          className={`flex flex-col gap-3 md:gap-3 w-full ${
            showValidation ? "" : ""
          }`}
        >
          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={showValidation || isSubmitting || isLoading}
            className={`w-full h-[36px] md:h-[46px] rounded-full font-aktiv font-bold text-[14px] md:text-[16px] leading-[16px] transition-all ${
              !showValidation && !isSubmitting && !isLoading
                ? "bg-green text-white hover:bg-green/90"
                : "bg-green/50 text-white/70 cursor-not-allowed"
            }`}
          >
            {isSubmitting ? progProfData.ctaPendingState : progProfData.genreCtaPrimary}
          </button>

          {/* Skip Button */}
          <button
            onClick={handleSkip}
            className="w-full h-[36px] md:h-[46px] rounded-full bg-[rgba(118,118,128,0.12)] font-aktiv font-bold text-[14px] md:text-[16px] leading-[16px] text-[#121212] hover:bg-[rgba(118,118,128,0.18)] transition-all"
          >
            {progProfData.genreCtaSecondary}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostSurpriseMeQuestion;
