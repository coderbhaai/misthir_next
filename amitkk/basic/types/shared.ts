// amitkk > basic > types > shared.ts

import type {  MediaProps } from "./media";

export interface MetaProps {
  meta_id?: string;
  title: string;
  description: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UnresolvedField {
  field: string;
  value: any;
}

export interface SingleBlogProps {
    _id: string;
    name: string;
    url: string;
    content: string;
    excerpt: string;
    media_id: string | MediaProps;
    author_id: string | AuthorProps;
    meta_id: string | MetaProps;
    status: boolean;
    createdAt: Date;
    updatedAt: Date;
    
    metas?: BlogMetaRelationProps[];
}

export interface AuthorProps {
  _id: string;
  name: string;
  media_id?: MediaProps | string;
  content: string;
}

export interface BlogMetaRelationProps {
  blogmeta_id: BlogMetaProps;
}

export interface BlogMetaProps {
  _id: number;
  type: string;
  name: string;
  url: string;
}

export interface SingleCommentProps {
  _id: string;
  module?: string;
  module_id?: string;
  name: string;
  email: string;
  content: string;
  status: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
};