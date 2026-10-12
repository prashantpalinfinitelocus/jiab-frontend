"use client";
import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { MemeTemplate } from "@/types/meme";

interface MasonryGridProps {
  templates: MemeTemplate[];
  searchQuery?: string;
}

const MasonryGrid: React.FC<MasonryGridProps> = ({ templates, searchQuery = "" }) => {
  const router = useRouter();
  
  // Handle template click - store template data in sessionStorage
  const handleTemplateClick = (template: MemeTemplate) => {
    try {
      sessionStorage.setItem(`template-${template.id}`, JSON.stringify(template));
    } catch (e) {
      console.error("Failed to store template data", e);
    }
    router.push(`/create-memes/${template.id}`);
  };

  // Show empty state if no templates and search query exists
  if (templates.length === 0 && searchQuery) {
    return (
      <div className="flex flex-col items-center justify-center md:py-[80px] py-[60px]">
        <div className="max-w-[600px] mx-auto px-[16px]">
          <h2 className="md:text-[32px] text-[16px] font-[700] text-center md:mb-[20px] mb-[16px] leading-none">
            OOPSIE DAISY!
          </h2>
          <Image
            src="/assets/images/empty-state-create-meme.png"
            alt="No results found"
            width={420}
            height={294}
            className="md:w-[420px] w-[220px] md:h-[294px] h-[154px] mx-auto md:mb-[32px] mb-[16px]"
          />
          <p className="md:text-[20px] text-[12px] text-center text-black leading-none w-[220px] md:w-full font-[500]">
            &quot;{searchQuery}&quot; is currently out of stock in the humour aisle!
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
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

