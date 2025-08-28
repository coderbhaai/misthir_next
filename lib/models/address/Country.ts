import mongoose, { Schema, Document, Types, model } from 'mongoose';

interface CountryDocument extends Document {
  name: string;
  capital?: string;
  code?: string;
  dial?: string;
  flag?: string;
  status: boolean;
  displayOrder?: number;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const countrySchema = new Schema<CountryDocument>({
  name: { type: String, required: true },
  capital: { type: String, required: false},
  code: { type: String, required: false},
  dial: { type: String, required: false},
  flag: { type: String, required: false},
  status: { type: Boolean, default: true },
  displayOrder: { type: Number, required: false, },
  content: { type: String },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

export default mongoose.models.Country || model<CountryDocument>('Country', countrySchema);