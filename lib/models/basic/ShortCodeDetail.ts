import mongoose, { Schema, Types, Document, model } from "mongoose";

export interface ShortCodeDetailDoc extends Document<Types.ObjectId> {
  shortCode_id: mongoose.Types.ObjectId;
  module: string;
  module_id: mongoose.Types.ObjectId;
}

const ShortCodeDetailSchema = new Schema<ShortCodeDetailDoc>({
    shortCode_id: { type: Schema.Types.ObjectId, required: true, ref: "ShortCode" },
    module: { type: String, required: true },
    module_id: { type: Schema.Types.ObjectId, required: true, refPath: "module" },
  }, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

ShortCodeDetailSchema.virtual("module_data", {
  ref: (doc: any) => doc.module,
  localField: "module_id",
  foreignField: "_id",
  justOne: true,
});

ShortCodeDetailSchema.index( { shortCode_id: 1, displayOrder: 1 } );
export default mongoose.models.ShortCodeDetail || model<ShortCodeDetailDoc>("ShortCodeDetail", ShortCodeDetailSchema);