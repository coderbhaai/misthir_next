import mongoose, { Schema, model, models, Types, Document } from "mongoose";

export interface OrderSkuDoc extends Document<Types.ObjectId> {
  order_id: string | Types.ObjectId;
  product_id: string | Types.ObjectId;
  sku_id: string | Types.ObjectId;
  seller_id: string | Types.ObjectId;
  quantity: number;
  price: number;
  vendor_discount?: number;
  flavor_id?: string | Types.ObjectId;
  tax_id?: string | Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const orderSkuSchema = new Schema<OrderSkuDoc>({
    order_id: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    product_id: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    sku_id: { type: Schema.Types.ObjectId, ref: 'Sku', required: true },
    seller_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    vendor_discount: { type: Number, required: false },
    flavor_id: { type: Schema.Types.ObjectId, ref: 'ProductFeature' },
    tax_id: { type: Schema.Types.ObjectId, ref: 'Tax' },
  }, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

orderSkuSchema.virtual('product', { ref: 'Product', localField: 'product_id', foreignField: '_id', justOne: true, });
orderSkuSchema.virtual('vendor', { ref: 'User', localField: 'seller_id', foreignField: '_id', justOne: true, });
orderSkuSchema.virtual('sku', { ref: 'Sku', localField: 'sku_id', foreignField: '_id', justOne: true, });

export default mongoose.models.OrderSku || mongoose.model<OrderSkuDoc>("OrderSku", orderSkuSchema);