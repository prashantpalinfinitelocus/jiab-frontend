"use client";
import React, { useEffect, useState } from "react";
import CreateMemes from "@/components/CreateMeme";
import MyMemes from "@/components/MyMemes";
import { useRouter, useSearchParams } from "next/navigation";

const CreateMemePage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<"create" | "myMemes">(
    tabParam === "myMemes" ? "myMemes" : "create"
  );

  // Keep state in sync when URL query changes (e.g., from deep link)
  useEffect(() => {
    const current = searchParams.get("tab");
    setActiveTab(current === "myMemes" ? "myMemes" : "create");
  }, [tabParam, searchParams]);

  const handleTabChange = (tab: "create" | "myMemes") => {
    setActiveTab(tab);
    if (tab === "myMemes") {
      router.replace("/create-memes?tab=myMemes");
    } else {
      router.replace("/create-memes");
    }
  };
  
  return (
    <>
      {/* Tab Navigation */}
      <div className="flex w-full border-b border-gray-200">
        <button
          onClick={() => handleTabChange("create")}
          className={`flex-1 md:py-4 py-2 text-center md:text-[20px] text-[12px] leading-[100%] transition-all duration-200 relative ${
            activeTab === "create"
              ? "text-black font-[700]"
              : "text-black font-[400]"
          }`}
        >
          Create
          {activeTab === "create" && (
            <div className="absolute bottom-0 left-0 right-0 md:h-1 h-0.5 bg-green" />
          )}
        </button>
        <button
          onClick={() => handleTabChange("myMemes")}
          className={`flex-1 md:py-4 py-2 text-center md:text-[20px] text-[12px] leading-[100%] transition-all duration-200 border-l relative ${
            activeTab === "myMemes"
              ? "text-black font-[700]"
              : "text-black font-[400]"
          }`}
        >
          My Memes
          {activeTab === "myMemes" && (
            <div className="absolute bottom-0 left-0 right-0 md:h-1 h-0.5 bg-green" />
          )}
        </button>
      </div>

      {/* Tab Content */}
      <div className="md:mt-[24px] mt-[12px]">
        {activeTab === "create" && (
          <CreateMemes />
        )}
        {activeTab === "myMemes" && (
          <MyMemes onCreateMeme={() => setActiveTab("create")} />
        )}
      </div>
    </>
  );
};

export default CreateMemePage;