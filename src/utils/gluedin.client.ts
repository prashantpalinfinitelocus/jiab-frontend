"use client";

let gluedInSDK: any | null = null;

export function initGluedIn() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const gluedinModule: any = require("gluedin");


    // Try both top-level and default exports

    const GluedInSDKInitilize =
      gluedinModule.GluedInSDKInitilize ??
      gluedinModule.default?.GluedInSDKInitilize;

    if (!GluedInSDKInitilize) {
      throw new Error("❌ GluedInSDKInitilize not found in gluedin exports");
    }

    const instance = new GluedInSDKInitilize();

    instance.initialize({
      apiKey: process.env.NEXT_PUBLIC_GLUEDIN_API_KEY,
      secretKey: process.env.NEXT_PUBLIC_GLUEDIN_SECRET_KEY,
    });

    // Attach feedback module if available

    const Feedback =
      gluedinModule.GluedInFeedModule ??
      gluedinModule.default?.GluedInFeedModule;

    if (Feedback) {
      instance.GluedInFeedModule =
        typeof Feedback === "function" ? new Feedback() : Feedback;
    }

    instance.GluedInFeedModule =
      gluedinModule.GluedInFeedModule ??
      gluedinModule.default?.GluedInFeedModule;

    instance.GluedInActivityTimeline =
      gluedinModule.GluedInActivityTimeline ??
      gluedinModule.default?.GluedInActivityTimeline;

    instance.GluedInAuthModule =
      gluedinModule.GluedInAuthModule ??
      gluedinModule.default?.GluedInAuthModule;

    instance.GluedInVideosModule =
      gluedinModule.GluedInVideosModule ??
      gluedinModule.default?.GluedInVideosModule;

    instance.GluedInUserModule =
      gluedinModule.GluedInUserModule ??
      gluedinModule.default?.GluedInUserModule;

    gluedInSDK = instance;

    return gluedInSDK;
  } catch (err) {
    gluedInSDK = null;

    return null;
  }
}

export function getGluedIn() {
  return gluedInSDK;
}
