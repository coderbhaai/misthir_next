import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAuditLog extends Document {
  module: string;
  module_id: mongoose.Types.ObjectId;
  user_id?: mongoose.Types.ObjectId;
  changes: {
    field_name: string;
    old_value: any;
    new_value: any;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>({
    module: { type: String, required: true },
    module_id: { type: Schema.Types.ObjectId, required: true },
    user_id: { type: Schema.Types.ObjectId, ref: "User", default: null },
    changes: [
      {
        field_name: String,
        old_value: Schema.Types.Mixed,
        new_value: Schema.Types.Mixed,
      },
    ],
  },{ timestamps: true }
);

export const AuditLog: Model<IAuditLog> = mongoose.models.AuditLog || mongoose.model("AuditLog", AuditLogSchema);
