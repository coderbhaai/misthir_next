import { MediaProps } from "@amitkk/basic/types/media";
import { UserProps } from "@amitkk/basic/types/user";

export interface CouponProps{
  _id: string;
  seller_id?: string | UserProps;
  coupon_by: string;
  usage_type: string;
  discount_type: "Amount Based" | "Percent Based" | string;
  discount?: number;
  name: string;
  code: string;
  sales: string | number;
  status: boolean;
  valid_from: string | Date;
  valid_to: string | Date;
  buy_one?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  media: string | MediaProps;
  media_id: string | MediaProps;
  bogo_items?: BuyOneGetOneProps[];
}

export interface BuyOneGetOneProps {
  _id: string;
  coupon_id: string;
  buy_id: { _id: string; name: string };
  get_id: { _id: string; name: string };
  createdAt: Date;
  updatedAt: Date;
}