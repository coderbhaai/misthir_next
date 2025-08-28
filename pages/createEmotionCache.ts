// src/createEmotionCache.ts
import createCache from "@emotion/cache";

// prepend: true moves MUI styles to the top of <head> (recommended by MUI)
export default function createEmotionCache() {
  return createCache({ key: "css", prepend: true });
}
