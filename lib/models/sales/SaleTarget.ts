import mongoose, { Schema, Types, Document, model } from "mongoose";

export interface SaleTargetDoc extends Document<Types.ObjectId> {
    sale_id: Types.ObjectId;
    module: string;
    module_id: Types.ObjectId;
    quantity: number;
    createdAt: Date;
    updatedAt: Date;
}

const SaleTargetSchema = new Schema<SaleTargetDoc>({
    sale_id: { type: Schema.Types.ObjectId, ref: "Sale", required: true, index: true },
    module: { type: String, required: true, index: true },
    module_id: { type: Schema.Types.ObjectId, required: true, index: true },
    quantity: { type: Number, required: true },
}, { timestamps: true });

SaleTargetSchema.index({ sale_id: 1, module: 1, module_id: 1 }, { unique: true });
export default mongoose.models.SaleTarget || model<SaleTargetDoc>("SaleTarget", SaleTargetSchema);