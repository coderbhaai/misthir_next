import mongoose, { Schema, Document, Types, model } from 'mongoose';

interface CityDocument extends Document {
  state_id?: Types.ObjectId;
  name: string;
  major?: boolean;
  status: boolean;
  displayOrder?: number;
  createdAt: Date;
  updatedAt: Date;
}

const citySchema = new Schema<CityDocument>({
  name: { type: String, required: true },
  state_id: { type: Schema.Types.ObjectId, ref: 'State' },
  major: { type: Boolean, default: false },
  status: { type: Boolean, default: true },
  displayOrder: { type: Number, required: false, },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

export default mongoose.models.City || model<CityDocument>('City', citySchema);