import { Types } from "mongoose";

export interface OptionProps {
  _id:  string;
  name: string;
}

export interface RoleItem {
  _id: string;
  name: string;
}

export interface PermissionItem {
  _id: string;
  name: string;
}

export interface UserProps {
  _id: string | Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  status: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MetaTableProps {
  meta_id?: string | Types.ObjectId;
  title?: String;
  description?: String;
}

export interface PageItemProps {
  _id: string | Types.ObjectId;
  name: string;
  url: string;
  media_id?: MediaProps;
}

export interface MediaProps {
  _id: string | Types.ObjectId;
  media: string;
  alt: string;
  path: string;
  createdAt?: Date;
  updatedAt?: Date;
  __v: number;
}

export interface MediaHubProps {
  _id: string | Types.ObjectId;
  media_id: string | Types.ObjectId | MediaProps;
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

export interface MetaProps {
  meta_id?: string | Types.ObjectId;
  title: string;
  description: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type ClientProps = {
  _id: string | Types.ObjectId;
  name: string;
  email?: string;
  phone?: string;
  role: string;
  status: boolean;
  content?: string;
  displayOrder?: number;
  media_id: string | Types.ObjectId | MediaProps;
  createdAt?: Date;
  updatedAt?: Date;
};

export type ContactProps = {
  name: string;
  email: string;
  phone: string;
  status: string;
  user_remarks?: string;
  admin_remarks?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type FaqProps = {
  _id: string | Types.ObjectId;
  question: string;
  answer: string;
  status: boolean;
  displayOrder?: number;
  createdAt: Date;
  updatedAt: Date;
}

export type TestimonialProps = {
  _id: string | Types.ObjectId;
  question: string;
  answer: string;
  status: boolean;
  displayOrder?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductMetaRef {
  _id: string | Types.ObjectId;
  module: string;
  name: string;
  url?: string;
}

export interface SiteSetting {
  module: string;
  module_value: string;
  status: boolean;
}
export interface ReviewProps {
  module_id: any;
  module: string;
  rating: number;
  review: string;
  status: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}