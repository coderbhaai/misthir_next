import mongoose, { Schema, model, models, Types, Document } from "mongoose";

export interface OrderDoc extends Document<Types.ObjectId> {
  user_id?: string | Types.ObjectId;
  billing_address_id?: string | Types.ObjectId;
  shipping_address_id?: string | Types.ObjectId;
  paymode?: string;
  weight?: number;
  total?: number;
  paid?: number;
  user_remarks?: string;
  admin_remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<OrderDoc>({
    user_id: { type: Schema.Types.ObjectId, ref: 'User' },
    billing_address_id: { type: Schema.Types.ObjectId, ref: 'Address',  },
    shipping_address_id: { type: Schema.Types.ObjectId, ref: 'Address', },
    paymode: { type: String },
    weight: { type: Number },
    total: { type: Number },
    paid: { type: Number },
    user_remarks: { type: String },
    admin_remarks: { type: String },
  }, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

orderSchema.virtual('orderSkus', { ref: 'OrderSku', localField: '_id', foreignField: 'order_id', justOne: false });
orderSchema.virtual('orderCharges', { ref: 'OrderCharges', localField: '_id', foreignField: 'order_id', justOne: true });
orderSchema.virtual('orderCoupon', { ref: 'PrderCoupon', localField: '_id', foreignField: 'order_id', justOne: true });

export default mongoose.models.Order || mongoose.model<OrderDoc>("Order", orderSchema);