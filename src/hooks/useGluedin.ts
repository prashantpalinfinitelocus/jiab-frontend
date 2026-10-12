"use client";

import { useEffect, useState } from "react";

import { initGluedIn, getGluedIn } from "@/utils/gluedin.client";

export function useGluedin() {
  const [sdk, setSdk] = useState<any | null>(getGluedIn());

  useEffect(() => {
    if (!sdk && typeof window !== "undefined") {
      const instance = initGluedIn();
      setSdk(instance);
    }
  }, [sdk]);

  return sdk;
}
