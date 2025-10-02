import { Schema, model, models, Document } from "mongoose";

interface MetaDoc extends Document<Types.ObjectId> {
  url: string;
  title: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const metaSchema = new Schema<MetaDoc>({
  url: { type: String, required: true },
  title: String,
  description: String,
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

export default models.Meta || model<MetaDoc>("Meta", metaSchema);