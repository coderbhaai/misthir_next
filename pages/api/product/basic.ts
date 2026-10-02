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

// Productmeta
  export async function get_filtered_product_meta(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { filters = {}, page = 0, limit = 10 } = req.body || {};
      const { matchQuery, skip, limit: safeLimit } = buildFilterQuery(filters, { page, limit, defaultLimit: 10, maxLimit: 100, searchableFields: ["name", "url"] });
      const total = await Productmeta.countDocuments(matchQuery);
 
      // 1. Fetch data with only the models that actually exist (media_id, meta_id, parent_id)
      const data = await Productmeta.find(matchQuery)
        .populate([ 
          { path: 'media_id' }, 
          { path: 'meta_id' }, 
          { path: "parent_id" } 
        ])
        .lean() // use lean so we can modify or inject fields freely
        .skip(skip)
        .limit(safeLimit)
        .sort({ createdAt: -1 });

      // 2. If you need to resolve custom parent relations without a Relationship model, 
      // you can map through them or extract IDs if they are stored as flat arrays:
      // (Example: if parentsFlat contains an array of ObjectIds pointing to other Productmetas)
      const enhancedData = await Promise.all(data.map(async (item: any) => {
        if (item.parentsFlat && item.parentsFlat.length > 0) {
          // Fetch the parent meta items directly from Productmeta model
          const parentDocs = await Productmeta.find({ _id: { $in: item.parentsFlat } }).select('name url').lean();
          
          // Map them back to match the structure your frontend expects (e.g. parentsRelation)
          item.parentsRelation = parentDocs.map(p => ({ parent_id: p }));
        }
        return item;
      }));

      return res.status(200).json({ 
        message: 'Fetched all Product Metas', 
        data: enhancedData, 
        pagination: { total, page, limit: safeLimit, pages: Math.ceil(total / safeLimit) } 
      });
    } catch (error) { 
      return await logError(error, { function: "get_filtered_product_meta", payload: req.body }); 
    }
}

  export async function get_single_product_meta(req: NextApiRequest, res: NextApiResponse){
    try{
      const id = (req.method === 'GET' ? req.query.id : req.body.id) as string;
      if (!id || !Types.ObjectId.isValid(id)) { return res.status(400).json({ message: 'Invalid or missing ID' }); }  
    
      const entry = await Productmeta.findById(id).populate([ { path: 'media_id' }, { path: 'meta_id' } ]).exec();  
      if (!entry) { return res.status(404).json({ message: `Productmeta with ID ${id} not found` }); }
    
      return res.status(200).json({ message: '✅ Single Entry Fetched', data: entry });

    }catch (error) { return await logError(error, { function: "get_single_product_meta", payload: req.body }); }
  };

  export async function create_update_product_meta(req: ExtendedRequest, res: NextApiResponse) {
    try {
      const data = req.body;
      if (!data?.name || !data?.module || !data?.url || !data?.status) { return res.status(400).json({ message: '❌ Required fields missing' }); }

      const modelId = typeof data._id === 'string' || data._id instanceof Types.ObjectId ? data._id : null;

      const slug = await slugify(data.url, Productmeta, modelId);

      let meta_id: string | null = null;
      meta_id = await upsertMeta({ meta_id: data.selected_meta_id ?? null, url: data.url, title: data.title, description: data.description });

      let media_id: string | null = null;
      if (data.media_id && isValidObjectId(data.media_id)) { media_id = data.media_id; }
      const file = Array.isArray(req.files?.image) ? req.files.image[0] : req.files?.image;
      
      if (file) {
        media_id = await uploadMedia({ file, name: data.name, pathType: data.path, media_id: data.media_id ?? null, user_id: null });
      }

      if (modelId && isValidObjectId(modelId)) {
        try {
          const updated = await Productmeta.findByIdAndUpdate(modelId, {
              parent_id: data.parent_id,
              module: data.module,
              name: data.name,
              url: slug,
              media_id: media_id,
              meta_id: meta_id,
              content: data.content,
              status: data.status,
              displayOrder: data.displayOrder,
              updatedAt: new Date(),
            }, { new: true });

          await generateSitemap();

          return res.status(200).json({ message: '✅ Entry updated successfully', data: updated });
        } catch (error) { return await logError(error, { function: "create_update_product_meta", payload: req.body }); }
      }
      const newEntry = new Productmeta({
        parent_id: data.parent_id,
        module: data.module,
        name: data.name,
        url: slug,
        media_id: media_id,
        meta_id: meta_id,
        content: data.content,
        status: data.status,
        displayOrder: data.displayOrder,
        createdAt: new Date(),
      });

      await newEntry.save();
      await generateSitemap();
      return res.status(201).json({ message: '✅ Entry created successfully', data: newEntry });
    } catch (error) { return await logError(error, { function: "create_update_product_meta", payload: req.body }); }
  }

  export async function get_product_meta_by_module(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { module } = req.query;
      const query: any = {};
      if (module) {
        query.module = module.toString();
      }

      const data = await Productmeta.find(query).select("_id name").exec();
      return res.status(200).json({ message: 'Fetched all Productmetas', data });
    } catch (error) { return await logError(error, { function: "get_product_meta_by_module", payload: req.body }); }
  }

  export async function get_product_meta_parents(req: NextApiRequest, res: NextApiResponse) {
    try {
      const data = await Productmeta.find().select('_id name').exec();
      return res.status(200).json({ message: 'Fetched all Product meta Parents', data });
    } catch (error) { await logError(error, { function: "get_product_meta_parents", payload: req.body }); return; }
  }

  export async function get_product_type_parents(req: NextApiRequest, res: NextApiResponse) {
    try {
      const data = await Productmeta.find({ module: "Type"}).select("_id name").exec();
      return res.status(200).json({ message: "Fetched all Product Types Parents", data });
    } catch (error) {
      await logError(error, { function: "get_product_type_parents", payload: req.body });
      return res.status(500).json({ message: "Internal server error" });
    }
  }
// Productmeta

// ProductBrand
  export async function get_filtered_product_brands(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { filters = {}, page = 0, limit = 10 } = req.body || {};
      const { matchQuery, skip, limit: safeLimit } = buildFilterQuery(filters, { page, limit, defaultLimit: 10, maxLimit: 100, searchableFields: ["name", "url"] });
      const total = await ProductBrand.countDocuments(matchQuery);
  
      const data = await ProductBrand.find(matchQuery).populate([ { path: 'media_id' }, { path: 'meta_id' }, { path: 'seller_id' }, ]).skip(skip).limit(safeLimit).sort({ createdAt: -1 });
      return res.status(200).json({ message: 'Fetched all Product Brands', data, pagination: { total, page, limit: safeLimit, pages: Math.ceil(total / safeLimit) } });
    } catch (error) { await logError(error, { function: "get_filtered_product_brands", payload: req.body }); }
  }

  export async function get_single_product_brand(req: NextApiRequest, res: NextApiResponse){
    try{
      const id = (req.method === 'GET' ? req.query.id : req.body.id) as string;
      if (!id || !Types.ObjectId.isValid(id)) { return res.status(400).json({ message: 'Invalid or missing ID' }); }  
    
      const entry = await ProductBrand.findById(id).populate([ { path: 'media_id' }, { path: 'meta_id' }, { path: 'seller_id' }, ]).exec();  
      if (!entry) { return res.status(404).json({ message: `ProductBrand with ID ${id} not found` }); }
    
      return res.status(200).json({ message: '✅ Single Entry Fetched', data: entry });

    }catch (error) { return await logError(error, { function: "get_single_product_brand", payload: req.body }); }
  };

  export async function create_update_product_brand(req: ExtendedRequest, res: NextApiResponse) {
    try {
      const data = req.body;
      if (!data?.name || !data?.status) { return res.status(400).json({ message: '❌ Required fields missing' }); }

      const modelId = typeof data._id === 'string' || data._id instanceof Types.ObjectId ? data._id : null;
      
      const slug = await slugify(data?.url ?? data?.name, Productmeta, modelId);
      let meta_id: string | null = null;
      meta_id = await upsertMeta({
        meta_id: data?.selected_meta_id ?? null,
        url: data?.url ?? data?.name,
        title: data?.title ?? data?.name,
        description: data?.description ?? data?.name,
      }); 
      
      let media_id: string | null = null;
      if (data.media_id && isValidObjectId(data.media_id)) { media_id = data.media_id; }
      const file = Array.isArray(req.files?.image) ? req.files.image[0] : req.files?.image;
      
      if (file) {
        media_id = await uploadMedia({ file, name: data.name, pathType: data.path, media_id: data.media_id ?? null, user_id: data.seller_id });
      }
      
      if (modelId && isValidObjectId(modelId)) {
        try {
          const updated = await ProductBrand.findByIdAndUpdate(modelId, {
              seller_id: data.seller_id,
              name: data.name,
              url: slug,
              media_id: media_id,
              meta_id: meta_id,
              content: data.content,
              status: data.status,
              displayOrder: data.displayOrder,
              updatedAt: new Date(),
            }, { new: true });

          await generateSitemap();

          return res.status(200).json({ message: '✅ Entry updated successfully', data: updated });
        } catch (error) { return await logError(error, { function: "create_update_product_brand", payload: req.body }); }
      }
      
      const newEntry = new ProductBrand({
        seller_id: data.seller_id,
        name: data.name,
        url: slug,
        media_id: media_id,
        meta_id: meta_id,
        content: data.content,
        status: data.status,
        displayOrder: data.displayOrder,
        createdAt: new Date(),
      });

      await newEntry.save();
      await generateSitemap();
      return res.status(201).json({ message: '✅ Entry created successfully', data: newEntry });
    } catch (error) { return await logError(error, { function: "create_update_product_brand", payload: req.body }); }
  }

  export async function get_product_brand_module(req: NextApiRequest, res: NextApiResponse) {
    try {
      const data = await ProductBrand.find().select('_id name').exec();
      return res.status(200).json({ message: 'Fetched all Product Brands Module', data });
    } catch (error) { return await logError(error, { function: "get_product_brand_module", payload: req.body }); }
  }
// ProductBrand

// Vendor
  export async function get_single_vendor(req: NextApiRequest, res: NextApiResponse){
    const id = (req.method === 'GET' ? req.query.id : req.body.id) as string;
    if (!id || !Types.ObjectId.isValid(id)) { return res.status(400).json({ message: 'Invalid or missing ID' }); }
    
    const data = await User.findById(id)
    .populate({ path: "rolesAttached", populate: { path: "role_id", model: "SpatieRole", select: "_id name status" } })
    .populate({ path: "permissionsAttached", populate: { path: "permission_id", model: "SpatiePermission", select: "_id name" } })
    .lean();
    const userRoles = await UserRole.find({ user_id: id }).populate("role_id", "name").lean().exec();
    const rolesIds = userRoles?.map(rp => rp.role_id?._id).filter(Boolean);

    const userPermissions = await UserPermission.find({ user_id: id }).populate("permission_id", "name").lean().exec();
    const permissionIds = userPermissions?.map(rp => rp.permission_id?._id).filter(Boolean);

    if (!data) { return res.status(404).json({ message: `Entry with ID ${id} not found` }); }
    return res.status(201).json({ message: 'Entry Fetched', data: { ...data, role_ids: rolesIds, permission_ids: permissionIds } });
  };

  export async function get_user_module(req: NextApiRequest, res: NextApiResponse) {
    try {
      const role = (req.method === 'GET' ? req.query.role : req.body.role) as string;
      if (!role) { return res.status(400).json({ message: 'Invalid or missing ID', }); }

      const data = await getUserModule(String(role));

      return res.status(200).json({ message: `Fetched users with role ${role}`, data });
    } catch (error) {
      return await logError(error, { function: "get_user_module", payload: req.body });
    }
  }
// Vendor

// Ingridient
  export async function get_filtered_product_ingridients(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { filters = {}, page = 0, limit = 10 } = req.body || {};
      const { matchQuery, skip, limit: safeLimit } = buildFilterQuery(filters, { page, limit, defaultLimit: 10, maxLimit: 100, searchableFields: ["name"] });
      const total = await Ingridient.countDocuments(matchQuery);
  
      const data = await Ingridient.find(matchQuery).populate([ { path: 'media_id' } ]).skip(skip).limit(safeLimit).sort({ createdAt: -1 });
      return res.status(200).json({ message: 'Fetched all Ingridient', data, pagination: { total, page, limit: safeLimit, pages: Math.ceil(total / safeLimit) } });
    } catch (error) { return await logError(error, { function: "get_filtered_product_ingridients", payload: req.body }); }
  }

  export async function get_single_product_ingridient(req: NextApiRequest, res: NextApiResponse){
    try{
      const id = (req.method === 'GET' ? req.query.id : req.body.id) as string;
      if (!id || !Types.ObjectId.isValid(id)) { return res.status(400).json({ message: 'Invalid or missing ID' }); }  
    
      const entry = await Ingridient.findById(id).populate([ { path: 'media_id' } ]).exec();  
      if (!entry) { return res.status(404).json({ message: `Ingridient with ID ${id} not found` }); }
    
      return res.status(200).json({ message: '✅ Single Entry Fetched', data: entry });

    }catch (error) { return await logError(error, { function: "get_single_product_ingridient", payload: req.body }); }
  };

  export async function create_update_product_ingridient(req: ExtendedRequest, res: NextApiResponse) {
    try {
      const data = req.body;
      if (!data?.name || !data?.status) { return res.status(400).json({ message: '❌ Required fields missing' }); }

      const modelId = typeof data._id === 'string' || data._id instanceof Types.ObjectId ? data._id : null;

      let media_id: string | null = null;
      if (data.media_id && isValidObjectId(data.media_id)) { media_id = data.media_id; }
      const file = Array.isArray(req.files?.image) ? req.files.image[0] : req.files?.image;
      
      if (file) {
        media_id = await uploadMedia({ file, name: data.name, pathType: data.path, media_id: data.media_id ?? null, user_id: null });
      }

      if (modelId && isValidObjectId(modelId)) {
        try {
          const updated = await Ingridient.findByIdAndUpdate(modelId, {
              name: data.name,
              media_id: media_id,
              status: data.status,
              displayOrder: data.displayOrder,
              updatedAt: new Date(),
            }, { new: true });

          await generateSitemap();

          return res.status(200).json({ message: '✅ Entry updated successfully', data: updated });
        } catch (error) { return await logError(error, { function: "create_update_product_ingridient", payload: req.body }); }
      }
      
      const newEntry = new Ingridient({
        name: data.name,
        media_id: media_id,
        status: data.status,
        displayOrder: data.displayOrder,
        createdAt: new Date(),
      });

      await newEntry.save();
      await generateSitemap();
      return res.status(201).json({ message: '✅ Entry created successfully', data: newEntry });
    } catch (error) { return await logError(error, { function: "create_update_product_ingridient", payload: req.body }); }
  }

  export async function get_product_ingridient_module(req: NextApiRequest, res: NextApiResponse) {
    try {
      const data = await Ingridient.find().select('_id name').exec();
      return res.status(200).json({ message: 'Fetched all Product Ingridient Module', data });
    } catch (error) { return await logError(error, { function: "get_product_ingridient_module", payload: req.body }); }
  }
// Ingridient

// Feature
  export async function get_filtered_product_features(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { filters = {}, page = 0, limit = 10 } = req.body || {};
      const { matchQuery, skip, limit: safeLimit } = buildFilterQuery(filters, { page, limit, defaultLimit: 10, maxLimit: 100, searchableFields: ["name", "url"] });
      const total = await ProductFeature.countDocuments(matchQuery);

      const data = await ProductFeature.find(matchQuery).populate([ { path: 'media_id' }, { path: 'meta_id' } ]).skip(skip).limit(safeLimit).sort({ createdAt: -1 });
      return res.status(200).json({ message: 'Fetched all ProductFeature', data, pagination: { total, page, limit: safeLimit, pages: Math.ceil(total / safeLimit) } });
    } catch (error) { return await logError(error, { function: "get_filtered_product_features", payload: req.body }); }
  }

  export async function get_single_product_feature(req: NextApiRequest, res: NextApiResponse){
    try{
      const id = (req.method === 'GET' ? req.query.id : req.body.id) as string;
      if (!id || !Types.ObjectId.isValid(id)) { return res.status(400).json({ message: 'Invalid or missing ID' }); }  
    
      const entry = await ProductFeature.findById(id).populate([ { path: 'media_id' }, { path: 'meta_id' } ]).exec();  
      if (!entry) { return res.status(404).json({ message: `ProductFeature with ID ${id} not found` }); }
    
      return res.status(200).json({ message: '✅ Single Entry Fetched', data: entry });

    }catch (error) { return await logError(error, { function: "get_single_product_feature", payload: req.body }); }
  };

  export async function create_update_product_feature(req: ExtendedRequest, res: NextApiResponse) {
    try {
      const data = req.body;
      if (!data?.name || !data?.module || !data?.status) { return res.status(400).json({ message: '❌ Required fields missing' }); }

      const modelId = typeof data._id === 'string' || data._id instanceof Types.ObjectId ? data._id : null;

      const slug = await slugify(data.url, Productmeta, modelId);

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
          const updated = await ProductFeature.findByIdAndUpdate(modelId, {
              module: data.module,
              module_value: data.module_value,
              name: data.name,
              url: slug,
              content: data.content,
              media_id: media_id,
              meta_id: meta_id,
              status: data.status,
              displayOrder: data.displayOrder,
              updatedAt: new Date(),
            }, { new: true });

          await generateSitemap();
          return res.status(200).json({ message: '✅ Entry updated successfully', data: updated });
        } catch (error) { return await logError(error, { function: "create_update_product_feature", payload: req.body }); }
      }
      
      const newEntry = new ProductFeature({
       module: data.module,
        module_value: data.module_value,
        name: data.name,
        url: slug,
        content: data.content,
        media_id: media_id,
        meta_id: meta_id,
        status: data.status,
        displayOrder: data.displayOrder,
        createdAt: new Date(),
      });

      await newEntry.save();
      await generateSitemap();
      return res.status(201).json({ message: '✅ Entry created successfully', data: newEntry });
    } catch (error) { return await logError(error, { function: "create_update_product_feature", payload: req.body }); }
  }

  export async function get_product_feature_module(req: NextApiRequest, res: NextApiResponse) {
    try {
      const data = await ProductFeature.find().select('_id name').exec();
      return res.status(200).json({ message: 'Fetched all Product Feature Module', data });
    } catch (error) { return await logError(error, { function: "get_product_feature_module", payload: req.body }); }
  }
// Feature

export const functions: APIHandlers = {
  get_single_vendor : { middlewares: [] },
  get_user_module : { middlewares: [] },

  get_filtered_product_meta : { middlewares: ["checkUserId", "checkPostMethod"] },
  get_single_product_meta : { middlewares: [] },
  create_update_product_meta : { middlewares: ["checkUserId", "checkPostMethod"] },
  get_product_meta_by_module : { middlewares: [] },
  get_product_meta_parents : { middlewares: [] },
  get_product_type_parents : { middlewares: [] },

  get_filtered_product_brands : { middlewares: ["checkUserId", "checkPostMethod"] },
  get_single_product_brand : { middlewares: [] },
  create_update_product_brand : { middlewares: ["checkUserId", "checkPostMethod"] },
  get_product_brand_module : { middlewares: [] },
  
  get_filtered_product_ingridients : { middlewares: ["checkUserId", "checkPostMethod"] },
  get_single_product_ingridient : { middlewares: [] },
  create_update_product_ingridient : { middlewares: ["checkUserId", "checkPostMethod"] },
  get_product_ingridient_module : { middlewares: [] },

  get_filtered_product_features : { middlewares: ["checkUserId", "checkPostMethod"] },
  get_single_product_feature : { middlewares: [] },
  create_update_product_feature : { middlewares: ["checkUserId", "checkPostMethod"] },
  get_product_feature_module : { middlewares: [] },
}

export const basicHandlers = {
  get_single_vendor,
  get_user_module,

  get_filtered_product_meta,
  get_single_product_meta,
  create_update_product_meta,
  get_product_meta_by_module,
  get_product_meta_parents,
  get_product_type_parents,

  get_filtered_product_brands,
  get_single_product_brand,
  create_update_product_brand,
  get_product_brand_module,
  
  get_filtered_product_ingridients,
  get_single_product_ingridient,
  create_update_product_ingridient,
  get_product_ingridient_module,

  get_filtered_product_features,
  get_single_product_feature,
  create_update_product_feature,
  get_product_feature_module,
};

export const config = { api: { bodyParser: false } };
export default createApiHandler(functions, basicHandlers);