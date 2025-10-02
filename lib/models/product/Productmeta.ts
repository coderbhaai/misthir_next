import mongoose, { Schema, Types, Document, model } from "mongoose";

interface ProductmetaDoc extends Document<Types.ObjectId> {
  module: string;
  name: string;
  url: string;
  status: boolean;
  displayOrder?: number;
  media_id?: Types.ObjectId;
  meta_id?: Types.ObjectId;
  content?: string;
  createdAt: Date;
  updatedAt: Date;
  products?: { product_id: Types.ObjectId }[];
}

const productmetaSchema = new Schema<ProductmetaDoc>({
    module: { type: String, required: true },
    name: { type: String, required: true },
    url: { type: String, required: true, unique: true },
    status: { type: Boolean, default: true },
    displayOrder: { type: Number, required: false },
    media_id: { type: Schema.Types.ObjectId, ref: "Media" },
    meta_id: { type: Schema.Types.ObjectId, ref: "Meta" },
    content: { type: String, required: false },
  }, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

productmetaSchema.virtual("products", { ref: "ProductProductmeta", localField: "_id", foreignField: "productmeta_id" });

export default mongoose.models.Productmeta || model<ProductmetaDoc>("Productmeta", productmetaSchema);