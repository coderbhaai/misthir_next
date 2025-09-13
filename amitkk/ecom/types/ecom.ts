import { AddressProps } from "@amitkk/address/types/address";
import { UserRowProps } from "@amitkk/blog/types/blog";
import { ProductProps, SkuProps } from "@amitkk/product/types/product";
import { Types } from "mongoose";

type DecimalValue = { $numberDecimal: string };

export interface CartProps extends Document {
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

export interface CartSkuProps extends Document {
  _id: string | Types.ObjectId;
  cart_id: string | Types.ObjectId;
  product_id: string | Types.ObjectId | ProductProps;
  sku_id: string | Types.ObjectId | SkuProps;
  vendor_id: string | Types.ObjectId | UserRowProps;
  quantity: number;
  vendor_discount?: number;
  flavor_id?: string | Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;

  // Virtuals
  product: { name: string; price?: number };  // depends on Product schema
  vendor: { name: string };
  sku: { price: number };
}

export interface CartChargesProps extends Document {
  cart_id: string | Types.ObjectId;
  shipping_charges?: number;
  shipping_chargeable_value?: number;
  sales_discount?: number;
  admin_discount?: number;
  cod_charges?: number;
}