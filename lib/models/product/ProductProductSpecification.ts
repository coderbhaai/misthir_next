import mongoose, { Schema } from 'mongoose';

const productProductSpecificationSchema = new Schema({
  product_id: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  productSpecification_id: { type: Schema.Types.ObjectId, ref: 'ProductSpecification', required: true },
});

productProductSpecificationSchema.index({ product_id: 1, productSpecification_id: 1 }, { unique: true });

export default mongoose.models.ProductProductSpecification || mongoose.model('ProductProductSpecification', productProductSpecificationSchema);