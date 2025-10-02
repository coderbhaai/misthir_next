import mongoose, { Schema, Document } from "mongoose";

export interface ISubmenuProps extends Document<Types.ObjectId> {
  name: string;
  url: string;
  status: boolean;
  displayOrder?: number;
  permission_id?: Types.ObjectId;
  media_id?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const spatieSubmenuSchema = new Schema<ISubmenuProps>({
  name: { type: String, required: true, trim: true },
  url: { type: String, required: true, trim: true },
  status: { type: Boolean, required: true },
  displayOrder: { type: Number, required: false },
  media_id: { type: Schema.Types.ObjectId, ref: 'Media' },
  permission_id: { type: Schema.Types.ObjectId, ref: "SpatiePermission", required: false },
}, { timestamps: true });

spatieSubmenuSchema.virtual("permissionAttached", { ref: "SpatiePermission", localField: "permission_id", foreignField: "_id", justOne: true });
spatieSubmenuSchema.virtual("menusAttached", { ref: "MenuSubmenu", localField: "_id", foreignField: "submenu_id" });

spatieSubmenuSchema.set("toObject", { virtuals: true });
spatieSubmenuSchema.set("toJSON", { virtuals: true });

export default mongoose.models.SpatieSubmenu || mongoose.model<ISubmenuProps>("SpatieSubmenu", spatieSubmenuSchema);