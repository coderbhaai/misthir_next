import mongoose, { Schema, Document, Types, model, models } from "mongoose";

export interface SkuDoc extends Document<Types.ObjectId> {
  _id: Types.ObjectId;
  product_id?: Types.ObjectId;
  item_code?: string;
  unit?: string;
  price_per_unit?: number;
  name: string;
  price: number;
  inventory: number;
  status: boolean;
  displayOrder?: number;
  adminApproval: boolean;
  eggless_id?: Types.ObjectId;
  sugarfree_id?: Types.ObjectId;
  gluttenfree_id?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const skuSchema = new Schema<SkuDoc>({
    product_id: { type: Schema.Types.ObjectId, ref: "Product" },
    name: { type: String, required: true },
    item_code: { type: String, required: false },
    unit: { type: String, required: false },
    price_per_unit: { type: Number, required: false },
    price: { type: Number, required: true },
    inventory: { type: Number, required: true },
    status: { type: Boolean, default: true },
    displayOrder: { type: Number },
    adminApproval: { type: Boolean, default: true },
    eggless_id: { type: Schema.Types.ObjectId, ref: "ProductFeature" },
    sugarfree_id: { type: Schema.Types.ObjectId, ref: "ProductFeature" },
    gluttenfree_id: { type: Schema.Types.ObjectId, ref: "ProductFeature" },
  }, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

skuSchema.virtual("flavors", { ref: "SkuProductFeature", localField: "_id", foreignField: "sku_id", justOne: false });
skuSchema.virtual("colors", { ref: "SkuProductFeature", localField: "_id", foreignField: "sku_id", justOne: false });
skuSchema.virtual("features", { ref: "SkuProductFeature", localField: "_id", foreignField: "sku_id", justOne: false, });
skuSchema.virtual("details", { ref: "SkuDetail", localField: "_id", foreignField: "sku_id", justOne: true });

export default mongoose.models.Sku || model<SkuDoc>('Sku', skuSchema);