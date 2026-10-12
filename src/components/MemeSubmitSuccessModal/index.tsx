"use client";
import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import SvgIcons from "@/components/common/SvgIcons";
import { ICONS_NAMES } from "@/constants";
import AktivGroteskText from "@/components/common/AktivGroteskText";
import GreenCTA from "@/components/GreenCTA";
import Image from "next/image";

interface MemeSubmitSuccessModalProps {
  open: boolean;
  onClose: () => void;
  onDropAnother: () => void;
  onViewVault: () => void;
}

const MemeSubmitSuccessModal: React.FC<MemeSubmitSuccessModalProps> = ({
  open,
  onClose,
  onDropAnother,
  onViewVault,
}) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[343px] md:max-w-[401px] gap-0 rounded-[10px] p-0">
        <div className="flex justify-end pt-[12px] pr-[12px] md:pr-[18px]">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            className="cursor-pointer bg-transparent rounded-full border-none outline-none"
            type="button"
            aria-label="Close"
          >
            <SvgIcons name={ICONS_NAMES.CROSS} className="w-[20px] h-[20px]" />
          </button>
        </div>

        <div className="w-full px-[22px] md:px-[16px] md:pt-[12px] pt-0 md:pb-[40px] pb-[14px] flex flex-col md:gap-[24px] gap-[11px] items-center text-center">
          {/* Thank you badge */}
          <div className="flex items-center justify-center md:p-[17px] p-[12px] bg-yellow rounded-full">
            <Image src={`/static/sprite/icons/${ICONS_NAMES.THANK_YOU}.svg`} alt="Thank You" width={42} height={42} className="md:w-[42px] md:h-[42px] w-[28px] h-[28px]"/>
          </div>

          {/* Heading */}
          <AktivGroteskText
            text="Meme locked & loaded"
            fontSize="md:text-[24px] text-[20px] leading-[24px]"
            fontWeight="font-[700]"
            className="text-black"
          />

          {/* Subtext */}
          <AktivGroteskText
            text="One more feather in your meme-lord hat! We'll bubble this up in 14 days."
            fontSize="md:text-[20px] text-[16px] leading-[20px]"
            fontWeight="font-[400]"
            className="md:max-w-[321px] max-w-[274px]"
          />

          {/* CTAs */}
          <div className="flex flex-col gap-[12px] w-full px-[16px] items-center">
            <GreenCTA
              text="Drop Another LOL"
              fontSize="text-[14px] md:text-[20px]"
              paddingClass="py-[12px]"
              onClick={onDropAnother}
              className="w-[245px]"
            />
            <GreenCTA
              text="Peep Your LOL vault"
              fontSize="text-[14px] md:text-[20px]"
              paddingClass="py-[12px]"
              onClick={onViewVault}
              className="w-[245px]"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MemeSubmitSuccessModal;


