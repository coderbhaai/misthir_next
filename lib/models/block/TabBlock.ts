import mongoose, { Schema, Document, Types, model } from 'mongoose';
import { auditLoggerPlugin } from 'lib/server/plugins/auditLogger';

export interface TabBlockDocument extends Document<Types.ObjectId> {
  module: string;
  module_id: mongoose.Types.ObjectId;
  menu: string;
  content: string;
  status: boolean;
  displayOrder?: number;
  createdAt: Date;
  updatedAt: Date;
}

const TabBlockSchema = new Schema<TabBlockDocument>({
  module: { type: String, required: true },
  module_id: { type: Schema.Types.ObjectId, required: true, refPath: "module" },
  menu: { type: String, required: true, translatable: true },
  content: { type: String, translatable: true },
  status: { type: Boolean, default: true },
  displayOrder: { type: Number, },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

TabBlockSchema.plugin(auditLoggerPlugin);
export default mongoose.models?.TabBlock || model<TabBlockDocument>('TabBlock', TabBlockSchema);