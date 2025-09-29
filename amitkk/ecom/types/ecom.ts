import { AddressProps } from "@amitkk/address/types/address";
import { UserRowProps } from "@amitkk/blog/types/blog";
import { ProductProps, SkuProps } from "@amitkk/product/types/product";
import { MediaProps } from "lib/models/types";
import { Types } from "mongoose";

export type SkuItem = CartSkuProps | OrderSkuProps;
export type ChargesItem = CartChargesProps | OrderChargesProps;

export interface CartProps{
  _id: string | Types.ObjectId;
  user_id?: string | Types.ObjectId;
  billing_address_id?: Types.ObjectId | AddressProps;
  shipping_address_id?: Types.ObjectId | AddressProps;
  email?: string;
  whatsapp?: string;
  paymode?: string;
  weight?: number;
  total?: DecimalValue;
  payable_amount?: DecimalValue;
  user_remarks?: string;
  admin_remarks?: string;
  createdAt: Date;
  updatedAt: Date;

  // Virtuals
  cartSkus?: CartSkuProps[];
  cartCharges?: CartChargesProps;
}

export interface CartSkuProps{
  _id: string | Types.ObjectId;
  cart_id: string | Types.ObjectId;
  product_id: string | Types.ObjectId | ProductProps;
  sku_id: string | Types.ObjectId | SkuProps;
  vendor_id: string | Types.ObjectId | UserRowProps;
  quantity: number;
  flavor_id?: string | Types.ObjectId;
  vendor_discount?: number;
  vendor_discount_validity?: Date;
  vendor_discount_unit?: string;
  vendor_discount_validity_value?: number;
  createdAt: Date;
  updatedAt: Date;

  // Virtuals
  product: { name: string; price?: number };  // depends on Product schema
  vendor: { name: string };
  sku: { price: number };
}

export interface CartChargesProps{
  cart_id: string | Types.ObjectId;
  shipping_charges?: number;
  shipping_chargeable_value?: number;
  sales_discount?: number;
  admin_discount?: number;
  total_vendor_discount?: number;
  cod_charges?: number;
}

export interface OrderProps{
  _id: string | Types.ObjectId;
  user_id?: string | Types.ObjectId;
  billing_address_id?: Types.ObjectId | AddressProps;
  shipping_address_id?: Types.ObjectId | AddressProps;
  email?: string;
  whatsapp?: string;
  paymode?: string;
  weight?: number;
  total?: DecimalValue;
  paid?: DecimalValue;
  user_remarks?: string;
  admin_remarks?: string;
  createdAt: Date;
  updatedAt: Date;

  // Virtuals
  orderSkus?: OrderSkuProps[];
  orderCharges?: OrderChargesProps;
}

export interface OrderSkuProps{
  _id: string | Types.ObjectId;
  order_id: string | Types.ObjectId;
  product_id: string | Types.ObjectId | ProductProps;
  sku_id: string | Types.ObjectId | SkuProps;
  vendor_id: string | Types.ObjectId | UserRowProps;
  quantity: number;
  flavor_id?: string | Types.ObjectId;
  vendor_discount?: number;
  vendor_discount_validity?: Date;
  vendor_discount_unit?: string;
  vendor_discount_validity_value?: number;
  createdAt: Date;
  updatedAt: Date;
  product: { name: string; price?: number };
  vendor: { name: string };
  sku: { price: number };
}

export interface OrderChargesProps{
  order_id: string | Types.ObjectId;
  shipping_charges?: number;
  shipping_chargeable_value?: number;
  sales_discount?: number;
  admin_discount?: number;
  total_vendor_discount?: number;
  cod_charges?: number;
}

export interface SaleProps{
  _id: string | Types.ObjectId;
  name: string;
  valid_from: string | Date;
  valid_to: string | Date;
  type: "Amount Based" | "Percent Based" | string; 
  discount: number | Types.Decimal128 | "";
  status: boolean;
  createdAt: Date;
  updatedAt: Date;
  saleSkus?: SaleSkuProps[];
  vendor_id?: Types.ObjectId | { _id: string; name?: string };
}

export interface SaleSkuProps {
  sale_id: Types.ObjectId;
  sku_id: Types.ObjectId | { _id: string; name?: string; price?: number };
  product_id: Types.ObjectId | { _id: string; name?: string };
  quantity: number;
  discount: number | Types.Decimal128 | "";
}

export interface CouponProps{
  _id: string | Types.ObjectId;
  coupon_by: string;
  coupon_type: string;
  vendor_id?: string | Types.ObjectId | { _id: string; name?: string };
  usage_type: "Amount Based" | "Percent Based" | string;
  discount?: number;
  name: string;
  code: string;
  sales: string | number;
  status: boolean;
  valid_from: string | Date;
  valid_to: string | Date;
  buy_one?: string | Types.ObjectId;
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

export interface BulkProps{
  _id: string | Types.ObjectId;
  user_id?: string | Types.ObjectId;
  product_id: string | Types.ObjectId;
  sku_id?: string | Types.ObjectId;
  vendor_id?: string | Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  status: string;
  quantity: number;
  user_remarks?: string;
  admin_remarks?: string;
  vendor_remarks?: string;
  createdAt: Date;
  updatedAt: Date;
};

