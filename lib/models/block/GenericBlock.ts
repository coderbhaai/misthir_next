import mongoose, { Schema, Document, Types, model } from 'mongoose';
import { auditLoggerPlugin } from 'lib/server/plugins/auditLogger';

export interface GenericBlockDocument extends Document<Types.ObjectId> {
  module: string;
  module_id: mongoose.Types.ObjectId;
  block_id: number;
  heading?: string;
  url?: string;
  status: boolean;
  displayOrder?: number;
  media_id?: Types.ObjectId;
  mobile_media_id?: Types.ObjectId;
  content?: string;
  createdAt: Date;
  updatedAt: Date;
}

const GenericBlockSchema = new Schema<GenericBlockDocument>({
  module: { type: String, required: true },
  module_id: { type: Schema.Types.ObjectId, required: true, refPath: "module" },
  block_id: { type: Number, required: true },
  heading: { type: String, translatable: true },
  url: { type: String, },
  status: { type: Boolean, default: true },
  displayOrder: { type: Number, },
  media_id: { type: Schema.Types.ObjectId, ref: 'Media' },
  mobile_media_id: { type: Schema.Types.ObjectId, ref: 'Media' },
  content: { type: String, translatable: true },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

GenericBlockSchema.plugin(auditLoggerPlugin);

export default mongoose.models?.GenericBlock || model<GenericBlockDocument>('GenericBlock', GenericBlockSchema);