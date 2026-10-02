import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface ctaCounterDoc extends Document<Types.ObjectId> {
  counter_date?: Date;
  type?: string;
  clicks?: Number;
  createdAt: Date;
  updatedAt: Date;
}

const ctaCounterSchema = new Schema<ctaCounterDoc>({
    counter_date: { type: Date, required: false },
    type: { type: String, required: false },
    clicks: { type: Number, required: false },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

export default mongoose.models.CtaCounter || mongoose.model<ctaCounterDoc>('CtaCounter', ctaCounterSchema);