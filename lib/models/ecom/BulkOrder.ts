import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface BulkOrderProps extends Document<Types.ObjectId> {
  user_id?: Types.ObjectId;
  product_id: Types.ObjectId;
  sku_id?: Types.ObjectId;
  vendor_id?: Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  status: string,
  quantity: number,
  user_remarks?: string;
  admin_remarks?: string;
  vendor_remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

const bulkOrderSchema = new Schema<BulkOrderProps>({
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: false },
    product_id: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    sku_id: { type: Schema.Types.ObjectId, ref: "Sku", required: false },
    vendor_id: { type: Schema.Types.ObjectId, ref: "User", required: false },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    status: { type: String, required: false },
    quantity: { type: Number, required: true },
    user_remarks: { type: String, required: false },
    admin_remarks: { type: String, required: false },
    vendor_remarks: { type: String, required: false },
  },{ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

const BulkOrder: Model<BulkOrderProps> = mongoose.models.BulkOrder || mongoose.model<BulkOrderProps>("BulkOrder", bulkOrderSchema);
export default BulkOrder;