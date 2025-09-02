import mongoose, { Schema, Document, Types } from "mongoose";

export interface ICloudflare {
  id: string;
  filename: string;
  metadata?: {
    name?: string;
    alt?: string;
    pathType?: string;
  };
  variants?: string[];
  uploaded?: Date;
}

export interface IMedia extends Document {
  _id: Types.ObjectId;
  user_id?: Types.ObjectId;
  alt?: string;
  path?: string;
  cloudflare?: ICloudflare;
  createdAt: Date;
  updatedAt: Date;
}

const cloudflareSchema = new Schema<ICloudflare>({
    id: { type: String, required: true },
    filename: { type: String, required: true },
    metadata: {
      name: { type: String },
      alt: { type: String },
      pathType: { type: String },
    },
    variants: [{ type: String }],
    uploaded: { type: Date, default: Date.now },
  }, { _id: false }
);

const mediaSchema = new Schema<IMedia>({
    user_id: { type: Schema.Types.ObjectId, ref: "User" },
    alt: { type: String },
    path: { type: String },
    cloudflare: { type: cloudflareSchema },
  }, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);  

export default mongoose.models.Media || mongoose.model<IMedia>("Media", mediaSchema);