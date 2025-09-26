import mongoose, { Document, Schema, Types } from "mongoose";
import { auditLoggerPlugin } from "pages/lib/auditLogger";

export interface IFaqProps extends Document {
  module: string;
  module_id: string | Types.ObjectId;
  question: string;
  answer: string;
  status: boolean;
  displayOrder?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const faqSchema = new Schema<IFaqProps>({
    module: { type: String, enum: ["Blog", "Destination", "Product", "Page"], required: true },
    module_id: { type: Schema.Types.ObjectId, required: true, refPath: "module" },
    question: { type: String, required: true, },
    answer: { type: String, required: true, },
    status: { type: Boolean, required: true, default: true },
    displayOrder: { type: Number, required: false, },
  }, { timestamps: true, toObject: { virtuals: true }, toJSON: { virtuals: true } }
);

faqSchema.plugin(auditLoggerPlugin);

export default mongoose.models.Faq || mongoose.model<IFaqProps>("Faq", faqSchema);
