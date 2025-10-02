import { Schema, model, models, Document, Types } from "mongoose";

interface RazorpayProps extends Document<Types.ObjectId> {
  module: string;
  module_id: string | Types.ObjectId;
  source: string;
  razorpay_payment_id: string;
  createdAt: Date;
  updatedAt: Date;
}

const razorpaySchema = new Schema<RazorpayProps>({
  module: { type: String, required: true },
  module_id: { type: Schema.Types.ObjectId, required: true },
  source: { type: String, required: true },
  razorpay_payment_id: { type: String, required: true },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

export default models.Razorpay || model<RazorpayProps>("Razorpay", razorpaySchema);