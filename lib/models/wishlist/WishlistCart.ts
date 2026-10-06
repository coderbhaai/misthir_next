import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface WishlistCartProps extends Document<Types.ObjectId> {
  wishlist_id?: Types.ObjectId;
  user_id?: Types.ObjectId;
  seller_id?: Types.ObjectId;
  product_id?: Types.ObjectId;
  sku_id?: Types.ObjectId;
  quantity?: Number;
  user_remarks?: string;
  admin_remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

const wishlistCartSchema = new Schema<WishlistCartProps>({
  wishlist_id: { type: Schema.Types.ObjectId, ref: 'Wishlist', required: true },
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: false },
  seller_id: { type: Schema.Types.ObjectId, ref: 'User', required: false },
  product_id: { type: Schema.Types.ObjectId, ref: 'Product', required: false },
  sku_id: { type: Schema.Types.ObjectId, ref: 'Sku', required: false },
  quantity: { type: Number, required: false },
  user_remarks: { type: String, required: false },
  admin_remarks: { type: String, required: false },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

wishlistCartSchema.index( { wishlist_id: 1, product_id: 1, sku_id: 1 }, { unique: true } );

export default mongoose.models.WishlistCart || mongoose.model<WishlistCartProps>('WishlistCart', wishlistCartSchema);