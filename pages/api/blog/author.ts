
import { isValidObjectId, Types } from 'mongoose';
import type { NextApiRequest, NextApiResponse } from 'next';
import Author from 'lib/models/blog/Author';
import { uploadMedia } from '../basic/media';
import { log } from '../utils';
import { createApiHandler, ExtendedRequest } from '../apiHandler';
import { APIHandlers } from '../middleware';

export async function get_all_author(req: NextApiRequest, res: NextApiResponse) {
  try {
    const data = await Author.find().populate('media_id').exec();
    return res.status(200).json({ message: 'Fetched all Authors', data });
  } catch (error) { return log(error); }
}

export async function get_single_author(req: NextApiRequest, res: NextApiResponse){
  try{
    const id = (req.method === 'GET' ? req.query.id : req.body.id) as string;
  
    if (!id || !Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid or missing ID' });
    }
  
    const entry = await Author.findById(id).populate('media_id').exec();
  
    if (!entry) { return res.status(404).json({ message: `Author with ID ${id} not found` }); }
  
    return res.status(200).json({ message: '✅ Single Entry Fetched', data: entry });

  }catch (error) { return log(error); }
};

export async function create_update_author(req: ExtendedRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const data = req.body;

    if (!data?.name || !data?.status) {
      return res.status(400).json({ message: '❌ Required fields missing' });
    }

    const modelId = typeof data._id === 'string' || data._id instanceof Types.ObjectId ? data._id : null;

    let media_id: string | null = null;
    if (data.media_id && isValidObjectId(data.media_id)) { media_id = data.media_id; }
    const file = Array.isArray(req.files?.image) ? req.files.image[0] : req.files?.image;
    
    if (file) {
      media_id = await uploadMedia({ file, name: data.name, pathType: data.path, media_id: data.media_id ?? null, user_id: null });
    }

    if (modelId && isValidObjectId(modelId)) {
      try {
        const updated = await Author.findByIdAndUpdate(
          modelId,
          {
            name: data.name,
            status: data.status,
            media_id: media_id ?? undefined,
            content: data.content,
            updatedAt: new Date(),
          },
          { new: true }
        );

        if (updated) {
          return res.status(200).json({ message: '✅ Entry updated successfully', data: updated });
        } else {
          return res.status(404).json({ message: '❌ Author not found for update' });
        }
      } catch (error) { return log(error); }
    }

    const newMeta = new Author({
      name: data.name,
      status: data.status ?? true,
      media_id: media_id ?? undefined,
      content: data.content,
    });

    await newMeta.save();
    return res.status(201).json({ message: '✅ Entry created successfully', data: newMeta });
  } catch (error) { return log(error); }
}

export const functions: APIHandlers = {
  get_all_author : { middlewares: [] },
  get_single_author : { middlewares: [] },
  create_update_author : { middlewares: [] },
}

export const authorHandlers = {
  get_all_author,
  get_single_author,
  create_update_author,
};

export const config = { api: { bodyParser: false } };
export default createApiHandler(functions);