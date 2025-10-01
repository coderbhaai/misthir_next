import { isValidObjectId, Types } from 'mongoose';
import type { NextApiRequest, NextApiResponse } from 'next';
import { log } from '../utils';
import { uploadMedia } from '../basic/media';
import Productmeta from 'lib/models/product/Productmeta';
import { slugify } from '@amitkk/basic/utils/utils';
import { upsertMeta } from '../basic/meta';
import ProductBrand from 'lib/models/product/ProductBrand';
import User from 'lib/models/spatie/User';
import UserRole from 'lib/models/spatie/UserRole';
import UserPermission from 'lib/models/spatie/UserPermission';
import { getUserModule, getUsersWithRole } from 'services/userService';
import Ingridient from 'lib/models/product/Ingridient';
import ProductFeature from 'lib/models/product/ProductFeature';
import Commission from 'lib/models/product/Commission';
import BankDetail from 'lib/models/product/BankDetail';
import Documentation from 'lib/models/product/Documentation';
import { createApiHandler, ExtendedRequest } from '../apiHandler';
import { APIHandlers } from '../middleware';

// Productmeta
  export async function get_all_product_metas(req: NextApiRequest, res: NextApiResponse) {
    try {
      const data = await Productmeta.find().populate([ { path: 'media_id' }, { path: 'meta_id' } ]).exec();
      return res.status(200).json({ message: 'Fetched all Productmetas', data });
    } catch (error) { return log(error); }
  }

  export async function get_single_product_meta(req: NextApiRequest, res: NextApiResponse){
    try{
      const id = (req.method === 'GET' ? req.query.id : req.body.id) as string;
      if (!id || !Types.ObjectId.isValid(id)) { return res.status(400).json({ message: 'Invalid or missing ID' }); }  
    
      const entry = await Productmeta.findById(id).populate([ { path: 'media_id' }, { path: 'meta_id' } ]).exec();  
      if (!entry) { return res.status(404).json({ message: `Productmeta with ID ${id} not found` }); }
    
      return res.status(200).json({ message: '✅ Single Entry Fetched', data: entry });

    }catch (error) { return log(error); }
  };

  export async function create_update_product_meta(req: ExtendedRequest, res: NextApiResponse) {
    try {
      if (req.method !== 'POST') { return res.status(405).json({ message: 'Method Not Allowed' }); }

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
          const updated = await Productmeta.findByIdAndUpdate(
            modelId,
            {
              module: data.module,
              name: data.name,
              url: slug,
              media_id: media_id,
              meta_id: meta_id,
              content: data.content,
              status: data.status,
              displayOrder: data.displayOrder,
              updatedAt: new Date(),
            }, { new: true }
          );

          return res.status(200).json({ message: '✅ Entry updated successfully', data: updated });
        } catch (error) { return log(error); }
      }
      const newEntry = new Productmeta({
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
      return res.status(201).json({ message: '✅ Entry created successfully', data: newEntry });
    } catch (error) { return log(error); }
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
    } catch (error) { return log(error); }
  }
// Productmeta

// ProductBrand
  export async function get_all_product_brands(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { vendor_id } = req.query;
      const filter: any = {};
      if (vendor_id) { filter.vendor_id = vendor_id; }

      const data = await ProductBrand.find(filter).populate([ { path: 'media_id' }, { path: 'meta_id' }, { path: 'vendor_id' }, ]).exec();
      return res.status(200).json({ message: 'Fetched all ProductBrands', data });
    } catch (error) { return log(error); }
  }

  export async function get_single_product_brand(req: NextApiRequest, res: NextApiResponse){
    try{
      const id = (req.method === 'GET' ? req.query.id : req.body.id) as string;
      if (!id || !Types.ObjectId.isValid(id)) { return res.status(400).json({ message: 'Invalid or missing ID' }); }  
    
      const entry = await ProductBrand.findById(id).populate([ { path: 'media_id' }, { path: 'meta_id' }, { path: 'vendor_id' }, ]).exec();  
      if (!entry) { return res.status(404).json({ message: `ProductBrand with ID ${id} not found` }); }
    
      return res.status(200).json({ message: '✅ Single Entry Fetched', data: entry });

    }catch (error) { return log(error); }
  };

  export async function create_update_product_brand(req: ExtendedRequest, res: NextApiResponse) {
    try {
      if (req.method !== 'POST') { return res.status(405).json({ message: 'Method Not Allowed' }); }

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
        media_id = await uploadMedia({ file, name: data.name, pathType: data.path, media_id: data.media_id ?? null, user_id: data.vendor_id });
      }
      
      if (modelId && isValidObjectId(modelId)) {
        try {
          const updated = await ProductBrand.findByIdAndUpdate(
            modelId,
            {
              vendor_id: data.vendor_id,
              name: data.name,
              url: slug,
              media_id: media_id,
              meta_id: meta_id,
              content: data.content,
              status: data.status,
              displayOrder: data.displayOrder,
              updatedAt: new Date(),
            }, { new: true }
          );

          return res.status(200).json({ message: '✅ Entry updated successfully', data: updated });
        } catch (error) { return log(error); }
      }
      
      const newEntry = new ProductBrand({
        vendor_id: data.vendor_id,
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
      return res.status(201).json({ message: '✅ Entry created successfully', data: newEntry });
    } catch (error) { return log(error); }
  }

  export async function get_product_brand_module(req: NextApiRequest, res: NextApiResponse) {
    try {
      const data = await ProductBrand.find().select('_id name').exec();
      return res.status(200).json({ message: 'Fetched all Product Brands Module', data });
    } catch (error) { return log(error); }
  }
// ProductBrand

// Vendor
  export async function get_user_by_role(req: NextApiRequest, res: NextApiResponse) {
    try {
      const role = (req.method === 'GET' ? req.query.role : req.body.role) as string;
      if (!role) { return res.status(400).json({ message: 'Invalid or missing ID', }); }

      const data = await getUsersWithRole(String(role));

      return res.status(200).json({ message: `Fetched users with role ${role}`, data });
    } catch (error) {
      return log(error);
    }
  }

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
      return log(error);
    }
  }
// Vendor

// Ingridient
  export async function get_all_product_ingridients(req: NextApiRequest, res: NextApiResponse) {
    try {
      const data = await Ingridient.find().populate([ { path: 'media_id' } ]).exec();
      return res.status(200).json({ message: 'Fetched all Ingridient', data });
    } catch (error) { return log(error); }
  }

  export async function get_single_product_ingridient(req: NextApiRequest, res: NextApiResponse){
    try{
      const id = (req.method === 'GET' ? req.query.id : req.body.id) as string;
      if (!id || !Types.ObjectId.isValid(id)) { return res.status(400).json({ message: 'Invalid or missing ID' }); }  
    
      const entry = await Ingridient.findById(id).populate([ { path: 'media_id' } ]).exec();  
      if (!entry) { return res.status(404).json({ message: `Ingridient with ID ${id} not found` }); }
    
      return res.status(200).json({ message: '✅ Single Entry Fetched', data: entry });

    }catch (error) { return log(error); }
  };

  export async function create_update_product_ingridient(req: ExtendedRequest, res: NextApiResponse) {
    try {
      if (req.method !== 'POST') { return res.status(405).json({ message: 'Method Not Allowed' }); }

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
          const updated = await Ingridient.findByIdAndUpdate(
            modelId,
            {
              name: data.name,
              media_id: media_id,
              status: data.status,
              displayOrder: data.displayOrder,
              updatedAt: new Date(),
            }, { new: true }
          );

          return res.status(200).json({ message: '✅ Entry updated successfully', data: updated });
        } catch (error) { return log(error); }
      }
      
      const newEntry = new Ingridient({
        name: data.name,
        media_id: media_id,
        status: data.status,
        displayOrder: data.displayOrder,
        createdAt: new Date(),
      });

      await newEntry.save();
      return res.status(201).json({ message: '✅ Entry created successfully', data: newEntry });
    } catch (error) { return log(error); }
  }

  export async function get_product_ingridient_module(req: NextApiRequest, res: NextApiResponse) {
    try {
      const data = await Ingridient.find().select('_id name').exec();
      return res.status(200).json({ message: 'Fetched all Product Ingridient Module', data });
    } catch (error) { return log(error); }
  }
// Ingridient

// Feature
  export async function get_all_product_features(req: NextApiRequest, res: NextApiResponse) {
    try {
      const data = await ProductFeature.find().populate([ { path: 'media_id' }, { path: 'meta_id' } ]).exec();
      return res.status(200).json({ message: 'Fetched all ProductFeature', data });
    } catch (error) { return log(error); }
  }

  export async function get_single_product_feature(req: NextApiRequest, res: NextApiResponse){
    try{
      const id = (req.method === 'GET' ? req.query.id : req.body.id) as string;
      if (!id || !Types.ObjectId.isValid(id)) { return res.status(400).json({ message: 'Invalid or missing ID' }); }  
    
      const entry = await ProductFeature.findById(id).populate([ { path: 'media_id' }, { path: 'meta_id' } ]).exec();  
      if (!entry) { return res.status(404).json({ message: `ProductFeature with ID ${id} not found` }); }
    
      return res.status(200).json({ message: '✅ Single Entry Fetched', data: entry });

    }catch (error) { return log(error); }
  };

  export async function create_update_product_feature(req: ExtendedRequest, res: NextApiResponse) {
    try {
      if (req.method !== 'POST') { return res.status(405).json({ message: 'Method Not Allowed' }); }

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
          const updated = await ProductFeature.findByIdAndUpdate(
            modelId,
            {
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
            }, { new: true }
          );

          return res.status(200).json({ message: '✅ Entry updated successfully', data: updated });
        } catch (error) { return log(error); }
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
      return res.status(201).json({ message: '✅ Entry created successfully', data: newEntry });
    } catch (error) { return log(error); }
  }

  export async function get_product_feature_module(req: NextApiRequest, res: NextApiResponse) {
    try {
      const data = await ProductFeature.find().select('_id name').exec();
      return res.status(200).json({ message: 'Fetched all Product Feature Module', data });
    } catch (error) { return log(error); }
  }
// Feature

// Commission
  export async function get_all_commissions(req: NextApiRequest, res: NextApiResponse) {
    try {      
      const { vendor_id } = req.query;

      let filter: any = {};
      if (vendor_id) { filter.vendor_id = vendor_id; }

      const data = await Commission.find(filter).populate([{ path: "vendor_id" }, { path: "productmeta_id" }]).exec();
      return res.status(200).json({ message: 'Fetched all Commission', data });
    } catch (error) { return log(error); }
  }

  export async function get_single_commission(req: NextApiRequest, res: NextApiResponse){
    try{
      const id = (req.method === 'GET' ? req.query.id : req.body.id) as string;
      if (!id || !Types.ObjectId.isValid(id)) { return res.status(400).json({ message: 'Invalid or missing ID' }); }  
    
      const entry = await Commission.findById(id).populate([ { path: 'vendor_id' }, { path: 'productmeta_id' } ]).exec();  
      if (!entry) { return res.status(404).json({ message: `Commission with ID ${id} not found` }); }
    
      return res.status(200).json({ message: '✅ Single Entry Fetched', data: entry });

    }catch (error) { return log(error); }
  };

  export async function create_update_commission(req: ExtendedRequest, res: NextApiResponse) {
    try {
      if (req.method !== 'POST') { return res.status(405).json({ message: 'Method Not Allowed' }); }

      const data = req.body;

      if (!data?.productmeta_id || !data?.vendor_id || !data?.percentage) { return res.status(400).json({ message: '❌ Required fields missing' }); }

      const existing = await Commission.findOne({ productmeta_id: data.productmeta_id, vendor_id: data.vendor_id });

      if (existing) {
        existing.percentage = data.percentage;
        existing.updatedAt = new Date();

        const updated = await existing.save();
        return res.status(200).json({ message: "✅ Entry updated successfully", data: updated });
      }
      
      const newEntry = new Commission({
       productmeta_id: data.productmeta_id,
        vendor_id: data.vendor_id,
        percentage: data.percentage,
        createdAt: new Date(),
      });

      await newEntry.save();
      return res.status(201).json({ message: '✅ Entry created successfully', data: newEntry });
    } catch (error) { return log(error); }
  }

  export async function create_update_vendor_commission(req: ExtendedRequest, res: NextApiResponse) {
    try {
      if (req.method !== "POST") { return res.status(405).json({ message: "Method Not Allowed" }); }
      const { data } = req.body;

      if (!Array.isArray(data) || data.length === 0) { return res.status(400).json({ message: "❌ No commission entries provided" }); }
      const results = [];

      for (const entry of data) {
        if (!entry?.productmeta_id || !entry?.vendor_id || entry.percentage === undefined) {
          results.push({ success: false, entry, message: "❌ Required fields missing" });
          continue;
        }

        const existing = await Commission.findOne({ productmeta_id: entry.productmeta_id, vendor_id: entry.vendor_id });

        if (existing) {
          existing.percentage = entry.percentage;
          existing.updatedAt = new Date();

          const updated = await existing.save();
          results.push({ success: true, type: "update", data: updated });
        } else {
          const newEntry = new Commission({
            productmeta_id: entry.productmeta_id,
            vendor_id: entry.vendor_id,
            percentage: entry.percentage,
            createdAt: new Date(),
          });

          await newEntry.save();
          results.push({ success: true, type: "create", data: newEntry });
        }
      }

      return res.status(200).json({ message: "✅ Bulk commissions processed", results });
    } catch (error) { return log(error); }
  }
// Commission

// Bank Detail
  export async function get_all_bank_details(req: NextApiRequest, res: NextApiResponse) {
    try {
      const data = await BankDetail.find().populate([ { path: 'user_id' } ]).exec();
      return res.status(200).json({ message: 'Fetched all BankDetail', data });
    } catch (error) { return log(error); }
  }

  export async function get_single_bank_detail(req: NextApiRequest, res: NextApiResponse){
    try{
      const id = (req.method === 'GET' ? req.query.id : req.body.id) as string;
      if (!id || !Types.ObjectId.isValid(id)) { return res.status(400).json({ message: 'Invalid or missing ID' }); }  
    
      const entry = await BankDetail.findById(id).populate([ { path: 'user_id' } ]).exec();  
      if (!entry) { return res.status(404).json({ message: `BankDetail with ID ${id} not found` }); }
    
      return res.status(200).json({ message: '✅ Single Entry Fetched', data: entry });

    }catch (error) { return log(error); }
  };

  export async function create_update_bank_detail(req: ExtendedRequest, res: NextApiResponse) {
    try {
      if (req.method !== 'POST') { return res.status(405).json({ message: 'Method Not Allowed' }); }

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
        } catch (error) { return log(error); }
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
    } catch (error) { return log(error); }
  }
// Bank Detail

// Document
  export async function get_all_documents(req: NextApiRequest, res: NextApiResponse) {
    try {
      const data = await Documentation.find().populate([ { path: 'user_id' }, { path: 'media_id' } ]).exec();
      return res.status(200).json({ message: 'Fetched all Documentation', data });
    } catch (error) { return log(error); }
  }

  export async function get_single_document(req: NextApiRequest, res: NextApiResponse){
    try{
      const id = (req.method === 'GET' ? req.query.id : req.body.id) as string;
      if (!id || !Types.ObjectId.isValid(id)) { return res.status(400).json({ message: 'Invalid or missing ID' }); }  
    
      const entry = await Documentation.findById(id).populate([ { path: 'user_id' }, { path: 'media_id' } ]).exec();  
      if (!entry) { return res.status(404).json({ message: `Documentation with ID ${id} not found` }); }
    
      return res.status(200).json({ message: '✅ Single Entry Fetched', data: entry });

    }catch (error) { return log(error); }
  };

  export async function create_update_document(req: ExtendedRequest, res: NextApiResponse) {
    try {
      if (req.method !== 'POST') { return res.status(405).json({ message: 'Method Not Allowed' }); }
      
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
        } catch (error) { return log(error); }
      }
      
      const newEntry = new Documentation({
        user_id: data.user_id,
        name: data.name,
        media_id: media_id,
        createdAt: new Date(),
      });

      await newEntry.save();
      return res.status(201).json({ message: '✅ Entry created successfully', data: newEntry });
    } catch (error) { return log(error); }
  }
// Document

export const functions: APIHandlers = {
  get_user_by_role : { middlewares: [] },
  get_single_vendor : { middlewares: [] },
  get_user_module : { middlewares: [] },

  get_all_product_metas : { middlewares: [] },
  get_single_product_meta : { middlewares: [] },
  create_update_product_meta : { middlewares: [] },
  get_product_meta_by_module : { middlewares: [] },

  get_all_product_brands : { middlewares: [] },
  get_single_product_brand : { middlewares: [] },
  create_update_product_brand : { middlewares: [] },
  get_product_brand_module : { middlewares: [] },
  
  get_all_product_ingridients : { middlewares: [] },
  get_single_product_ingridient : { middlewares: [] },
  create_update_product_ingridient : { middlewares: [] },
  get_product_ingridient_module : { middlewares: [] },

  get_all_product_features : { middlewares: [] },
  get_single_product_feature : { middlewares: [] },
  create_update_product_feature : { middlewares: [] },
  get_product_feature_module : { middlewares: [] },

  get_all_commissions : { middlewares: [] },
  get_single_commission : { middlewares: [] },
  create_update_commission : { middlewares: [] },
  create_update_vendor_commission : { middlewares: [] },

  get_all_bank_details : { middlewares: [] },
  get_single_bank_detail : { middlewares: [] },
  create_update_bank_detail : { middlewares: [] },

  get_all_documents : { middlewares: [] },
  get_single_document : { middlewares: [] },
  create_update_document : { middlewares: [] },
}

export const basicHandlers = {
  get_user_by_role,
  get_single_vendor,
  get_user_module,

  get_all_product_metas,
  get_single_product_meta,
  create_update_product_meta,
  get_product_meta_by_module,

  get_all_product_brands,
  get_single_product_brand,
  create_update_product_brand,
  get_product_brand_module,
  
  get_all_product_ingridients,
  get_single_product_ingridient,
  create_update_product_ingridient,
  get_product_ingridient_module,

  get_all_product_features,
  get_single_product_feature,
  create_update_product_feature,
  get_product_feature_module,

  get_all_commissions,
  get_single_commission,
  create_update_commission,
  create_update_vendor_commission,

  get_all_bank_details,
  get_single_bank_detail,
  create_update_bank_detail,

  get_all_documents,
  get_single_document,
  create_update_document,
};

export const config = { api: { bodyParser: false } };
export default createApiHandler(functions);