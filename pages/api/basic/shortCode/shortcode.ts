import { Types } from 'mongoose';
import type { NextApiRequest, NextApiResponse } from 'next';
import { logError, safeParse } from '../../utils';
import { createApiHandler, ExtendedRequest } from '../../apiHandler';
import { APIHandlers } from '../../../../lib/server/middleware';
import { buildFilterQuery } from 'lib/server/plugins/buildFilterQuery';
import ShortCode from 'lib/models/basic/ShortCode';
import ShortCodeDetail from 'lib/models/basic/ShortCodeDetail';

export async function get_filtered_short_codes(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { filters = {}, page = 0, limit = 10 } = req.body || {};
      const { matchQuery, skip, limit: safeLimit } = buildFilterQuery(filters, { page, limit, defaultLimit: 10, maxLimit: 100, searchableFields: ["review"] });
      const total = await ShortCode.countDocuments(matchQuery);

    const data = await ShortCode.find(matchQuery).populate([ {
    path: "details",
    options: { sort: { displayOrder: 1 } },
    populate: {
      path: "module_data",
      select: "_id name url",
    },
  } ]).exec();
    return res.status(200).json({ message: 'Fetched all ShortCodes', data, pagination: { total, page, limit: safeLimit, pages: Math.ceil(total / safeLimit) } });
  } catch (error) { await logError(error, { function: "get_filtered_short_codes", payload: req.body }); }
}

export async function get_single_short_code(req: NextApiRequest, res: NextApiResponse){
  try{
    const id = (req.method === "GET" ? req.query.id : req.body.id) as string;
    if (!id || !Types.ObjectId.isValid(id)) { return res.status(400).json({ message: 'Invalid or missing ID' }); }
  
    const data = await ShortCode.findById(id).populate([ { path: "details", options: { sort: { displayOrder: 1 } }, populate: { path: "module_data", select: "_id name url" },
    } ]).sort({ primary: -1, createdAt: 1 }).lean();
    return res.status(200).json({ message: '✅ Single Entry Fetched', data });
  } catch (error) { await logError(error, { function: "get_single_short_code", payload: req.body }); }
};

export async function create_update_short_code(req: ExtendedRequest, res: NextApiResponse) {
  try {
    const data = req.body;
    const { module, call_id, status } = data;
    if (!module || call_id === undefined) { return res.status(400).json({ message: "Required fields missing" }); }

    let details = data.details ?? [];
    if (typeof details === "string") { details = safeParse(details); }
    if (!Array.isArray(details)) { details = [details]; }

    if (!details.every((d: { module: any; module_id: any; }) => d.module && d.module_id)) {
      return res.status(400).json({ message: "Invalid details format" });
    }
    
    const isUpdate = data._id && Types.ObjectId.isValid(String(data._id));
    let shortCode;

    if (isUpdate) {
      shortCode = await ShortCode.findByIdAndUpdate( data._id, {
        module,
        call_id,
        status,
      }, { new: true } );

      if (!shortCode) { return res.status(404).json({ message: "ShortCode not found" }); }
    } else {
      shortCode = await ShortCode.create({
        module,
        call_id,
        status,
      });
    }

    const shortCodeId = shortCode._id;
    
    await ShortCodeDetail.deleteMany({ shortCode_id: shortCodeId });
    
    if (details.length > 0) {
      const detailDocs = details.map((d: { module: any; module_id: any; }) => ({
        shortCode_id: shortCodeId,
        module: d.module || module,
        module_id: d.module_id,
      }));

      await ShortCodeDetail.insertMany(detailDocs);
    }
    
    return res.status(isUpdate ? 200 : 201).json({ message: isUpdate ? "✅ ShortCode updated successfully" : "✅ ShortCode created  successfully", data: shortCode });
  } catch (error) { 
    await logError(error, { function: "create_update_short_code", payload: req.body });
    return res.status(500).json({ message: "Server error", error, }); 
  }
}

export const functions: APIHandlers = {
  get_single_short_code: { middlewares: [ "checkUserId" ], url: "/admin/reviews" },
  get_filtered_short_codes: { middlewares: [ "checkUserId", "checkPostMethod" ], url: "/admin/reviews" },
  create_update_short_code: { middlewares: [ "checkUserId", "checkPostMethod" ], },
};

export const shortcodeHandlers = {
  get_filtered_short_codes,
  get_single_short_code,
  create_update_short_code,
};

export const config = { api: { bodyParser: false } };
export default createApiHandler(functions, shortcodeHandlers);