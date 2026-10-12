import withSerwistInit from "@serwist/next";

// Service worker: precaches the build output and applies Serwist's default runtime caching.
// Source is src/app/sw.ts; the bundled worker is written to public/sw.js at build time.
const withPWA = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: false,
  register: true,
  exclude: [/\.map$/],
});

/**
 * Next.js config.
 * Security: Next.js 14.2.35+ includes fix for CVE-2025-48068 (dev server origin validation).
 * To allow custom dev origins (e.g. local.yourapp.com), set allowedDevOrigins: ['local.yourapp.com'].
 * @see https://nextjs.org/docs/app/api-reference/config/next-config-js/allowedDevOrigins
 */
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  output: "standalone",
  // Removes the "X-Powered-By: Next.js" response header (StackHawk: Server
  // Leaks Information via "X-Powered-By" HTTP Response Header).
  poweredByHeader: false,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Next.js 16 removed the `eslint.ignoreDuringBuilds` config option
  // (ESLint is no longer run as part of `next build`); the key is now
  // rejected with an "Invalid next.config.mjs options" warning, so it's
  // dropped here rather than carried forward as dead/invalid config.
  // Next.js 16 scaffolds an AGENTS.md file for AI coding agents on every
  // dev/build run; this repo doesn't use that feature, so disable it to
  // avoid generating an untracked file as a side effect of the upgrade.
  agentRules: false,
  /**
   * Clickjacking mitigation (e.g. finding 4.12 / OWASP WSTG).
   * SAMEORIGIN: only same-origin pages may embed this app in a frame.
   * Use DENY instead if the product must never be framed (even same-site).
   *
   * The CSP below lists every third-party origin this app actually loads
   * (GTM/GA/Floodlight, Meta Pixel, Adobe Launch/Alloy, YouTube and Instagram
   * embeds, the Typotheque webfont CDN, CloudFront/S3 media) instead of leaving directives unset, which StackHawk's
   * "CSP: Wildcard Directive" check treats as an unrestricted/wildcard
   * policy. `'unsafe-inline'` on script-src is required by the inline
   * GTM/GA bootstrap snippets in LoadGTMScript/LoadGAScript - replacing it
   * would need a per-request nonce wired through Next middleware, a larger
   * change out of scope here.
   */
  async headers() {
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://www.googleadservices.com https://googleads.g.doubleclick.net https://*.doubleclick.net https://connect.facebook.net https://cdn1.adoberesources.net https://assets.adobedtm.com https://www.youtube.com https://s.ytimg.com https://www.gstatic.com",
      "style-src 'self' 'unsafe-inline' https://webfonts.typotheque.com",
      "font-src 'self' data: https://webfonts.typotheque.com",
      "img-src 'self' data: blob: https:",
      "media-src 'self' blob: data: https:",
      "connect-src 'self' https:",
      "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://www.facebook.com https://www.instagram.com https://www.googletagmanager.com https://*.doubleclick.net",
      "worker-src 'self' blob:",
      "manifest-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "frame-ancestors 'self'",
    ].join("; ");

    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Content-Type-Options", value: "nosniff" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
        ],
      },
    ];
  },
};

export default withPWA(nextConfig);
