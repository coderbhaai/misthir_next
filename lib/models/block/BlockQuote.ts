import mongoose, { Document, Schema, Types } from "mongoose";
import { auditLoggerPlugin } from 'lib/server/plugins/auditLogger';

export interface IBlockQuoteDoc extends Document<Types.ObjectId> {
  module: string;
  module_id: Types.ObjectId;
  media_id?: Types.ObjectId;
  heading: string;
  content?: string;
  bg_colour?: string;
  status: boolean;
  displayOrder?: number;
  createdAt?: Date;
  updatedAt?: Date;
}


const blockQuoteSchema = new Schema<IBlockQuoteDoc>({
    module: { type: String, required: true },
    module_id: { type: Schema.Types.ObjectId, required: true, refPath: "module" },
    media_id: { type: Schema.Types.ObjectId, ref: 'Media' },
    heading: { type: String, required: false, translatable: true },
    content: { type: String, required: false, translatable: true },
    bg_colour: { type: String, required: false },
    status: { type: Boolean, required: true, default: true },
    displayOrder: { type: Number },
  }, { timestamps: true, toObject: { virtuals: true }, toJSON: { virtuals: true } }
);

blockQuoteSchema.plugin(auditLoggerPlugin);

export default mongoose.models?.BlockQuote || mongoose.model<IBlockQuoteDoc>("BlockQuote", blockQuoteSchema);