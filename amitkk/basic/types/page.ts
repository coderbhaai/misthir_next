import type { MediaProps } from "./media";

export interface PageDetailProps {
  page_id: string | null;

  faq_title: string;
  faq_text: string;

  blog_title: string;
  blog_text: string;

  contact_title: string;
  contact_text: string;

  achievement_title: string;
  achievement_text: string;

  testimonial_title: string;
  testimonial_text: string;

  mediaHub_title: string;
  mediaHub_text: string;

  product_title: string;
  product_text: string;
}

export interface SinglePageProps extends PageDetailProps {
  _id: string;

  module: string;
  module_id?: string;

  name: string;
  url: string;

  media: string | MediaProps;
  media_id: string | MediaProps;

  content: string;

  status: boolean;
  schema_status: boolean;
  sitemap: boolean;

  meta_id: string | null;

  title: string;
  description: string;

  details?: PageDetailProps;

  createdAt?: Date;
  updatedAt?: Date;
}