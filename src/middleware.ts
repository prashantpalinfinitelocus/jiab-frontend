import { NextResponse } from "next/server";

import type { NextRequest } from "next/server";

const ROUTE_MAP: Record<
  string,
  { pathname: string; addParams?: Record<string, string> }
> = {
  "/login": { pathname: "/", addParams: { login: "true" } },

  "/otp-verification": { pathname: "/", addParams: { login: "true" } },

  "/signup": { pathname: "/", addParams: { login: "true" } },

  "/faq": { pathname: "/" },

  "/artists": { pathname: "/" },

  "/artist": { pathname: "/" },

  "/videos": { pathname: "/" },

  "/my_wallet": { pathname: "/my-wallet" },

  "/my_profile": { pathname: "/profile" },

  "/ugc_upload": { pathname: "/submit-your-joke" },

  "/ugc": { pathname: "/user-generated-jokes" },

  "/link": { pathname: "/" },

  "/claim-form": { pathname: "/" },
};

function isAssetOrIgnored(pathname: string) {
  return (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/api/") ||
    pathname === "/favicon.ico" ||
    pathname === "/manifest.json" ||
    pathname.startsWith("/static/") ||
    pathname.startsWith("/icons/") ||
    pathname.match(/\.(png|jpg|jpeg|svg|css|js|map|ico|mp4|json|woff2?|ttf)$/i)
  );
}

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();

  const pathname = url.pathname;


  // ✅ Never touch root path

  if (pathname === "/") {
    return NextResponse.next();
  }

  // ✅ Skip assets/static

  if (isAssetOrIgnored(pathname)) {

    return NextResponse.next();
  }

  // ✅ Redirect if mapping exists

  const mapping = ROUTE_MAP[pathname];

  if (mapping) {
    const destUrl = req.nextUrl.clone();

    // normalize pathname → prevent `//`

    destUrl.pathname = mapping.pathname.replace(/\/+$/, "") || "/";

    // preserve original query params

    req.nextUrl.searchParams.forEach((v, k) => {
      destUrl.searchParams.set(k, v);
    });

    // add mapping-specific params

    if (mapping.addParams) {
      for (const [k, v] of Object.entries(mapping.addParams)) {
        destUrl.searchParams.set(k, v);
      }
    }


    const isProd = process.env.NODE_ENV === "production";

    return NextResponse.redirect(destUrl, isProd ? 301 : 302);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/|favicon.ico|manifest.json|static|icons|videos/|$).*)",
  ],
};
