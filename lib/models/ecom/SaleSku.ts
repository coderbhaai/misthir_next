import mongoose, { Schema, Document, Types } from "mongoose";

export interface SaleSkuProps extends Document<Types.ObjectId> {
  sale_id: Types.ObjectId;
  sku_id: Types.ObjectId;
  product_id: Types.ObjectId;
  quantity: number;
  discount: number;
  createdAt: Date;
  updatedAt: Date;
}

const SaleSkuSchema = new Schema<SaleSkuProps>({
  sale_id: { type: Schema.Types.ObjectId, ref: "Sale", required: true },
  sku_id: { type: Schema.Types.ObjectId, ref: "Sku", required: true },
  product_id: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true },
  discount: {
    type: Schema.Types.Decimal128 as unknown as typeof Number,
    required: true,
    get: (v: Types.Decimal128) => (v ? parseFloat(v.toString()) : 0),
    set: (v: number) => parseFloat(v.toFixed(2)),
  },
},{ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } } );

SaleSkuSchema.index({ sale_id: 1, sku_id: 1 }, { unique: true });

export default mongoose.models.SaleSku || mongoose.model<SaleSkuProps>("SaleSku", SaleSkuSchema);