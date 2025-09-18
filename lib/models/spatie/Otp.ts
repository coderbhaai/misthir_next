import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export type OtpType = 'email' | 'phone' | 'both';

export interface IOtp extends Document {
  type: OtpType;
  email?: string;
  phone?: string;
  otp: string;
  expiresAt: Date;
  user_id?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const OtpSchema = new Schema<IOtp>({
  type: {  type: String, enum: ['email', 'phone', 'both'], required: true },
  email: { type: String, required: function() { return this.type === 'email' || this.type === 'both'; }, match: [/.+\@.+\..+/, 'Please enter a valid email'] },
  phone: { type: String, required: function() { return this.type === 'phone' || this.type === 'both'; }, match: [/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number'] },
  otp: { type: String, required: true, minlength: 4, maxlength: 8 },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 5 * 60 * 1000), index: { expires: '5m' } },
  user_id: { type: Schema.Types.ObjectId, ref: "User", required: false },
}, { timestamps: true });

OtpSchema.index({ email: 1, otp: 1 });
OtpSchema.index({ phone: 1, otp: 1 });

const Otp: Model<IOtp> = mongoose.models.Otp || mongoose.model<IOtp>('Otp', OtpSchema);
export default Otp;