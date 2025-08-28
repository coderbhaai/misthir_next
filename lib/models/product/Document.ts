import mongoose, { Schema, Types, Document, model } from "mongoose";

interface DocumentDoc extends Document {
  user_id?: Types.ObjectId;
  name: string;
  media_id?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  products?: { product_id: Types.ObjectId }[];
}

const documentSchema = new Schema<DocumentDoc>({
    user_id: { type: Schema.Types.ObjectId, ref: "User" },
    name: { type: String, required: true },
    media_id: { type: Schema.Types.ObjectId, ref: "Media" },
  }, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

export default mongoose.models.Document || model<DocumentDoc>("Document", documentSchema);