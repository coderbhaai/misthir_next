import mongoose, { Schema, Document, Types } from "mongoose";

export interface MetaTempDoc extends Document<Types.ObjectId> {
  excelUpload_id: Types.ObjectId;
  status: string;
  message: string;

  url?: string;
  title?: string;
  description?: string;
  focus_keyword?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MetaTempSchema = new Schema<MetaTempDoc>({
  excelUpload_id: { type: Schema.Types.ObjectId, ref: "ExcelUpload" },
  status: { type: String, default: "New" },
  message: { type: String, default: "" },

  url: { type: String, required: false },
  title: { type: String, required: false },
  description: { type: String, required: false },
  focus_keyword: { type: String, required: false },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

export default mongoose.models.MetaTemp || mongoose.model<MetaTempDoc>("MetaTemp", MetaTempSchema);