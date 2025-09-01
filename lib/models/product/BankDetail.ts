import mongoose, { Schema, Types, Document, model } from "mongoose";

interface BankDetailDoc extends Document {
  user_id?: Types.ObjectId;
  account: string;
  ifsc: string;
  branch: string;
  bank: string;
  createdAt: Date;
  updatedAt: Date;
  products?: { product_id: Types.ObjectId }[];
}

const bankDetailSchema = new Schema<BankDetailDoc>({
    user_id: { type: Schema.Types.ObjectId, ref: "User" },
    account: { type: String, required: true },
    ifsc: { type: String, required: true },
    branch: { type: String, required: true },
    bank: { type: String, required: true },
  }, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

export default mongoose.models.BankDetail || model<BankDetailDoc>("BankDetail", bankDetailSchema);