import mongoose, { Schema, model, models, Types, Document } from "mongoose";

export interface CartDoc extends Document<Types.ObjectId> {
  user_id?: string | Types.ObjectId;
  billing_address_id?: string | Types.ObjectId;
  shipping_address_id?: string | Types.ObjectId;
  paymode?: string;
  weight?: number;
  total?: number;
  payable_amount?: number;
  user_remarks?: string;
  admin_remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

const cartSchema = new Schema<CartDoc>({
    user_id: { type: Schema.Types.ObjectId, ref: 'User' },
    billing_address_id: { type: Schema.Types.ObjectId, ref: 'Address',  },
    shipping_address_id: { type: Schema.Types.ObjectId, ref: 'Address', },
    paymode: { type: String },
    weight: { type: Number },
    total: { type: Number },
    payable_amount: { type: Number },
    user_remarks: { type: String },
    admin_remarks: { type: String },
  }, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

cartSchema.virtual('cartSkus', { ref: 'CartSku', localField: '_id', foreignField: 'cart_id', justOne: false });
cartSchema.virtual('cartCharges', { ref: 'CartCharges', localField: '_id', foreignField: 'cart_id', justOne: true });
cartSchema.virtual('cartCoupon', { ref: 'CartCoupon', localField: '_id', foreignField: 'cart_id', justOne: true });
cartSchema.virtual('cartConsent', { ref: 'CartConsent', localField: '_id', foreignField: 'cart_id', justOne: true });

export default mongoose.models.Cart || mongoose.model<CartDoc>("Cart", cartSchema);