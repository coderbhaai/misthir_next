import { IPermissionProps } from 'lib/models/spatie/SpatiePermission';
import { IRoleProps } from 'lib/models/spatie/SpatieRole';
import mongoose, { Schema, Types, Document } from 'mongoose';

export interface IUserProps extends Document {
  name?: string;
  email?: string;
  password?: string;
  phone: string;
  status: boolean,
  roles: Types.ObjectId[] | IRoleProps[];
  permissions: Types.ObjectId[] | IPermissionProps[];
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUserProps>({
    name: { type: String, required: false },
    email: { type: String, required: false },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: false },
    status: { type: Boolean, default: true },
  }, { timestamps: true }
);

userSchema.virtual("rolesAttached", { ref: "UserRole", localField: "_id", foreignField: "user_id" });
userSchema.virtual("permissionsAttached", { ref: "UserPermission", localField: "_id", foreignField: "user_id" });

userSchema.set("toObject", { virtuals: true });
userSchema.set("toJSON", { virtuals: true });

export default mongoose.models.User || mongoose.model<IUserProps>("User", userSchema);
