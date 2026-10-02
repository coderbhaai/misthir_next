import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface KeywordEntryDoc{
  _id: Types.ObjectId;
  keyword: string;
  primary: boolean;
}

export interface KeywordDoc extends Document<Types.ObjectId> {
  _id: Types.ObjectId;
  module: string;
  module_id: mongoose.Types.ObjectId;
  keyword: string;
  primary: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const KeywordSchema = new Schema<KeywordDoc>({
    module: { type: String, required: true },
    module_id: { type: Schema.Types.ObjectId, required: true },
    keyword: { type: String, required: true },
    primary: { type: Boolean, required: true },
  },{ timestamps: true }
);

export default mongoose.models.Keyword || mongoose.model<KeywordDoc>('Keyword', KeywordSchema);