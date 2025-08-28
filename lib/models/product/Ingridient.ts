import mongoose, { Schema, Types, Document, model } from "mongoose";

interface IngridientDoc extends Document {
  name: string;
  status: boolean;
  displayOrder?: number;
  media_id?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  products?: { product_id: Types.ObjectId }[];
}

const ingridientSchema = new Schema<IngridientDoc>({
    name: { type: String, required: true },
    status: { type: Boolean, default: true },
    displayOrder: { type: Number, required: false },
    media_id: { type: Schema.Types.ObjectId, ref: "Media" },
  }, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

ingridientSchema.virtual("products", { ref: "ProductIngridient", localField: "_id", foreignField: "ingridient_id" });

export default mongoose.models.Ingridient || model<IngridientDoc>("Ingridient", ingridientSchema);