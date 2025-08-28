import mongoose, { Schema, Document, Types, model } from 'mongoose';

interface StateDocument extends Document {
  name: string;
  country_id?: Types.ObjectId;
  major?: boolean;
  status: boolean;
  displayOrder?: number;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const stateSchema = new Schema<StateDocument>({
  name: { type: String, required: true },
  country_id: { type: Schema.Types.ObjectId, ref: 'Country' },
  major: { type: Boolean, default: false },
  status: { type: Boolean, default: true },
  displayOrder: { type: Number, required: false, },
  content: { type: String },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

export default mongoose.models.State || model<StateDocument>('State', stateSchema);