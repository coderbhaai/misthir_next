import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface ActionProps extends Document<Types.ObjectId> {
  _id: Types.ObjectId;
  module: string;
  module_id: mongoose.Types.ObjectId;
  status: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ActionSchema = new Schema<ActionProps>({
    module: { type: String, required: true },
    module_id: { type: Schema.Types.ObjectId, required: true },
    status: { type: Boolean, required: true },
  },{ timestamps: true }
);

export const Action: Model<ActionProps> = mongoose.models.Action || mongoose.model("Action", ActionSchema);