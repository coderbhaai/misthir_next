import mongoose, { Schema, Types, Document, model } from "mongoose";

interface ProductFilterDoc extends Document<Types.ObjectId> {
  product_id: string | Types.ObjectId;
  status: boolean;
  total_sku_inventory: number;
  in_stock: boolean;
}

const productFilterSchema = new Schema<ProductFilterDoc>({
  product_id: { type: Schema.Types.ObjectId, ref: "Product" },
  status: { type: Boolean, default: true },
  total_sku_inventory: { type: Number, required: false, default: 0 },
  in_stock: { type: Boolean, default: true },
  }, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

export default mongoose.models.ProductFilter || model<ProductFilterDoc>("ProductFilter", productFilterSchema);