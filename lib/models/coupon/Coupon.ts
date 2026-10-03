import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface CouponDoc extends Document<Types.ObjectId> {
    coupon_by: string;
    usage_type: string;
    seller_id?: string | Types.ObjectId;
    media_id?: string | Types.ObjectId;
    discount_type: string;
    discount?: number;
    name: string;
    coupon_code: string;
    sales: number;
    status: boolean;
    valid_from: Date;
    valid_to: Date;
    buy_one?: string | Types.ObjectId;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
}

const couponSchema = new Schema<CouponDoc>({
    coupon_by: { type: String, required: true },
    usage_type: { type: String, required: true },
    seller_id: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    media_id: { type: Schema.Types.ObjectId, ref: 'Media', required: false },
    discount_type: { type: String, required: true },
    discount: { type: Number, default: null },
    name: { type: String, required: true },
    coupon_code: { type: String, required: true, unique: true },
    sales: { type: Number, default: 0 },
    status: { type: Boolean, default: false },
    valid_from: { type: Date, required: true },
    valid_to: { type: Date, required: true },
    buy_one: { type: Number, default: null },
    description: { type: String, default: null },
  },{ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

couponSchema.virtual("bogo_items", { ref: "BuyOneGetOne", localField: "_id", foreignField: "coupon_id", });

export default mongoose.models.Coupon || mongoose.model<CouponDoc>("Coupon", couponSchema);