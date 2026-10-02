import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface ActionDoc extends Document<Types.ObjectId> {
  _id: Types.ObjectId;
  module: string;
  module_id: mongoose.Types.ObjectId;
  status: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ActionSchema = new Schema<ActionDoc>({
    module: { type: String, required: true },
    module_id: { type: Schema.Types.ObjectId, required: true },
    status: { type: Boolean, required: true },
  },{ timestamps: true }
);

export default mongoose.models?.Action || mongoose.model<ActionDoc>('Action', ActionSchema);