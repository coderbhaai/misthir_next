import mongoose, { Document, Schema, Types } from "mongoose";

export interface ITestimonialProps extends Document {
  module: "Blog" | "Destination" | "Page" | "Product";
  module_id: string | Types.ObjectId;
  media_id?: Types.ObjectId;
  name: string;
  role: string;
  content: string;
  status: boolean;
  displayOrder?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const testimonialModelSchema = new Schema<ITestimonialProps>({
    module: { type: String, enum: ["Blog", "Destination", "Page", "Product"], required: true },
    module_id: { type: Schema.Types.ObjectId, required: true, refPath: "module" },
    media_id: { type: Schema.Types.ObjectId, ref: 'Media' },
    name: { type: String, required: true, },
    role: { type: String, required: true, },
    content: { type: String, required: true, },
    status: { type: Boolean, required: true, default: true },
    displayOrder: { type: Number, required: false, },
  }, { timestamps: true, toObject: { virtuals: true }, toJSON: { virtuals: true } }
);

export default mongoose.models.Testimonial || mongoose.model<ITestimonialProps>("Testimonial", testimonialModelSchema);