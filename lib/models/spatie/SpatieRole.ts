// models/Role.ts
import mongoose, { Schema, Document, Types } from "mongoose";

export interface IRoleProps extends Document {
  name: string;
  status: boolean;
  displayOrder?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRoleWithPermissions {
  _id: Types.ObjectId;
  name: string;
  permissionsAttached?: Array<{
    permission_id: { _id: Types.ObjectId; name: string; };
  }>;
}

const spatieRoleSchema = new Schema<IRoleProps>({
  name: { type: String, required: true, trim: true },
  status: { type: Boolean, required: true },
  displayOrder: { type: Number, required: false, },
}, { timestamps: true });

spatieRoleSchema.virtual("permissionsAttached", { ref: "RolePermission", localField: "_id", foreignField: "role_id" });
spatieRoleSchema.set("toObject", { virtuals: true });
spatieRoleSchema.set("toJSON", { virtuals: true });

export default mongoose.models.SpatieRole || mongoose.model<IRoleProps>("SpatieRole", spatieRoleSchema);