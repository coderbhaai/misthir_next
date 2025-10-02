import mongoose, { Schema, Document, model, Types } from 'mongoose';

interface CountryDocument extends Document<Types.ObjectId> {
  name: string;
  capital?: string;
  code?: string;
  calling_code?: string;
  flag?: string;
  status: boolean;
  displayOrder?: number;
  createdAt: Date;
  updatedAt: Date;
}

const countrySchema = new Schema<CountryDocument>({
  name: { type: String, required: true },
  capital: { type: String, required: false},
  code: { type: String, required: false},
  calling_code: { type: String, required: false},
  flag: { type: String, required: false},
  status: { type: Boolean, default: true },
  displayOrder: { type: Number, required: false, },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

export default mongoose.models.Country || model<CountryDocument>('Country', countrySchema);