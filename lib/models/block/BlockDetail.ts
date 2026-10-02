import mongoose, { Schema, Document, Types, model } from 'mongoose';
import { auditLoggerPlugin } from 'lib/server/plugins/auditLogger';

export interface BlockDetailDocument extends Document<Types.ObjectId> {
  module: string;
  module_id: mongoose.Types.ObjectId;
  block_id: number;
  media_id?: Types.ObjectId;
  mobile_media_id?: Types.ObjectId;
  heading?: string;
  url?: string;
  bg_colour?: string;
  status: boolean;
  content_1?: string;
  content_2?: string;
  content_3?: string;
  createdAt: Date;
  updatedAt: Date;
}

const blockDetailSchema = new Schema<BlockDetailDocument>({
  module: { type: String, required: true },
  module_id: { type: Schema.Types.ObjectId, required: true, refPath: "module" },
  block_id: { type: Number, required: true },
  media_id: { type: Schema.Types.ObjectId, ref: 'Media' },
  mobile_media_id: { type: Schema.Types.ObjectId, ref: 'Media' },
  heading: { type: String, translatable: true },
  url: { type: String, },
  bg_colour: { type: String, },
  status: { type: Boolean, default: true },
  content_1: { type: String, translatable: true },
  content_2: { type: String, translatable: true },
  content_3: { type: String, translatable: true },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

blockDetailSchema.plugin(auditLoggerPlugin);

export default mongoose.models?.BlockDetail || model<BlockDetailDocument>('BlockDetail', blockDetailSchema);