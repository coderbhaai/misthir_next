import mongoose, { Schema, Document, Types } from 'mongoose';

export interface CtaDoc extends Document<Types.ObjectId> {
  type?: string;
  page_url?: string;
  message?: string;
  clicked_on?: string;
  device?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ctaSchema = new Schema<CtaDoc>({
    type: { type: String, required: false },
    page_url: { type: String, required: false },
    message: { type: String, required: false },
    clicked_on: { type: String, required: false },
    device: { type: String, required: false },
    utm_source: { type: String, required: false },
    utm_medium: { type: String, required: false },
    utm_campaign: { type: String, required: false },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

export default mongoose.models.Cta || mongoose.model<CtaDoc>('Cta', ctaSchema);