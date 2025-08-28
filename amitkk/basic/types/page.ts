import { Types } from "mongoose";

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