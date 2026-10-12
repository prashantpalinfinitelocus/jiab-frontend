import localFont from "next/font/local";
import "./globals.css";
import LayoutClient from "@/components/LayoutClient";
import LoadGAScript from "@/components/common/LoadGAScript";
import LoadGTMScript from "@/components/common/LoadGTMScript";
import GTMNoscript from "@/components/common/GTMNoscript";
import { Metadata } from "next";
import FacebookPixelEvents from "@/components/FacebookPixelEvents";
// import AdobeAlloyCDP from "@/components/AdobeAlloyCDP";

// Application-wide metadata
export const metadata: Metadata = {
  title: "Sprite Joke-In-A-Bottle | Scan Karo, Joke Suno, Thand Rakho",
  description:
    "Listen to your favorite comedians as per your mood with Sprite's refreshing humor hub! Submit your own joke and stand a chance to win fabulous prizes. Enjoy a laughter bonanza.",
  // Testing environment: nothing here belongs in search results.
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/icons/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  alternates: {
    canonical: "https://sprite-joke-in-a-bottle.coke2home.com/",
  },
  verification: {
    google: "pqDRVJp2-kdkVnF9Y0c9GQLA7Y7UkswG1oErMZSZWMQ",
  },
};

// Viewport configuration
export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#11A64B",
};

const aktivGrotesk = localFont({
  src: [
    {
      path: "./fonts/AktivGroteskCorp-Light.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "./fonts/AktivGroteskCorp-Light.woff",
      weight: "300",
      style: "normal",
    },
    {
      path: "./fonts/AktivGroteskCorp-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/AktivGroteskCorp-Regular.woff",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/AktivGroteskCorp-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/AktivGroteskCorp-Medium.woff",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/AktivGroteskCorp-Bold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "./fonts/AktivGroteskCorp-Bold.woff",
      weight: "700",
      style: "normal",
    },
    {
      path: "./fonts/AktivGroteskCorp-Italic.woff2",
      weight: "400",
      style: "italic",
    },
    {
      path: "./fonts/AktivGroteskCorp-Italic.woff",
      weight: "400",
      style: "italic",
    },
    {
      path: "./fonts/AktivGroteskCorp-LightItalic.woff2",
      weight: "300",
      style: "italic",
    },
    {
      path: "./fonts/AktivGroteskCorp-LightItalic.woff",
      weight: "300",
      style: "italic",
    },
    {
      path: "./fonts/AktivGroteskCorp-MediumItalic.woff2",
      weight: "500",
      style: "italic",
    },
    {
      path: "./fonts/AktivGroteskCorp-MediumItalic.woff",
      weight: "500",
      style: "italic",
    },
    {
      path: "./fonts/AktivGroteskCorp-BoldItalic.woff2",
      weight: "700",
      style: "italic",
    },
    {
      path: "./fonts/AktivGroteskCorp-BoldItalic.woff",
      weight: "700",
      style: "italic",
    },
    {
      path: "./fonts/Aktiv-Grotesk-Black.woff",
      weight: "900",
      style: "normal",
    }
  ],
  variable: "--font-aktiv-grotesk",
  display: "swap",
  preload: true,
  fallback: [
    // Mac fallbacks
    "-apple-system",
    "BlinkMacSystemFont",
    // Windows fallbacks
    "Segoe UI",
    // Generic fallbacks
    "Roboto",
    "Helvetica Neue",
    "Arial",
    "sans-serif",
    // Emoji fallbacks
    "Apple Color Emoji",
    "Segoe UI Emoji",
    "Segoe UI Symbol",
    "Noto Color Emoji",
  ],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <link
          rel="stylesheet"
          href="https://webfonts.typotheque.com/WF-045992-012612.css"
          type="text/css"
        />
        <link
          rel="preload"
          href="/fonts/AktivGroteskCorp-Regular.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/AktivGroteskCorp-Medium.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/AktivGroteskCorp-Bold.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/Aktiv-Grotesk-Black.woff"
          as="font"
          type="font/woff"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/videos/coin-anim.json"
          as="fetch"
          type="application/json"
          crossOrigin="anonymous"
        />

        <LoadGAScript />
        <LoadGTMScript />
        <FacebookPixelEvents />
        {/* <AdobeAlloyCDP /> */}
      </head>
      <body
        className={`${aktivGrotesk.variable} antialiased bg-[#F2F2F2]`}
        style={{
          fontFeatureSettings: "'kern' 1, 'liga' 1, 'calt' 1",
          fontOpticalSizing: "auto",
          textRendering: "optimizeLegibility",
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
          touchAction: "manipulation",
        }}
      >
        <GTMNoscript />
        <LayoutClient>{children}</LayoutClient>
      </body>
    </html>
  );
}
