import mongoose, { Schema, Types } from "mongoose";

export interface ExcelUploadDoc {
  _id: Types.ObjectId;
  module: string;
  batch_no: string;
  status: "Pending" | "Pre-Processing" | "Completed";
  total_rows: number;
  success_count: number;
  failed_count: number;
  pending_count: number;
  file_path: string;
  createdAt: Date;
  updatedAt: Date;
}

const ExcelUploadSchema = new Schema<ExcelUploadDoc>({
    module: { type: String, required: true },
    batch_no: String,
    status: String,
    total_rows: { type: Number, default: 0 },
    success_count: { type: Number, default: 0 },
    failed_count: { type: Number, default: 0 },
    pending_count: { type: Number, default: 0 },
    file_path: String,
  }, { timestamps: true });

export default mongoose.models.ExcelUpload ||mongoose.model<ExcelUploadDoc>("ExcelUpload", ExcelUploadSchema);