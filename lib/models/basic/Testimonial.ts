import mongoose, { Document, Schema, Types } from "mongoose";

export interface ITestimonialDoc extends Document<Types.ObjectId> {
  module: string;
  module_id: mongoose.Types.ObjectId;
  user_id: Types.ObjectId;
  content: string;
  status: boolean;
  displayOrder?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const testimonialModelSchema = new Schema<ITestimonialDoc>({
    module: { type: String, required: true },
    module_id: { type: Schema.Types.ObjectId, required: true, refPath: "module" },
    user_id: { type: Schema.Types.ObjectId, ref: 'User' },
    content: { type: String, required: true, translatable: true },
    status: { type: Boolean, required: true, default: true },
    displayOrder: { type: Number, required: false, },
  }, { timestamps: true, toObject: { virtuals: true }, toJSON: { virtuals: true } }
);

export default mongoose.models?.Testimonial || mongoose.model<ITestimonialDoc>("Testimonial", testimonialModelSchema);