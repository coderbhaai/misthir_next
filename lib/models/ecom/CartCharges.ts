import mongoose, { Schema, model, models, Types, Document } from "mongoose";

export interface CartChargesDoc extends Document<Types.ObjectId> {
  cart_id: string | Types.ObjectId;
  shipping_charges?: number;
  shipping_chargeable_value?: number;
  sales_discount?: number;
  admin_discount?: number;
  admin_discount_validity?: Date;
  admin_discount_unit?: string;
  admin_discount_validity_value?: number;
  total_vendor_discount?: number;
  vendor_discount?: number;
  vendor_discount_validity?: Date;
  vendor_discount_unit?: string;
  vendor_discount_validity_value?: number;
  cod_charges?: number;
}

const cartChargesSchema = new Schema<CartChargesDoc>({
    cart_id: { type: Schema.Types.ObjectId, required: true, ref: 'Cart', },
    shipping_charges: { type: Number },
    shipping_chargeable_value: { type: Number },
    sales_discount: { type: Number },
    admin_discount: { type: Number },
    admin_discount_validity: { type: Date, default: null },
    admin_discount_unit: { type: String, default: null },
    admin_discount_validity_value: { type: Number, default: null },
    total_vendor_discount: { type: Number },
    cod_charges: { type: Number },
    vendor_discount: { type: Number, required: false },
    vendor_discount_validity: { type: Date, default: null },
    vendor_discount_unit: { type: String, default: null },
    vendor_discount_validity_value: { type: Number, default: null },
  }, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

export default mongoose.models.CartCharges || mongoose.model<CartChargesDoc>("CartCharges", cartChargesSchema);