import mongoose, { Schema } from "mongoose";

export interface UserRoleProps extends Document {
  user_id: mongoose.Types.ObjectId;
  role_id: mongoose.Types.ObjectId;
}

const UserRoleSchema = new Schema<UserRoleProps>({
  user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
  role_id: { type: Schema.Types.ObjectId, ref: "SpatieRole", required: true }
}, { timestamps: true });

export default mongoose.models.UserRole || mongoose.model<UserRoleProps>("UserRole", UserRoleSchema);
