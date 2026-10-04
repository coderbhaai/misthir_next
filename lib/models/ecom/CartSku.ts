import mongoose, { Schema, model, models, Types, Document } from "mongoose";

export interface CartSkuDoc extends Document<Types.ObjectId> {
  cart_id: string | Types.ObjectId;
  product_id: string | Types.ObjectId;
  sku_id: string | Types.ObjectId;
  seller_id: Types.ObjectId;
  quantity: number;
  price: number;
  sale: number;
  flavor_id?: string | Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const cartSkuSchema = new Schema<CartSkuDoc>({
    cart_id: { type: Schema.Types.ObjectId, ref: 'Cart', required: true },
    product_id: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    sku_id: { type: Schema.Types.ObjectId, ref: 'Sku', required: true },
    seller_id: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    sale: { type: Number, required: true },
    flavor_id: { type: Schema.Types.ObjectId, ref: 'ProductFeature' },
  }, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

cartSkuSchema.virtual('product', { ref: 'Product', localField: 'product_id', foreignField: '_id', justOne: true, });
cartSkuSchema.virtual('vendor', { ref: 'User', localField: 'seller_id', foreignField: '_id', justOne: true, });
cartSkuSchema.virtual('sku', { ref: 'Sku', localField: 'sku_id', foreignField: '_id', justOne: true, });
cartSkuSchema.virtual('details', { ref: 'CartSkuDetail', localField: '_id', foreignField: 'cart_sku_id', justOne: false });

export default mongoose.models.CartSku || mongoose.model<CartSkuDoc>("CartSku", cartSkuSchema);