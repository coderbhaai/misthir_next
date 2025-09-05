import { MediaProps, MetaTableProps } from "@amitkk/basic/types/page";
import { Types } from "mongoose";

export interface ProductMetaProps {
    module: string;
    name: string;
    url: string;
    status: boolean;
    displayOrder?: number;
    content?: string;
    createdAt: Date;
    updatedAt: Date;
    media_id: string | Types.ObjectId | MediaProps;
    meta_id: string | Types.ObjectId | MetaTableProps | null; 
    _id: string | Types.ObjectId;
}

export interface ProductBrandProps {
    name: string;
    url: string;
    status: boolean;
    displayOrder?: number;
    content?: string;
    createdAt: Date;
    updatedAt: Date;
    vendor_id: string | null | Types.ObjectId;
    media_id: string | Types.ObjectId | MediaProps;
    meta_id: string | Types.ObjectId | MetaTableProps | null; 
    _id: string | Types.ObjectId;
}

export interface ProductFeatureProps {
    module: string;
    module_value: string;
    name: string;
    url: string;
    status: boolean;
    displayOrder?: number;
    content?: string;
    createdAt: Date;
    updatedAt: Date;
    media_id: string | Types.ObjectId | MediaProps;
    meta_id: string | Types.ObjectId | MetaTableProps | null; 
    _id: string | Types.ObjectId;
}

export interface BankProps {
    user_id: string | Types.ObjectId;
    account: string;
    ifsc: string;
    bank: string;
    branch: string;
    _id: string | Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export interface DocumentProps {
    user_id: string;
    name: string;
    media_id: string | Types.ObjectId | MediaProps;
    _id: string | Types.ObjectId;
    createdAt: string | Date;
    updatedAt: Date;
}

export interface ProductProps {
    vendor_id: string | Types.ObjectId;
    name: string;
    url: string;
    gtin?: string;
    adminApproval: boolean;
    status: boolean | null;
    displayOrder?: number;
    short_desc?: string;
    long_desc?: string;
    meta_id: string | Types.ObjectId | MetaTableProps | null; 
    dietary_type: string;
    _id: string | Types.ObjectId;
    createdAt: string | Date;
    updatedAt: Date;
}

export interface SkuProps {
    _id?: string | Types.ObjectId | null;
    product_id: string | Types.ObjectId;
    name: string;
    price: number | string;
    inventory: number | string;
    status: boolean;
    displayOrder?: number;
    adminApproval?: boolean;
    eggless_id: string;
    sugarfree_id: string;
    gluttenfree_id: string;
    weight?: number;
    length?: number;
    width?: number;
    height?: number;
    preparationTime?: number;
    flavors: string[];
    colors: string[];
}