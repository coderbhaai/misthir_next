/// <reference types="next" />

interface ImportMeta {
  glob<T = unknown>(
    pattern: string,
    options?: { eager?: boolean; import?: string }
  ): Record<string, () => Promise<T>>;
}

interface SingleProductProps {
  _id: string;
  name: string;
  dietary_type:string;
  titleamt?: string;
  weight?: string;
  type?: string;
  url?: string;
  media_id?: MediaProps;
  medias?: MediaProps[];
}