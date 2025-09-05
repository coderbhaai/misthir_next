import { Types } from "mongoose";

export interface ArrayProps {
    _id: Types.ObjectId | string;
    name: string;
    url: string;
}

export interface ModuleProps{
    _id: Types.ObjectId | string;
    module: string;
    name: string;
    url: string;
}

export interface MediaProps {
  _id: Types.ObjectId | string;
  path: string;
  alt?: string;
  cloudflare?: boolean;
}

export interface SkuFlavorColorProps {
  _id: Types.ObjectId | string;
  name: string;
  url: string;
}

export interface SkuDetailProps {
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  preparationTime?: number;
}

export interface SkuProps {
  _id: Types.ObjectId | string;
  product_id?: Types.ObjectId | string;
  name: string;
  price: number;
  inventory: number;
  status: boolean;
  displayOrder?: number;
  adminApproval: boolean;
  eggless_id?: Types.ObjectId | string;
  sugarfree_id?: Types.ObjectId | string;
  gluttenfree_id?: Types.ObjectId | string;
  createdAt: Date;
  updatedAt: Date;
  details?: SkuDetailProps | null;
  flavors?: ArrayProps[];
  colors?: ArrayProps[];
}

export interface ProductRawDocument {
  _id: Types.ObjectId | string;
  name: string;
  url: string;
  vendor_id?: Types.ObjectId;
  meta_id?: Types.ObjectId;
  gtin: string;
  dietary_type: string;
  short_desc?: string;
  long_desc?: string;
  status: boolean;
  displayOrder?: number;
  adminApproval: boolean;
  createdAt: Date;
  updatedAt: Date;

    // Raw populated refs
  productMeta?: { _id: Types.ObjectId | string; productmeta_id?: ModuleProps; }[];
  metas?: { _id: string; module: string; name: string; url: string; }[];
  productFeature?: { _id: Types.ObjectId | string; productFeature_id?: ModuleProps; }[];
  features?: ArrayProps[];
  productIngridient?: { _id: Types.ObjectId | string; ingridient_id?: ModuleProps; }[];
  ingridients?: ArrayProps[];
  productBrand?: { _id: Types.ObjectId | string; productBrand_id?: ModuleProps; }[];
  brands?: ArrayProps[];
  mediaHubs?: { _id: Types.ObjectId | string; media_id?: MediaProps }[];
  medias?: MediaProps[];
  skus?: SkuProps[];
}