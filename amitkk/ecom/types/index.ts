import { AddressProps, CityProps, CountryProps, StateProps } from "@amitkk/address/types";
import { UserProps, UserRowProps } from "@amitkk/basic/types/user";
import { CouponProps } from "@amitkk/coupon/types";
import { SingleProductItemProps, SkuProps } from "@amitkk/product/types";

export type SkuItem = CartSkuProps | OrderSkuProps;
export type ChargesItem = CartChargesProps | OrderChargesProps;

export interface CartProps{
  _id: string;
  user_id?: string | UserProps;
  billing_address_id: string | AddressProps;
  shipping_address_id: string | AddressProps;
  paymode: string;
  weight?: number;
  total?: number;
  payable_amount?: number;
  user_remarks?: string;
  admin_remarks?: string;
  createdAt: Date;
  updatedAt: Date;

  cartSkus?: CartSkuProps[];
  cartCoupon?: CouponProps;
  cartConsent?: CartConsentProps;
  cartCharges?: CartChargesProps;
}

export interface CartConsentProps{
  _id: string;
  cart_id: string | CartProps;
  user_id?: string | UserProps;
  city_id: string | CityProps;
  state_id: string | StateProps;
  country_id: string | CountryProps;
  email?: string;
  phone?: string;
  emailConsent: boolean;
  phoneConsent: boolean;
  user_remarks?: string;
  admin_remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartSkuProps{
  _id: string;
  cart_id: string;
  product_id: string | SingleProductItemProps;
  sku_id: string | SkuProps;
  seller_id: string | UserRowProps;
  quantity: number;
  flavor_id?: string;
  price: number;
  sale: number;
  vendor_discount?: number;
  vendor_discount_validity?: Date;
  vendor_discount_unit?: string;
  vendor_discount_validity_value?: number;
  createdAt: Date;
  updatedAt: Date;
  
  product: { name: string; price?: number }
  vendor: { name: string };
  sku: { price: number };
}

export interface CartChargesProps{
  cart_id: string;
  shipping_charges?: number;
  shipping_chargeable_value?: number;
  sales_discount?: number;
  admin_discount?: number;
  total_vendor_discount?: number;
  cod_charges?: number;
}

export interface OrderProps{
  _id: string;
  user_id?: string;
  billing_address_id?: string | AddressProps;
  shipping_address_id?: string | AddressProps;
  email?: string;
  whatsapp?: string;
  paymode?: string;
  weight?: number;
  total?: number;
  paid?: number;
  user_remarks?: string;
  admin_remarks?: string;
  createdAt: Date;
  updatedAt: Date;
  
  orderSkus?: OrderSkuProps[];
  orderCharges?: OrderChargesProps;
  orderConsent?: OrderConsentProps;
  orderCoupon?: CouponProps;
}

export interface OrderConsentProps{
  _id: string;
  user_id?: string | UserProps;
  city_id: string | CityProps;
  state_id: string | StateProps;
  country_id: string | CountryProps;
  email?: string;
  phone?: string;
  emailConsent: boolean;
  phoneConsent: boolean;
  user_remarks?: string;
  admin_remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderSkuProps{
  _id: string;
  order_id: string;
  product_id: string | SingleProductItemProps;
  sku_id: string | SkuProps;
  seller_id: string | UserRowProps;
  quantity: number;
  flavor_id?: string;
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
  order_id: string;
  shipping_charges?: number;
  shipping_chargeable_value?: number;
  sales_discount?: number;
  admin_discount?: number;
  total_vendor_discount?: number;
  cod_charges?: number;
}

export interface BulkProps{
  _id: string;
  user_id?: string;
  product_id: string;
  sku_id?: string;
  seller_id?: string;
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