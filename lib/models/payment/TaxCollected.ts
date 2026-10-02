import mongoose, { Schema, Document, models, Types } from "mongoose";

export interface ITaxCollected extends Document<Types.ObjectId> {
  module: string;
  module_id: Types.ObjectId;
  cgst?: number;
  sgst?: number;
  igst?: number;
  total?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const TaxCollectedSchema = new Schema<ITaxCollected>({
    module: { type: String, required: true },
    module_id: { type: Schema.Types.ObjectId, required: true }, 
    cgst: { type: Number, default: null },
    sgst: { type: Number, default: null },
    igst: { type: Number, default: null },
    total: { type: Number, default: null },
  },{ timestamps: true }
);

export default models.TaxCollected || mongoose.model<ITaxCollected>("TaxCollected", TaxCollectedSchema);
