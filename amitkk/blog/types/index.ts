// amitkk > blog > types > index.ts
import type { MediaProps } from "@amitkk/basic/types/media";
import { SinglePageProps } from "@amitkk/basic/types/page";
import type { AuthorProps, BlogMetaProps, MetaProps } from "@amitkk/basic/types/shared";

export interface SingleBlogPageProps {
    _id: string;
    name: string;
    url: string;
    status: Boolean;
    media_id?: string | MediaProps;
    author_id?: string | AuthorProps;
    blogmetas?: BlogMetaProps[];
    category?: BlogMetaProps[];
    tag?: BlogMetaProps[];
    meta_id?: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;

    page?: SinglePageProps;
}

export interface SingleBlogMetaProps {
   _id: string;
  type: string;
  name: string;
  url: string;
  status: boolean;
  displayOrder: number | null;
  meta_id: string | MetaProps;
  createdAt: Date;
  updatedAt: Date;
}

export interface SingleAuthorProps {
    _id: string;
    name: string;
    status: boolean;
    content: string;
    createdAt: Date;
    updatedAt: Date;
    media_id: string | MediaProps;
}