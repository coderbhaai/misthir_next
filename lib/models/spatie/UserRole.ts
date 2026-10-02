import mongoose, { Schema, Document, Types } from "mongoose";

export interface UserRoleDoc extends Document<Types.ObjectId> {
  user_id: Types.ObjectId;
  role_id: Types.ObjectId;
}

const UserRoleSchema = new Schema<UserRoleDoc>({
  user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
  role_id: { type: Schema.Types.ObjectId, ref: "SpatieRole", required: true }
}, { timestamps: true });

export default mongoose.models?.UserRole || mongoose.model<UserRoleDoc>("UserRole", UserRoleSchema);