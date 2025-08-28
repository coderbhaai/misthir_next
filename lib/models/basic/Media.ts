import mongoose, { Schema } from "mongoose";

const cloudflareSchema = new Schema(
  {
    id: { type: String, required: true },
    filename: { type: String, required: true },
    metadata: {
      name: { type: String },
      alt: { type: String },
      pathType: { type: String },
    },
    variants: [{ type: String }],
    uploaded: { type: Date, default: Date.now },
  },
  { _id: false }
);

const mediaSchema = new Schema({
  alt: { type: String },
  path: { type: String },
  cloudflare: { type: cloudflareSchema },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

export default mongoose.models.Media || mongoose.model("Media", mediaSchema);