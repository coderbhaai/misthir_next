import { Types } from "mongoose";

export interface ArrayProps {
    _id: string | Types.ObjectId;
    name: string;
    url: string;
}

export interface ModuleProps{
    _id: string | Types.ObjectId;
    module: string;
    name: string;
    url: string;
}

export interface MediaProps {
  _id: string | Types.ObjectId;
  path: string;
  alt?: string;
  cloudflare?: boolean;
}

export interface SkuFlavorColorProps {
  _id: string | Types.ObjectId;
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
  _id: string | Types.ObjectId;
  product_id?: string | Types.ObjectId;
  name: string;
  price: number;
  inventory: number;
  status: boolean;
  displayOrder?: number;
  adminApproval: boolean;
  eggless_id?: string | Types.ObjectId | ModuleProps;
  sugarfree_id?: string | Types.ObjectId | ModuleProps;
  gluttenfree_id?: string | Types.ObjectId | ModuleProps;
  createdAt: Date;
  updatedAt: Date;
  details?: SkuDetailProps | null;
  flavors?: ArrayProps[];
  colors?: ArrayProps[];
}

export interface ProductRawDocument {
  _id: string | Types.ObjectId;
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
  productMeta?: { _id: string | Types.ObjectId; productmeta_id?: ModuleProps; }[];
  metas?: { _id: string; module: string; name: string; url: string; }[];
  productFeature?: { _id: string | Types.ObjectId; productFeature_id?: ModuleProps; }[];
  features?: ArrayProps[];
  productIngridient?: { _id: string | Types.ObjectId; ingridient_id?: ModuleProps; }[];
  ingridients?: ArrayProps[];
  productBrand?: { _id: string | Types.ObjectId; productBrand_id?: ModuleProps; }[];
  brands?: ArrayProps[];
  mediaHubs?: { _id: string | Types.ObjectId; media_id?: MediaProps }[];
  medias?: MediaProps[];
  skus?: SkuProps[];
}