import { Schema, model, models, Document, Types } from "mongoose";

interface PageDoc extends Document {
  module: string;
  name: string;
  url: string;
  media_id?: Types.ObjectId;
  meta_id?: Types.ObjectId;
  content?: string;
  status: boolean;
  displayOrder?: number;
  schema_status?: boolean;
  sitemap?: boolean;
  createdAt: Date;
  details?: Types.ObjectId;
}

const pageSchema = new Schema<PageDoc>(
  {
    module: String,
    name: String,
    url: String,
    media_id: { type: Schema.Types.ObjectId, ref: "Media" },
    meta_id: { type: Schema.Types.ObjectId, ref: "Meta" },
    content: String,
    status: { type: Boolean, default: true },
    displayOrder: Number,
    schema_status: { type: Boolean, default: false },
    sitemap: { type: Boolean, default: true },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

pageSchema.virtual("details", { ref: "PageDetail", localField: "_id", foreignField: "page_id", justOne: true });

export default models.Page || model<PageDoc>("Page", pageSchema);