import mongoose, { Schema, Document, Types, model, models } from "mongoose";

export interface SkuDetailDocument extends Document<Types.ObjectId> {
  sku_id: Types.ObjectId;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  preparationTime?: number;
  createdAt: Date;
  updatedAt: Date;
}

const skuDetailSchema = new Schema<SkuDetailDocument>({
    sku_id: { type: Schema.Types.ObjectId, ref: "Sku", required: true, unique: true },
    weight: { type: Number, default: 0 },
    length: { type: Number, default: 0 },
    width: { type: Number, default: 0 },
    height: { type: Number, default: 0 },
    preparationTime: { type: Number, default: 0 },
  }, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

export default mongoose.models.SkuDetail || model<SkuDetailDocument>('SkuDetail', skuDetailSchema);