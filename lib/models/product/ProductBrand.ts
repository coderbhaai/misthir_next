import mongoose, { Schema, Types, Document, model } from "mongoose";

interface ProductBrandDoc extends Document<Types.ObjectId> {
  name: string;
  url: string;
  content: string;
  status: boolean;
  displayOrder?: number;
  vendor_id?: Types.ObjectId;
  media_id?: Types.ObjectId;
  meta_id?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  products?: { product_id: Types.ObjectId }[];
}

const productBrandSchema = new Schema<ProductBrandDoc>({
    name: { type: String, required: true },
    url: { type: String, required: true, unique: true },
    content: { type: String, required: false },
    status: { type: Boolean, default: true },
    displayOrder: { type: Number, required: false },
    vendor_id: { type: Schema.Types.ObjectId, ref: "User" },
    media_id: { type: Schema.Types.ObjectId, ref: "Media" },
    meta_id: { type: Schema.Types.ObjectId, ref: "Meta" },
  }, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

productBrandSchema.virtual("products", { ref: "ProductProductBrand", localField: "_id", foreignField: "productBrand_id" });

export default mongoose.models.ProductBrand || model<ProductBrandDoc>("ProductBrand", productBrandSchema);