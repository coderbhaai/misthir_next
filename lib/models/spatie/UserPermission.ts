import mongoose, { Schema, Document, Types } from "mongoose";

export interface UserPermissionDoc extends Document<Types.ObjectId> {
  user_id: Types.ObjectId;
  permission_id: Types.ObjectId;
}

const UserPermissionSchema = new Schema<UserPermissionDoc>({
  user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
  permission_id: { type: Schema.Types.ObjectId, ref: "SpatiePermission", required: true }
}, { timestamps: true });

export default mongoose.models?.UserPermission || mongoose.model<UserPermissionDoc>("UserPermission", UserPermissionSchema);
