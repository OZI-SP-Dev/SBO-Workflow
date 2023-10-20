import { useState } from "react";

export interface ICachedPeople {
  getCachedOL: () => string;
  cacheOL: (ol: string) => void;
}

const SBO_CACHED_OL: string = "sboCachedOL";

export const useCachedOL = (): ICachedPeople => {
  const [ol, setOL] = useState<string>(
    localStorage.getItem(SBO_CACHED_OL) ?? "WPAFB"
  );
  const getCachedOL = () => {
    return ol;
  };

  const cacheOL = (newOL: string) => {
    localStorage.setItem(SBO_CACHED_OL, newOL);
    setOL(newOL);
  };

  return { getCachedOL, cacheOL };
};
