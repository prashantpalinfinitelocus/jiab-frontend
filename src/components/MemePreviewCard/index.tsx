import React from "react";
import GreenCTA from "@/components/GreenCTA";

type MemePreviewCardProps = {
  userName: string;
  selectedLanguage: string;
  avatarUrl?: string;
  imageSrc?: string;
  termsAccepted: boolean;
  onTermsChange: (accepted: boolean) => void;
  onRetry: () => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
};

const MemePreviewCard: React.FC<MemePreviewCardProps> = ({
  userName,
  selectedLanguage,
  avatarUrl,
  imageSrc,
  termsAccepted,
  onTermsChange,
  onRetry,
  onSubmit,
  isSubmitting = false,
}) => {
  return (
    <>
      {/* User Info Card */}
      <div className="bg-white rounded-t-[5px] p-4 max-w-[483px] mx-auto">
        <div className="flex items-center gap-3 mb-3">
          {
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt="avatar"
              className="w-12 h-12 rounded-full object-cover"
            />
        }
          <div>
            <h3 className="font-[600] text-[16px]">
              {userName || "User"}, {selectedLanguage}
            </h3>
            <p className="text-[12px] text-mediumGray">
              The content displayed is user generated and may not reflect the opinions of Sprite
            </p>
          </div>
        </div>

        {/* Meme Preview in Card (CSS layered surface) */}
        <div className="w-full aspect-[450/440.56] relative overflow-hidden rounded-[8px]"
          style={{
            backgroundImage: `url('/assets/temp/backdrop-image-ugc.png')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {imageSrc ? (
            <img src={imageSrc} alt="meme preview" className="absolute inset-0 w-full h-full object-contain" />
          ) : null}
        </div>
      </div>

      {/* Preview Text */}
      <p className="text-center text-[16px] font-[500] mb-6 bg-[#41B7661A] py-[13px] text-[#121212] rounded-b-[5px] max-w-[483px] mx-auto">Preview your submission</p>

      {/* Terms and Conditions Checkbox */}
      <div className="mb-6 w-full">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => onTermsChange(e.target.checked)}
            className="mt-1 w-5 h-5 accent-green flex-shrink-0"
          />
          <span className="text-[12px] text-black leading-relaxed">
            By submitting content to The Coca-Cola Company&apos;s Sprite® Joke In A Bottle Platform, you grant TCCC a non-exclusive, worldwide license to use, display, and distribute your content on the Sprite® Joke In A Bottle platform. You acknowledge that TCCC will be the sole owner of the submitted content upon upload. The company reserves the right to moderate and may use the content if it passes moderation checks. This grants TCCC the right to feature, modify, or distribute the content as deemed fit. By submitting, you release TCCC from any claims and agree to indemnify against liabilities arising from the use of your content.
          </span>
        </label>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 max-w-[483px] mx-auto">
        <button
          onClick={onRetry}
          disabled={isSubmitting}
          className="w-full py-3 px-6 bg-white border-2 border-black rounded-full text-[16px] font-[600] flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/other-svgs/retry-meme.svg" alt="retry" className="w-4 h-4" />{` `}
          Retry
        </button>
        <GreenCTA
          text={isSubmitting ? "Submitting..." : "Submit"}
          onClick={onSubmit}
          className={`w-full ${!termsAccepted || isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
          disabled={!termsAccepted || isSubmitting}
        />
      </div>
    </>
  );
};

export default MemePreviewCard;


