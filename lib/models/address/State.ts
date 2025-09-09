import mongoose, { Schema, Document, Types, model } from 'mongoose';

interface StateDocument extends Document {
  country_id?: Types.ObjectId;
  name: string;
  major?: boolean;
  status: boolean;
  displayOrder?: number;
  createdAt: Date;
  updatedAt: Date;
}

const stateSchema = new Schema<StateDocument>({
  country_id: { type: Schema.Types.ObjectId, ref: 'Country' },
  name: { type: String, required: true },
  major: { type: Boolean, default: false },
  status: { type: Boolean, default: true },
  displayOrder: { type: Number, required: false, },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

export default mongoose.models.State || model<StateDocument>('State', stateSchema);