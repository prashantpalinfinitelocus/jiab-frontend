"use client";
import React from "react";
import ScreenWrapper from "@/components/common/ScreenWrapper";
import Header from "@/components/common/Header/Header";
import MobileTempNavBar from "@/components/common/MobileTempNavBar";

interface CreateMemesLayoutProps {
  children: React.ReactNode;
}

const CreateMemesLayout = ({ children }: CreateMemesLayoutProps) => {
  return (
    <>
      <MobileTempNavBar 
        title="Meme Burst" 
        subtitle="Create the LOL, Rule the Scroll"
      />
      <ScreenWrapper className="px-0 md:px-4 md:mt-20 mt-[-15px]">
        {/* Meme Burst Heading */}
        <Header
          title="Meme Burst"
          className="mt-[20px] mb-[40px] hidden md:block"
          description="Create the LOL, Rule the Scroll"
        />
        {children}
      </ScreenWrapper>
    </>
  );
};

export default CreateMemesLayout;