import { isValidObjectId, Types } from 'mongoose';
import type { NextApiRequest, NextApiResponse } from 'next';
import { uploadMedia } from '../basic/media';
import { cleanContent, logError } from '../utils';
import { createApiHandler, ExtendedRequest } from '../apiHandler';
import { APIHandlers } from '../../../lib/server/middleware';
import { buildFilterQuery } from 'lib/server/plugins/buildFilterQuery';
import BlockQuote from 'lib/models/block/BlockQuote';

export async function get_filtered_blockquotes(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { filters = {}, page = 0, limit = 10 } = req.body || {};
    const { matchQuery, skip, limit: safeLimit } = buildFilterQuery(filters, { page, limit, defaultLimit: 10, maxLimit: 100, searchableFields: ["name"] });
    const total = await BlockQuote.countDocuments(matchQuery);

    const data = await BlockQuote.find(matchQuery).populate([ { path: "media_id" }, { path: "module_id", select: "name url" } ]).skip(skip).limit(safeLimit).sort({ createdAt: -1 });
    return res.status(200).json({ message: 'Fetched all Generic Blocks', data, pagination: { total, page, limit: safeLimit, pages: Math.ceil(total / safeLimit) } });
  } catch (error) { await logError(error, { function: "get_filtered_blockquotes", payload: req.body }); }
}

export async function get_single_blockquote(req: NextApiRequest, res: NextApiResponse) {
  try {
    const id = (req.method === "GET" ? req.query.id : req.body.id) as string;
    if (!id || !Types.ObjectId.isValid(id)) { return res.status(400).json({ message: 'Invalid or missing ID' }); }

    const data = await BlockQuote.findById(id).populate([ { path: "media_id" }, { path: "module_id", select: "name url" } ]).exec();  
    return res.status(200).json({ message: "Fetched Single BlockQuote", data });
  } catch (error) { await logError(error, { function: "get_single_blockquote", payload: req.body }); }
}

export async function create_update_blockquote(req: ExtendedRequest, res: NextApiResponse) {
  try {
    const data = req.body;
    if ( !data.module || !data.module_id ) { return res.status(400).json({ success: false, message: "Module & Module ID are required" }); }

    const modelId = typeof data._id === 'string' || data._id instanceof Types.ObjectId ? data._id : null;

    const mediaName = `${data.heading ?? data.module}`;

    let media_id: string | null = null;
    if (data.media_id && isValidObjectId(data.media_id)) { media_id = data.media_id; }
    const file = Array.isArray(req.files?.image) ? req.files.image[0] : req.files?.image;
    if (file) { media_id = await uploadMedia({ file, name: mediaName, pathType: "block", media_id: data.media_id ?? null, user_id: null }); }

    if (modelId && isValidObjectId(modelId)) {
      try {
        const updated = await BlockQuote.findByIdAndUpdate( modelId, {
            module: data.module,
            module_id: data.module_id,
            media_id,
            heading: data.heading,
            bg_colour: data.bg_colour,
            content: cleanContent(data.content),
            status: data.status ?? true,
            displayOrder: Number(data.displayOrder) || 0,
            updatedAt: new Date(),
          }, { new: true } 
        );

        if (updated) {
          return res.status(200).json({ message: '✅ Entry updated successfully', data: updated });
        } else {
          return res.status(404).json({ message: '❌ BlockQuote not found for update' });
        }
      } catch (error) { await logError(error, { function: "create_update_blockquote", payload: req.body }); }
    }

    const newEntry = new BlockQuote({
      module: data.module,
      module_id: data.module_id,
      heading: data.heading,
      content: cleanContent(data.content),
      bg_colour: data.bg_colour,
      media_id,
      status: data.status ?? true,
      displayOrder: Number(data.displayOrder) || 0,
      createdAt: new Date(),
    });

    return res.status(200).json({ success: true, message: "Tab Blocks processed successfully", data: newEntry });
  } catch (error) { await logError(error, { function: "create_update_blockquote", payload: req.body }); }
}

export const functions: APIHandlers = {
  get_filtered_blockquotes : { middlewares: [ "checkUserId", "checkPostMethod" ], url: "/admin/blockquotes" },
  get_single_blockquote : { middlewares: [ "checkUserId", ] },
  create_update_blockquote : { middlewares: [ "checkUserId", "checkPostMethod" ], url: "/admin/blockquotes" },
}

export const blockquoteHandlers = {
  get_filtered_blockquotes,
  get_single_blockquote,
  create_update_blockquote,
};

export const config = { api: { bodyParser: false } };
export default createApiHandler(functions, blockquoteHandlers);