import mongoose, { Schema, Types, Document, model } from "mongoose";

interface ProductSpecificationDoc extends Document {
  name: string;
  media_id?: Types.ObjectId;
  status: boolean;
  displayOrder?: number;
  createdAt: Date;
  updatedAt: Date;
  products?: { product_id: Types.ObjectId }[];
}

const productSpecificationSchema = new Schema<ProductSpecificationDoc>({
    name: { type: String, required: true },
    media_id: { type: Schema.Types.ObjectId, ref: "Media" },
    status: { type: Boolean, default: true },
    displayOrder: { type: Number, required: false },
  }, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

productSpecificationSchema.virtual("products", { ref: "ProductProductSpecification", localField: "_id", foreignField: "productSpecification_id" });

export default mongoose.models.ProductSpecification || model<ProductSpecificationDoc>("ProductSpecification", productSpecificationSchema);