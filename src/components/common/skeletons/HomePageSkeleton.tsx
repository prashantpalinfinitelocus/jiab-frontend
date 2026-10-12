"use client";

import { Skeleton } from "@/components/ui/skeleton";

interface SectionHeaderSkeletonProps {
  className?: string;
}

export function SectionHeaderSkeleton({
  className = "",
}: SectionHeaderSkeletonProps) {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <Skeleton className="h-6 w-40 md:h-8 md:w-60 rounded" />
      <Skeleton className="h-4 w-16 md:w-20 rounded" />
    </div>
  );
}

export function BannerSkeleton() {
  return (
    <Skeleton className="w-full h-[140px] xxs:h-[120px] md:h-[371px] rounded-lg" />
  );
}

export function VideoCardSkeleton() {
  return (
    <div className="relative">
      {/* Card */}
      <Skeleton className="h-[300px] md:h-[572px] w-full rounded-[10px]" />

      {/* Center square */}
      <div className="absolute inset-0 flex items-center justify-center">
        <Skeleton className="h-12 w-12 md:h-20 md:w-20 rounded-md" />
      </div>

      {/* Bottom meta */}
      <div className="absolute bottom-4 left-4 right-4 flex items-end gap-3">
        <Skeleton className="h-9 w-9 md:h-14 md:w-14 rounded-[10px]" />
        <div className="flex-1 flex flex-col gap-2">
          <Skeleton className="h-3 w-[70%]" />
          <Skeleton className="h-3 w-[60%]" />
        </div>
      </div>
    </div>
  );
}

export function VideoRowSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-10">
      <VideoCardSkeleton />
      <VideoCardSkeleton />
      <div className="hidden md:block">
        <VideoCardSkeleton />
      </div>
    </div>
  );
}

export function CategoriesRowSkeleton() {
  return (
    <>
      <div className="flex justify-between md:justify-evenly gap-3 md:gap-6 px-4 md:px-0 mb-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={`cat-skel-${index}`}
            className={`flex flex-col items-center ${
              index >= 4 ? "hidden md:flex" : ""
            }`}
          >
            <Skeleton className="rounded-full w-[80px] h-[80px] md:w-[140px] md:h-[140px]" />
            <Skeleton className="h-3 w-16 md:w-[100px] mt-3" />
          </div>
        ))}
      </div>
      <div className="flex justify-center items-center gap-2 md:hidden mt-4">
        <div className="h-[4px] w-16 bg-black rounded-full" />
        <div className="h-[4px] w-3 bg-gray-300 rounded-full" />
        <div className="h-[4px] w-3 bg-gray-300 rounded-full" />
        <div className="h-[4px] w-3 bg-gray-300 rounded-full" />
      </div>
    </>
  );
}

export function ChallengeBannerSkeleton() {
  return <Skeleton className="w-full h-[120px] md:h-[160px] rounded-xl" />;
}

export default function HomePageSkeleton() {
  return (
    <div className="md:w-[76.57%] mx-auto md:pt-24 pt-20">
      <SectionHeaderSkeleton className="md:mt-[58px] md:mb-[24px] mt-[20px] mb-[16px]" />
      <VideoRowSkeleton />

      <SectionHeaderSkeleton className="md:mt-[58px] md:mb-[24px] mt-[20px] mb-[16px]" />
      <CategoriesRowSkeleton />
    </div>
  );
}
