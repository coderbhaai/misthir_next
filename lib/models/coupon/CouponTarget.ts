import mongoose, { Schema, Types, Document, model } from "mongoose";

export interface CouponTargetDoc extends Document<Types.ObjectId> {
    coupon_id: Types.ObjectId;
    module: string;
    module_id: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const CouponTargetSchema = new Schema<CouponTargetDoc>({
    coupon_id: { type: Schema.Types.ObjectId, ref: "Coupon", required: true, index: true },
    module: { type: String, enum: ["Product", "ProductBrand", "ProductType"], required: true, index: true },
    module_id: { type: Schema.Types.ObjectId, required: true, index: true },
}, { timestamps: true });
CouponTargetSchema.index({ coupon_id: 1, module: 1, module_id: 1 }, { unique: true });

export default mongoose.models.CouponTarget || model<CouponTargetDoc>("CouponTarget", CouponTargetSchema);