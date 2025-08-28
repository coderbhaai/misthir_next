import mongoose, { Schema, Document } from "mongoose";

export interface IPermissionProps extends Document {
  name: string;
  status: boolean;
  displayOrder?: number;
  createdAt: Date;
  updatedAt: Date;
}

const spatiePermissionSchema = new Schema<IPermissionProps>({
  name: { type: String, required: true, trim: true },
  status: { type: Boolean, required: true },
  displayOrder: { type: Number, required: false, },
}, { timestamps: true });

spatiePermissionSchema.virtual("rolesAttached", { ref: "RolePermission", localField: "_id", foreignField: "permission_id" });

spatiePermissionSchema.set("toObject", { virtuals: true });
spatiePermissionSchema.set("toJSON", { virtuals: true });

export default mongoose.models.SpatiePermission || mongoose.model<IPermissionProps>("SpatiePermission", spatiePermissionSchema);