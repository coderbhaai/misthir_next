import mongoose, { Schema } from 'mongoose';

const OrderOrderConsentSchema = new Schema({
  orderConsent_id: { type: Schema.Types.ObjectId, ref: 'OrderConsent', required: true },
  order_id: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
});

OrderOrderConsentSchema.index({ order_id: 1, orderConsent_id: 1 }, { unique: true });
export default mongoose.models.OrderOrderConsent || mongoose.model('OrderOrderConsent', OrderOrderConsentSchema);