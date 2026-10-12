import { NextRequest } from "next/server";
import { MEME_SOURCE_ALLOWED_HOSTS } from "@/constants";

// Meme assets live on a GCS bucket that sends no CORS headers, so the browser
// cannot read them back - which broke sharing the meme as an image file.
// Fetching server-side has no such restriction, so this streams the bytes back
// same-origin and the client can build a File from them.
//
// Only hosts we actually serve assets from are allowed, so this cannot be used
// as a general purpose open proxy. Shared with the meme-generator's meme_url
// allowlist (see MEME_SOURCE_ALLOWED_HOSTS) since both fetch the same assets.
const ALLOWED_HOSTS = MEME_SOURCE_ALLOWED_HOSTS;

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");

  if (!url) {
    return new Response("Missing 'url' query param", { status: 400 });
  }

  let target: URL;
  try {
    target = new URL(url);
  } catch {
    return new Response("Invalid 'url' query param", { status: 400 });
  }

  if (target.protocol !== "https:" || !ALLOWED_HOSTS.includes(target.hostname)) {
    return new Response("Host not allowed", { status: 403 });
  }

  try {
    const response = await fetch(target.toString());

    if (!response.ok) {
      return new Response("Failed to fetch asset", { status: response.status });
    }

    const contentType = response.headers.get("Content-Type") || "";
    if (!contentType.startsWith("image/")) {
      return new Response("Not an image", { status: 415 });
    }

    return new Response(await response.arrayBuffer(), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch {
    return new Response("Error fetching asset", { status: 500 });
  }
}
