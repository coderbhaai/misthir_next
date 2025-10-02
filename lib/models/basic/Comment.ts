import mongoose, { Document, Schema, Types, Model } from "mongoose";

export interface ICommentModelProps extends Document<Types.ObjectId> {
  module: "Blog" | "Product" | "Page";
  module_id: string | Types.ObjectId;
  user_id?: string | Types.ObjectId;
  name: string;
  email: string;
  content: string;
  status: boolean;
  displayOrder?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const commentModelSchema = new Schema<ICommentModelProps>({
    module: { type: String, enum: ["Blog", "Product", "Page"], required: true },
    module_id: { type: Schema.Types.ObjectId, required: true, refPath: "module" },
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    content: { type: String, required: true },
    status: { type: Boolean, required: true, default: true },
    displayOrder: { type: Number },
  },
  { timestamps: true, toObject: { virtuals: true }, toJSON: { virtuals: true } }
);

export default mongoose.models.CommentModel || mongoose.model<ICommentModelProps>("CommentModel", commentModelSchema);