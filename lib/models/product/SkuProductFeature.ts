import mongoose, { Schema } from 'mongoose';

const skuProductFeatureSchema = new Schema({
  sku_id: { type: Schema.Types.ObjectId, ref: 'Sku', required: true },
  productFeature_id: { type: Schema.Types.ObjectId, ref: 'ProductFeature', required: true },
});

skuProductFeatureSchema.index({ sku_id: 1, productFeature_id: 1 }, { unique: true });

export default mongoose.models.SkuProductFeature || mongoose.model('SkuProductFeature', skuProductFeatureSchema);