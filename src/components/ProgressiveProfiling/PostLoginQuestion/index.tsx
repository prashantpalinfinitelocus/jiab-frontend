"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { TQuestionOption } from "@/api/types/ProfileTypes";
import { triggerGAEvent } from "@/utils/gTagEvents";
import { GA_EVENTS } from "@/constants";
import useAppSelector from "@/hooks/useSelector";
import { useCMSData } from "@/data";

interface PostLoginQuestionProps {
  options: TQuestionOption[];
  selectedOptionId?: number | null;
  onSubmit?: (optionId: number) => void;
  onSkip?: () => void;
  isSubmitting?: boolean;
  className?: string;
}

const PostLoginQuestion: React.FC<PostLoginQuestionProps> = ({
  options,
  selectedOptionId: initialSelectedOptionId = null,
  onSubmit,
  onSkip,
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
  const cmsData = useCMSData(mounted)
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

  // Image keys for options in order: Morning, Noon, Evening
  const IMAGE_KEYS = ["morning", "noon", "night"];
  const OPTION_LABELS = [progProfData.mneMorning, progProfData.mneNoon, progProfData.mneEvening];

  // Track modal viewed on mount
  useEffect(() => {
    const visitCount = typeof window !== "undefined"
      ? parseInt(sessionStorage.getItem("visit_count") || "1", 10)
      : 1;

    triggerGAEvent(GA_EVENTS.SPRITE_J24_DAYPART_VIEWED, {
      session_id: sessionIdRef.current,
      user_id: user?.id || null,
      visit_count: visitCount,
      ui_surface: "modal",
      session_profile_question_type: "Q3",
      is_first_question_of_session: true
    });
  }, [user?.id]);

  // Get option image based on index (0=Morning, 1=Noon, 2=Evening) and selection state
  const getOptionImage = (index: number, isSelected: boolean) => {
    const imageKey = IMAGE_KEYS[index] || "morning";
    const suffix = isSelected ? "web" : "unactive";
    return `/assets/progressive-profiling/${imageKey}-${suffix}.svg`;
  };

  // Sort options by display_order
  const sortedOptions = [...options].sort(
    (a, b) => a.display_order - b.display_order
  );

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

    // Find selected option and map to daypart preference
    const selectedOptionIndex = sortedOptions.findIndex(opt => opt.id === selectedOptionId);
    const daypartMap = ["morning", "noon", "evening"];
    const selectedDaypart = daypartMap[selectedOptionIndex] || "unknown";

    // Track submit event
    triggerGAEvent(GA_EVENTS.SPRITE_J24_DAYPART_SUBMIT, {
      session_id: sessionIdRef.current,
      user_id: user?.id || null,
      visit_count: visitCount,
      ui_surface: "modal",
      session_profile_question_type: "Q3",
      is_first_question_of_session: true,
      sprite_daypart_preference_selected: selectedDaypart,
      response_time_ms: responseTimeMs,
      previous_daypart_pref: null,
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
    triggerGAEvent(GA_EVENTS.SPRITE_J24_DAYPART_SKIP, {
      session_id: sessionIdRef.current,
      user_id: user?.id || null,
      visit_count: visitCount,
      ui_surface: "modal",
      session_profile_question_type: "Q3",
      is_first_question_of_session: true,
      skip_reason: "Maybelater",
      response_time_ms: responseTimeMs
    });

    if (onSkip) {
      onSkip();
    }
  };

  return (
    <div className={`flex justify-center min-h-[calc(100vh-71px)] md:min-h-0 ${className}`}>
      <div className="flex flex-col gap-[24px] md:gap-[32px] justify-center items-center w-full max-w-full md:max-w-[442px] md:h-[783px] bg-white px-[24px] py-[24px] md:px-[32px] md:py-[24px]">
        {/* Question and Options */}
        <div className="flex flex-col gap-[16px] md:gap-[24px] items-center w-full">
          {/* Question */}
          <h2 className="font-aktiv font-bold text-[16px] md:text-[20px] leading-[24px] md:leading-[30px] text-black text-center max-w-[249px] md:max-w-[370px] whitespace-pre-wrap">
            {progProfData.mneHeading}
          </h2>

          {/* Time Options */}
          <div className="flex items-center justify-between w-full gap-3 md:gap-4">
            {sortedOptions.map((option, index) => (
              <button
                key={option.id}
                onClick={() => {
                  setSelectedOptionId(option.id);
                  setShowValidation(false);
                }}
                className="relative group flex-shrink-0"
                aria-label={option.option_text}
              >
                <div
                  className={`relative w-[80px] h-[80px] md:w-[105px] md:h-[105px] rounded-full overflow-hidden transition-all ${selectedOptionId === option.id
                      ? "ring-[3px] ring-green"
                      : "hover:ring-[3px] hover:ring-green"
                    }`}
                >
                  <Image
                    src={getOptionImage(index, selectedOptionId === option.id)}
                    alt={option.option_text}
                    width={105}
                    height={105}
                    className="w-full h-full object-cover"
                  />
                  {/* Text Label */}
                  <span className="absolute bottom-[10.64px] md:bottom-[14px] inset-0 flex items-end justify-center font-aktiv font-bold text-black text-[9.12px] leading-[10.49px] md:text-[12px] md:leading-[13.81px]">
                    {OPTION_LABELS[index]}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {showValidation && (
          <div className="text-center text-red text-[12px] md:text-[14px] leading-[16px] md:leading-[18px] -mt-[8px]">
            {progProfData.mneValidation}
          </div>
        )}

        {/* Buttons */}
        <div
          className={`flex flex-col gap-3 w-full ${showValidation ? "" : ""
            }`}
        >
          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={showValidation || isSubmitting}
            className={`w-full h-[40px] md:h-[46px] rounded-full font-aktiv font-bold text-[14px] md:text-[16px] leading-[16px] transition-all ${!showValidation && !isSubmitting
                ? "bg-green text-white hover:bg-green/90"
                : "bg-green/50 text-white/70 cursor-not-allowed"
              }`}
          >
            {isSubmitting ? progProfData.ctaPendingState : progProfData.mneCtaPrimary}
          </button>

          {/* Skip Button */}
          <button
            onClick={handleSkip}
            className="w-full h-[40px] md:h-[46px] rounded-full bg-[rgba(118,118,128,0.12)] font-aktiv font-bold text-[14px] md:text-[16px] leading-[16px] text-[#121212] hover:bg-[rgba(118,118,128,0.18)] transition-all"
          >
            {progProfData.mneCtaSecondary}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostLoginQuestion;
