import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface IResetPasswordDoc extends Document<Types.ObjectId> {
  email: string;
  otp: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ResetPasswordSchema = new Schema<IResetPasswordDoc>({
  email: { type: String, required: true },
  otp: { type: String, required: true, minlength: 4, maxlength: 8 },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 5 * 60 * 1000), index: { expires: '5m' } },
}, { timestamps: true });

ResetPasswordSchema.index({ email: 1, otp: 1 });

const ResetPassword: Model<IResetPasswordDoc> = mongoose.models?.ResetPassword || mongoose.model<IResetPasswordDoc>('ResetPassword', ResetPasswordSchema);
export default ResetPassword;