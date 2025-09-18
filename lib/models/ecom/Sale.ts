import mongoose, { Schema, Document, Types } from "mongoose";

export interface SaleProps extends Document {
  name: string;
  vendor_id: string | Types.ObjectId;
  valid_from: Date;
  valid_to: Date;
  type: "Amount Based" | "Percent Based";
  discount: number;
  status: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SaleSchema = new Schema<SaleProps>({
  name: { type: String, required: true },
  vendor_id: { type: Schema.Types.ObjectId, required: true, ref: 'User', },
  valid_from: { type: Date, required: true },
  valid_to: { type: Date, required: true },
  type: { type: String, enum: ["Amount Based", "Percent Based"], required: true },
  discount: {
    type: Schema.Types.Decimal128 as unknown as typeof Number,
    required: true,
    get: (v: Types.Decimal128) => (v ? parseFloat(v.toString()) : 0),
    set: (v: number) => parseFloat(v.toFixed(2)),
  },
  status: { type: Boolean, default: true },
},{ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } } );

SaleSchema.virtual('saleSkus', { ref: 'SaleSku', localField: '_id', foreignField: 'sale_id', justOne: false });

export default mongoose.models.Sale || mongoose.model<SaleProps>("Sale", SaleSchema);