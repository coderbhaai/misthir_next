import { MediaProps } from "@amitkk/basic/types/media";
import { UserProps } from "@amitkk/basic/types/user";
import { BuyOneGetOneProps } from "@amitkk/coupon/types";

export interface SaleProps{
    _id: string;
    name: string;
    seller_id?: string | UserProps;
    media_id?: string | MediaProps;
    sales: number | null;
    valid_from: string | Date;
    valid_to: string | Date;
    discount_type: string;
    discount: number | null;
    description?: string;
    status: boolean;
    buy_one?: string;
    createdAt: Date;
    updatedAt: Date;
    media: string | MediaProps;
    bogo_items?: BuyOneGetOneProps[];
}