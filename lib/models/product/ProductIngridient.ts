import mongoose, { Schema } from 'mongoose';

const ProductIngridientSchema = new Schema({
  product_id: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  ingridient_id: { type: Schema.Types.ObjectId, ref: 'Ingridient', required: true },
});

ProductIngridientSchema.index({ product_id: 1, ingridient_id: 1 }, { unique: true });

export default mongoose.models.ProductIngridient || mongoose.model('ProductIngridient', ProductIngridientSchema);