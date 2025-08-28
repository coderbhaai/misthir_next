import mongoose, { Schema } from 'mongoose';

const productProductmetaSchema = new Schema({
  product_id: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  productmeta_id: { type: Schema.Types.ObjectId, ref: 'Productmeta', required: true },
});

productProductmetaSchema.index({ product_id: 1, productmeta_id: 1 }, { unique: true });

export default mongoose.models.ProductProductmeta || mongoose.model('ProductProductmeta', productProductmetaSchema);