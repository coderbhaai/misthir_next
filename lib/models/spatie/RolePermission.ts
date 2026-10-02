import mongoose, { Document, Schema, Types } from "mongoose";

export interface RolePermisssionDoc extends Document<Types.ObjectId> {
  role_id: Types.ObjectId;
  permission_id: Types.ObjectId;
}

const RolePermissionSchema = new Schema<RolePermisssionDoc>({
  role_id: { type: Schema.Types.ObjectId, ref: "SpatieRole", required: true },
  permission_id: { type: Schema.Types.ObjectId, ref: "SpatiePermission", required: true }
}, { timestamps: true });

export default mongoose.models?.RolePermission || mongoose.model<RolePermisssionDoc>("RolePermission", RolePermissionSchema);