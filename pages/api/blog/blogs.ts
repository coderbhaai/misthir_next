import { isValidObjectId, Types } from 'mongoose';
import type { NextApiRequest, NextApiResponse } from 'next';
import Blog from 'lib/models/blog/Blog';
import { uploadMedia } from '../basic/media';
import { generateSitemap, slugify, upsertMeta } from '../basic/meta';
import BlogBlogmeta from 'lib/models/blog/BlogBlogmeta';
import { cleanContent, getRelatedContent, logError, pivotEntry, safeParse } from '../utils';
import Blogmeta from 'lib/models/blog/Blogmeta';
import { createApiHandler, ExtendedRequest } from '../apiHandler';
import { APIHandlers } from '../../../lib/server/middleware';
import Author from 'lib/models/blog/Author';
import { buildFilterQuery } from 'lib/server/plugins/buildFilterQuery';
import { parseShortcodes } from 'pages/api/basic/shortCode/parseShortcodes';
import Product from 'lib/models/product/Product';
import { get_page_entry } from '../basic/page';

export async function get_filtered_blogs(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { filters = {}, page = 0, limit = 10 } = req.body || {};
    const { matchQuery, skip, limit: safeLimit } = buildFilterQuery(filters, { page, limit, defaultLimit: 10, maxLimit: 100, searchableFields: ["name", "url"] });
    const total = await Blog.countDocuments(matchQuery);

    const data = await Blog.find(matchQuery).populate([
      { path: 'media_id' },
      { path: 'meta_id' },
      { path: 'author_id' },
      { path: 'metas', populate: { path: 'blogmeta_id', model: 'Blogmeta', select: '_id type name url' }},
    ]).skip(skip).limit(safeLimit).sort({ createdAt: -1 });
    return res.status(200).json({ message: 'Fetched all Authors', data, pagination: { total, page, limit: safeLimit, pages: Math.ceil(total / safeLimit) } });
  } catch (error) { await logError(error, { function: "get_filtered_blogs", payload: req.body }); }
}

export async function get_single_blog(req: NextApiRequest, res: NextApiResponse){
  try{
    const id = (req.method === "GET" ? req.query.id : req.body.id) as string;
    if (!id || !Types.ObjectId.isValid(id)) { return res.status(400).json({ message: 'Invalid or missing ID' }); }
  
    const data = await Blog.findById(id).populate([ 
      { path: 'media_id' },
      { path: 'meta_id' },
      { path: 'author_id' },
      { path: 'metas', populate: { path: 'blogmeta_id', model: 'Blogmeta', select: '_id type name url' }}
    ]).exec();  
    if (!data) { return res.status(404).json({ message: `Blog meta with ID ${id} not found` }); }
  
    return res.status(200).json({ message: 'Fetched Single Blog', data });
  }catch (error) { await logError(error, { function: "get_single_blog", payload: req.body }); }
};

export async function create_update_blog(req: ExtendedRequest, res: NextApiResponse) {
  try {
    const data = req.body;
    const modelId = typeof data._id === 'string' || data._id instanceof Types.ObjectId ? data._id : null;

    const slug = await slugify(data.url, Blog, modelId);

    let media_id: string | null = null;
    if (data.media_id && isValidObjectId(data.media_id)) { media_id = data.media_id; }
    const file = Array.isArray(req.files?.image) ? req.files.image[0] : req.files?.image;
    
    if (file) {
      media_id = await uploadMedia({ file, name: data.name, pathType: data.path, media_id: data.media_id ?? null, user_id: null });
    }    

    let meta_id: string | null = null;
    meta_id = await upsertMeta({ meta_id: data.meta_id ?? null, url: slug, title: data.title, description: data.description });

    const blogMetaIds = safeParse(req.body.blogmeta || '[]');
    const destinationIds = safeParse(req.body.destination || '[]');

    if (modelId && isValidObjectId(modelId)) {
      try {
        const updated = await Blog.findByIdAndUpdate(modelId, {
            name: data.name,
            url: slug,
            meta_id: meta_id,
            status: data.status,
            media_id: media_id ?? undefined,
            author_id: data.author_id ?? undefined,
            content: cleanContent(data.content),
            updatedAt: new Date(),
          }, { new: true });

        await pivotEntry( BlogBlogmeta, updated._id, blogMetaIds, 'blog_id', 'blogmeta_id' );
        await generateSitemap();

        if (!updated) { return res.status(404).json({ message: '❌ Entry not found for update' }); }
        return res.status(200).json({ message: '✅ Entry updated successfully', data: updated });
      } catch (error) { await logError(error, { function: "create_update_blog", payload: req.body }); }
    }
    
    const newEntry = new Blog({
      name: data.name,
      url: slug,
      meta_id: meta_id,
      status: data.status ?? true,
      media_id: media_id ?? undefined,
      author_id: data.author_id ?? undefined,
      content: cleanContent(data.content),
    });

    await newEntry.save();

    await pivotEntry( BlogBlogmeta, newEntry._id, blogMetaIds, 'blog_id', 'blogmeta_id' );
    await generateSitemap();
    
    return res.status(201).json({ message: 'Entry created successfully', data: newEntry });
  } catch (error) { await logError(error, { function: "create_update_blog", payload: req.body }); }
}

export async function get_blogs(req: NextApiRequest, res: NextApiResponse) {
  try {
    const limit = parseInt((req.query.limit as string) || "10");
    const pageRow = parseInt((req.query.pageRow as string) || "1");
    const skip = (pageRow - 1) * limit;
    const [data, total] = await Promise.all([
      Blog.find({ status: true, media_id: { $exists: true, $ne: null } }).skip(skip).limit(limit).sort({ createdAt: -1, _id: 1 })
        .populate([
          { path: "media_id" },
          { path: "author_id" },
          { path: "metas", populate: { path: "blogmeta_id", model: "Blogmeta", select: "_id type name url", }, },
        ]).lean(),
      Blog.countDocuments(),
    ]);

    const pageData = await get_page_entry("blogs");
    return res.status(200).json({ message: "Fetched Blogs", data, page: pageData, total, hasMore: skip + data.length < total, });
  } catch (error) {
    await logError(error, { function: "get_blogs", payload: req.query });
  }
}

export async function get_single_blog_by_url(req: NextApiRequest, res: NextApiResponse){
  try{
    const url = (req.method === "GET" ? req.query.url : req.body.url) as string;
    if ( !url ) { return res.status(400).json({ message: 'Invalid or missing URL' }); }  
  
    const data = await Blog.findOne({ url }).populate([ 
      { path: 'media_id' }, 
      { path: 'meta_id' }, 
      { path: 'author_id', populate: { path: 'media_id', model: 'Media' } }, 
      { path: 'metas', populate: { path: 'blogmeta_id', model: 'Blogmeta', select: '_id type name url' } }
    ]).exec();
    
    if (!data) { return res.status(404).json({ message: `Blog with URL ${url} not found` }); }

    if (data.content) { data.content = await parseShortcodes(data.content); }
    const relatedContent = await getRelatedContent({ module: "Blog", moduleId: data._id.toString() });
    return res.status(200).json({ message: 'Fetched Single Blog', data, relatedContent });
  }catch (error) { await logError(error, { function: "get_single_blog_by_url", payload: req.body }); }
};

export async function get_blogs_by_meta(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { meta_type, meta_url } = req.query;
    if (!meta_type || !meta_url) { return res.status(400).json({ message: "Missing meta_type or meta_url" }); }

    const blogmeta = await Blogmeta.findOne({ type: meta_type, url: meta_url, status: true }).populate([ { path: 'meta_id' } ]);
    if (!blogmeta) { return res.status(200).json({ message: "No meta found", data: [] }); }

    const attached = await BlogBlogmeta.find({ blogmeta_id: blogmeta._id }).select("blog_id");
    if (!attached.length) { return res.status(200).json({ message: "No blogs found", data: [] }); }

    const blogIds = attached.map((b: { blog_id: any; }) => b.blog_id);

    const data = await Blog.find({ _id: { $in: blogIds }, status: true }).populate([ { path: "media_id" }, { path: "metas", populate: { path: "blogmeta_id", model: "Blogmeta", select: "_id type name url" } }, ]).sort({ createdAt: -1 });
    
    return res.status(200).json({ message: `Fetched blogs for ${meta_type}: ${meta_url}`, data, blogmeta });
  } catch (error) { await logError(error, { function: "get_blogs_by_meta", payload: req.body }); return res.status(500).json({ message: "Server error", error: (error as Error).message });
  }
}

export async function get_options_for_blog(req: NextApiRequest, res: NextApiResponse) {
  try {
    const [categories, tags, authors, products] = await Promise.all([
      Blogmeta.find({ type: "category" }).select("_id name").exec(),
      Blogmeta.find({ type: "tag" }).select("_id name").exec(),
      Author.find().select("_id name").exec(),
      Product.find().select("_id name").exec(),
    ]);

    return res.status(200).json({ message: "Fetched all blog options", data: { categories, tags, authors, products } });
  } catch (error) { await logError(error, { function: "get_options_for_blog", payload: req.body }); }
}

export const functions: APIHandlers = {
  get_blogs : { middlewares: [ "allowCrossOrigin" ] },
  get_filtered_blogs : { middlewares: [ "checkUserId", "checkPostMethod" ], url: "/admin/blogs" },
  get_single_blog : { middlewares: [ "checkUserId", ] },
  create_update_blog : { middlewares: [ "checkUserId", "checkPostMethod", { name: "validateInput", options: { requiredFields: [ "name", "url", "status" ] }} ], url: "/admin/blogs" },
  get_single_blog_by_url : { middlewares: [ "allowCrossOrigin" ] },
  get_blogs_by_meta : { middlewares: [ "allowCrossOrigin" ] },
  get_options_for_blog : { middlewares: [ "checkUserId", ] },
}

export const blogHandlers = {
  get_blogs,
  get_filtered_blogs,
  get_single_blog,
  create_update_blog,
  get_single_blog_by_url,
  get_blogs_by_meta,
  get_options_for_blog,
};

export const config = { api: { bodyParser: false } };
export default createApiHandler(functions, blogHandlers);