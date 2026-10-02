import { addVirtualRelations } from 'lib/server/plugins/addVirtualRelations';
import mongoose, { Schema, Types, Document, model } from "mongoose";

export interface ProductmetaDoc extends Document<Types.ObjectId> {
  module: string;
  name: string;
  url: string;
  status: boolean;
  highlight: boolean;
  displayOrder?: number;
  media_id?: Types.ObjectId | null;
  meta_id?: Types.ObjectId | null;
  parent_id?: Types.ObjectId | null;
  content?: string | null;
  createdAt: Date;
  updatedAt: Date;

  parentsRelation?: { parent_id: Types.ObjectId }[];
  parentsFlat?: Types.ObjectId[];
  childrenRelation?: { child_id: Types.ObjectId }[];
  childrenFlat?: Types.ObjectId[];
  products?: { product_id: Types.ObjectId }[];
}

const productmetaSchema = new Schema<ProductmetaDoc>({
    module: { type: String, required: true },
    name: { type: String, required: true },
    url: { type: String, required: true, unique: true },
    status: { type: Boolean, default: true },
    highlight: { type: Boolean, default: false },
    displayOrder: { type: Number },
    media_id: { type: Schema.Types.ObjectId, ref: "Media", default: null },
    meta_id: { type: Schema.Types.ObjectId, ref: "Meta", default: null },
    parent_id: { type: Schema.Types.ObjectId, ref: "Productmeta", default: null },
    content: { type: String, required: false, default: null },
  }, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true }, });

productmetaSchema.index({ module: 1, module_id: 1 });
productmetaSchema.index({ parent_id: 1 });
productmetaSchema.index({ status: 1 });
productmetaSchema.index({ displayOrder: 1 });

addVirtualRelations(productmetaSchema, [
  { populateName: "parentsRelation", outputName: "parentsFlat", ref: "Relationship", foreignField: "child_id", extractIdField: "parent_id", match: { module: "ProductType" } },
  { populateName: "childrenRelation", outputName: "childrenFlat", ref: "Relationship", foreignField: "parent_id", extractIdField: "child_id", match: { module: "ProductType" } },
  { populateName: "products", outputName: "productMeta", ref: "ProductProductmeta", foreignField: "productmeta_id", extractIdField: "product_id", } 
]);

export default mongoose.models.Productmeta || model<ProductmetaDoc>("Productmeta", productmetaSchema);