import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAuthor extends Document {
  name: string;
  status: boolean;
  displayOrder?: number;
  media_id?: mongoose.Types.ObjectId;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const authorSchema = new Schema<IAuthor>({
  name: { type: String, required: true },
  status: { type: Boolean, required: true },
  displayOrder: { type: Number, required: false, },
  media_id: { type: Schema.Types.ObjectId, ref: 'Media' },
  content: { type: String, required: true },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

export default mongoose.models.Author || mongoose.model<IAuthor>('Author', authorSchema);