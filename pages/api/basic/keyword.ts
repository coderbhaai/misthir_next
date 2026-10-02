import type { NextApiRequest, NextApiResponse } from 'next';
import { logError, safeParse } from '../utils';
import { createApiHandler, ExtendedRequest } from '../apiHandler';
import Review from 'lib/models/basic/Review';
import { APIHandlers } from '../../../lib/server/middleware';
import { buildFilterQuery } from 'lib/server/plugins/buildFilterQuery';
import Keyword from 'lib/models/basic/Keyword';

export async function create_update_keyword(req: ExtendedRequest, res: NextApiResponse) { 
  try {
    const { module, module_id } = req.body;
    if (!module || !module_id) { return res.status(400).json({ message: "Required fields missing" }); }

    const keywords = safeParse(req.body.keywords || '[]');

    const primaryCount = keywords.filter((k: { primary: any; }) => k.primary).length;
    if (primaryCount > 1) { return res.status(400).json({ message: "Only one keyword can be primary" }); }

    const docs = keywords.map((k: { keyword: string; primary: any; }) => ({
      module,
      module_id,
      keyword: k.keyword.trim(),
      primary: !!k.primary,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    
    await Keyword.deleteMany({ module, module_id });
    if (docs.length) { await Keyword.insertMany(docs); }

    return res.status(201).json({ message: "✅ Keywords Submitted successfully", data: true });
  } catch (error) { 
    await logError(error, { function: "create_update_keyword", payload: req.body }); 
    return res.status(500).json({ message: "Server error", error });
  }
}

export async function get_filtered_keywords(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { filters = {}, page = 0, limit = 10 } = req.body || {};
      const { matchQuery, skip, limit: safeLimit } = buildFilterQuery(filters, { page, limit, defaultLimit: 10, maxLimit: 100, searchableFields: ["review"] });
      const total = await Review.countDocuments(matchQuery);

    const data = await Review.find(matchQuery).populate([ { path: "module_id", select: "_id name url" }, { path: "user_id", select: "name email phone" } ]).exec();
    return res.status(200).json({ message: 'Fetched all Reviews', data, pagination: { total, page, limit: safeLimit, pages: Math.ceil(total / safeLimit) } });
  } catch (error) { await logError(error, { function: "get_filtered_keywords", payload: req.body }); }
}

export async function get_single_keyword(req: NextApiRequest, res: NextApiResponse){
  try{
    const { module, module_id } = req.body;
    if (!module || !module_id) { return res.status(400).json({ message: "module and module_id are required", data: [], }); }
  
    const data = await Keyword.find({ module, module_id }).select("_id keyword primary").sort({ primary: -1, createdAt: 1 }).lean();
    return res.status(200).json({ message: '✅ Single Entry Fetched', data });
  } catch (error) { await logError(error, { function: "get_single_keyword", payload: req.body }); }
};

export async function update_keyword(req: ExtendedRequest, res: NextApiResponse) { 
  try {
    const data = req.body;  
    if ( !data?.review || !data?.rating || !data?.user_id ) { return res.status(400).json({ message: 'Required fields missing' }); }

    const { module, module_id, rating, review, user_id } = data;

    const updatedOrCreated = await Review.findOneAndUpdate({ module, module_id, user_id }, 
          {
            $set: {
              rating,
              review,
              status:data.status,
              displayOrder: Number(data.displayOrder),
              updatedAt: new Date(),
            }, $setOnInsert: { createdAt: new Date() }
          }, { new: true, upsert: true }
        );

    return res.status(201).json({ message: "✅ Review Submitted successfully", data: updatedOrCreated });
  } catch (error) { 
    await logError(error, { function: "update_keyword", payload: req.body });
    return res.status(500).json({ message: "Server error", error });
  }
}

export const functions: APIHandlers = {
  create_update_keyword: { middlewares: [ "checkUserId", "checkPostMethod" ], },
  get_single_keyword: { middlewares: [ "checkUserId", "checkPostMethod" ], url: "/admin/reviews" },
  get_filtered_keywords: { middlewares: [ "checkUserId", "checkPostMethod" ], url: "/admin/reviews" },
  update_keyword: { middlewares: [ "checkUserId", "checkPostMethod"], url: "/admin/reviews" },
};

export const keywordHandlers = {
  create_update_keyword,
  get_filtered_keywords,
  get_single_keyword,
  update_keyword,
};

export const config = { api: { bodyParser: false } };
export default createApiHandler(functions, keywordHandlers);