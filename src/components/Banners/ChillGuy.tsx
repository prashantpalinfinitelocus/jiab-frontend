import React from "react";
import { useLanguage } from "@/hooks/useLanguage";
import ScrollableBanner from "@/components/common/ScrollableBanner";
import { LANGUAGE_MNEMONICS } from "@/constants";

const ChillGuyBanner = () => {
  const { selectedLanguage } = useLanguage();

  // Determine the banner type based on selected language
  const getBannerType = (): "video" | "image" => {
    return selectedLanguage === LANGUAGE_MNEMONICS.ENGLISH ? "video" : "image";
  };

  // Determine the banner image based on selected language
  const getBannerImage = () => {
    switch (selectedLanguage) {
      case LANGUAGE_MNEMONICS.ENGLISH:
        return "/videos/home-banner-en.mp4";
      case LANGUAGE_MNEMONICS.HINDI:
        return "/assets/images/home-banner-hi.jpg";
      case LANGUAGE_MNEMONICS.TELUGU:
        return "/assets/images/home-banner-3.jpg";
      case LANGUAGE_MNEMONICS.ORIYA:
        return "/assets/images/home-banner-4.jpg";
      case LANGUAGE_MNEMONICS.BENGALI:
        return "/assets/images/home-banner-5.jpg";
      case LANGUAGE_MNEMONICS.MARATHI:
        return "/assets/images/home-banner-6.jpg";
      case LANGUAGE_MNEMONICS.KANNADA:
        return "/assets/images/home-banner-7.jpg";
      case LANGUAGE_MNEMONICS.BHOJPURI:
        return "/assets/images/home-banner-8.jpg";
      case LANGUAGE_MNEMONICS.MAITHILI:
        return "/assets/images/home-banner-9.jpg";
      case LANGUAGE_MNEMONICS.TAMIL:
        return "/assets/images/home-banner-10.jpg";
      default:
        return "/assets/images/home-banner-11.jpg";
    }
  };

  // Determine the spicy-kv image based on selected language
  const getSpicyKvImage = () => {
    switch (selectedLanguage) {
      case LANGUAGE_MNEMONICS.BHOJPURI:
        return "/assets/spicy-kv/skv-bhojpuri.jpg";
      case LANGUAGE_MNEMONICS.TULU:
        return "/assets/spicy-kv/skv-tulu.jpg";
      case LANGUAGE_MNEMONICS.TELUGU:
        return "/assets/spicy-kv/skv-telegu.jpg";
      case LANGUAGE_MNEMONICS.TAMIL:
        return "/assets/spicy-kv/skv-tamil.jpg";
      case LANGUAGE_MNEMONICS.MARATHI:
        return "/assets/spicy-kv/skv-marathi.jpg";
      case LANGUAGE_MNEMONICS.MAITHILI:
        return "/assets/spicy-kv/skv-maithali.jpg";
      case LANGUAGE_MNEMONICS.BENGALI:
        return "/assets/spicy-kv/skv-bengali.jpg";
      case LANGUAGE_MNEMONICS.ENGLISH:
        return "/assets/spicy-kv/skv-english.jpg";
      case LANGUAGE_MNEMONICS.HINDI:
        return "/assets/spicy-kv/skv-hindi.jpg";
      case LANGUAGE_MNEMONICS.KANNADA:
        return "/assets/spicy-kv/skv-kanadda.jpg";
      case LANGUAGE_MNEMONICS.ORIYA:
        return "/assets/spicy-kv/skv-oriya.jpg";
      default:
        return "/assets/spicy-kv/skv-english.jpg";
    }
  };

  const items = [
    {
      type: "image" as const,
      src: getSpicyKvImage(),
    },
    {
      type: getBannerType(),
      src: getBannerImage(),
    },
  ];

  return (
    <ScrollableBanner
      items={items}
      className="rounded-[4px] banner-section mx-5 md:mx-0"
    />
  );
};

export default ChillGuyBanner;
 