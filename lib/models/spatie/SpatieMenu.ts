import mongoose, { Schema, Document } from "mongoose";

export interface IMenuProps extends Document {
  name: string;
  status: boolean;
  displayOrder?: number;
  media_id?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const spatieMenuSchema = new Schema<IMenuProps>({
  name: { type: String, required: true, trim: true },
  status: { type: Boolean, required: true },
  displayOrder: { type: Number, required: false },
  media_id: { type: Schema.Types.ObjectId, ref: 'Media' },
}, { timestamps: true });

spatieMenuSchema.virtual("submenusAttached", { ref: "MenuSubmenu", localField: "_id", foreignField: "menu_id" });

spatieMenuSchema.set("toObject", { virtuals: true });
spatieMenuSchema.set("toJSON", { virtuals: true });

export default mongoose.models.SpatieMenu || mongoose.model<IMenuProps>("SpatieMenu", spatieMenuSchema);