import { Schema, model, models, Document, Types } from "mongoose";

interface TaxDoc extends Document<Types.ObjectId> {
  name: string;
  rate: number;
  status: boolean;
  displayOrder?: number;
  createdAt: Date;
  updatedAt: Date;
}

const taxSchema = new Schema<TaxDoc>({
  name: { type: String, required: true },
  rate: { type: Number, required: true },
  status: { type: Boolean, required: true, default: true },
  displayOrder: { type: Number, required: false },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

export default models.Tax || model<TaxDoc>("Tax", taxSchema);