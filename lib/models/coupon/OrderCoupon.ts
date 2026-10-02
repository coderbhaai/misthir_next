import mongoose, { Schema, model, models, Types, Document } from "mongoose";

export interface OrderCouponDoc extends Document<Types.ObjectId> {
  order_id: string | Types.ObjectId;
  coupon_id?: string | Types.ObjectId;
  admin_coupon_discount: number;
  vendor_coupon_discount: number;
  coupon_code?: string;
  coupon_by: string;
  usage_type: string;
  seller_id?: string | Types.ObjectId;
  discount_type: string;
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

const orderCouponSchema = new Schema<OrderCouponDoc>({
    order_id: { type: Schema.Types.ObjectId, required: true, ref: 'Order', },
    coupon_id: { type: Schema.Types.ObjectId, required: false, ref: 'Coupon', },
    admin_coupon_discount: { type: Number, required: false, },
    vendor_coupon_discount: { type: Number, required: false, },
    coupon_code: { type: String, default: null },
    coupon_by: { type: String, required: true },
    usage_type: { type: String, required: true },
    seller_id: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    discount_type: { type: String, required: true },
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

export default mongoose.models.OrderCoupon || mongoose.model<OrderCouponDoc>("OrderCoupon", orderCouponSchema);