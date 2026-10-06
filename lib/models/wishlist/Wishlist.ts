import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface WishlistProps extends Document<Types.ObjectId> {
  user_id?: Types.ObjectId;
  name?: string;
  email?: string;
  phone?: string;
  status?: string;
  createdAt: Date;
  updatedAt: Date;
}

const wishlistSchema = new Schema<WishlistProps>({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: false },
  name: { type: String, required: false },
  email: { type: String, required: false },
  phone: { type: String, required: false },
  status: { type: String, required: false },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

wishlistSchema.virtual('wishlistCarts', { ref: 'WishlistCart', localField: '_id', foreignField: 'wishlist_id' });

export default mongoose.models.Wishlist || mongoose.model<WishlistProps>('Wishlist', wishlistSchema);