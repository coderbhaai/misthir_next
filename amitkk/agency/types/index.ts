import { MediaProps, MetaProps } from "@amitkk/basic/types/page";
import { Types } from "mongoose";

export interface ServiceProps extends MetaProps {
  _id: string | Types.ObjectId;
  name: string;
  url: string;
  status: boolean;
  displayOrder?: number;
  media_id?: string | Types.ObjectId | MediaProps;
  meta_id?: string | Types.ObjectId;
  page_id?: string | Types.ObjectId;
  content?: string;
  createdAt: Date;
  updatedAt: Date;
};

export interface TechnologyProps extends MetaProps {
  _id: string | Types.ObjectId;
  name: string;
  url: string;
  status: boolean;
  displayOrder?: number;
  media_id?: string | Types.ObjectId | MediaProps;
  meta_id?: string | Types.ObjectId;
  page_id?: string | Types.ObjectId;
  content?: string;
  createdAt: Date;
  updatedAt: Date;
};

export interface CataloguePortfolioProps{
  _id: string | Types.ObjectId;
  client_id: string | Types.ObjectId;
  media_id?: string | Types.ObjectId | MediaProps;
  heading: string;
  content: string;
  status: boolean;
  displayOrder?: number;
  createdAt: Date;
  updatedAt: Date;
};

export interface GraphicsPortfolioProps{
  _id: string | Types.ObjectId;
  media_id?: string | Types.ObjectId | MediaProps;
  heading: string;
  content: string;
  status: boolean;
  displayOrder?: number;
  createdAt: Date;
  updatedAt: Date;
};

export interface LogoPortfolioProps{
  _id: string | Types.ObjectId;
  client_id: string | Types.ObjectId;
  media_id?: string | Types.ObjectId | MediaProps;
  heading: string;
  content: string;
  status: boolean;
  displayOrder?: number;
  createdAt: Date;
  updatedAt: Date;
};

export interface PortfolioProps{
  _id: string | Types.ObjectId;
  module: string;
  website_id?: string | Types.ObjectId | WebsitePortfolioProps;
  heading: string;
  content: string;
  status: boolean;
  displayOrder?: number;
  createdAt: Date;
  updatedAt: Date;
};

export interface VideoPortfolioProps{
  _id: string | Types.ObjectId;
  name: string;
  url: string;
  status: boolean;
  displayOrder?: number;
  createdAt: Date;
  updatedAt: Date;
};

export interface WebsitePortfolioProps{
  _id: string | Types.ObjectId;
  client_id: string | Types.ObjectId;
  media_id?: string | Types.ObjectId | MediaProps;
  url: string;
  status: boolean;
  displayOrder?: number;
  createdAt: Date;
  updatedAt: Date;
};