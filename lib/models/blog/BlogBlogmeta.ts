import mongoose, { Schema } from 'mongoose';

const blogBlogmetaSchema = new Schema({
  blog_id: { type: Schema.Types.ObjectId, ref: 'Blog', required: true },
  blogmeta_id: { type: Schema.Types.ObjectId, ref: 'Blogmeta', required: true },
  createdAt: { type: Date, default: Date.now },
});

blogBlogmetaSchema.index({ blog_id: 1, blogmeta_id: 1 }, { unique: true });

export default mongoose.models.BlogBlogmeta || mongoose.model('BlogBlogmeta', blogBlogmetaSchema);