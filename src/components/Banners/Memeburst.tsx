import React from "react";
// import { useLanguage } from "@/hooks/useLanguage";
// import ScrollableBanner from "@/components/common/ScrollableBanner";
import Banner from "../common/Banner/Banner";
import Link from "next/link";
import { GA_EVENTS } from "@/constants";
import { triggerGAEvent } from "@/utils/gTagEvents";
// import { LANGUAGE_MNEMONICS } from "@/constants";

const MemeburstBanner = () => {
  // const { selectedLanguage } = useLanguage();


  // Determine the spicy-kv image based on selected language
  // const getSpicyKvImage = () => {
  //   switch (selectedLanguage) {
  //     case LANGUAGE_MNEMONICS.BHOJPURI:
  //       return "/assets/meme-burst/mb-english.jpg";
  //     case LANGUAGE_MNEMONICS.TULU:
  //       return "/assets/meme-burst/mb-english.jpg";
  //     case LANGUAGE_MNEMONICS.TELUGU:
  //       return "/assets/meme-burst/mb-english.jpg";
  //     case LANGUAGE_MNEMONICS.TAMIL:
  //       return "/assets/meme-burst/mb-english.jpg";
  //     case LANGUAGE_MNEMONICS.MARATHI:
  //       return "/assets/meme-burst/mb-english.jpg";
  //     case LANGUAGE_MNEMONICS.MAITHILI:
  //       return "/assets/meme-burst/mb-english.jpg";
  //     case LANGUAGE_MNEMONICS.BENGALI:
  //       return "/assets/meme-burst/mb-english.jpg";
  //     case LANGUAGE_MNEMONICS.ENGLISH:
  //       return "/assets/meme-burst/mb-english.jpg";
  //     case LANGUAGE_MNEMONICS.HINDI:
  //       return "/assets/meme-burst/mb-english.jpg";
  //     case LANGUAGE_MNEMONICS.KANNADA:
  //       return "/assets/meme-burst/mb-english.jpg";
  //     case LANGUAGE_MNEMONICS.ORIYA:
  //       return "/assets/meme-burst/mb-english.jpg";
  //     default:
  //       return "/assets/meme-burst/mb-english.jpg";
  //   }
  // };


  return (
    <Link
      href="/create-memes"
      className=""
      onClick={() => triggerGAEvent(GA_EVENTS.MEME_ENTRY_CLICK, { entry_point: "banner" })}
    >
      <Banner
        type="image"
        src="/assets/meme-burst/mb-english.png"
        alt="Meme Burst Banner"
        className="rounded-[4px] banner-section mx-5 md:mx-0 cursor-pointer"
      />
    </Link>
  );
};

export default MemeburstBanner;