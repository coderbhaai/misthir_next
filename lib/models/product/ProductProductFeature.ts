import mongoose, { Schema } from 'mongoose';

const productProductFeatureSchema = new Schema({
  product_id: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  productFeature_id: { type: Schema.Types.ObjectId, ref: 'ProductFeature', required: true },
});

productProductFeatureSchema.index({ product_id: 1, productFeature_id: 1 }, { unique: true });

export default mongoose.models.ProductProductFeature || mongoose.model('ProductProductFeature', productProductFeatureSchema);