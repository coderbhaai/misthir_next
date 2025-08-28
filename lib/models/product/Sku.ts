import { Schema, Document, Types, model, models } from "mongoose";

export interface SkuDocument extends Document {
  product_id?: Types.ObjectId;
  name: string;
  price: number;
  inventory: number;
  status: boolean;
  displayOrder?: number;
  adminApproval: boolean;
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
  }, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

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