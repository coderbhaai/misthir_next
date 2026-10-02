
import { isValidObjectId, Types } from 'mongoose';
import type { NextApiRequest, NextApiResponse } from 'next';
import Author from 'lib/models/blog/Author';
import { uploadMedia } from '../basic/media';
import { logError } from '../utils';
import { createApiHandler, ExtendedRequest } from '../apiHandler';
import { APIHandlers } from '../../../lib/server/middleware';
import { buildFilterQuery } from 'lib/server/plugins/buildFilterQuery';

export async function get_filtered_author(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { filters = {}, page = 0, limit = 10 } = req.body || {};
    const { matchQuery, skip, limit: safeLimit } = buildFilterQuery(filters, { page, limit, defaultLimit: 10, maxLimit: 100, searchableFields: ["name"] });
    const total = await Author.countDocuments(matchQuery);

    const data = await Author.find(matchQuery).populate('media_id').skip(skip).limit(safeLimit).sort({ createdAt: -1 });
    return res.status(200).json({ message: 'Fetched all Authors', data, pagination: { total, page, limit: safeLimit, pages: Math.ceil(total / safeLimit) } });
  } catch (error) { await logError(error, { function: "get_filtered_author", payload: req.body }); }
}

export async function get_single_author(req: NextApiRequest, res: NextApiResponse){
  try{
    const id = (req.method === "GET" ? req.query.id : req.body.id) as string;  
    if (!id || !Types.ObjectId.isValid(id)) { return res.status(400).json({ message: 'Invalid or missing ID' }); }
  
    const data = await Author.findById(id).populate('media_id').exec();
    if (!data) { return res.status(404).json({ message: `Author with ID ${id} not found` }); }
  
    return res.status(200).json({ message: '✅ Single Entry Fetched', data });
  }catch (error) { await logError(error, { function: "get_single_author", payload: req.body }); }
};

export async function create_update_author(req: ExtendedRequest, res: NextApiResponse) {
  try {
    const data = req.body;
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

        if (!updated) { return res.status(404).json({ message: '❌ Entry not found for update' }); }
        return res.status(200).json({ message: '✅ Entry updated successfully', data: updated });
      } catch (error) { await logError(error, { function: "create_update_author", payload: req.body }); }
    }

    const newEntry = new Author({
      name: data.name,
      status: data.status ?? true,
      media_id: media_id ?? undefined,
      content: data.content,
    });

    await newEntry.save();
    return res.status(201).json({ message: '✅ Entry created successfully', data: newEntry });
  } catch (error) { await logError(error, { function: "create_update_author", payload: req.body }); }
}

export const functions: APIHandlers = {
  get_filtered_author : { middlewares: [ "checkUserId", "checkPostMethod" ], url: "/admin/author"  },
  get_single_author : { middlewares: [ "checkUserId", ], url: "/admin/author"  },
  create_update_author : { middlewares: [ "checkUserId", "checkPostMethod", { name: "validateInput", options: { requiredFields: [ "name", "status", "content" ] }} ], url: "/admin/author"  },
}

export const authorHandlers = {
  get_filtered_author,
  get_single_author,
  create_update_author,
};

export const config = { api: { bodyParser: false } };
export default createApiHandler(functions, authorHandlers);