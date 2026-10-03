import mongoose, { Document, Schema, Types } from "mongoose";

export interface UserBrowsingHistoryDoc extends Document<Types.ObjectId> {
  module: string;
  module_id: string | Types.ObjectId;
  user_id?: Types.ObjectId;
  frequency?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const userBrowsingHistorySchema = new Schema<UserBrowsingHistoryDoc>({
    module: { type: String, required: true },
    module_id: { type: Schema.Types.ObjectId, required: true, refPath: "module" },
    user_id: { type: Schema.Types.ObjectId, ref: 'User' },
    frequency: { type: Number, default: 1, required: true, },
  }, { timestamps: true, toObject: { virtuals: true }, toJSON: { virtuals: true } }
);

export default mongoose.models.UserBrowsingHistory || mongoose.model<UserBrowsingHistoryDoc>("UserBrowsingHistory", userBrowsingHistorySchema);