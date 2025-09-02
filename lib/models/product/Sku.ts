import { Schema, Document, Types, model, models } from "mongoose";

export interface SkuDocument extends Document {
  product_id?: Types.ObjectId;
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

const skuSchema = new Schema<SkuDocument>({
    product_id: { type: Schema.Types.ObjectId, ref: "Product" },
    name: { type: String, required: true },
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

skuSchema.virtual('flavors', { ref: 'SkuProductFeature', localField: '_id', foreignField: 'sku_id', justOne: false });
skuSchema.virtual('colors', { ref: 'SkuProductFeature', localField: '_id', foreignField: 'sku_id', justOne: false });

export const Sku = models.Sku || model<SkuDocument>("Sku", skuSchema);

export interface SkuDetailDocument extends Document {
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

export const SkuDetail = models.SkuDetail || model<SkuDetailDocument>("SkuDetail", skuDetailSchema);