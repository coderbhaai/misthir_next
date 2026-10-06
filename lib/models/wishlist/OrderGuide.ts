import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import { OrderGuideProductsProps } from './OrderGuideProducts';
import { addVirtualRelations } from 'lib/server/plugins/addVirtualRelations';

export interface OrderGuideProps extends Document<Types.ObjectId> {
  user_id?: Types.ObjectId;
  name?: string;
  createdAt: Date;
  updatedAt: Date;

  products?: OrderGuideProductsProps[];
  product_ids?: Types.ObjectId[];
}

const OrderGuideSchema = new Schema<OrderGuideProps>({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: false },
  name: { type: String, required: false },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });


addVirtualRelations(OrderGuideSchema, [
  { populateName: 'products', outputName: 'product_ids', ref: 'OrderGuideProducts', foreignField: 'order_guide_id', extractIdField: 'product_id', justOne: false, } 
]);

export default mongoose.models.OrderGuide || mongoose.model<OrderGuideProps>('OrderGuide', OrderGuideSchema);