import mongoose, { Document, Schema, Types } from "mongoose";

export interface UserBrowsingHistoryProps extends Document {
  module: "Blog" | "Destination" | "Page" | "Product";
  module_id: string | Types.ObjectId;
  user_id?: mongoose.Types.ObjectId;
  frequency?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const userBrowsingHistorySchema = new Schema<UserBrowsingHistoryProps>({
    module: { type: String, enum: ["Blog", "Destination", "Page", "Product"], required: true },
    module_id: { type: Schema.Types.ObjectId, required: true, refPath: "module" },
    user_id: { type: Schema.Types.ObjectId, ref: 'User' },
    frequency: { type: Number, default: 1, required: true, },
  }, { timestamps: true, toObject: { virtuals: true }, toJSON: { virtuals: true } }
);

export default mongoose.models.UserBrowsingHistory || mongoose.model<UserBrowsingHistoryProps>("UserBrowsingHistory", userBrowsingHistorySchema);