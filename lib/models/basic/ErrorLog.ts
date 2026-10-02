import mongoose, { Schema, Document, model } from "mongoose";

export interface ErrorLogDoc extends Document {
  message: string;
  stack?: string;
  api?: string;
  function?: string;
  module?: string;
  payload?: any;
  user_id?: mongoose.Types.ObjectId;
  level?: "ERROR" | "WARN" | "INFO";
  createdAt: Date;
  updatedAt: Date;
}

const ErrorLogSchema = new Schema<ErrorLogDoc>({
    message: { type: String, required: true },
    stack: { type: String },
    api: { type: String },
    function: { type: String },
    module: { type: String },
    payload: { type: Schema.Types.Mixed },
    user_id: { type: Schema.Types.ObjectId, ref: "User" },
    level: { type: String, default: "ERROR" },
  }, { timestamps: true } );

export default mongoose.models?.ErrorLog || model<ErrorLogDoc>("ErrorLog", ErrorLogSchema);