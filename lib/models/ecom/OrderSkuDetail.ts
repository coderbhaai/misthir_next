import mongoose, { Schema, model, models, Types, Document } from "mongoose";

export interface OrderSkuDetailDoc extends Document<Types.ObjectId> {
  order_id: string | Types.ObjectId;
  order_sku_id: string | Types.ObjectId;
  module: string;
  module_id: string | Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSkuDetailSchema = new Schema<OrderSkuDetailDoc>({
    order_id: { type: Schema.Types.ObjectId, ref: 'Cart', required: true },
    order_sku_id: { type: Schema.Types.ObjectId, ref: 'Cart', required: true },
    module: { type: String, required: true },
    module_id: { type: Schema.Types.ObjectId, required: true, refPath: "module" },
  }, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

export default mongoose.models.OrderSkuDetail || mongoose.model<OrderSkuDetailDoc>("OrderSkuDetail", OrderSkuDetailSchema);