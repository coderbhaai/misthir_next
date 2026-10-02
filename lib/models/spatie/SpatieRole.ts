// models/Role.ts
import mongoose, { Schema, Document, Types } from "mongoose";

export interface IRoleDoc extends Document<Types.ObjectId> {
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

const spatieRoleSchema = new Schema<IRoleDoc>({
  name: { type: String, required: true, trim: true },
  status: { type: Boolean, required: true },
  displayOrder: { type: Number, required: false, },
}, { timestamps: true });

spatieRoleSchema.virtual("permissionsAttached", { ref: "RolePermission", localField: "_id", foreignField: "role_id" });
spatieRoleSchema.set("toObject", { virtuals: true });
spatieRoleSchema.set("toJSON", { virtuals: true });

export default mongoose.models?.SpatieRole || mongoose.model<IRoleDoc>("SpatieRole", spatieRoleSchema);