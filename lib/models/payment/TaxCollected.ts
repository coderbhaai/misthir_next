import mongoose, { Schema, Document, models } from "mongoose";

export interface ITaxCollected extends Document {
  module: string;
  module_id: number;
  cgst?: number;
  sgst?: number;
  igst?: number;
  total?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const TaxCollectedSchema = new Schema<ITaxCollected>(
  {
    module: { type: String, required: true },
    module_id: { type: Number, required: true },
    cgst: { type: Schema.Types.Decimal128, default: null },
    sgst: { type: Schema.Types.Decimal128, default: null },
    igst: { type: Schema.Types.Decimal128, default: null },
    total: { type: Schema.Types.Decimal128, default: null },
  },
  { timestamps: true }
);

export default models.TaxCollected || mongoose.model<ITaxCollected>("TaxCollected", TaxCollectedSchema);
