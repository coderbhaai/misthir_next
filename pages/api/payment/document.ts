import { isValidObjectId, Types } from 'mongoose';
import type { NextApiRequest, NextApiResponse } from 'next';
import { uploadMedia } from '../basic/media';
import Productmeta from 'lib/models/product/Productmeta';
import { generateSitemap, slugify, upsertMeta } from '../basic/meta';
import ProductBrand from 'lib/models/product/ProductBrand';
import User from 'lib/models/spatie/User';
import UserRole from 'lib/models/spatie/UserRole';
import UserPermission from 'lib/models/spatie/UserPermission';
import { getUserModule } from 'services/userService';
import Ingridient from 'lib/models/product/Ingridient';
import ProductFeature from 'lib/models/product/ProductFeature';
import Commission from 'lib/models/product/Commission';
import BankDetail from 'lib/models/product/BankDetail';
import Documentation from 'lib/models/product/Documentation';
import { createApiHandler, ExtendedRequest } from '../apiHandler';
import { APIHandlers } from 'lib/server/middleware';
import { logError } from '../utils';
import { buildFilterQuery } from 'lib/server/plugins/buildFilterQuery';

// Bank Detail
  export async function get_filtered_bank_details(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { filters = {}, page = 0, limit = 10 } = req.body || {};
      const { matchQuery, skip, limit: safeLimit } = buildFilterQuery(filters, { page, limit, defaultLimit: 10, maxLimit: 100, searchableFields: ["account", "ifsc", "branch", "bank"] });
      const total = await BankDetail.countDocuments(matchQuery);

      const data = await BankDetail.find(matchQuery).populate([ { path: 'user_id' } ]).skip(skip).limit(safeLimit).sort({ createdAt: -1 });
      return res.status(200).json({ message: 'Fetched all BankDetail', data, pagination: { total, page, limit: safeLimit, pages: Math.ceil(total / safeLimit) } });
    } catch (error) { return await logError(error, { function: "get_filtered_bank_details", payload: req.body }); }
  }

  export async function get_single_bank_detail(req: NextApiRequest, res: NextApiResponse){
    try{
      const id = (req.method === 'GET' ? req.query.id : req.body.id) as string;
      if (!id || !Types.ObjectId.isValid(id)) { return res.status(400).json({ message: 'Invalid or missing ID' }); }  
    
      const entry = await BankDetail.findById(id).populate([ { path: 'user_id' } ]).exec();  
      if (!entry) { return res.status(404).json({ message: `BankDetail with ID ${id} not found` }); }
    
      return res.status(200).json({ message: '✅ Single Entry Fetched', data: entry });

    }catch (error) { return await logError(error, { function: "get_single_bank_detail", payload: req.body }); }
  };

  export async function create_update_bank_detail(req: ExtendedRequest, res: NextApiResponse) {
    try {
      const data = req.body;
      if (!data?.account || !data?.ifsc || !data?.branch || !data?.bank) { return res.status(400).json({ message: '❌ Required fields missing' }); }

      const modelId = typeof data._id === 'string' || data._id instanceof Types.ObjectId ? data._id : null;

      if (modelId && isValidObjectId(modelId)) {
        try {
          const updated = await BankDetail.findByIdAndUpdate(
            modelId,
            {
              user_id: data.user_id,
              account: data.account,
              ifsc: data.ifsc,
              branch: data.branch,
              bank: data.bank,
              updatedAt: new Date(),
            }, { new: true }
          );

          return res.status(200).json({ message: '✅ Entry updated successfully', data: updated });
        } catch (error) { return await logError(error, { function: "create_update_bank_detail", payload: req.body }); }
      }
      
      const newEntry = new BankDetail({
        user_id: data.user_id,
        account: data.account,
        ifsc: data.ifsc,
        branch: data.branch,
        bank: data.bank,
        createdAt: new Date(),
      });

      await newEntry.save();
      return res.status(201).json({ message: '✅ Entry created successfully', data: newEntry });
    } catch (error) { return await logError(error, { function: "create_update_bank_detail", payload: req.body }); }
  }
// Bank Detail

// Document
  export async function get_filtered_documents(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { filters = {}, page = 0, limit = 10 } = req.body || {};
      const { matchQuery, skip, limit: safeLimit } = buildFilterQuery(filters, { page, limit, defaultLimit: 10, maxLimit: 100, searchableFields: ["name"] });
      const total = await Documentation.countDocuments(matchQuery);

      const data = await Documentation.find(matchQuery).populate([ { path: 'user_id' }, { path: 'media_id' } ]).skip(skip).limit(safeLimit).sort({ createdAt: -1 });
      return res.status(200).json({ message: 'Fetched all Documentation', data, pagination: { total, page, limit: safeLimit, pages: Math.ceil(total / safeLimit) } });
    } catch (error) { return await logError(error, { function: "get_filtered_documents", payload: req.body }); }
  }

  export async function get_single_document(req: NextApiRequest, res: NextApiResponse){
    try{
      const id = (req.method === 'GET' ? req.query.id : req.body.id) as string;
      if (!id || !Types.ObjectId.isValid(id)) { return res.status(400).json({ message: 'Invalid or missing ID' }); }  
    
      const entry = await Documentation.findById(id).populate([ { path: 'user_id' }, { path: 'media_id' } ]).exec();  
      if (!entry) { return res.status(404).json({ message: `Documentation with ID ${id} not found` }); }
    
      return res.status(200).json({ message: '✅ Single Entry Fetched', data: entry });

    }catch (error) { return await logError(error, { function: "get_single_document", payload: req.body }); }
  };

  export async function create_update_document(req: ExtendedRequest, res: NextApiResponse) {
    try {
      const data = req.body;
      if (!data?.name || !data?.user_id) { return res.status(400).json({ message: '❌ Required fields missing' }); }

      const modelId = typeof data._id === 'string' || data._id instanceof Types.ObjectId ? data._id : null;

      let media_id: string | null = null;
      if (data.media_id && isValidObjectId(data.media_id)) { media_id = data.media_id; }
      const file = Array.isArray(req.files?.image) ? req.files.image[0] : req.files?.image;
      
      if (file) {
        media_id = await uploadMedia({ file, name: data.name, pathType: data.path, media_id: data.media_id ?? null, user_id: data.user_id });
      }

      if (modelId && isValidObjectId(modelId)) {
        try {
          const updated = await Documentation.findByIdAndUpdate(
            modelId,
            {
              user_id: data.user_id,
              name: data.name,
              media_id: media_id,
              updatedAt: new Date(),
            }, { new: true }
          );

          return res.status(200).json({ message: '✅ Entry updated successfully', data: updated });
        } catch (error) { return await logError(error, { function: "create_update_document", payload: req.body }); }
      }
      
      const newEntry = new Documentation({
        user_id: data.user_id,
        name: data.name,
        media_id: media_id,
        createdAt: new Date(),
      });

      await newEntry.save();
      return res.status(201).json({ message: '✅ Entry created successfully', data: newEntry });
    } catch (error) { return await logError(error, { function: "create_update_document", payload: req.body }); }
  }
// Document

export const functions: APIHandlers = {
  get_filtered_bank_details : { middlewares: ["checkUserId", "checkPostMethod"] },
  get_single_bank_detail : { middlewares: [] },
  create_update_bank_detail : { middlewares: [] },

  get_filtered_documents : { middlewares: ["checkUserId", "checkPostMethod"] },
  get_single_document : { middlewares: [] },
  create_update_document : { middlewares: ["checkUserId", "checkPostMethod"] },
}

export const documentHandlers = {
  get_filtered_bank_details,
  get_single_bank_detail,
  create_update_bank_detail,

  get_filtered_documents,
  get_single_document,
  create_update_document,
};

export const config = { api: { bodyParser: false } };
export default createApiHandler(functions, documentHandlers);