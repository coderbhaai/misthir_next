import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface MetaDoc extends Document<Types.ObjectId> {
  url: string;
  title: string;
  description: string;
  media_id?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const metaSchema = new Schema<MetaDoc>({
  url: { type: String, required: true },
  title: { type: String, required: true, translatable: true },
  description: { type: String, required: true, translatable: true },
  media_id: { type: Schema.Types.ObjectId, ref: 'Media' },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

export default mongoose.models?.Meta || mongoose.model<MetaDoc>("Meta", metaSchema);