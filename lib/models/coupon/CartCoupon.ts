import mongoose, { Schema, model, models, Types, Document } from "mongoose";

export interface CartCouponDoc extends Document<Types.ObjectId> {
  cart_id: string | Types.ObjectId;
  coupon_id?: string | Types.ObjectId;
  admin_coupon_discount?: number;
  vendor_coupon_discount?: number;
  coupon_code?: string;
  createdAt: Date;
  updatedAt: Date;
}

const cartCouponSchema = new Schema<CartCouponDoc>({
    cart_id: { type: Schema.Types.ObjectId, required: true, ref: 'Cart', },
    coupon_id: { type: Schema.Types.ObjectId, required: false, ref: 'Coupon', },
    admin_coupon_discount: { type: Number, required: false, },
    vendor_coupon_discount: { type: Number, required: false, },
    coupon_code: { type: String, default: null },
  }, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

export default mongoose.models.CartCoupon || mongoose.model<CartCouponDoc>("CartCoupon", cartCouponSchema);