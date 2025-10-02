import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IClient extends Document<Types.ObjectId> {
  name: string;
  email?: string;
  phone?: string;
  role: string;
  content?: string;
  status: boolean;
  displayOrder?: number;
  media_id?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const clientSchema = new Schema<IClient>({
    name: { type: String, required: true },
    email: { type: String, required: false },
    phone: { type: String, required: false },
    role: { type: String, required: true },
    content: { type: String, required: false },
    status: { type: Boolean, required: true },
    displayOrder: { type: Number, required: false, },
    media_id: { type: Schema.Types.ObjectId, ref: 'Media' },
  }, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

export default mongoose.models.Client || mongoose.model<IClient>('Client', clientSchema);