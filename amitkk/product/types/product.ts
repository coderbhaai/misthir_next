import { MediaProps, MetaTableProps } from "@amitkk/basic/types/page";
import { Types } from "mongoose";

export interface ProductMetaProps {
    module: string;
    name: string;
    url: string;
    status: boolean;
    displayOrder?: number;
    content?: string;
    createdAt: string | Date;
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
    createdAt: string | Date;
    updatedAt: Date;
    vendor_id: string | Types.ObjectId;
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
    createdAt: string | Date;
    updatedAt: Date;
    media_id: string | Types.ObjectId | MediaProps;
    meta_id: string | Types.ObjectId | MetaTableProps | null; 
    _id: string | Types.ObjectId;
}