import mongoose, { Schema, Document, Types } from 'mongoose';

export interface SeoMetaDoc {
  title?: string;
  description?: string;
  robots?: string;
  canonical?: string;
  ogType?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
}

export interface UrlRegistryDoc extends Omit<Document<Types.ObjectId>, 'schema'> {
  name: string;
  url: string;
  module: string;
  module_id: Types.ObjectId;
  seo?: SeoMetaDoc;
  schema?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const UrlRegistrySchema = new Schema<UrlRegistryDoc>({
  name: { type: String, required: true, translatable: true },
  url: { type: String, required: true },
  module: { type: String, required: true },
  module_id: { type: Schema.Types.ObjectId, required: true, refPath: "module" },
  seo: {
    title: { type: String },
    description: { type: String },
    robots: { type: String, default: "index,follow" },
    canonical: { type: String },
    ogType: { type: String, default: "website" },
    ogTitle: { type: String },
    ogDescription: { type: String },
    ogImage: { type: String },
    twitterCard: { type: String, default: "summary_large_image" },
    twitterTitle: { type: String },
    twitterDescription: { type: String },
    twitterImage: { type: String },
  },
  schema: { type: Schema.Types.Mixed, default: null },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

UrlRegistrySchema.index({ module: 1, module_id: 1 }, { unique: true });

export default mongoose.models?.UrlRegistry || mongoose.model<UrlRegistryDoc>('UrlRegistry', UrlRegistrySchema);