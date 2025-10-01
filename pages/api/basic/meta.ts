import mongoose, { isValidObjectId, Types } from 'mongoose';
import type { NextApiRequest, NextApiResponse } from 'next';
import Meta from 'lib/models/basic/Meta';
import { log } from '../utils';
import { clo, slugify } from '@amitkk/basic/utils/utils';
import Blog from 'lib/models/blog/Blog';
import Page from 'lib/models/basic/Page';
import { createApiHandler } from '../apiHandler';
import { APIHandlers } from '../middleware';

type MetaInput = {
  meta_id: mongoose.Types.ObjectId | string | null;
  url: string;
  title: string;
  description: string;
};

async function create_update_meta(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') { return res.status(405).json({ message: 'Method Not Allowed' }); }
  
    const data = req.body;
    if (!data?.title || !data?.description || !data?.url) {
      return res.status(400).json({ message: 'Required fields missing' });
    }

    const modelId = (typeof data._id === 'string' || data._id instanceof Types.ObjectId) ? data._id : null;
    const slug = await slugify(data.url, Meta, modelId);

    if (data._id) {
      const updated = await Meta.findByIdAndUpdate(
        data._id,
        {
          url: slug,
          title: data.title,
          description: data.description,
          updatedAt: new Date(),
        },
        { new: true }
      );

      if (updated) {
        return res.status(200).json({ message: 'Entry updated successfully', data: updated });
      }
    }

    const newEntry = new Meta({
      url: slug,
      title: data.title,
      description: data.description,
    });

    await newEntry.save();

    return res.status(201).json({ message: 'Entry created successfully', data: newEntry });
  } catch (error) { log(error); }
}

export async function upsertMeta({ meta_id, url, title, description }: MetaInput): Promise<string> {
  try {
    if (!url || !title || !description) { throw new Error('URL, title, and description are required'); }
    
    let entry;
    if (meta_id && isValidObjectId(meta_id)) {
      entry = await Meta.findByIdAndUpdate(
        meta_id,
        { url, title, description },
        { new: true, runValidators: true }
      );
    } else {
      entry = await Meta.create({ url, title, description });
    }

    if (!entry) {
      throw new Error('Database operation failed - no entry returned');
    }

    return entry._id.toString();
  } catch (error) { clo(error); return ""; }
};

export async function get_all_meta(req: NextApiRequest, res: NextApiResponse) {
  try {
    const data = await Meta.find().exec();
    return res.status(200).json({ message: 'Fetched all blog meta', data });
  } catch (error) { log(error); }
}

export async function get_single_meta(req: NextApiRequest, res: NextApiResponse){
  const id = (req.method === 'GET' ? req.query.id : req.body.id) as string;

  if (!id || !Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid or missing ID' });
  }

  const entry = await Meta.findById(id).exec();
  if (!entry) { return res.status(404).json({ message: `Meta with ID ${id} not found` }); }

  return res.status(200).json({ message: '✅ Single Entry Fetched', data: entry });
};

export async function get_sitemap_links(req: NextApiRequest, res: NextApiResponse) {
  try {
    const blogs = await Blog.find().select('_id name url');
    const pages = await Page.find().select('_id name url');
    return res.status(200).json({ message: 'Fetched all Sitemap Links', data:{ blogs, pages } });
  } catch (error) { log(error); }
}

export const functions: APIHandlers = {
  create_update_meta : { middlewares: [] },
  get_all_meta : { middlewares: [] },
  get_single_meta : { middlewares: [] },
  get_sitemap_links : { middlewares: [] },
}

export const metaHandlers = {
  create_update_meta,
  get_all_meta,
  get_single_meta,
  get_sitemap_links,
};

export const config = { api: { bodyParser: false } };
export default createApiHandler(functions);