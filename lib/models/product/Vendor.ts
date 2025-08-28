import mongoose, { Schema, Types, Document, model } from "mongoose";

interface VendorDoc extends Document {
  user_id?: Types.ObjectId;
  adminApproval: boolean;
  heading?: string;
  content?: string;
  displayOrder?: number;
  createdAt: Date;
  updatedAt: Date;
  products?: { product_id: Types.ObjectId }[];
}

const vendorSchema = new Schema<VendorDoc>({
    user_id: { type: Schema.Types.ObjectId, ref: "User" },
    adminApproval: { type: Boolean, default: true },
    heading: { type: String, required: false },
    content: { type: String, required: false },
    displayOrder: { type: Number, required: false },
  }, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

export default mongoose.models.Vendor || model<VendorDoc>("Vendor", vendorSchema);