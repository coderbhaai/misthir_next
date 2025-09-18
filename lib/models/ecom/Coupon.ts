// models/Coupon.ts
import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface CouponProps extends Document {
    coupon_by: string;
    vendor_id: string | Types.ObjectId;
    coupon_type: string;
    type: string;
    usage_type: string;
    discount?: number;
    name: string;
    code: string;
    sales: number;
    status: boolean;
    valid_from?: Date;
    valid_to?: Date;
    buy_one?: number;
    buy_type?: string;
    get_one?: number;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
}

const couponSchema = new Schema<CouponProps>({
    coupon_by: { type: String, required: true },
    vendor_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    coupon_type: { type: String, required: true },
    type: { type: String, required: true },
    usage_type: { type: String, required: true },
    discount: { type: Number, default: null },
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    sales: { type: Number, default: 0 },
    status: { type: Boolean, default: false },
    valid_from: { type: Date, default: null },
    valid_to: { type: Date, default: null },
    buy_one: { type: Number, default: null },
    buy_type: { type: String, default: null },
    get_one: { type: Number, default: null },
    description: { type: String, default: null },
  },{ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

const Coupon: Model<CouponProps> = mongoose.models.Coupon || mongoose.model<CouponProps>("Coupon", couponSchema);
export default Coupon;