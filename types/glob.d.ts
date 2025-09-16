type DecimalValue = { $numberDecimal: string };

interface AdminModuleProps {
  module?: string;
  module_id?: string;
}

interface ImportMeta {
  glob<T = unknown>(
    pattern: string,
    options?: { eager?: boolean; import?: string }
  ): Record<string, () => Promise<T>>;
}

interface SingleProductProps {
  _id: string | Types.ObjectId;
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
  _id: string | Types.ObjectId;
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

interface PageProps {
    module: string;
    name: string;
    url: string;
    media: string | MediaProps;
    media_id: string | MediaProps;
    content: string;
    status: boolean;
    schema_status: boolean;
    sitemap: boolean;
    createdAt: Date;
    updatedAt: Date;
    _id: string;
    
    meta_id: string | null;
    title: string;
    description: string;
    
    page_detail_id: string | null;
    faq_title: string;
    faq_text: string;
    blog_title: string;
    blog_text: string;
    contact_title: string;
    contact_text: string;
    testimonial_title: string;
    testimonial_text: string;
}