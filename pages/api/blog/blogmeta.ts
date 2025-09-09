import { Types } from 'mongoose';
import type { NextApiRequest, NextApiResponse } from 'next';
import Blogmeta from 'lib/models/blog/Blogmeta';
import { upsertMeta } from '../basic/meta';
import { log } from '../utils';
import { slugify } from '@amitkk/basic/utils/utils';
import { createApiHandler } from '../apiHandler';

export async function create_update_blog_meta(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') { return res.status(405).json({ message: 'Method Not Allowed' }); }
  
    const data = req.body;
    if (!data?.type || !data?.name || !data?.url) {
      return res.status(400).json({ message: '❌ Required fields missing' });
    }

    const modelId = (typeof data._id === 'string' || data._id instanceof Types.ObjectId) ? data._id : null;
    const slug = await slugify(data.url, Blogmeta, modelId);

    let meta_id: string | null = null;
    meta_id = await upsertMeta({ meta_id: data.selected_meta_id ?? null, url: data.url, title: data.title, description: data.description });

    if (data._id) {
      const updated = await Blogmeta.findByIdAndUpdate(
        data._id,
        {
          type: data.type,
          name: data.name,
          url: slug,
          meta_id: meta_id,
          status: data.status,
          updatedAt: new Date(),
        },
        { new: true }
      );

      if (updated) {
        return res.status(200).json({ message: '✅ Entry updated successfully', data: updated });
      }
    }

    const newMeta = new Blogmeta({
      type: data.type,
      name: data.name,
      url: slug,
      meta_id: meta_id,
      status: data.status ?? true,
    });

    await newMeta.save();

    return res.status(201).json({ message: '✅ Entry created successfully', data: newMeta });
  } catch (error) { return log(error); }
}

export async function get_all_blog_meta(req: NextApiRequest, res: NextApiResponse) {
  try {
    const data = await Blogmeta.find().populate([ { path: 'meta_id' } ]).exec();
    return res.status(200).json({ message: 'Fetched all blog meta', data });
  } catch (error) { return log(error); }
}

export async function get_category(req: NextApiRequest, res: NextApiResponse) {
  try {
    const data = await Blogmeta.find({ type: 'category' }).exec();
    return res.status(200).json({ message: 'Fetched categories', data });
  } catch (error) { return log(error); }
}

export async function get_tag(req: NextApiRequest, res: NextApiResponse) {
  try {
    const data = await Blogmeta.find({ type: 'tag' }).exec();
    return res.status(200).json({ message: 'Fetched tags', data });
  } catch (error) { return log(error); }
}

export async function get_single_blog_meta(req: NextApiRequest, res: NextApiResponse){
  const id = (req.method === 'GET' ? req.query.id : req.body.id) as string;

  if (!id || !Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid or missing ID' });
  }

  const data = await Blogmeta.findById(id).populate([ { path: 'meta_id' } ]).exec();
  if (!data) { return res.status(404).json({ message: `Blog meta with ID ${id} not found` }); }

  return res.status(200).json({ message: 'Fetched Single Blog', data });
};

const functions = {
  create_update_blog_meta,
  get_all_blog_meta,
  get_category,
  get_tag,
  get_single_blog_meta,
};

export default createApiHandler(functions);