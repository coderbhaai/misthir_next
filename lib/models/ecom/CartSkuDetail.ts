import mongoose, { Schema, model, models, Types, Document } from "mongoose";

export interface CartSkuDetailDoc extends Document<Types.ObjectId> {
  cart_id: string | Types.ObjectId;
  cart_sku_id: string | Types.ObjectId;
  module: string;
  module_id: string | Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const cartSkuDetailSchema = new Schema<CartSkuDetailDoc>({
    cart_id: { type: Schema.Types.ObjectId, ref: 'Cart', required: true },
    cart_sku_id: { type: Schema.Types.ObjectId, ref: 'Cart', required: true },
    module: { type: String, required: true },
    module_id: { type: Schema.Types.ObjectId, required: true, refPath: "module" },
  }, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

export default mongoose.models.CartSkuDetail || mongoose.model<CartSkuDetailDoc>("CartSkuDetail", cartSkuDetailSchema);