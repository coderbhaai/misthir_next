import { UserProps } from "@amitkk/basic/types/user";
import { SingleProductItemProps, SkuProps } from "@amitkk/product/types";

export interface WishlistProps {
  _id: string;
  user_id: string | UserProps;
  name?: string;
  email?: string;
  phone?: string;
  user_remarks?: string;
  admin_remarks?: string;
  status?: string;
  createdAt: Date;
  updatedAt: Date;

  wishlistCarts: WishlistCartProps[];
}

export interface WishlistCartProps {
  _id: string;
  wishlist_id?:  string | WishlistProps;
  user_id: string | UserProps;
  product_id?:  string | SingleProductItemProps;
  sku_id?:  string | SkuProps;
  quantity?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface GrievanceProps {
  _id: string;
  user_id?: string | UserProps;
  module: string;
  module_id: string;
  name: string;
  email: string;
  phone: string;
  user_remarks?: string | null;
  admin_remarks?: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;

  media_files?: File[];
}

export interface GrievanceMediaProps {
  _id?: string;
  media: string;
}

export interface AdminGrievanceProps {
  _id: string;
  admin_remarks?: string | null;
  status: string;
}

export interface OrderGuideProps {
  _id: string;
  user_id?: string | UserProps;
  buyer_id?: string | UserProps;
  name?: string;
  createdAt: Date;
  updatedAt: Date;

  products?: SingleProductItemProps[];
}