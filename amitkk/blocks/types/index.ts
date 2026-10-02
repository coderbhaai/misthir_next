// amitkk > blocks > types > index.ts

import type { BlockDetailProps, GenericBlock } from "@amitkk/basic/types/blocks";
import type { GenericModule } from "@amitkk/basic/types/generic";
import type { MediaProps } from "@amitkk/basic/types/media";
import type { GenericSummaryProps } from "@amitkk/basic/types/relations";

export interface GenericBlockProps {
  module_id?: string;
  data: GenericBlock[];
  detail: BlockDetailProps;
};

export interface SingleGenericBlockProps{
  _id: string;
  module: string;
  module_id: string;
  block_id: number;
  heading?: string;
  url?: string;
  status: boolean;
  displayOrder: number | null;
  media_id: string | MediaProps;
  mobile_media_id: string | MediaProps;
  content?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TabBlockProps{
  _id?: string;
  module: string;
  module_id: string;
  menu: string;
  content: string;
  status: boolean;
  displayOrder?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TabBlockItem {
  _id: string;
  menu: string;
  content: string;
  status: boolean;
  displayOrder: number | null;
}

export interface TabBlockGroup {
  _id: string;
  module: string;
  module_id: GenericSummaryProps;
  blocks: TabBlockItem[];
  status: boolean;
  displayOrder?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationType {
  total: number;
  page: number;
  limit: number;
}

export interface GetFilteredTabBlocksResponse {
  data: TabBlockGroup[];
  pagination: PaginationType;
}

export interface BlockContentProps {
  genericBlocks: GenericBlock[];
  blockDetails: BlockDetailProps[];
  tab: TabBlockProps[];
}

export interface BlockquoteProps {
  _id: string;
  module: string;
  module_id: string | GenericModule;
  media_id?: string | MediaProps | null;
  heading: string;
  content?: string;
  bg_colour?: string;
  status: boolean;
  displayOrder: number | null;
  createdAt: Date;
  updatedAt: Date;
}