import { NextRequest } from "next/server";
import { assetOrigin } from "@/utils/assetOrigin";

// Reads a text file from one of our own asset hosts and returns it same-origin.
// Only https URLs on the allowlist are fetched and redirects are not followed, so
// this cannot be pointed at internal addresses or used as an open proxy.
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

  const origin = assetOrigin(target.hostname);
  if (target.protocol !== "https:" || !origin) {
    return new Response("Host not allowed", { status: 403 });
  }

  try {
    const response = await fetch(`${origin}${target.pathname}${target.search}`, { redirect: "manual" });

    if (!response.ok) {
      return new Response("Failed to fetch file", { status: response.status === 0 ? 502 : response.status });
    }

    const contentType = response.headers.get("Content-Type") || "text/plain";
    if (!contentType.startsWith("text/") && !contentType.startsWith("application/json")) {
      return new Response("Not a text file", { status: 415 });
    }

    return new Response(await response.text(), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "no-cache",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Error fetching file", { status: 500 });
  }
}
