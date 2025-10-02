import mongoose, { Schema, Types, Document, model } from "mongoose";

interface CommissionDoc extends Document<Types.ObjectId> {
  productmeta_id?: Types.ObjectId;
  vendor_id?: Types.ObjectId;
  percentage: number;
  createdAt: Date;
  updatedAt: Date;
}

const commissionSchema = new Schema<CommissionDoc>({
    productmeta_id: { type: Schema.Types.ObjectId, ref: "Productmeta" },
    vendor_id: { type: Schema.Types.ObjectId, ref: "User" },
    percentage: { type: Number, required: true },
  }, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

export default mongoose.models.Commission || model<CommissionDoc>("Commission", commissionSchema);