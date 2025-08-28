import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IContact extends Document {
  name: string;
  email: string;
  phone: string;
  user_remarks?: string;
  admin_remarks?: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const contactSchema = new Schema<IContact>({
    name: { type: String, required: true },
    email: { type: String, required: false },
    phone: { type: String, required: false },
    user_remarks: { type: String, required: false },
    admin_remarks: { type: String, required: false },
    status: { type: String, required: true },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

export default mongoose.models.Contact || mongoose.model<IContact>('Contact', contactSchema);