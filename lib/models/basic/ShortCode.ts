import mongoose, { Schema, Types, Document, model } from "mongoose";
import { auditLoggerPlugin } from 'lib/server/plugins/auditLogger';
import { ShortCodeDetailDoc } from "./ShortCodeDetail";

interface ShortCodeDoc extends Document<Types.ObjectId> {
  _id: Types.ObjectId;
  call_id: number;
  module: string;
  status: boolean;
  details?: ShortCodeDetailDoc[];
}

const ShortCodeSchema = new Schema<ShortCodeDoc>({
    module: { type: String, required: true },
    status: { type: Boolean, default: true },
    call_id: { type: Number, required: true },
  }, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

ShortCodeSchema.virtual("details", { ref: "ShortCodeDetail", localField: "_id", foreignField: "shortCode_id", justOne: false });

ShortCodeSchema.plugin(auditLoggerPlugin);

export default mongoose.models.ShortCode || model<ShortCodeDoc>("ShortCode", ShortCodeSchema);
