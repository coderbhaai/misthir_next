import mongoose, { Document, Schema, Types } from "mongoose";

export interface IMediaHubProps extends Document {
  module: string;
  module_id: Types.ObjectId | string;
  media_id: Types.ObjectId;
  primary: boolean;
  status: boolean;
  displayOrder?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const mediaHubSchema = new Schema<IMediaHubProps>({
    module: { type: String, enum: ["Blog", "Destination", "Product", "Page"], required: true },
    module_id: { type: Schema.Types.ObjectId, required: true, refPath: "module" },
    media_id: { type: Schema.Types.ObjectId, ref: 'Media' },
    primary: { type: Boolean, required: true, default: false },
    status: { type: Boolean, required: true, default: true },
    displayOrder: { type: Number, required: false, },
  }, { timestamps: true, toObject: { virtuals: true }, toJSON: { virtuals: true } }
);

export default mongoose.models.MediaHub || mongoose.model<IMediaHubProps>("MediaHub", mediaHubSchema);
