import mongoose, { Schema, model, models, Types, Document } from "mongoose";

export interface OrderChargesDoc extends Document<Types.ObjectId> {
  order_id: string | Types.ObjectId;
  shipping_charges?: number;
  shipping_chargeable_value?: number;
  sales_discount?: number;
  admin_discount?: number;
  cod_charges?: number;
  total_vendor_discount?: number;
}

const orderChargesSchema = new Schema<OrderChargesDoc>({
    order_id: { type: Schema.Types.ObjectId, required: true, ref: 'Order', },
    shipping_charges: { type: Number },
    shipping_chargeable_value: { type: Number },
    sales_discount: { type: Number },
    admin_discount: { type: Number },
    cod_charges: { type: Number },
    total_vendor_discount: { type: Number },
  }, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

export default mongoose.models.OrderCharges || mongoose.model<OrderChargesDoc>("OrderCharges", orderChargesSchema);