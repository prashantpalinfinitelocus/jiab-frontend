// Helpers that keep security-sensitive primitives in one place.

/** Random identifier from the browser's cryptographic generator (not Math.random). */
export const secureId = (bytes = 8): string => {
  const buf = new Uint8Array(bytes);
  crypto.getRandomValues(buf);
  return Array.from(buf, (b) => b.toString(16).padStart(2, "0")).join("");
};

/**
 * Object URL for a user-selected file, only when it really is the kind of media
 * the element expects. Anything else (an HTML or SVG file renamed to .png, say)
 * gets no URL, so nothing user-supplied is ever loaded as a document.
 */
export const safeObjectUrl = (file: Blob | null | undefined, kind: "image" | "audio" | "video"): string => {
  if (!file || !file.type.startsWith(`${kind}/`) || file.type === "image/svg+xml") return "";
  const url = URL.createObjectURL(file);
  // createObjectURL always yields a blob: URL for a Blob; refuse anything else.
  return /^blob:/.test(url) ? url : "";
};

/** Exact-origin check for postMessage senders. */
export const isOneOfOrigins = (origin: string, allowed: readonly string[]): boolean => allowed.includes(origin);

/** True for an https URL with a real host; used instead of hand-written URL regexes. */
export const isHttpsUrl = (value: string, allowHttp = false): boolean => {
  try {
    const u = new URL(value);
    return (u.protocol === "https:" || (allowHttp && u.protocol === "http:")) && u.hostname.includes(".");
  } catch {
    return false;
  }
};

/** Short one-way fingerprint of a token, for "has the session changed?" checks. The token itself is never stored. */
export const tokenMarker = (token: string): string => {
  let h = 5381;
  for (let i = 0; i < token.length; i++) h = ((h << 5) + h + token.charCodeAt(i)) | 0;
  return `m${(h >>> 0).toString(36)}`;
};
