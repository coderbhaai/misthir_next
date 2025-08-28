import mongoose, { Schema, Types, Document, model } from "mongoose";

interface BlogmetaDoc extends Document {
  type: string;
  name: string;
  url: string;
  status: boolean;
  displayOrder?: number;
  meta_id?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  blogs?: { blog_id: Types.ObjectId }[];
}

const blogmetaSchema = new Schema<BlogmetaDoc>({
    type: { type: String, required: true },
    name: { type: String, required: true },
    url: { type: String, required: true, unique: true },
    status: { type: Boolean, default: true },
    displayOrder: { type: Number, required: false },
    meta_id: { type: Schema.Types.ObjectId, ref: "Meta" },
  }, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

blogmetaSchema.virtual("blogs", { ref: "BlogBlogmeta", localField: "_id", foreignField: "blogmeta_id" });

export default mongoose.models.Blogmeta || model<BlogmetaDoc>("Blogmeta", blogmetaSchema);
