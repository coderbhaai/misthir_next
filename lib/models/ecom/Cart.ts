import { Schema, model, models, Types, Document } from "mongoose";

// ------------------- Interfaces -------------------

export interface CartProps extends Document {
  user_id?: string | Types.ObjectId;
  billing_address_id?: string | Types.ObjectId;
  shipping_address_id?: string | Types.ObjectId;
  shipping_charges?: number;
  cod_charges?: number;
  paymode?: string;
  weight?: number;
  shipping_chargeable_value?: number;
  total?: number;
  payable_amount?: number;
  additional_discount?: number;
  user_remarks?: string;
  admin_remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartSkuProps extends Document {
  cart_id: Types.ObjectId | number;
  product_id: number;
  sku_id: number;
  quantity: number;
  color_id?: number;
  size_id?: number;
  createdAt: Date;
  updatedAt: Date;
}
const cartSchema = new Schema<CartProps>({
    user_id: { type: Number },
    billing_address_id: { type: Number },
    shipping_address_id: { type: Number },
    shipping_charges: { type: Schema.Types.Decimal128 },
    cod_charges: { type: Schema.Types.Decimal128 },
    paymode: { type: String },
    weight: { type: Number },
    shipping_chargeable_value: { type: Number },
    total: { type: Schema.Types.Decimal128 },
    payable_amount: { type: Schema.Types.Decimal128 },
    additional_discount: { type: Number },
    user_remarks: { type: String },
    admin_remarks: { type: String },
  },
  { timestamps: true }
);

const cartSkuSchema = new Schema<CartSkuProps>(
  {
    cart_id: { type: Number, required: true },
    product_id: { type: Number, required: true },
    sku_id: { type: Number, required: true },
    quantity: { type: Number, required: true },
    color_id: { type: Number },
    size_id: { type: Number },
  },
  { timestamps: true }
);

// ------------------- Models Export -------------------

export const Cart = models.Cart || model<CartProps>("Cart", cartSchema);
export const CartSku = models.CartSku || model<CartSkuProps>("CartSku", cartSkuSchema);
