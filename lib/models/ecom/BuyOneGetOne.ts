import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface BuyOneGetOneProps extends Document<Types.ObjectId> {
  coupon_id: Types.ObjectId;
  buy_id: Types.ObjectId;
  get_id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const buyOneGetOneSchema = new Schema<BuyOneGetOneProps>({
    coupon_id: { type: Schema.Types.ObjectId, ref: "Coupon", required: true },
    buy_id: { type: Schema.Types.ObjectId, ref: "Sku", required: true },
    get_id: { type: Schema.Types.ObjectId, ref: "Sku", required: true },
  },{ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

buyOneGetOneSchema.index(
  { coupon_id: 1, buy_id: 1, get_id: 1 },
  { unique: true }
);

const BuyOneGetOne: Model<BuyOneGetOneProps> = mongoose.models.BuyOneGetOne || mongoose.model<BuyOneGetOneProps>("BuyOneGetOne", buyOneGetOneSchema);
export default BuyOneGetOne;