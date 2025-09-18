import mongoose, { Schema, Types } from "mongoose";

export interface IProps extends Document {
  role_id: Types.ObjectId;
  permission_id: Types.ObjectId;
}

const RolePermissionSchema = new Schema<IProps>({
  role_id: { type: Schema.Types.ObjectId, ref: "SpatieRole", required: true },
  permission_id: { type: Schema.Types.ObjectId, ref: "SpatiePermission", required: true }
}, { timestamps: true });

export default mongoose.models.RolePermission || mongoose.model<IProps>("RolePermission", RolePermissionSchema);