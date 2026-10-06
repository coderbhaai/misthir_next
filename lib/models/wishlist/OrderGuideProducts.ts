import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface OrderGuideProductsProps extends Document<Types.ObjectId> {
  order_guide_id?: Types.ObjectId;
  sku_id?: Types.ObjectId;
  product_id?: Types.ObjectId;
  quantity?: number;
  createdAt: Date;
  updatedAt: Date;
}

const OrderGuideProductsSchema = new Schema<OrderGuideProductsProps>({
  order_guide_id: { type: Schema.Types.ObjectId, ref: 'OrderGuide', required: true },
  sku_id: { type: Schema.Types.ObjectId, ref: 'Sku', required: false },
  product_id: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, default: 1 },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

export default mongoose.models.OrderGuideProducts || mongoose.model<OrderGuideProductsProps>('OrderGuideProducts', OrderGuideProductsSchema);