import { ArrayProps } from "@amitkk/basic/types";
import { ModuleProps } from "@amitkk/basic/types/generic";
import { MediaHubProps, MediaProps } from "@amitkk/basic/types/media";
import { MetaProps } from "@amitkk/basic/types/shared";
import { MetaTableProps } from "@amitkk/seo/types";

export interface ProductMetaProps {
    _id: string;
    module: string;
    name: string;
    url: string;
    status: boolean;
    highlight: boolean;
    displayOrder: number | null;
    content?: string;
    parent_id: string | ProductMetaProps | null;
    media_id: string | MediaProps;
    meta_id: string | MetaProps; 
    createdAt: Date;
    updatedAt: Date;
    parentsRelation?: ParentRelationItem[];
    parentsFlat?: string[];
}

export interface ParentRelationItem {
  _id: string;
  parent_id: string | ProductTypeProps | null;
}

export interface ProductTypeProps {
  _id: string;
  name: string;
  url: string;
  status: boolean;
  highlight: boolean;
  displayOrder: number | null;
  productsCount?: number | null;
  heading?: string;
  content?: string;
  parent_ids?: string[];
  parentsRelation?: ParentRelationItem[];
  parentsFlat?: string[];
  media_id: string | MediaProps;
  meta_id: string | MetaProps;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductBrandProps {
    _id: string;
    name: string;
    url: string;
    status: boolean;
    displayOrder: number | null;
    content?: string;
    createdAt: Date;
    updatedAt: Date;
    seller_id: string | null;
    media_id: string | MediaProps;
    meta_id: string | MetaTableProps; 
}

export interface IngridientProps {
    _id: string;
    name: string;
    media_id: string | MediaProps;
    status: boolean;
    displayOrder: number | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface BankProps {
    _id: string;
    user_id: string;
    account: string;
    ifsc: string;
    bank: string;
    branch: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface DocumentProps {
    _id: string;
    user_id: string;
    name: string;
    media_id: string | MediaProps;
    createdAt: Date;
    updatedAt: Date;
}

export interface SingleProductItemProps {
    _id: string;
    seller_id: string;
    name: string;
    url: string;
    gtin?: string;
    adminApproval: boolean;
    status: boolean;
    displayOrder: number | null;
    short_desc?: string;
    long_desc?: string;
    meta_id: string | MetaTableProps;
    dietary_type: string;
    tax_id: string;
    createdAt: Date;
    updatedAt: Date;

    filter?: string | ProductFilterProps;
    medias?: MediaHubProps[];
    mediaHubs?: MediaHubProps[];
    sku?: SkuProps[];
    productMeta?: { _id: string; productmeta_id?: ModuleProps; }[];
    metas?: { _id: string; module: string; name: string; url: string; }[];
    productFeature?: { _id: string; productFeature_id?: ModuleProps; }[];
    features?: { _id: string; module: string; name: string; url: string; }[];
    ingridients?: { _id: string; module: string; name: string; url: string; }[];
    productType?: { _id: string; productType_id?: ModuleProps; }[];
    types?: ArrayProps[];
    productBrand?: { _id: string; productBrand_id?: ModuleProps; }[];
    brands?: ArrayProps[];
}

export interface SkuProps {
    _id: string;
    item_code: string;
    unit: string;
    price_per_unit: string;
    product_id: string;
    name: string;
    price: number | string;
    inventory: number | string;
    status: boolean;
    displayOrder: number | null;
    adminApproval?: boolean;
    eggless_id: string | ProductFeatureProps;
    sugarfree_id: string | ProductFeatureProps;
    gluttenfree_id: string | ProductFeatureProps;
    features?: string[] | SkuProductFeatureRelationItem[];
    flavors: string[] | ProductFeatureProps[];
    colors: string[] | ProductFeatureProps[];

    details?: SkuDetailProps;
    weight?: number | null;
    length?: number | null;
    width?: number | null;
    height?: number | null;
    preparationTime?: number | null;
}

export interface SkuProductFeatureRelationItem {
  _id: string;
  sku_id: string | SkuProps;
  productFeature_id: string | ProductFeatureProps;
}

export interface SkuDetailProps {
    _id: string;
    sku_id: string | SkuProps;
    weight: number | null;
    length: number | null;
    width: number | null;
    height: number | null;
    preparationTime: number | null;
}

export interface ProductFeatureProps {
    _id: string;
    module: string;
    module_value: string;
    name: string;
    url: string;
    status: boolean;
    displayOrder: number | null;
    content?: string;
    createdAt: Date;
    updatedAt: Date;
    media_id: string | MediaProps;
    meta_id: string | MetaTableProps; 
}

export interface ProductFilterProps {
    product_id: string;
    status: boolean;
    total_sku_inventory: number;
    in_stock: boolean;
    purchased_qty: number;
    createdAt: Date;
    updatedAt: Date;
}