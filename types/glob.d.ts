/// <reference types="next" />

interface ImportMeta {
  glob<T = unknown>(
    pattern: string,
    options?: { eager?: boolean; import?: string }
  ): Record<string, () => Promise<T>>;
}

interface SingleProductProps {
  _id: Types.ObjectId | string;
  name: string;
  dietary_type:string;
  titleamt?: string;
  weight?: string;
  type?: string;
  url?: string;
  media_id?: MediaProps;
  medias?: MediaProps[];
}

interface RelatedContent {
  faq: FaqProps[];
  testimonials: ITestimonialProps[];
  blogs: BlogDocument[];
  products: ProductRawDocument[];
}

interface BlogProps{
  _id: Types.ObjectId | string;
  name: string;
  url: string;
  media_id?: Types.ObjectId;
  author_id?: Types.ObjectId;
  meta_id?: Types.ObjectId;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  metas?: BlogmetaReference[];
  blogmetas?: { _id: Types.ObjectId; name: string; url: string }[]; 
}