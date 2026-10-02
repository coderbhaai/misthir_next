import mongoose, { Schema, Types, Document, model } from "mongoose";

interface CommissionDoc extends Document<Types.ObjectId> {
  module: string;
  module_id?: Types.ObjectId;
  user_id?: Types.ObjectId;
  percentage: number;
  createdAt: Date;
  updatedAt: Date;
}

const commissionSchema = new Schema<CommissionDoc>({
    module: { type: String, required: true },
    module_id: { type: Schema.Types.ObjectId, required: true, refPath: "module" },
    user_id: { type: Schema.Types.ObjectId, ref: "User" },
    percentage: { type: Number, required: true },
  }, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

export default mongoose.models.Commission || model<CommissionDoc>("Commission", commissionSchema);