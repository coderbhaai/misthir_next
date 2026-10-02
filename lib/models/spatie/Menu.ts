import mongoose, { Schema, Types, Document } from "mongoose";

export interface IMenu extends Document<Types.ObjectId> {
  name: string;
  url?: string;
  parent_id?: Types.ObjectId | null;
  path: string;
  depth: number;
  displayOrder?: number;
  status: boolean;
  permission_id?: Types.ObjectId;
  media_id?: Types.ObjectId;
}

const MenuSchema = new Schema<IMenu>({
    name: { type: String, required: true, translatable: true },
    url: { type: String },
    parent_id: { type: Schema.Types.ObjectId, ref: "Menu", default: null },
    path: { type: String, index: true },
    depth: { type: Number, index: true },
    displayOrder: { type: Number },
    status: { type: Boolean, default: true },
    permission_id: { type: Schema.Types.ObjectId, ref: "SpatiePermission" },
    media_id: { type: Schema.Types.ObjectId, ref: "Media" },
  }, { timestamps: true }
);

MenuSchema.index({ path: 1, displayOrder: 1 });

export default mongoose.models?.Menu || mongoose.model<IMenu>("Menu", MenuSchema);
