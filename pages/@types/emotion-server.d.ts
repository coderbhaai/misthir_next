// emotion-server.d.ts
declare module "@emotion/server/create-instance" {
  import { EmotionCache } from "@emotion/cache";

  interface EmotionCritical {
    key: any;
    html: string;
    ids: string[];
    css: string;
  }

  export interface EmotionServer {
    extractCriticalToChunks(html: string): { styles: EmotionCritical[] };
    constructStyleTagsFromChunks(chunks: { styles: EmotionCritical[] }): string;
  }

  export default function createEmotionServer(cache: EmotionCache): EmotionServer;
}
