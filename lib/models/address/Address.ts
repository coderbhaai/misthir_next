import mongoose, { Schema, Document, Types, model } from 'mongoose';

interface AddressDcument extends Document {
  user_id?: Types.ObjectId;
  name: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  city: string;
  city_id: Types.ObjectId;
  address1?: string;
  address2?: string;
  pin?: string;
  landmark?: string;
  company?: string;
  status: boolean;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const addressSchema = new Schema<AddressDcument>({
  user_id: { type: Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true },
  email: { type: String, required: false },
  phone: { type: String, required: true },
  whatsapp: { type: String, required: false },
  city: { type: String, required: true },
  city_id: { type: Schema.Types.ObjectId, ref: 'City' },
  address1: { type: String, required: true },
  address2: { type: String, required: false },
  pin: { type: String, required: true },
  landmark: { type: String, required: false },
  company: { type: String, required: false },
  status: { type: Boolean, default: true },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

export default mongoose.models.Address || model<AddressDcument>('Address', addressSchema);