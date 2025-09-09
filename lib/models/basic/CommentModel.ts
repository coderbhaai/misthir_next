import mongoose, { Document, Schema, Types } from "mongoose";

export interface ICommentProps extends Document {
  module: "Blog" | "Product";
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

const commentModelSchema = new Schema<ICommentProps>({
    module: { type: String, enum: ["Blog", "Product"], required: true },
    module_id: { type: Schema.Types.ObjectId, required: true, refPath: "module" },
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, },
    email: { type: String, required: true, },
    content: { type: String, required: true, },
    status: { type: Boolean, required: true, default: true,},
    displayOrder: { type: Number, required: false, },
  }, { timestamps: true, toObject: { virtuals: true }, toJSON: { virtuals: true } }
);

export default mongoose.models.CommentModel || mongoose.model<ICommentProps>("CommentModel", commentModelSchema);
