import { Schema, model, models, Document, Types } from "mongoose";

interface RazorpayPaymentProps extends Document<Types.ObjectId> {
  module: string;
  module_id: string | Types.ObjectId;
  amount: number;
  currency: string;
  source: string;
  razorpay_payment_id: string;
  razorpay_order_id: string;
  paymentDetails?: any;
  createdAt: Date;
  updatedAt: Date;
}

const RazorpayPaymentSchema = new Schema<RazorpayPaymentProps>({
  module: { type: String, required: true },
  module_id: { type: Schema.Types.ObjectId, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, required: true },
  source: { type: String, required: true },
  razorpay_payment_id: { type: String, required: false },
  razorpay_order_id: { type: String, required: false },
  paymentDetails: { type: Schema.Types.Mixed, required: false },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

export default models.RazorpayPayment || model<RazorpayPaymentProps>("RazorpayPayment", RazorpayPaymentSchema);