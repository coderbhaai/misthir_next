import mongoose, { Schema, Document, Types } from "mongoose";

export interface SaleDoc extends Document<Types.ObjectId> {
  name: string;
  seller_id?: string | Types.ObjectId;
  media_id?: string | Types.ObjectId;
  sales: number;
  valid_from: Date;
  valid_to: Date;
  discount_type: string;
  discount: number;
  description?: string;
  status: boolean;
  buy_one?: string | Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SaleSchema = new Schema<SaleDoc>({
  name: { type: String, required: true },
  seller_id: { type: Schema.Types.ObjectId, required: false, ref: 'User', },
  media_id: { type: Schema.Types.ObjectId, ref: 'Media', required: false },
  sales: { type: Number, default: 0 },
  valid_from: { type: Date, required: true },
  valid_to: { type: Date, required: true },
  discount_type: { type: String, required: true },
  discount: { type: Number, required: true,
    get: (v: Number) => (v ? parseFloat(v.toString()) : 0),
    set: (v: number) => parseFloat(v.toFixed(2)),
  },
  description: { type: String, default: null },
  status: { type: Boolean, default: true },
  buy_one: { type: Number, default: null },
},{ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } } );

SaleSchema.virtual('saleTargets', { ref: 'SaleTarget', localField: '_id', foreignField: 'sale_id', justOne: false });
SaleSchema.virtual("bogo_items", { ref: "BuyOneGetOne", localField: "_id", foreignField: "sale_id", });

export default mongoose.models.Sale || mongoose.model<SaleDoc>("Sale", SaleSchema);