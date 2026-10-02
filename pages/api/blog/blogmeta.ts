import { Types } from 'mongoose';
import type { NextApiRequest, NextApiResponse } from 'next';
import Blogmeta from 'lib/models/blog/Blogmeta';
import { generateSitemap, slugify, upsertMeta } from '../basic/meta';
import { logError } from '../utils';
import { createApiHandler } from '../apiHandler';
import { APIHandlers } from '../../../lib/server/middleware';
import { buildFilterQuery } from 'lib/server/plugins/buildFilterQuery';

export async function create_update_blog_meta(req: NextApiRequest, res: NextApiResponse) {
  try {
    const data = req.body;
    const modelId = (typeof data._id === 'string' || data._id instanceof Types.ObjectId) ? data._id : null;
    const slug = await slugify(data.url, Blogmeta, modelId);

    let meta_id: string | null = null;
    meta_id = await upsertMeta({ meta_id: data.selected_meta_id ?? null, url: slug, title: data.title, description: data.description });

    if (modelId) {
      const updated = await Blogmeta.findByIdAndUpdate(modelId, {
          type: data.type,
          name: data.name,
          url: slug,
          meta_id: meta_id,
          status: data.status,
          updatedAt: new Date(),
        }, { new: true });

        await generateSitemap();
      return res.status(200).json({ message: '✅ Entry updated successfully', data: updated });
    }

    const newEntry = new Blogmeta({
      type: data.type,
      name: data.name,
      url: slug,
      meta_id: meta_id,
      status: data.status ?? true,
    });

    await newEntry.save();

    await generateSitemap();
    return res.status(201).json({ message: '✅ Entry created successfully', data: newEntry });
  } catch (error) { await logError(error, { function: "create_update_blog_meta", payload: req.body }); }
}

export async function get_filtered_blog_meta(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { filters = {}, page = 0, limit = 10 } = req.body || {};
    const { matchQuery, skip, limit: safeLimit } = buildFilterQuery(filters, { page, limit, defaultLimit: 10, maxLimit: 100, searchableFields: ["name", "url"] });
    const total = await Blogmeta.countDocuments(matchQuery);

    const data = await Blogmeta.find(matchQuery).populate([ { path: 'meta_id' } ]).skip(skip).limit(safeLimit).sort({ createdAt: -1 });
    return res.status(200).json({ message: 'Fetched all blog meta', data, pagination: { total, page, limit: safeLimit, pages: Math.ceil(total / safeLimit) } });
  } catch (error) { await logError(error, { function: "get_filtered_blog_meta", payload: req.body }); }
}

export async function get_single_blog_meta(req: NextApiRequest, res: NextApiResponse){
  try{
    const id = (req.method === "GET" ? req.query.id : req.body.id) as string;
    if (!id || !Types.ObjectId.isValid(id)) { return res.status(400).json({ message:  'Invalid or missing ID' }); }
  
    const data = await Blogmeta.findById(id).populate([ { path: 'meta_id' } ]).exec();
    if (!data) { return res.status(404).json({ message: `Blog meta with ID ${id} not found` }); }
  
    return res.status(200).json({ message: 'Fetched Single Blog', data });
  } catch (error) { await logError(error, { function: "get_filtered_blog_meta", payload: req.body }); }
};

export const functions: APIHandlers = {
  create_update_blog_meta : { middlewares: [ "checkUserId", "checkPostMethod", { name: "validateInput", options: { requiredFields: ["type", "name", "url", "status" ] }} ], url: "/admin/blogmeta"  },
  get_filtered_blog_meta : { middlewares: [ "checkUserId", "checkPostMethod" ], url: "/admin/blogmeta"  },
  get_single_blog_meta : { middlewares: ["checkUserId", ], url: "/admin/blogmeta"  },
}

export const blogmetaHandlers = {
  create_update_blog_meta,
  get_filtered_blog_meta,
  get_single_blog_meta,
};

export const config = { api: { bodyParser: false } };
export default createApiHandler(functions, blogmetaHandlers);