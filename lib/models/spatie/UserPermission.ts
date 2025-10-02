import mongoose, { Schema, Types } from "mongoose";

export interface UserPermissionProps extends Document<Types.ObjectId> {
  user_id: Types.ObjectId;
  permission_id: Types.ObjectId;
}

const UserPermissionSchema = new Schema<UserPermissionProps>({
  user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
  permission_id: { type: Schema.Types.ObjectId, ref: "SpatiePermission", required: true }
}, { timestamps: true });

export default mongoose.models.UserPermission || mongoose.model<UserPermissionProps>("UserPermission", UserPermissionSchema);
