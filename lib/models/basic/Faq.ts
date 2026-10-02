import { auditLoggerPlugin } from "lib/server/plugins/auditLogger";
import mongoose, { Document, Schema, Types } from "mongoose";

export interface IFaqDoc extends Document<Types.ObjectId> {
  module: string;
  module_id: string | Types.ObjectId;
  question: string;
  answer: string;
  status: boolean;
  displayOrder?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const faqSchema = new Schema<IFaqDoc>({
    module: { type: String, required: true },
    module_id: { type: Schema.Types.ObjectId, required: true, refPath: "module" },
    question: { type: String, required: true, },
    answer: { type: String, required: true, },
    status: { type: Boolean, required: true, default: true },
    displayOrder: { type: Number, required: false, },
  }, { timestamps: true, toObject: { virtuals: true }, toJSON: { virtuals: true } }
);

faqSchema.plugin(auditLoggerPlugin);

export default mongoose.models.Faq || mongoose.model<IFaqDoc>("Faq", faqSchema);
