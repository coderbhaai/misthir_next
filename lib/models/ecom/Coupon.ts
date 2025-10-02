// models/Coupon.ts
import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface CouponProps extends Document<Types.ObjectId> {
    coupon_by: string;
    coupon_type: string;
    vendor_id?: string | Types.ObjectId;
    media_id?: string | Types.ObjectId;
    usage_type: string;
    discount?: number;
    name: string;
    code: string;
    sales: number;
    status: boolean;
    valid_from: Date;
    valid_to: Date;
    buy_one?: string | Types.ObjectId;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
}

const couponSchema = new Schema<CouponProps>({
    coupon_by: { type: String, required: true },
    coupon_type: { type: String, required: true },
    vendor_id: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    media_id: { type: Schema.Types.ObjectId, ref: 'Media', required: false },
    usage_type: { type: String, required: true },
    discount: { type: Number, default: null },
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    sales: { type: Number, default: 0 },
    status: { type: Boolean, default: false },
    valid_from: { type: Date, required: true },
    valid_to: { type: Date, required: true },
    buy_one: { type: Number, default: null },
    description: { type: String, default: null },
  },{ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

couponSchema.virtual("bogo_items", { ref: "BuyOneGetOne", localField: "_id", foreignField: "coupon_id", });

const Coupon: Model<CouponProps> = mongoose.models.Coupon || mongoose.model<CouponProps>("Coupon", couponSchema);
export default Coupon;