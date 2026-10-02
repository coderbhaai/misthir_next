import type { MediaProps } from "./media";

export interface BlockDetailProps {
  _id: string;

  module: string;
  module_id: string;

  block_id: number | null;

  media_id?: string | MediaProps | null;
  mobile_media_id?: string | MediaProps | null;

  heading?: string;
  url?: string;

  bg_colour?: string;

  status: boolean;

  content_1?: string;
  content_2?: string;
  content_3?: string;

  createdAt: Date;
  updatedAt: Date;
}

export interface GenericBlock {
  _id: string;
  module: string;
  module_id: string;
  block_id: number;
  heading?: string;
  url?: string;
  status: boolean;
  displayOrder: number | null;
  media_id: string | MediaProps;
  mobile_media_id?: string | MediaProps;
  content?: string;
  createdAt?: string;
  updatedAt?: string;
}