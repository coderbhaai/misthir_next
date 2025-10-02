import mongoose, { Schema, Document, Types, model } from 'mongoose';

interface BlogmetaReference {
  blogmeta_id: {
    _id: Types.ObjectId;
    name: string;
    url: string;
  };
}

export interface BlogDocument extends Document<Types.ObjectId> {
  name: string;
  url: string;
  status: boolean;
  displayOrder?: number;
  media_id?: Types.ObjectId;
  author_id?: Types.ObjectId;
  meta_id?: Types.ObjectId;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  metas?: BlogmetaReference[];
  blogmetas?: { _id: Types.ObjectId; name: string; url: string }[]; 
}

const blogSchema = new Schema<BlogDocument>({
  name: { type: String, required: true },
  url: { type: String, required: true, unique: true },
  status: { type: Boolean, default: true },
  displayOrder: { type: Number, required: false, },
  media_id: { type: Schema.Types.ObjectId, ref: 'Media' },
  author_id: { type: Schema.Types.ObjectId, ref: 'Author' },
  meta_id: { type: Schema.Types.ObjectId, ref: 'Meta' },
  content: { type: String },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

blogSchema.virtual('metas', { ref: 'BlogBlogmeta', localField: '_id', foreignField: 'blog_id', justOne: false });

blogSchema.virtual('blogmetas').get(function (this: BlogDocument) {
  if (!this.metas || !Array.isArray(this.metas)) return [];
  return this.metas
   ?.map((meta) => {
      if (!meta.blogmeta_id) return null;
      const { _id, name, url } = meta.blogmeta_id;
      return { _id, name, url };
    })
    .filter(Boolean);
});

export default mongoose.models.Blog || model<BlogDocument>('Blog', blogSchema);