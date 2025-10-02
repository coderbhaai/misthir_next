import { Schema, model, models, Document, Types } from "mongoose";

interface PageDetailDoc extends Document<Types.ObjectId> {
  page_detail_id: Types.ObjectId;
  faq_title?: string;
  faq_text?: string;
  blog_title?: string;
  blog_text?: string;
  contact_title?: string;
  contact_text?: string;
  testimonial_title?: string;
  testimonial_text?: string;
  createdAt: Date;
  updatedAt: Date;
}

const pageDetailSchema = new Schema<PageDetailDoc>(
  {
    page_detail_id: { type: Schema.Types.ObjectId, ref: "Page" },
    faq_title: String,
    faq_text: String,
    blog_title: String,
    blog_text: String,
    contact_title: String,
    contact_text: String,
    testimonial_title: String,
    testimonial_text: String,
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

export default models.PageDetail || model<PageDetailDoc>("PageDetail", pageDetailSchema);