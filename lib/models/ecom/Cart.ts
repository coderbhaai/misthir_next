import { Schema, model, models, Types, Document } from "mongoose";

export interface CartProps extends Document {
  user_id?: string | Types.ObjectId;
  email?: string;
  whatsapp?: string;
  billing_address_id?: string | Types.ObjectId;
  shipping_address_id?: string | Types.ObjectId;
  paymode?: string;
  weight?: number;
  total?: number;
  payable_amount?: number;
  user_remarks?: string;
  admin_remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

const cartSchema = new Schema<CartProps>({
    user_id: { type: Schema.Types.ObjectId, ref: 'User' },
    billing_address_id: { type: Schema.Types.ObjectId, ref: 'Address',  },
    shipping_address_id: { type: Schema.Types.ObjectId, ref: 'Address', },
    email: { type: String },
    whatsapp: { type: String },
    paymode: { type: String },
    weight: { type: Number },
    total: { type: Schema.Types.Decimal128 },
    payable_amount: { type: Schema.Types.Decimal128 },
    user_remarks: { type: String },
    admin_remarks: { type: String },
  }, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

export interface CartChargesProps extends Document {
  cart_id: string | Types.ObjectId;
  shipping_charges?: number;
  shipping_chargeable_value?: number;
  sales_discount?: number;
  admin_discount?: number;
  admin_discount_validity?: Date;
  admin_discount_unit?: string;
  admin_discount_validity_value?: number;
  total_vendor_discount?: number;
  cod_charges?: number;
}

const cartChargesSchema = new Schema<CartChargesProps>({
    cart_id: { type: Schema.Types.ObjectId, required: true, ref: 'Cart', },
    shipping_charges: { type: Schema.Types.Decimal128 },
    shipping_chargeable_value: { type: Number },
    sales_discount: { type: Number },
    admin_discount: { type: Number },
    admin_discount_validity: { type: Date, default: null },
    admin_discount_unit: { type: String, default: null },
    admin_discount_validity_value: { type: Number, default: null },
    total_vendor_discount: { type: Number },
    cod_charges: { type: Schema.Types.Decimal128 },
  }, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

export interface CartSkuProps extends Document {
  cart_id: string | Types.ObjectId;
  product_id: string | Types.ObjectId;
  sku_id: string | Types.ObjectId;
  vendor_id: string | Types.ObjectId;
  quantity: number;
  vendor_discount?: number;
  flavor_id?: string | Types.ObjectId;
  vendor_discount_validity?: Date;
  vendor_discount_unit?: string;
  vendor_discount_validity_value?: number;
  createdAt: Date;
  updatedAt: Date;
}

const cartSkuSchema = new Schema<CartSkuProps>({
    cart_id: { type: Schema.Types.ObjectId, ref: 'Cart', required: true },
    product_id: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    sku_id: { type: Schema.Types.ObjectId, ref: 'Sku', required: true },
    vendor_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    quantity: { type: Number, required: true },
    vendor_discount: { type: Number, required: false },
    vendor_discount_validity: { type: Date, default: null },
    vendor_discount_unit: { type: String, default: null },
    vendor_discount_validity_value: { type: Number, default: null },
    flavor_id: { type: Schema.Types.ObjectId, ref: 'ProductFeature' },
  }, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

cartSchema.virtual('cartSkus', { ref: 'CartSku', localField: '_id', foreignField: 'cart_id', justOne: false });
cartSchema.virtual('cartCharges', { ref: 'CartCharges', localField: '_id', foreignField: 'cart_id', justOne: true });
cartSkuSchema.virtual('product', { ref: 'Product', localField: 'product_id', foreignField: '_id', justOne: true, });
cartSkuSchema.virtual('vendor', { ref: 'User', localField: 'vendor_id', foreignField: '_id', justOne: true, });
cartSkuSchema.virtual('sku', { ref: 'Sku', localField: 'sku_id', foreignField: '_id', justOne: true, });

export const Cart = models.Cart || model<CartProps>("Cart", cartSchema);
export const CartSku = models.CartSku || model<CartSkuProps>("CartSku", cartSkuSchema);
export const CartCharges = models.CartCharges || model<CartChargesProps>("CartCharges", cartChargesSchema);