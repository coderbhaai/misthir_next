import mongoose, { Schema, Types } from "mongoose";

export interface IProps extends Document<Types.ObjectId> {
  menu_id: Types.ObjectId;
  submenu_id: Types.ObjectId;
}

const MenuSubmenuSchema = new Schema<IProps>({
  menu_id: { type: Schema.Types.ObjectId, ref: "SpatieMenu", required: true },
  submenu_id: { type: Schema.Types.ObjectId, ref: "SpatieSubmenu", required: true }
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

export default mongoose.models.MenuSubmenu || mongoose.model<IProps>("MenuSubmenu", MenuSubmenuSchema);