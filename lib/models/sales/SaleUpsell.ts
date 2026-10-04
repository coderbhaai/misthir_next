import mongoose, { Schema, Types, Document, model } from "mongoose";

export interface SaleUpsellDoc extends Document<Types.ObjectId> {
  sale_id: Types.ObjectId;
  min_spend?: number;     // e.g., Spend $50 more
  min_quantity?: number;  // e.g., Buy 2 more items
  message: string;        // e.g., "Add $X more to unlock Free Shipping or Extra 10% Off!"
  createdAt: Date;
  updatedAt: Date;
}

const SaleUpsellSchema = new Schema<SaleUpsellDoc>({
  sale_id: { type: Schema.Types.ObjectId, ref: "Sale", required: true, index: true },
  min_spend: { type: Number, default: null },
  min_quantity: { type: Number, default: null },
  message: { type: String, required: true },
}, { timestamps: true });

export default mongoose.models.SaleUpsell || model<SaleUpsellDoc>("SaleUpsell", SaleUpsellSchema);