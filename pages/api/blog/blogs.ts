import { isValidObjectId, Types } from 'mongoose';
import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from 'pages/lib/mongodb';
import Blog from 'lib/models/blog/Blog';
import { uploadMedia } from '../basic/media';
import { IncomingForm, Fields, Files } from 'formidable';
import fs from 'fs';
import path from 'path';
import { upsertMeta } from '../basic/meta';
import BlogBlogmeta from 'lib/models/blog/BlogBlogmeta';
import { generateSitemap, log, pivotEntry } from '../utils';
import Blogmeta from 'lib/models/blog/Blogmeta';
import { slugify } from '@amitkk/basic/utils/utils';

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

    // || !data?.status

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

type HandlerMap = {
  [key: string]: (req: NextApiRequest, res: NextApiResponse) => Promise<void>;
};

export const config = {
  api: {
    bodyParser: false,
  },
};

interface ExtendedRequest extends NextApiRequest {
  file?: File;
  files?: { [key: string]: File | File[] };
}

const functions: HandlerMap = {
  get_blogs: get_blogs,
  get_all_blogs: get_all_blogs,
  get_single_blog: get_single_blog,
  create_update_blog: create_update_blog,
  get_single_blog_by_url: get_single_blog_by_url,
  get_blogs_module: get_blogs_module,
  get_single_blog_module: get_single_blog_module,
  get_single_blog_sidebar: get_single_blog_sidebar,
};

const tmpDir = path.join(process.cwd(), 'tmp');
if (!fs.existsSync(tmpDir)) { fs.mkdirSync(tmpDir); }

function normalizeFormFields(fields: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const key in fields) {
    const value = fields[key];
    const v = Array.isArray(value) && value.length === 1 ? value[0] : value;
    result[key] = v === 'null' || v === '' ? undefined : v;
  }
  return result;
}

export const parseForm = async ( req: NextApiRequest ): Promise<{ fields: Fields; files: Files }> => {
  return new Promise((resolve, reject) => {
    const form = new IncomingForm({
      uploadDir: tmpDir,
      keepExtensions: true,
      multiples: true,
    });

    form.parse(req, (err: Error | null, fields: Fields, files: Files) => {
      if (err) {
        reject(err);
      } else {
        resolve({ fields, files });
      }
    });
  });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    let fnName: string;
    let body: any = req.body;
    let files: any = null;

    if (req.method === 'POST') {
      const parsed = await parseForm(req);
      body = normalizeFormFields(parsed.fields);
      files = parsed.files;
      fnName = body.function;
    } else {
      fnName = req.method === 'GET' ? (req.query.function as string) : req.body.function;
    }

    if (!fnName || typeof fnName !== 'string') {
      return res.status(400).json({ message: 'Missing or invalid function name' });
    }    

    const targetFn = functions[fnName];
    if (!targetFn) {
      return res.status(400).json({ message: `Invalid function name: ${fnName}` });
    }

    await connectDB();

    req.body = body;
    if (files) (req as any).files = files;
    await targetFn(req, res);
  } catch (error) { return log(error); }
}