import mongoose, { isValidObjectId, Types } from 'mongoose';
import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchData, generateSitemap, getRelatedContent, getUserIdFromToken, log, pivotEntry } from '../utils';
import { syncMediaHub } from '../basic/media';
import Productmeta from 'lib/models/product/Productmeta';
import { slugify } from '@amitkk/basic/utils/utils';
import { upsertMeta } from '../basic/meta';
import ProductBrand from 'lib/models/product/ProductBrand';
import Ingridient from 'lib/models/product/Ingridient';
import ProductFeature from 'lib/models/product/ProductFeature';
import Product, { ProductDocument } from 'lib/models/product/Product';
import ProductProductmeta from 'lib/models/product/ProductProductmeta';
import ProductProductFeature from 'lib/models/product/ProductProductFeature';
import ProductIngridient from 'lib/models/product/ProductIngridient';
import ProductProductBrand from 'lib/models/product/ProductProductBrand';
import { Sku, SkuDetail } from 'lib/models/product/Sku';
import SkuProductFeature from 'lib/models/product/SkuProductFeature';
import { ProductRawDocument } from 'lib/models/types';
import { createApiHandler, ExtendedRequest } from '../apiHandler';
import Tax from 'lib/models/payment/Tax';
import { getReviews } from '../basic/review';
import BulkOrder from 'lib/models/ecom/BulkOrder';
import { initAction } from '../basic/action';

export async function get_all_products(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { vendor_id } = req.query;
    const filter: any = {};
    if (vendor_id && mongoose.Types.ObjectId.isValid(vendor_id as string)) {
      filter.vendor_id = new mongoose.Types.ObjectId(vendor_id as string);
    }

    const data = await fetchData<ProductDocument>(Product, { filter, sort: { name: 1 }, lean : false,
      populate: [
        { path: 'meta_id', select: '_id title description' },
        { path: 'productMeta', populate: { path: 'productmeta_id', select: '_id module name url' } },
        { path: 'productFeature', populate: { path: 'productFeature_id', model: 'ProductFeature', select: '_id name url' } },
        { path: 'productBrand', populate: { path: 'productBrand_id', model: 'ProductBrand', select: '_id name url' } },
        { path: 'productIngridient', populate: { path: 'ingridient_id', model: 'Ingridient', select: '_id name url' } },
        { path: "mediaHubs", populate: { path: "media_id", model: "Media", select: "_id path alt" } },
        { path: "sku",
          populate: [
            { path: "details", model: "SkuDetail" },
            { path: "flavors", populate: { path: "productFeature_id", model: "ProductFeature", select: "_id module name url" } },
            { path: "colors", populate: { path: "productFeature_id", model: "ProductFeature", select: "_id module name url" } },
          ] 
        },
      ] 
    });

    const cleanData = data.map(d => d.toJSON());

    return res.status(200).json({ message: 'Fetched all Products', data:cleanData });
  } catch (error) { return log(error); }
}

export async function get_single_product(req: NextApiRequest, res: NextApiResponse){
  try{
    const id = (req.method === 'GET' ? req.query.id : req.body.id) as string;
  
    if (!id || !Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid or missing ID' });
    }

    const { vendor_id } = req.query;
    const filter: any = {};

    filter._id = new mongoose.Types.ObjectId(id);
    if (vendor_id && mongoose.Types.ObjectId.isValid(vendor_id as string)) {
      filter.vendor_id = new mongoose.Types.ObjectId(vendor_id as string);
    }

    const data = await Product.findOne(filter)
      .populate([
        { path: 'meta_id', select: '_id title description' },
        { path: 'productMeta', populate: { path: 'productmeta_id', select: '_id module name url' } },
        { path: 'productFeature', populate: { path: 'productFeature_id', model: 'ProductFeature', select: '_id module name url' } },
        { path: 'productBrand', populate: { path: 'productBrand_id', model: 'ProductBrand', select: '_id name url' } },
        { path: 'productIngridient', populate: { path: 'ingridient_id', model: 'Ingridient', select: '_id name url' } },
        { path: "mediaHubs", populate: { path: "media_id", model: "Media", select: "_id path alt" } },
        { path: 'sku',
          populate: [
            { path: 'details', model: 'SkuDetail' },
            { path: 'eggless_id', model: 'ProductFeature', select: '_id module name url' },
            { path: 'sugarfree_id', model: 'ProductFeature', select: '_id module name url' },
            { path: 'gluttenfree_id', model: 'ProductFeature', select: '_id module name url' },
            { path: 'flavors',  populate: { path: 'productFeature_id', model: 'ProductFeature', select: '_id module name url' } },
            { path: 'colors',   populate: { path: 'productFeature_id', model: 'ProductFeature', select: '_id module name url' } },
          ],
        },
      ]).lean(false).exec();
  
    if (!data) { return res.status(404).json({ message: `Product  with ID ${id} not found` }); }
    return res.status(200).json({ message: 'Fetched Single Product', data });
  }catch (error) { return log(error); }
};

export async function create_update_product(req: ExtendedRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') { return res.status(405).json({ message: 'Method Not Allowed' }); }

    const data = req.body;

    if (!data?.name || !data?.status || !data?.url ) {
      return res.status(400).json({ message: 'Required fields missing' });
    }

    const modelId = typeof data._id === 'string' || data._id instanceof Types.ObjectId ? data._id : null;
    const slug = await slugify(data.url, Product, modelId);
    let meta_id: string | null = null;
    meta_id = await upsertMeta({
      meta_id: data?.selected_meta_id ?? null,
      url: data?.url ?? data?.name,
      title: data?.title ?? data?.name,
      description: data?.description ?? data?.name,
    });

    const mediaArray: string[] = JSON.parse(data.selectedMediaIds || [] );
    const productMeta: string[] = JSON.parse(data.productMeta || [] );
    const storage: string[] = JSON.parse(data.storage || [] );
    const ingridients: string[] = JSON.parse(data.ingridients || [] );
    const brands: string[] = JSON.parse(data.brands || [] );
    const skus = JSON.parse(data.skus || []);

    if (modelId && isValidObjectId(modelId)) {
      try {
        const updated = await Product.findByIdAndUpdate(
          modelId,
          {
            vendor_id: data.vendor_id,
            name: data.name,
            url: slug,
            gtin: data.gtin,
            tax_id: data.tax_id,
            meta_id: meta_id,
            status: data.status,
            displayOrder: data.displayOrder,
            adminApproval: data.adminApproval,
            dietary_type: data.dietary_type,
            short_desc: data.short_desc,
            long_desc: data.long_desc,
            updatedAt: new Date(),
          },
          { new: true }
        );
        
        await syncMediaHub({ module: data.module, module_id: updated._id, mediaArray });
        await pivotEntry( ProductProductmeta, updated._id, productMeta, 'product_id', 'productmeta_id' );
        await pivotEntry( ProductProductFeature, updated._id, storage, 'product_id', 'productFeature_id' );
        await pivotEntry( ProductIngridient, updated._id, ingridients, 'product_id', 'ingridient_id' );
        await pivotEntry( ProductProductBrand, updated._id, brands, 'product_id', 'productBrand_id' );

        if (Array.isArray(skus)) {
          for (const skuData of skus) {
            await upsertSku({ ...skuData, product_id: updated._id });
          }
        }
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
        gtin: data.gtin,
        tax_id: data.tax_id,
        meta_id: meta_id,
        status: data.status,
        displayOrder: data.displayOrder,
        adminApproval: data.adminApproval,
        dietary_type: data.dietary_type,
        short_desc: data.short_desc,
        long_desc: data.long_desc,
        createdAt: new Date(),
    });

    await newEntry.save();

    await syncMediaHub({ module: data.module, module_id: newEntry._id, mediaArray });
    await pivotEntry( ProductProductmeta, newEntry._id, productMeta, 'product_id', 'productmeta_id' );
    await pivotEntry( ProductProductFeature, newEntry._id, storage, 'product_id', 'productFeature_id' );
    await pivotEntry( ProductIngridient, newEntry._id, ingridients, 'product_id', 'ingridient_id' );
    await pivotEntry( ProductProductBrand, newEntry._id, brands, 'product_id', 'productBrand_id' );
    
    if (Array.isArray(skus)) {
      for (const skuData of skus) {
        await upsertSku({ ...skuData, product_id: newEntry._id });
      }
    }
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
    const tax = await fetchData(Tax, { select: "_id name", sort: { name: 1 } });

  return res.status(200).json({ message: 'Fetched all Products', data:{ category, tag, productTypes, productBrand, ingridient, flavors, colors, eggless, glutten, sugar, storage, tax } });
  } catch (error) { return log(error); }
}

export async function get_single_product_module(req: NextApiRequest, res: NextApiResponse){
  const id = (req.method === 'GET' ? req.query.id : req.body.id) as string;

  if (!id || !Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid or missing ID' });
  }

  const entry = await Product.findById(id).exec();
  if (!entry) { return res.status(404).json({ message: `Product with ID ${id} not found` }); }

  return res.status(200).json({ message: '✅ Single Entry Fetched', data: entry });
};

export async function get_product_module(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { vendor_id } = req.query;
    const filter: any = {};
    if (vendor_id && mongoose.Types.ObjectId.isValid(vendor_id as string)) {
      filter.vendor_id = new mongoose.Types.ObjectId(vendor_id as string);
    }

    const data = await Product.find(filter).select("_id name").exec();

    return res.status(200).json({ message: 'Fetched all Product Modules', data });
  } catch (error) { log(error); }
}

interface UpsertSkuInput {
  _id?: string;
  product_id: string | Types.ObjectId;
  name: string;
  price: number;
  inventory: number;
  status?: boolean;
  displayOrder?: number;
  adminApproval?: boolean;
  eggless_id?: string;
  sugarfree_id?: string;
  gluttenfree_id?: string;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  preparationTime?: number;
  flavors?: string[];
  colors?: string[];
}

export async function upsertSku(data: UpsertSkuInput) {
  try{
    let sku;
  
    if (data._id) {
      sku = await Sku.findByIdAndUpdate(
        data._id,
        {
          product_id: data.product_id,
          name: data.name,
          price: data.price,
          inventory: data.inventory,
          status: data.status ?? true,
          displayOrder: data.displayOrder ?? 0,
          adminApproval: data.adminApproval ?? true,
          eggless_id: data.eggless_id,
          sugarfree_id: data.sugarfree_id,
          gluttenfree_id: data.gluttenfree_id,
          updatedAt: new Date(),
        },{ new: true, upsert: true }
      );
    } else {
      sku = new Sku({
        product_id: data.product_id,
        name: data.name,
        price: data.price,
        inventory: data.inventory,
        status: data.status ?? true,
        displayOrder: data.displayOrder ?? 0,
        adminApproval: data.adminApproval ?? true,
        eggless_id: data.eggless_id,
        sugarfree_id: data.sugarfree_id,
        gluttenfree_id: data.gluttenfree_id,
      });
      await sku.save();
    }
    
    await SkuDetail.findOneAndUpdate(
      { sku_id: sku._id },
      {
        weight: data.weight ?? 0,
        length: data.length ?? 0,
        width: data.width ?? 0,
        height: data.height ?? 0,
        preparationTime: data.preparationTime ?? 0,
        updatedAt: new Date(),
      },
      { upsert: true, new: true }
    );
  
    const featureIds = [ ...(data.flavors || []), ...(data.colors || []) ];
    await pivotEntry( SkuProductFeature, sku._id, featureIds, "sku_id", "productFeature_id" );
  
    return sku;
  }catch (error) { log(error); }
}

export async function get_products(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { vendor_id } = req.query;
    const filter: any = {};
    if (vendor_id && mongoose.Types.ObjectId.isValid(vendor_id as string)) {
      filter.vendor_id = new mongoose.Types.ObjectId(vendor_id as string);
    }

    const data = await fetchData<ProductDocument>(Product, { filter, sort: { name: 1 }, lean : false,
      populate: [
        { path: 'meta_id', select: '_id title description' },
        { path: 'productMeta', populate: { path: 'productmeta_id', select: '_id module name url' } },
        { path: "mediaHubs", populate: { path: "media_id", model: "Media", select: "_id path alt" } },
      ] 
    });

    const cleanData = data.map(d => d.toJSON());

    return res.status(200).json({ message: 'Fetched all Products', data:cleanData });
  } catch (error) { return log(error); }
}

export async function get_single_product_by_url(req: NextApiRequest, res: NextApiResponse){
  try{
    const url = (req.method === 'GET' ? req.query.url : req.body.url) as string;
    if (!url) { return res.status(400).json({ message: 'Invalid or missing URL' }); }

    const data = await Product.findOne({ url })
      .populate([
        { path: 'meta_id', select: '_id title description' },
        { path: 'productMeta', populate: { path: 'productmeta_id', select: '_id module name url' } },
        { path: 'productFeature', populate: { path: 'productFeature_id', model: 'ProductFeature', select: '_id module name url' } },
        { path: 'productBrand', populate: { path: 'productBrand_id', model: 'ProductBrand', select: '_id name url' } },
        { path: 'productIngridient', populate: { path: 'ingridient_id', model: 'Ingridient', select: '_id name url' } },
        { path: "mediaHubs", populate: { path: "media_id", model: "Media", select: "_id path alt" } },
        { path: 'sku',
          populate: [
            { path: 'details', model: 'SkuDetail' },
            { path: 'eggless_id', model: 'ProductFeature', select: '_id module name url' },
            { path: 'sugarfree_id', model: 'ProductFeature', select: '_id module name url' },
            { path: 'gluttenfree_id', model: 'ProductFeature', select: '_id module name url' },
            { path: 'flavors',  populate: { path: 'productFeature_id', model: 'ProductFeature', select: '_id module name url' } },
            { path: 'colors',   populate: { path: 'productFeature_id', model: 'ProductFeature', select: '_id module name url' } },
          ],
        },
      ]).lean(false).exec() as ProductRawDocument | null;;
  
    if (!data) { return res.status(404).json({ message: `Product  with URL ${url} not found` }); }

    const relatedContent = await getRelatedContent({
      module: "Product",
      moduleId: data._id.toString(),
      productId: data._id.toString(),
      blogId : null
    });

    const reviews = await getReviews({ module: "Product", moduleId: data._id.toString() });
    
    return res.status(200).json({ message: 'Fetched Single Product', data, relatedContent, reviews });
  }catch (error) { return log(error); }
};

export async function get_sku_options(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { vendor_id } = req.query;
    const filter: any = {};
    if (vendor_id && mongoose.Types.ObjectId.isValid(vendor_id as string)) {
      filter.vendor_id = new mongoose.Types.ObjectId(vendor_id as string);
    }

    const data = await Product.find(filter).select("_id name").populate([ { path: "sku", match: { status: true }, select: "_id name price" } ]).exec();

    return res.status(200).json({ message: 'Fetched all SKU Options', data });
  } catch (error) { log(error); }
}

// Bulk Order
  export async function create_bulk_order(req: ExtendedRequest, res: NextApiResponse) {
    try {
      if (req.method !== 'POST') { return res.status(405).json({ message: 'Method Not Allowed' }); }

      const data = req.body;
      if (!data?.name || !data?.email || !data?.phone ) { return res.status(400).json({ message: 'Required fields missing' }); }

      const user_id = getUserIdFromToken(req);    
      const newEntry = new BulkOrder({
          user_id: user_id,
          product_id: data.product_id,
          sku_id: data.sku_id,
          vendor_id: data.vendor_id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          status: data.status,
          quantity: data.quantity,
          user_remarks: data.user_remarks,
          updatedAt: new Date(),
          createdAt: new Date(),
      });
      await newEntry.save();

      await initAction('Bulk Order', newEntry._id as Types.ObjectId);
      
      return res.status(201).json({ message: 'Entry created successfully', data: newEntry });
    } catch (error) { log(error); }
  }

  export async function get_single_bulk_order(req: NextApiRequest, res: NextApiResponse) {
    try {
      if (req.method !== 'POST') { return res.status(405).json({ message: 'Method Not Allowed' }); }
  
      const { id } = req.body;
      if ( !id ) { return res.status(400).json({ message: 'Invalid or missing Id' }); }
  
      const data = await BulkOrder.findById(id).populate([ { path: 'product_id', select: 'name url' }, { path: 'vendor_id', select: 'name email phone' }, { path: 'sku_id', select: 'name' } ]).exec();
  
      return res.status(200).json({ message: 'Single Bulk Order Fetched', data });
    } catch (error) { return log(error); }
  }

  export async function get_all_bulk_orders(req: NextApiRequest, res: NextApiResponse) {
    try {
      const data = await BulkOrder.find().populate([ { path: 'product_id', populate: [ { path: 'mediaHubs', populate: { path: 'media_id' } } ]}, { path: 'vendor_id', select: 'name email phone' }, { path: 'sku_id' } ]);     
  
      return res.status(200).json({ message: 'All Bulk Orders Fetched', data });
    } catch (error) { return log(error); }
  }

  export async function update_bulk_order(req: ExtendedRequest, res: NextApiResponse) {
    try {
      if (req.method !== 'POST') { return res.status(405).json({ message: 'Method Not Allowed' }); }

      const data = req.body;
      if (!data?.name || !data?.email || !data?.phone ) { return res.status(400).json({ message: 'Required fields missing' }); }
      const entry = await BulkOrder.findByIdAndUpdate(data._id, {
          product_id: data.product_id,
          sku_id: data.sku_id,
          vendor_id: data.vendor_id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          status: data.status,
          quantity: data.quantity,
          user_remarks: data.user_remarks,
          admin_remarks: data.admin_remarks,
          vendor_remarks: data.vendor_remarks,
          updatedAt: new Date(),
        },{ new: true, upsert: true }
      );
      
      return res.status(201).json({ message: 'Entry created successfully', data: entry });


    } catch (error) { log(error); }
  }
// Bulk Order

const functions = {
  get_all_products,
  get_single_product,
  create_update_product,

  get_product_modules,
  get_products,
  get_single_product_module,
  get_single_product_by_url,
  get_product_module,
  get_sku_options,

  create_bulk_order,
  update_bulk_order,
  get_all_bulk_orders,
  get_single_bulk_order
};

export const config = { api: { bodyParser: false } };
export default createApiHandler(functions);