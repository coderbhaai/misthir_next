import { Schema, model, models, Types, Document } from "mongoose";

export interface OrderProps extends Document {
  user_id?: string | Types.ObjectId;
  billing_address_id?: string | Types.ObjectId;
  shipping_address_id?: string | Types.ObjectId;
  paymode?: string;
  weight?: number;
  total?: number;
  paid?: number;
  user_remarks?: string;
  admin_remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<OrderProps>({
    user_id: { type: Schema.Types.ObjectId, ref: 'User' },
    billing_address_id: { type: Schema.Types.ObjectId, ref: 'Address',  },
    shipping_address_id: { type: Schema.Types.ObjectId, ref: 'Address', },
    paymode: { type: String },
    weight: { type: Number },
    total: { type: Schema.Types.Decimal128 },
    paid: { type: Schema.Types.Decimal128 },
    user_remarks: { type: String },
    admin_remarks: { type: String },
  }, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

export interface OrderChargesProps extends Document {
  order_id: string | Types.ObjectId;
  shipping_charges?: number;
  shipping_chargeable_value?: number;
  sales_discount?: number;
  admin_discount?: number;
  cod_charges?: number;
  total_vendor_discount?: number;
}

const orderChargesSchema = new Schema<OrderChargesProps>({
    order_id: { type: Schema.Types.ObjectId, required: true, ref: 'Order', },
    shipping_charges: { type: Schema.Types.Decimal128 },
    shipping_chargeable_value: { type: Number },
    sales_discount: { type: Number },
    admin_discount: { type: Number },
    cod_charges: { type: Schema.Types.Decimal128 },
    total_vendor_discount: { type: Number },
  }, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

export interface OrderCouponProps extends Document {
  order_id: string | Types.ObjectId;
  coupon_id?: string | Types.ObjectId;
  admin_coupon_discount: number;
  vendor_coupon_discount: number;
  coupon_code?: string;
  coupon_by: string;
  coupon_type: string;
  vendor_id?: string | Types.ObjectId;
  usage_type: string;
  discount?: number;
  name: string;
  code: string;
  sales: number;
  status: boolean;
  valid_from: Date;
  valid_to: Date;
  buy_one?: string | Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const orderCouponSchema = new Schema<OrderCouponProps>({
    order_id: { type: Schema.Types.ObjectId, required: true, ref: 'Order', },
    coupon_id: { type: Schema.Types.ObjectId, required: false, ref: 'Coupon', },
    admin_coupon_discount: { type: Number, required: false, },
    vendor_coupon_discount: { type: Number, required: false, },
    coupon_code: { type: String, default: null },
    coupon_by: { type: String, required: true },
    coupon_type: { type: String, required: true },
    vendor_id: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    usage_type: { type: String, required: true },
    discount: { type: Number, default: null },
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    sales: { type: Number, default: 0 },
    status: { type: Boolean, default: false },
    valid_from: { type: Date, required: true },
    valid_to: { type: Date, required: true },
    buy_one: { type: Number, default: null }
  }, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

export interface OrderSkuProps extends Document {
  order_id: string | Types.ObjectId;
  product_id: string | Types.ObjectId;
  sku_id: string | Types.ObjectId;
  vendor_id: string | Types.ObjectId;
  quantity: number;
  price: number;
  vendor_discount?: number;
  flavor_id?: string | Types.ObjectId;
  tax_id?: string | Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const orderSkuSchema = new Schema<OrderSkuProps>({
    order_id: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    product_id: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    sku_id: { type: Schema.Types.ObjectId, ref: 'Sku', required: true },
    vendor_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    vendor_discount: { type: Number, required: false },
    flavor_id: { type: Schema.Types.ObjectId, ref: 'ProductFeature' },
    tax_id: { type: Schema.Types.ObjectId, ref: 'Tax' },
  }, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

orderSchema.virtual('orderSkus', { ref: 'orderSku', localField: '_id', foreignField: 'order_id', justOne: false });
orderSchema.virtual('orderCharges', { ref: 'orderCharges', localField: '_id', foreignField: 'order_id', justOne: true });
orderSchema.virtual('orderCoupon', { ref: 'orderCoupon', localField: '_id', foreignField: 'order_id', justOne: true });
orderSkuSchema.virtual('product', { ref: 'Product', localField: 'product_id', foreignField: '_id', justOne: true, });
orderSkuSchema.virtual('vendor', { ref: 'User', localField: 'vendor_id', foreignField: '_id', justOne: true, });
orderSkuSchema.virtual('sku', { ref: 'Sku', localField: 'sku_id', foreignField: '_id', justOne: true, });

export const Order = models.Order || model<OrderProps>("Order", orderSchema);
export const OrderSku = models.OrderSku || model<OrderSkuProps>("OrderSku", orderSkuSchema);
export const OrderCharges = models.OrderCharges || model<OrderChargesProps>("OrderCharges", orderChargesSchema);
export const OrderCoupon = models.OrderCoupon || model<OrderCouponProps>("OrderCoupon", orderCouponSchema);