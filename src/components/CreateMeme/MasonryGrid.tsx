"use client";
import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { MemeTemplate } from "@/types/meme";
import { GA_EVENTS } from "@/constants";
import { triggerGAEvent } from "@/utils/gTagEvents";

interface MasonryGridProps {
  templates: MemeTemplate[];
  /** The search matched nothing: say so above the templates that are still shown. */
  showNoResults?: boolean;
}

const MasonryGrid: React.FC<MasonryGridProps> = ({ templates, showNoResults = false }) => {
  const router = useRouter();
  
  // Handle template click - store template data in sessionStorage
  const handleTemplateClick = (template: MemeTemplate) => {
    triggerGAEvent(GA_EVENTS.MEME_TEMPLATE_SELECT, {
      template_id: template.id,
      type: template.type === "Sticker" ? "sticker" : "gif",
    });
    try {
      sessionStorage.setItem(`template-${template.id}`, JSON.stringify(template));
    } catch (e) {
      console.error("Failed to store template data", e);
    }
    router.push(`/create-memes/${template.id}`);
  };

  return (
    <>
      {showNoResults && (
        <div className="flex flex-col items-center justify-center md:pb-[40px] pb-[24px] px-[16px]">
          <Image
            src="/assets/images/empty-state-create-meme.png"
            alt="No results found"
            width={420}
            height={294}
            className="md:w-[280px] w-[160px] md:h-[196px] h-[112px] mx-auto md:mb-[20px] mb-[12px]"
          />
          <p className="md:text-[20px] text-[12px] text-center text-black leading-tight max-w-[600px] font-[500]">
            Nothing fizzed up for that one. Try a different word or pick from the templates below.
          </p>
        </div>
      )}

      {/* Desktop Masonry Layout */}
      <div className="hidden md:block">
        <div className="columns-4 gap-[16px]" style={{ columnFill: 'balance' }}>
          {templates.map((template) => (
            <button
              key={template.id}
              onClick={() => handleTemplateClick(template)}
              className="inline-block break-inside-avoid mb-[16px] relative group w-full cursor-pointer"
            >
              {/* isolate keeps the badge's z-index inside the card. Without it
                  the badge competes with the sticky page header, which sits at
                  the same z-index, and wins on DOM order. */}
              <div className="relative isolate w-full overflow-hidden rounded-[16px] shadow-sm">
                {/* Badge */}
                <div
                  className={`absolute top-[4px] left-[4px] z-10 px-[12px] py-[4px] rounded-[20px] text-[14px] font-[400] leading-[100%] ${
                    template.type === "GIF"
                      ? "bg-[#FFEE67] text-black"
                      : "bg-[#4FD077] text-black"
                  }`}
                >
                  {template.type === "GIF" ? "GIF" : "Sticker"}
                </div>

                {/* Image */}
                <div className="relative w-full aspect-auto">
                  <Image
                    src={template.imageURL}
                    alt={`Meme template ${template.id}`}
                    width={600}
                    height={600}
                    className="w-full h-auto object-cover hover:scale-[1.02] transition-transform"
                    unoptimized
                  />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Masonry Layout */}
      <div className="block md:hidden mx-4">
        <div className="columns-2 gap-[10px]" style={{ columnFill: 'balance' }}>
          {templates.map((template) => (
            <button
              key={template.id}
              onClick={() => handleTemplateClick(template)}
              className="inline-block break-inside-avoid mb-[10px] relative group active:scale-[0.98] transition-transform w-full cursor-pointer"
            >
              <div className="relative isolate w-full overflow-hidden rounded-[12px] shadow-sm">
                {/* Badge */}
                <div
                  className={`absolute top-[10px] left-[10px] z-10 px-[10px] py-[5px] rounded-[16px] text-[10px] font-[700] leading-[100%] ${
                    template.type === "GIF"
                      ? "bg-[#FFEE67] text-black"
                      : "bg-[#4FD077] text-black"
                  }`}
                >
                  {template.type === "GIF" ? "GIF" : "Sticker"}
                </div>

                {/* Image */}
                <div className="relative w-full aspect-auto">
                  <Image
                    src={template.imageURL}
                    alt={`Meme template ${template.id}`}
                    width={400}
                    height={400}
                    className="w-full h-auto object-cover"
                    unoptimized
                  />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default MasonryGrid;

