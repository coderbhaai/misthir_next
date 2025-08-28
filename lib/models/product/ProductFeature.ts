import mongoose, { Schema, Types, Document, model } from "mongoose";

interface ProductFeatureDoc extends Document {
  module: string;
  name: string;
  module_value: string;
  url: string;
  content: string;
  status: boolean;
  displayOrder?: number;
  media_id?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  products?: { product_id: Types.ObjectId }[];
}

const productFeatureSchema = new Schema<ProductFeatureDoc>({
    module: { type: String, required: true },
    name: { type: String, required: true },
    module_value: { type: String },
    url: { type: String, required: true, unique: true },
    content: { type: String, required: false },
    status: { type: Boolean, default: true },
    displayOrder: { type: Number, required: false },
    media_id: { type: Schema.Types.ObjectId, ref: "Media" },
  }, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

productFeatureSchema.virtual("products", { ref: "ProductProductFeature", localField: "_id", foreignField: "productFeature_id" });

export default mongoose.models.ProductFeature || model<ProductFeatureDoc>("ProductFeature", productFeatureSchema);