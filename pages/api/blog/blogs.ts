import { isValidObjectId, Types } from 'mongoose';
import type { NextApiRequest, NextApiResponse } from 'next';
import Blog from 'lib/models/blog/Blog';
import { uploadMedia } from '../basic/media';
import { upsertMeta } from '../basic/meta';
import BlogBlogmeta from 'lib/models/blog/BlogBlogmeta';
import { generateSitemap, log, pivotEntry } from '../utils';
import Blogmeta from 'lib/models/blog/Blogmeta';
import { slugify } from '@amitkk/basic/utils/utils';
import { createApiHandler, ExtendedRequest } from '../apiHandler';

export async function get_all_blogs(req: NextApiRequest, res: NextApiResponse) {
  try {
    const data = await Blog.find().populate([ { path: 'media_id' }, { path: 'meta_id' }, { path: 'author_id' }, { path: 'metas', populate: { path: 'blogmeta_id', model: 'Blogmeta', select: '_id type name url' } } ]).exec();
    return res.status(200).json({ message: 'Fetched all Authors', data });
  } catch (error) { return log(error); }
}

export async function get_single_blog(req: NextApiRequest, res: NextApiResponse){
  try{
    const id = (req.method === 'GET' ? req.query.id : req.body.id) as string;
  
    if (!id || !Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid or missing ID' });
    }
  
    const data = await Blog.findById(id).populate([ { path: 'media_id' }, { path: 'meta_id' }, { path: 'author_id' }, { path: 'metas', populate: { path: 'blogmeta_id', model: 'Blogmeta', select: '_id type name url' } } ]).exec();
  
    if (!data) { return res.status(404).json({ message: `Blog meta with ID ${id} not found` }); }
    return res.status(200).json({ message: 'Fetched Single Blog', data });
  }catch (error) { return log(error); }
};

export async function create_update_blog(req: ExtendedRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const data = req.body;

    if (!data?.name ) {
      return res.status(400).json({ message: 'Required fields missing' });
    }

    const modelId = typeof data._id === 'string' || data._id instanceof Types.ObjectId ? data._id : null;

    const slug = await slugify(data.url, Blog, modelId);

    let media_id: string | null = null;
    if (data.media_id && isValidObjectId(data.media_id)) { media_id = data.media_id; }
    const file = Array.isArray(req.files?.image) ? req.files.image[0] : req.files?.image;
    
    if (file) {
      media_id = await uploadMedia({ file, name: data.name, pathType: data.path, media_id: data.media_id ?? null, user_id: null });
    }    

    let meta_id: string | null = null;
    meta_id = await upsertMeta({ meta_id: data.selected_meta_id ?? null, url: data.url, title: data.title, description: data.description });

    if (modelId && isValidObjectId(modelId)) {
      try {
        const updated = await Blog.findByIdAndUpdate(
          modelId,
          {
            name: data.name,
            url: slug,
            meta_id: meta_id,
            status: data.status,
            media_id: media_id ?? undefined,
            author_id: data.author_id ?? undefined,
            content: data.content,
            updatedAt: new Date(),
          },
          { new: true }
        );

        generateSitemap();

        if (updated) {
          return res.status(200).json({ message: 'Entry updated successfully', data: updated });
        } else {
          return res.status(404).json({ message: 'Entry not found for update' });
        }
      } catch (error) { log(error); }
    }
    
    const newEntry = new Blog({
      name: data.name,
      url: slug,
      meta_id: meta_id,
      status: data.status ?? true,
      media_id: media_id ?? undefined,
      author_id: data.author_id ?? undefined,
      content: data.content,
    });

    await newEntry.save();

    const blogMetaIds = JSON.parse(req.body.blogmeta || '[]');
    await pivotEntry( BlogBlogmeta, newEntry._id, blogMetaIds, 'blog_id', 'blogmeta_id' );

    generateSitemap();
    
    return res.status(201).json({ message: 'Entry created successfully', data: newEntry });
  } catch (error) { log(error); }
}

export async function get_blogs(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { skip, limit } = req.body;

    const safeSkip = typeof skip === 'number' && skip >= 0 ? skip : 0;
    const safeLimit = typeof limit === 'number' && limit > 0 ? limit : 10;

    const data = await Blog.find().skip(safeSkip).limit(safeLimit).populate([ { path: 'media_id' }, { path: 'metas', populate: { path: 'blogmeta_id', model: 'Blogmeta', select: '_id type name url' } } ]);

    return res.status(200).json({ message: 'Fetched all Blogs', data });
  } catch (error) { return log(error); }
}

export async function get_single_blog_by_url(req: NextApiRequest, res: NextApiResponse){
  try{
    const url = (req.method === 'GET' ? req.query.slug : req.body.slug) as string;
    if ( !url ) { return res.status(400).json({ message: 'Invalid or missing URL' }); }  
  
    const data = await Blog.findOne({ url }).populate([ { path: 'media_id' }, { path: 'meta_id' }, { path: 'author_id', populate: { path: 'media_id', model: 'Media' } }, { path: 'metas', populate: { path: 'blogmeta_id', model: 'Blogmeta', select: '_id type name url' } } ]).exec();
    if (!data) { return res.status(404).json({ message: `Blog with URL ${url} not found` }); }

    return res.status(200).json({ message: 'Fetched Single Blog', data });
  }catch (error) { return log(error); }
};

export async function get_blogs_module(req: NextApiRequest, res: NextApiResponse) {
  try {
    const data = await Blog.find().select('_id name url');

    return res.status(200).json({ message: 'Fetched all Blogs', data });
  } catch (error) { return log(error); }
}

export async function get_single_blog_module(req: NextApiRequest, res: NextApiResponse) {
  try {
    const id = (req.method === 'GET' ? req.query.id : req.body.id) as string;
  
    if (!id || !Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid or missing ID' });
    }
    
    const data = await Blog.findById(id).select('_id name url');

    return res.status(200).json({ message: 'Fetched all Blogs', data });
  } catch (error) { return log(error); }
}

export async function get_single_blog_sidebar(req: NextApiRequest, res: NextApiResponse) {
  try {
    const id = (req.method === 'GET' ? req.query.id : req.body.id) as string;
    if (!id || !Types.ObjectId.isValid(id)) { return res.status(400).json({ message: 'Invalid or missing ID' }); }  
    
    const blogs     = await Blog.find().limit(6).populate([ { path: 'media_id' } ]);
    // { _id: { $ne: new Types.ObjectId(id) } }
    const category  = await Blogmeta.find({ type: 'category' }).exec();
    const tag       = await Blogmeta.find({ type: 'tag' }).exec();

    return res.status(200).json({ message: 'Fetched all Blogs', data:{ blogs, category, tag } });
  } catch (error) { return log(error); }
}

const functions = {
  get_blogs,
  get_all_blogs,
  get_single_blog,
  create_update_blog,
  get_single_blog_by_url,
  get_blogs_module,
  get_single_blog_module,
  get_single_blog_sidebar,
};

export default createApiHandler(functions);