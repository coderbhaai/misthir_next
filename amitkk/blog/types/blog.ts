import { MediaProps } from "@amitkk/basic/types/page";
import { Types } from "mongoose";

export interface BlogMetaProps {
  _id: number;
  name: string;
  url: string;
}

export interface UserRowProps {
  _id: string;
  name: string;
  email: string;
  phone: string;
}

export interface AuthorProps {
  _id: string;
  name: string;
  media_id?: MediaProps | string;
  content: string;
}

export interface SingleBlogProps {
    _id: string;
    name: string;
    url: string;
    media_id?: MediaProps;
    author_id?: AuthorProps;
    blogmetas?: BlogMetaProps[];
}

export interface CommentProps {
  _id: string | Types.ObjectId;
  function: string;
  module?: string;
  module_id?: string;
  name: string;
  email: string;
  content: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  selectedDataId?: string | number;
};