import mongoose, { Schema, Types, Document } from "mongoose";

export interface CouponUsageLogDoc extends Document<Types.ObjectId> {
    coupon_id: Types.ObjectId;
    user_id: Types.ObjectId;
    module: string;
    module_id: Types.ObjectId;
    discount_applied: number;
    createdAt: Date;
    updatedAt: Date;
}

const couponUsageLogSchema = new Schema<CouponUsageLogDoc>({
    coupon_id: { type: Schema.Types.ObjectId, ref: "Coupon", required: true, index: true },
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    module: { type: String, required: true, index: true },
    module_id: { type: Schema.Types.ObjectId, required: true, index: true },
    discount_applied: { type: Number, required: true, default: 0 },
}, { timestamps: true });

couponUsageLogSchema.index({ coupon_id: 1, user_id: 1 });

export default mongoose.models.CouponUsageLog || mongoose.model<CouponUsageLogDoc>("CouponUsageLog", couponUsageLogSchema);