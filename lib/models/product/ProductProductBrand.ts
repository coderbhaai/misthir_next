import mongoose, { Schema } from 'mongoose';

const productProductBrandSchema = new Schema({
  product_id: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  productBrand_id: { type: Schema.Types.ObjectId, ref: 'ProductBrand', required: true },
});

productProductBrandSchema.index({ product_id: 1, productBrand_id: 1 }, { unique: true });

export default mongoose.models.ProductProductBrand || mongoose.model('ProductProductBrand', productProductBrandSchema);