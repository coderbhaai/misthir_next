import mongoose, { Document, Schema, Types } from "mongoose";

export interface IAchievementDoc extends Document<Types.ObjectId> {
  module: string;
  module_id: mongoose.Types.ObjectId;
  name: string;
  value: number;
  media_id?: Types.ObjectId;
  status: boolean;
  displayOrder?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const achievementSchema = new Schema<IAchievementDoc>({
    module: { type: String, required: true },
    module_id: { type: Schema.Types.ObjectId, required: true, refPath: "module" },
    name: { type: String, required: true, translatable: true },
    value: { type: Number, required: true, },
    media_id: { type: Schema.Types.ObjectId, ref: 'Media' },
    status: { type: Boolean, required: true, default: true },
    displayOrder: { type: Number, required: false, },
  }, { timestamps: true, toObject: { virtuals: true }, toJSON: { virtuals: true } }
);

export default mongoose.models?.Achievement || mongoose.model<IAchievementDoc>("Achievement", achievementSchema);
