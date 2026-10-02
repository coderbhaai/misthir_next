// amitkk > basic > types > index.ts
import type { SingleCommentProps, MetaProps, SingleBlogProps } from "@amitkk/basic/types/shared";
import type { MediaProps } from "./media";
import type { GenericModule } from "./generic";
import type { UserProps } from "./user";
import type { SinglePageProps } from "./page";
import { BlockDetailProps, GenericBlock } from "./blocks";
import { SingleProductItemProps } from "@amitkk/product/types";

export interface RelatedContent {
  faq: FaqProps[];
  testimonials: SingleTestimonialProps[];
  achievements: AchievementProps[];
  blogs: SingleBlogProps[];
  comments: SingleCommentProps[];
  products: SingleProductItemProps[];
}

export interface ArrayProps {
  _id: string;
  name: string;
  url: string;
}

export interface AdminModuleProps {
  module?: string;
  module_id?: string;
}

export interface DropdownItem {
  label: string;
  to: string;
}

export interface DropdownGroup {
  type: string;
  items: DropdownItem[];
}

export type DropdownType = DropdownGroup | DropdownItem;

export interface NavItem {
  label: string;
  to: string;
  Icon?: React.ElementType;
  dropdown?: DropdownType[];
}

export interface RoleItem {
  _id: string;
  name: string;
}

export interface PermissionItem {
  _id: string;
  name: string;
}

export interface PageItemProps {
  _id: string;
  name: string;
  url: string;
  media_id?: MediaProps;
}

export interface ImageObject {
  path: string;
  alt: string;
};

export interface ImageWithFallbackProps {
  img?: ImageObject | null;
  width?: number | string;
  height?: number | string;
};

export type ClientProps = {
  _id: string;
  name: string;
  brand?: string;
  email?: string;
  phone?: string;
  role: string;
  content?: string;
  status: boolean;
  displayOrder: number | null;
  media_id: string | MediaProps;
  createdAt: Date;
  updatedAt: Date;
};

export type ContactProps = {
  name: string;
  email: string;
  phone: string;
  country_id: string;
  status: string;
  user_remarks?: string;
  admin_remarks?: string;
  page_url?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type FaqProps = {
  _id: string;
  question: string;
  answer: string;
  status: boolean;
  displayOrder: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export type SingleTestimonialProps = {
  _id: string;
  module: string;
  module_id : string;
  content: string;
  media_id: string | MediaProps;
  client_id: string | ClientProps;
  status: boolean;
  displayOrder: number | null;
  createdAt: Date;
  updatedAt: Date; 
}

export interface ReviewProps {
  _id: string;
  module: string;
  module_id: string | GenericModule;
  user_id: string | UserProps;
  rating: number;
  review: string;
  status: boolean;
  displayOrder: number | null;
  createdAt: Date;
  updatedAt: Date;
  mediaHub?: MediaProps[];
}

export interface AchievementProps {
  _id: string;
  module: string;
  module_id: string | GenericModule;
  name: string;
  value: number;
  status: boolean;
  displayOrder: number | null;
  media_id: string | MediaProps;
  createdAt?: Date;
  updatedAt?: Date;
}

interface AuditChange {
  field_name: string;
  old_value: any;
  new_value: any;
}

export interface AuditLogProps {
  _id: string;
  module: string;
  module_id: string;
  user_id?: string;
  changes: AuditChange[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PageServerProps {
  data: SinglePageProps;
  meta?: MetaProps;
  relatedContent: RelatedContent;
  groupedBlocks: Record<number, GenericBlock[]>;
  groupedDetails: Record<number, BlockDetailProps[]>;
}

export interface ErrorLogProps {
  _id: string;
  message: string;
  function?: string;
  stack?: string;
  api?: string;
  module?: string;
  payload?: any;
  user_id: string | UserProps;
  level?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MenuProps {
  _id: string;
  depth?: number;
  name: string;
  url: string;
  path?: string;
  parent_id?: string | null;
  displayOrder: number | null;
  status: boolean;
  media_id?: MediaProps | null;
  permission_id?: {
    _id: string;
    name: string;
  } | null;
  
  children?: MenuProps[];
}

export interface ShortCodeProps {
  _id: string;
  call_id: number | null;
  module?: string;
  status: boolean;
  details?: ShortCodeDetailProps[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ShortCodeDetailProps {
  _id: string;
  shortCode_id: string;
  module: string;
  module_id: string;
  module_data?: {
    _id: string;
    name: string;
    url?: string;
  };
}

export interface SingleModuleContentProps {
  _id: string;
  module: string;
  module_id: string;
  heading: string;
  content: string;
  status: boolean;
  displayOrder: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface LeadProps {
  _id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  page_url: string;
  user_remarks?: string;
  admin_remarks?: string;
  createdAt: Date;
  updatedAt: Date;
  leadModules?: LeadModuleType[];
}

export interface LeadModuleType {
  module: string;
  module_id: {
    _id: string;
    name: string;
    url: string;
  };
}

export type FlexibleValue<T = any> = | string | string[] | T | T[] | undefined;

export interface NewsLetterFormProps {
  _id: string;
  name?: string;
  email: string;
  phone?: string;
  page_url: string;
  status: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UrlRegistryModalProps {
  _id: string;
  name: string;
  url: string;
  module: string;
  module_id: string;
  status: boolean;
  createdAt: Date;
  updatedAt: Date;
}