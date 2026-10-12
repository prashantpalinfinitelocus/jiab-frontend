declare global {
  interface Window {
    gtag?: (
      command: "event" | "config" | "set",
      eventName: string,
      parameters?: Record<string, unknown>
    ) => void;
    alloy: (event: string, payload: Record<string, unknown>) => void;
    fbq?: (command: "track", eventName: string) => void;
    dataLayer: Record<string, any>[];
  }
}

export {};
