import mongoose, { isValidObjectId, Types } from 'mongoose';
import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from 'pages/lib/mongodb';
import { IncomingForm, Fields, Files } from 'formidable';
import fs from 'fs';
import path from 'path';
import { fetchData, generateSitemap, log } from '../utils';
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
import Product from 'lib/models/product/Product';

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

export async function get_all_products(req: NextApiRequest, res: NextApiResponse) {
  try {
    const data = await Product.find().populate([ { path: 'media_id' }, { path: 'meta_id' }, { path: 'author_id' }, { path: 'metas', populate: { path: 'blogmeta_id', model: 'Blogmeta', select: '_id type name url' } } ]).exec();
    return res.status(200).json({ message: 'Fetched all Products', data });
  } catch (error) { return log(error); }
}

export async function get_single_product(req: NextApiRequest, res: NextApiResponse){
  try{
    const id = (req.method === 'GET' ? req.query.id : req.body.id) as string;
  
    if (!id || !Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid or missing ID' });
    }
  
    const data = await Product.findById(id).populate([ { path: 'media_id' }, { path: 'meta_id' }, { path: 'author_id' }, { path: 'metas', populate: { path: 'blogmeta_id', model: 'Blogmeta', select: '_id type name url' } } ]).exec();
  
    if (!data) { return res.status(404).json({ message: `Product meta with ID ${id} not found` }); }
    return res.status(200).json({ message: 'Fetched Single Product', data });
  }catch (error) { return log(error); }
};

export async function create_update_product(req: ExtendedRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const data = req.body;

    if (!data?.name ) {
      return res.status(400).json({ message: 'Required fields missing' });
    }

    // || !data?.status

    const modelId = typeof data._id === 'string' || data._id instanceof Types.ObjectId ? data._id : null;

    const slug = await slugify(data.url, Product, modelId);

    let media_id: string | null = null;
    if (data.media_id && isValidObjectId(data.media_id)) { media_id = data.media_id; }
    const file = Array.isArray(req.files?.image) ? req.files.image[0] : req.files?.image;
    
    if (file) {
      media_id = await uploadMedia({ file, name: data.name, pathType: data.path, media_id: data.media_id ?? null, user_id: data.vendor_id });
    }    

    let meta_id: string | null = null;
    meta_id = await upsertMeta({ meta_id: data.selected_meta_id ?? null, url: data.url, title: data.title, description: data.description });

    if (modelId && isValidObjectId(modelId)) {
      try {
        const updated = await Product.findByIdAndUpdate(
          modelId,
          {
            vendor_id: data.vendor_id,
            name: data.name,
            url: slug,
            meta_id: meta_id,
            status: data.status,
            media_id: media_id ?? undefined,
            author_id: data.author_id ?? undefined,
            content: data.content,
            updatedAt: new Date(),
          },
          { new: true }
        );

        generateSitemap();

        if (updated) {
          return res.status(200).json({ message: 'Entry updated successfully', data: updated });
        } else {
          return res.status(404).json({ message: 'Entry not found for update' });
        }
      } catch (error) { log(error); }
    }
    
    const newEntry = new Product({
      vendor_id: data.vendor_id,
      name: data.name,
      url: slug,
      meta_id: meta_id,
      status: data.status ?? true,
      media_id: media_id ?? undefined,
      author_id: data.author_id ?? undefined,
      content: data.content,
    });

    await newEntry.save();

    const blogMetaIds = JSON.parse(req.body.blogmeta || '[]');
    // await pivotEntry( BlogBlogmeta, newEntry._id, blogMetaIds, 'blog_id', 'blogmeta_id' );

    generateSitemap();
    
    return res.status(201).json({ message: 'Entry created successfully', data: newEntry });
  } catch (error) { log(error); }
}

export async function get_product_modules(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { vendor_id } = req.query;
    const filter: any = {};
    if (vendor_id && mongoose.Types.ObjectId.isValid(vendor_id as string)) {
      filter.vendor_id = new mongoose.Types.ObjectId(vendor_id as string);
    }
    const productBrand = await fetchData(ProductBrand, { filter, select: "_id name", sort: { name: 1 } });

    const category = await fetchData(Productmeta, { filter: { module: "Category" }, select: "_id name", sort: { name: 1 } });
    const tag = await fetchData(Productmeta, { filter: { module: "Tag" }, select: "_id name", sort: { name: 1 } });
    const productTypes = await fetchData(Productmeta, { filter: { module: "Type" }, select: "_id name", sort: { name: 1 } });
    const ingridient = await fetchData(Ingridient, { select: "_id name", sort: { name: 1 } });
    const flavors = await fetchData(ProductFeature, { filter: { module: "Flavor" }, select: "_id name", sort: { name: 1 } });
    const colors = await fetchData(ProductFeature, { filter: { module: "Color" }, select: "_id name", sort: { name: 1 } });
    const eggless = await fetchData(ProductFeature, { filter: { module: "Eggless" }, select: "_id name", sort: { name: 1 } });
    const glutten = await fetchData(ProductFeature, { filter: { module: "Glutten Free" }, select: "_id name", sort: { name: 1 } });
    const sugar = await fetchData(ProductFeature, { filter: { module: "Sugar Free" }, select: "_id name", sort: { name: 1 } });
    const storage = await fetchData(ProductFeature, { filter: { module: "Storage" }, select: "_id name", sort: { name: 1 } });


  // const tag = await Productmeta.find({ module: 'Tag' }).select("_id name").exec();
  // const productTypes = await Productmeta.find({ module: 'Type' }).select("_id name").exec();
  // const productBrand = await ProductBrand.find(filter).select("_id name").exec();
  // const ingridient = await Ingridient.find().select("_id name").exec();
  // const flavors = await ProductFeature.find({ module: 'Flavor' }).select("_id name").exec();
  // const colors = await ProductFeature.find({ module: 'Color' }).select("_id name").exec();
  // const eggless = await ProductFeature.find({ module: 'Eggless' }).select("_id name").exec();
  // const glutten = await ProductFeature.find({ module: 'Glutten Free' }).select("_id name").exec();
  // const storage = await ProductFeature.find({ module: 'Storage' }).select("_id name").exec();

  return res.status(200).json({ message: 'Fetched all Products', data:{ category, tag, productTypes, productBrand, ingridient, flavors, colors, eggless, glutten, sugar, storage } });
  } catch (error) { return log(error); }
}

const functions: HandlerMap = {
  get_all_products: get_all_products,
  get_single_product: get_single_product,
  create_update_product: create_update_product,

  get_product_modules: get_product_modules,
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

    if (!fnName || typeof fnName !== 'string') { return res.status(400).json({ message: 'Missing or invalid function name' }); }    

    const targetFn = functions[fnName];
    if (!targetFn) { return res.status(400).json({ message: `Invalid function name: ${fnName}` }); }

    await connectDB();

    req.body = body;
    if (files) (req as any).files = files;

    await targetFn(req, res);
  } catch (error) { return log(error); }
}