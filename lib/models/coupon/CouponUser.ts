import mongoose, { Schema } from 'mongoose';

const couponUserSchema = new Schema({
  coupon_id: { type: Schema.Types.ObjectId, ref: 'Coupon', required: true },
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
});

couponUserSchema.index({ coupon_id: 1, user_id: 1 }, { unique: true });

export default mongoose.models.CouponUser || mongoose.model('CouponUser', couponUserSchema);