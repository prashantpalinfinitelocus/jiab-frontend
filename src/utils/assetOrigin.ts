// The origin we fetch from is chosen here and only ever one of these literals;
// the caller supplies just the path and query, never the host.
export function assetOrigin(hostname: string): string | null {
  switch (hostname) {
    case "storage.googleapis.com":
      return "https://storage.googleapis.com";
    case "media.giphy.com":
      return "https://media.giphy.com";
    case "media0.giphy.com":
      return "https://media0.giphy.com";
    case "media1.giphy.com":
      return "https://media1.giphy.com";
    case "media2.giphy.com":
      return "https://media2.giphy.com";
    case "media3.giphy.com":
      return "https://media3.giphy.com";
    case "media4.giphy.com":
      return "https://media4.giphy.com";
    default:
      return null;
  }
}
