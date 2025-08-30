import { isValidObjectId, Types } from 'mongoose';
import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from 'pages/lib/mongodb';
import { IncomingForm, Fields, Files } from 'formidable';
import fs from 'fs';
import path from 'path';
import { log } from '../utils';
import { uploadMedia } from '../basic/media';
import Productmeta from 'lib/models/product/Productmeta';
import { slugify } from '@amitkk/basic/utils/utils';
import { upsertMeta } from '../basic/meta';
import ProductBrand from 'lib/models/product/ProductBrand';
import User from 'lib/models/spatie/User';
import UserRole from 'lib/models/spatie/UserRole';
import UserPermission from 'lib/models/spatie/UserPermission';
import { getUsersWithRole } from 'services/userService';

type HandlerMap = {
  [key: string]: (req: NextApiRequest, res: NextApiResponse) => Promise<void>;
};

export const config = {
  api: {
    bodyParser: false,
  },
};

interface ExtendedRequest extends NextApiRequest {
  file?: File;
  files?: { [key: string]: File | File[] };
}

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
        media_id = await uploadMedia({ file, name: data.name, pathType: data.path, media_id: data.media_id ?? null });
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

  // export async function get_all_productmeta_options(req: NextApiRequest, res: NextApiResponse) {
  //   try {
  //     const data = await Productmeta.find().select('_id name').exec();
  //     return res.status(200).json({ message: 'Fetched all Productmetas', data });
  //   } catch (error) { return log(error); }
  // }
// Productmeta

// ProductBrand
  export async function get_all_product_brands(req: NextApiRequest, res: NextApiResponse) {
    try {
      const data = await ProductBrand.find().populate([ { path: 'media_id' }, { path: 'meta_id' } ]).exec();
      return res.status(200).json({ message: 'Fetched all ProductBrands', data });
    } catch (error) { return log(error); }
  }

  export async function get_single_product_brand(req: NextApiRequest, res: NextApiResponse){
    try{
      const id = (req.method === 'GET' ? req.query.id : req.body.id) as string;
      if (!id || !Types.ObjectId.isValid(id)) { return res.status(400).json({ message: 'Invalid or missing ID' }); }  
    
      const entry = await ProductBrand.findById(id).populate([ { path: 'media_id' }, { path: 'meta_id' } ]).exec();  
      if (!entry) { return res.status(404).json({ message: `ProductBrand with ID ${id} not found` }); }
    
      return res.status(200).json({ message: '✅ Single Entry Fetched', data: entry });

    }catch (error) { return log(error); }
  };

  export async function create_update_product_brand(req: ExtendedRequest, res: NextApiResponse) {
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
        media_id = await uploadMedia({ file, name: data.name, pathType: data.path, media_id: data.media_id ?? null });
      }

      if (modelId && isValidObjectId(modelId)) {
        try {
          const updated = await ProductBrand.findByIdAndUpdate(
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
      const newEntry = new ProductBrand({
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
// ProductBrand

// Vendor
  export async function get_all_vendors(req: NextApiRequest, res: NextApiResponse) {
    try {
      const role = (req.method === 'GET' ? req.query.role : req.body.role) as string;
      if (!role) { return res.status(400).json({ message: 'Invalid or missing ID', }); }

      const data = await getUsersWithRole(String(role));

      console.log('data', data)


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
// Vendor

const functions: HandlerMap = {
  get_all_vendors: get_all_vendors,
  get_single_vendor: get_single_vendor,

  get_all_product_metas: get_all_product_metas,
  get_single_product_meta: get_single_product_meta,
  create_update_product_meta: create_update_product_meta,

  get_all_product_brands: get_all_product_brands,
  get_single_product_brand: get_single_product_brand,
  create_update_product_brand: create_update_product_brand,
};

const tmpDir = path.join(process.cwd(), 'tmp');
if (!fs.existsSync(tmpDir)) { fs.mkdirSync(tmpDir); }

function normalizeFormFields(fields: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const key in fields) {
    const value = fields[key];
    const v = Array.isArray(value) && value.length === 1 ? value[0] : value;
    result[key] = v === 'null' || v === '' ? undefined : v;
  }
  return result;
}

export const parseForm = async ( req: NextApiRequest ): Promise<{ fields: Fields; files: Files }> => {
  return new Promise((resolve, reject) => {
    const form = new IncomingForm({
      uploadDir: tmpDir,
      keepExtensions: true,
      multiples: true,
    });

    form.parse(req, (err: Error | null, fields: Fields, files: Files) => {
      if (err) {
        reject(err);
      } else {
        resolve({ fields, files });
      }
    });
  });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    let fnName: string;
    let body: any = req.body;
    let files: any = null;

    if (req.method === 'POST') {
      const parsed = await parseForm(req);
      body = normalizeFormFields(parsed.fields);
      files = parsed.files;
      fnName = body.function;
    } else {
      fnName = req.method === 'GET' ? (req.query.function as string) : req.body.function;
    }

    console.log("fnName", fnName)

    if (!fnName || typeof fnName !== 'string') { return res.status(400).json({ message: 'Missing or invalid function name' }); }    

    const targetFn = functions[fnName];
    if (!targetFn) { return res.status(400).json({ message: `Invalid function name: ${fnName}` }); }

    await connectDB();

    req.body = body;
    if (files) (req as any).files = files;

    await targetFn(req, res);
  } catch (error) { return log(error); }
}