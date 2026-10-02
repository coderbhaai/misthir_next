import mongoose, { isValidObjectId, Types } from 'mongoose';
import type { NextApiRequest, NextApiResponse } from 'next';
import { escapeRegExp, getRelatedContent, logError, pivotEntry } from '../utils';
import { syncMediaHub } from '../basic/media';
import Productmeta from 'lib/models/product/Productmeta';
import { generateSitemap, slugify, upsertMeta } from '../basic/meta';
import ProductBrand from 'lib/models/product/ProductBrand';
import Ingridient from 'lib/models/product/Ingridient';
import ProductFeature from 'lib/models/product/ProductFeature';
import Product from 'lib/models/product/Product';
import ProductProductmeta from 'lib/models/product/ProductProductmeta';
import ProductProductFeature from 'lib/models/product/ProductProductFeature';
import ProductIngridient from 'lib/models/product/ProductIngridient';
import ProductProductBrand from 'lib/models/product/ProductProductBrand';
import Sku from 'lib/models/product/Sku';
import SkuProductFeature from 'lib/models/product/SkuProductFeature';
import { createApiHandler, ExtendedRequest } from '../apiHandler';
import Tax from 'lib/models/payment/Tax';
import { getReviews } from '../basic/review';
import BulkOrder from 'lib/models/ecom/BulkOrder';
import { initAction } from '../basic/action';
import { APIHandlers } from 'lib/server/middleware';
import { getUserIdFromToken } from '../basic/auth';
import { buildFilterQuery } from 'lib/server/plugins/buildFilterQuery';
import SkuDetail from 'lib/models/product/SkuDetail';

export async function get_filtered_products(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { filters = {}, page = 0, limit = 10 } = req.body || {};
    const { matchQuery, skip, limit: safeLimit } = buildFilterQuery(filters, { page, limit, defaultLimit: 10, maxLimit: 100, searchableFields: ["name", "url"], ignoreKeys: ["search", "productType_id", "productBrand_id"] });
    
    const search = filters.search?.trim();
    if (filters.productType_id) {
      const ids = Array.isArray(filters.productType_id) ? filters.productType_id : [filters.productType_id];
      const hasUncategorised = ids.includes("uncategorised");
      const validIds = ids.filter(Types.ObjectId.isValid).map((id: string) => new Types.ObjectId(id));

      const typeProductIds: any[] = [];

      if (validIds.length > 0) {
        const productTypes = await ProductProductmeta.find({ productmeta_id: { $in: validIds } }, { product_id: 1 }).lean();
        typeProductIds.push(...productTypes.map((i: any) => i.product_id));
      }

      if (hasUncategorised) {
        const allAssigned = await ProductProductmeta.find({}, { product_id: 1 }).lean();
        const assignedProductIds = allAssigned.map((i: any) => i.product_id);
        const unassignedProducts = await Product.find({ _id: { $nin: assignedProductIds } }, { _id: 1 }).lean();
        typeProductIds.push(...unassignedProducts.map((i: any) => i._id));
      }

      matchQuery._id = { $in: typeProductIds };
    }

    if (filters.productBrand_id) {
      const ids = Array.isArray(filters.productBrand_id) ? filters.productBrand_id : [filters.productBrand_id];
      const hasUncategorised = ids.includes("uncategorised");
      const validIds = ids.filter(Types.ObjectId.isValid).map((id: string) => new Types.ObjectId(id));

      const brandProductIds: any[] = [];

      if (validIds.length > 0) {
        const productBrands = await ProductProductBrand.find({ productBrand_id: { $in: validIds } }, { product_id: 1 }).lean();
        brandProductIds.push(...productBrands.map((i: any) => i.product_id));
      }

      if (hasUncategorised) {
        const allAssigned = await ProductProductBrand.find({}, { product_id: 1 }).lean();
        const assignedProductIds = allAssigned.map((i: any) => i.product_id);
        const unassignedProducts = await Product.find({ _id: { $nin: assignedProductIds } }, { _id: 1 }).lean();
        brandProductIds.push(...unassignedProducts.map((i: any) => i._id));
      }

      if (matchQuery._id && matchQuery._id.$in) {
        const existingIds = matchQuery._id.$in.map((id: any) => id.toString());
        const filteredIntersection = brandProductIds.filter((id: any) => existingIds.includes(id.toString()));
        matchQuery._id = { $in: filteredIntersection };
      } else {
        matchQuery._id = { $in: brandProductIds };
      }
    }

    if (search) {
      const escapedSearch = escapeRegExp(search);
      const regex = new RegExp(escapedSearch, "i");

      const skuMatches = await Sku.find({ $or: [ { name: regex }, { item_code: regex } ] }, { product_id: 1 }).lean();
      const skuProductIds = skuMatches.map((i: any) => i.product_id).filter(Boolean);
      
      const searchOr = [
        { name: { $regex: regex } },
        { url: { $regex: regex } },
        { _id: { $in: skuProductIds } },
      ];

      if (matchQuery._id) {
        matchQuery.$and = [
          { _id: matchQuery._id },
          { $or: searchOr }
        ];
        delete matchQuery._id;
      } else {
        matchQuery.$or = searchOr;
      }
    }

    const total = await Product.countDocuments(matchQuery);

    const data = await Product.find(matchQuery).populate([ 
        // { path: "filter" }, 
        { path: "tax_id" }, { path: "seller_id" },
        { path: "meta_id", select: "_id title description" },
        { path: 'productMeta', populate: { path: 'productmeta_id' } },
        { path: 'productFeature', populate: { path: 'productFeature_id', model: 'ProductFeature'} },
        { path: 'productBrand', populate: { path: 'productBrand_id', model: 'ProductBrand' } },
        { path: 'productIngridient', populate: { path: 'ingridient_id', model: 'Ingridient' } },
        { path: "mediaHubs", populate: { path: "media_id", model: "Media", select: "_id path alt", } },
        { path: "sku",
          populate: [
            { path: "eggless_id", model: "ProductFeature" },
            { path: "sugarfree_id", model: "ProductFeature" },
            { path: "gluttenfree_id", model: "ProductFeature" },
            { path: "features", model: "ProductFeature", populate: { path: "productFeature_id", model: "ProductFeature" } },
            { path: "details", model: "SkuDetail" },
            { path: "flavors", populate: { path: "productFeature_id", model: "ProductFeature" } },
            { path: "colors", populate: { path: "productFeature_id", model: "ProductFeature" } }
          ] 
        },
      ]).sort({ name: 1 }).skip(skip).limit(safeLimit);

    return res.status(200).json({ message: "Fetched all Products", data, pagination: { total, page, limit: safeLimit, pages: Math.ceil(total / safeLimit), }, });
  } catch (error) {
    await logError(error, { function: "get_filtered_products", payload: req.body });
    return res.status(500).json({ message: "Something went wrong." });
  }
}

export async function get_single_product(req: NextApiRequest, res: NextApiResponse) {
  try {
    const id = (req.method === 'GET' ? req.query.id : req.body.id) as string;
    if (!id || !Types.ObjectId.isValid(id)) { return res.status(400).json({ message: 'Invalid or missing ID' });  }

    const { seller_id } = req.query;
    const filter: any = {};

    filter._id = new mongoose.Types.ObjectId(id);
    if (seller_id && mongoose.Types.ObjectId.isValid(seller_id as string)) {
      filter.seller_id = new mongoose.Types.ObjectId(seller_id as string);
    }
    
    const data = await Product.findOne(filter).populate([
      { path: "tax_id" }, { path: "seller_id" }, { path: "meta_id" },
      { path: 'productMeta', populate: { path: 'productmeta_id' } },
      { path: 'productFeature', populate: { path: 'productFeature_id', model: 'ProductFeature'} },
      { path: 'productBrand', populate: { path: 'productBrand_id', model: 'ProductBrand'} },
      { path: 'productIngridient', populate: { path: 'ingridient_id', model: 'Ingridient'} },
      { path: "mediaHubs", populate: { path: "media_id", model: "Media", select: "_id path alt" } },
      { path: "sku", populate: [
        { path: "eggless_id", model: "ProductFeature" },
        { path: "sugarfree_id", model: "ProductFeature" },
        { path: "gluttenfree_id", model: "ProductFeature" },
        { path: "features", model: "ProductFeature", populate: { path: "productFeature_id", model: "ProductFeature" } },
        { path: "details", model: "SkuDetail" },
        { path: "flavors", populate: { path: "productFeature_id", model: "ProductFeature" } },
        { path: "colors", populate: { path: "productFeature_id", model: "ProductFeature" } }
      ]},
    ]).lean(false).exec();
    if (!data) { return res.status(404).json({ message: `Product with ID ${id} not found` }); }

    return res.status(200).json({ message: 'Fetched Single Product', data });
  } catch (error) { 
    return await logError(error, { function: "get_single_product", payload: req.body }); 
  }
};

export async function create_update_product(req: ExtendedRequest, res: NextApiResponse) {
  try {
    const data = req.body;

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
        const updated = await Product.findByIdAndUpdate(modelId, {
            seller_id: data.seller_id,
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
          }, { new: true });
        
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
        await generateSitemap();

        if (updated) {
          return res.status(200).json({ message: 'Entry updated successfully', data: updated });
        } else {
          return res.status(404).json({ message: 'Entry not found for update' });
        }
      } catch (error) { await logError(error, { function: "create_update_product", payload: req.body }); }
    }
    
    const newEntry = new Product({
       seller_id: data.seller_id,
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
    await generateSitemap();
    
    return res.status(201).json({ message: 'Entry created successfully', data: newEntry });
  } catch (error) { await logError(error, { function: "create_update_product", payload: req.body }); }
}

export async function get_product_modules(req: NextApiRequest, res: NextApiResponse) {
  try {
    const rawSellerId = req.query.seller_id as string;
    const hasValidSeller = rawSellerId && mongoose.Types.ObjectId.isValid(rawSellerId);
    const sellerObjectId = hasValidSeller ? new mongoose.Types.ObjectId(rawSellerId) : null;
    const sellerFilter = sellerObjectId ? { $or: [{ seller_id: sellerObjectId }, { user_id: sellerObjectId }] } : {};

    const [productBrand, category, tag, productTypes, ingridient, flavors, colors, eggless, glutten, sugar, storage, tax] = await Promise.all([
      ProductBrand.find({...sellerFilter, status: true}).select("_id name").sort({ name: 1 }).lean(),
      Productmeta.find({ status: true, module: "Category" }).select("_id name").sort({ name: 1 }).lean(),
      Productmeta.find({ status: true, module: "Tag" }).select("_id name").sort({ name: 1 }).lean(),
      Productmeta.find({ status: true, module: "Type" }).select("_id name").sort({ name: 1 }).lean(),
      Ingridient.find(sellerFilter).select("_id name").sort({ name: 1 }).lean(),
      ProductFeature.find({ status: true, module: "Flavor" }).select("_id name").sort({ name: 1 }).lean(),
      ProductFeature.find({ status: true, module: "Color" }).select("_id name").sort({ name: 1 }).lean(),
      ProductFeature.find({ status: true, module: "Eggless" }).select("_id name").sort({ name: 1 }).lean(),
      ProductFeature.find({ status: true, module: "Glutten Free" }).select("_id name").sort({ name: 1 }).lean(),
      ProductFeature.find({ status: true, module: "Sugar Free" }).select("_id name").sort({ name: 1 }).lean(),
      ProductFeature.find({ status: true, module: "Storage" }).select("_id name").sort({ name: 1 }).lean(),
      Tax.find({status: true}).select("_id name").sort({ name: 1 }).lean(),
    ]);

  return res.status(200).json({ message: 'Fetched all Products', data:{ category, tag, productTypes, productBrand, ingridient, flavors, colors, eggless, glutten, sugar, storage, tax } });
  } catch (error) { return await logError(error, { function: "get_product_modules", payload: req.body }); }
}

export async function get_sku_modules(req: NextApiRequest, res: NextApiResponse) {
  try {
    const [flavors, colors, eggless, glutten, sugar, storage] = await Promise.all([
      ProductFeature.find({ status: true, module: "Flavor" }).select("_id name").sort({ name: 1 }).lean(),
      ProductFeature.find({ status: true, module: "Color" }).select("_id name").sort({ name: 1 }).lean(),
      ProductFeature.find({ status: true, module: "Eggless" }).select("_id name").sort({ name: 1 }).lean(),
      ProductFeature.find({ status: true, module: "Glutten Free" }).select("_id name").sort({ name: 1 }).lean(),
      ProductFeature.find({ status: true, module: "Sugar Free" }).select("_id name").sort({ name: 1 }).lean(),
      ProductFeature.find({ status: true, module: "Storage" }).select("_id name").sort({ name: 1 }).lean(),
    ]);

  return res.status(200).json({ message: 'Fetched all Products', data:{ flavors, colors, eggless, glutten, sugar, storage } });
  } catch (error) { return await logError(error, { function: "get_sku_modules", payload: req.body }); }
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
    const { seller_id } = req.query;
    const filter: any = {};
    if (seller_id && mongoose.Types.ObjectId.isValid(seller_id as string)) {
      filter.seller_id = new mongoose.Types.ObjectId(seller_id as string);
    }

    const data = await Product.find(filter).select("_id name").exec();

    return res.status(200).json({ message: 'Fetched all Product Modules', data });
  } catch (error) { await logError(error, { function: "get_product_module", payload: req.body }); }
}

interface UpsertSkuInput {
  _id?: string;
  product_id: string | Types.ObjectId;
  name: string;
  item_code?: string;
  unit?: string;
  price_per_unit?: number;
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
  try {
    const extractId = (val: any) => (typeof val === 'object' && val !== null ? val._id : val);

    const egglessId = extractId(data.eggless_id);
    const sugarfreeId = extractId(data.sugarfree_id);
    const gluttenfreeId = extractId(data.gluttenfree_id);
    const flavorIds = Array.isArray(data.flavors) ? data.flavors.map(extractId) : [];
    const colorIds = Array.isArray(data.colors) ? data.colors.map(extractId) : [];
    
    let sku;
    const isValidId = data._id && mongoose.isValidObjectId(data._id);

    if (isValidId) {
      const queryId = new mongoose.Types.ObjectId(data._id);

      sku = await Sku.findOneAndUpdate({ _id: queryId }, {
          product_id: data.product_id,
          name: data.name,
          item_code: data.item_code,
          unit: data.unit,
          price_per_unit: data.price_per_unit,
          price: data.price,
          inventory: data.inventory,
          status: data.status ?? true,
          displayOrder: data.displayOrder ?? 0,
          adminApproval: data.adminApproval ?? true,
          eggless_id: egglessId,
          sugarfree_id: sugarfreeId,
          gluttenfree_id: gluttenfreeId,
          updatedAt: new Date(),
        }, { new: true });
        
      if (!sku) {
        sku = new Sku({
          product_id: data.product_id,
          name: data.name,
          item_code: data.item_code,
          unit: data.unit,
          price_per_unit: data.price_per_unit,
          price: data.price,
          inventory: data.inventory,
          status: data.status ?? true,
          displayOrder: data.displayOrder ?? 0,
          adminApproval: data.adminApproval ?? true,
          eggless_id: egglessId,
          sugarfree_id: sugarfreeId,
          gluttenfree_id: gluttenfreeId,
        });
        await sku.save();
      }
    } else {
      sku = new Sku({
        product_id: data.product_id,
        name: data.name,
        item_code: data.item_code,
        unit: data.unit,
        price_per_unit: data.price_per_unit,
        price: data.price,
        inventory: data.inventory,
        status: data.status ?? true,
        displayOrder: data.displayOrder ?? 0,
        adminApproval: data.adminApproval ?? true,
        eggless_id: egglessId,
        sugarfree_id: sugarfreeId,
        gluttenfree_id: gluttenfreeId,
      });
      await sku.save();
    }
    
    await SkuDetail.findOneAndUpdate({ sku_id: sku._id }, {
        weight: data.weight ?? 0,
        length: data.length ?? 0,
        width: data.width ?? 0,
        height: data.height ?? 0,
        preparationTime: data.preparationTime ?? 0,
        updatedAt: new Date(),
      }, { upsert: true, new: true });
      
    const featureIds = [ ...flavorIds, ...colorIds ];
    await pivotEntry(SkuProductFeature, sku._id, featureIds, "sku_id", "productFeature_id");
  
    return sku;
  } catch (error) { 
    await logError(error, { function: "upsertSku", payload: { data } }); 
  }
}

export async function get_products(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { seller_id } = req.query;
    const filter: any = {};
    if (seller_id && mongoose.Types.ObjectId.isValid(seller_id as string)) {
      filter.seller_id = new mongoose.Types.ObjectId(seller_id as string);
    }

     const { filters = {} } = req.body as { filters?: Record<string, string[]> };


    const filterConditions: any[] = [];

    if (filters.productBrand?.length) {
      const productIds = await getLinkedProductIds(ProductProductBrand, "productBrand_id", filters.productBrand);
      if (productIds.length) filter._id = { $in: productIds };
    }

    if (filters.category?.length) {
      filterConditions.push({
        "productMeta.productmeta_id": { $in: filters.category.map(id => new mongoose.Types.ObjectId(id)) }
      });
    }

    if (filters.tag?.length) {
      filterConditions.push({
        "productMeta.productmeta_id": { $in: filters.tag.map(id => new mongoose.Types.ObjectId(id)) }
      });
    }

    if (filters.flavors?.length) {
      filterConditions.push({
        "sku.flavors.productFeature_id": { $in: filters.flavors.map(id => new mongoose.Types.ObjectId(id)) }
      });
    }
    
    if (filters.colors?.length) {
      filterConditions.push({
        "sku.colors.productFeature_id": { $in: filters.colors.map(id => new mongoose.Types.ObjectId(id)) }
      });
    }
    
    if (filters.eggless?.length) {
      filterConditions.push({
        "sku.eggless_id": { $in: filters.eggless.map(id => new mongoose.Types.ObjectId(id)) }
      });
    }

    if (filters.sugar?.length) {
      filterConditions.push({
        "sku.sugarfree_id": { $in: filters.sugar.map(id => new mongoose.Types.ObjectId(id)) }
      });
    }

    if (filters.glutten?.length) {
      filterConditions.push({
        "sku.gluttenfree_id": { $in: filters.glutten.map(id => new mongoose.Types.ObjectId(id)) }
      });
    }

    // Combine all filter conditions
    if (filterConditions.length > 0) {
      filter.$and = filterConditions;
    }

    const data = await Product.find(filter).sort({ name: 1 }).populate([
        { path: 'meta_id', select: '_id title description' },
        { path: 'productMeta', populate: { path: 'productmeta_id', select: '_id module name url' } },
        { path: "mediaHubs", populate: { path: "media_id", model: "Media", select: "_id path alt" } },
      ]).exec();

    const cleanData = data.map(d => d.toJSON());

    return res.status(200).json({ message: 'Fetched all Products', data:cleanData });
  } catch (error) { return await logError(error, { function: "get_products", payload: req.body }); }
}

export async function getLinkedProductIds(model: mongoose.Model<any>, field: string, values: string[]): Promise<mongoose.Types.ObjectId[]> {
  if (!values?.length) return [];
  const ids = values.map(id => new mongoose.Types.ObjectId(id));

  const links = await model.find({ [field]: { $in: ids } }).select("product_id");
  return links.map(l => l.product_id);
}

export async function get_single_product_by_url(req: NextApiRequest, res: NextApiResponse){
  try{
    const url = (req.method === 'GET' ? req.query.url : req.body.url) as string;
    if (!url) { return res.status(400).json({ message: 'Invalid or missing URL' }); }

    const data = await Product.findOne({ url })
      .populate([
        { path: 'meta_id' },
        { path: 'productMeta', populate: { path: 'productmeta_id' } },
        { path: 'productFeature', populate: { path: 'productFeature_id', model: 'ProductFeature' } },
        { path: 'productBrand', populate: { path: 'productBrand_id', model: 'ProductBrand' } },
        { path: 'productIngridient', populate: { path: 'ingridient_id', model: 'Ingridient' } },
        { path: "mediaHubs", populate: { path: "media_id", model: "Media" } },
        { path: "sku", populate: [
          { path: "eggless_id", model: "ProductFeature" },
          { path: "sugarfree_id", model: "ProductFeature" },
          { path: "gluttenfree_id", model: "ProductFeature" },
          { path: "features", model: "ProductFeature", populate: { path: "productFeature_id", model: "ProductFeature" } },
          { path: "details", model: "SkuDetail" },
          { path: "flavors", populate: { path: "productFeature_id", model: "ProductFeature" } },
          { path: "colors", populate: { path: "productFeature_id", model: "ProductFeature" } }
        ]},
      ]).lean(false).exec();
  
    if (!data) { return res.status(404).json({ message: `Product  with URL ${url} not found` }); }

    const relatedContent = await getRelatedContent({ module: "Product", moduleId: data._id.toString() });

    const reviews = await getReviews({ module: "Product", moduleId: data._id.toString() });
    
    return res.status(200).json({ message: 'Fetched Single Product', data, relatedContent, reviews });
  }catch (error) { return await logError(error, { function: "get_single_product_by_url", payload: req.body }); }
};

export async function get_sku_options(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { seller_id } = req.query;
    const filter: any = {};
    if (seller_id && mongoose.Types.ObjectId.isValid(seller_id as string)) {
      filter.seller_id = new mongoose.Types.ObjectId(seller_id as string);
    }

    const data = await Product.find(filter).select("_id name").populate([ { path: "sku", match: { status: true }, select: "_id name price" } ]).exec();

    return res.status(200).json({ message: 'Fetched all SKU Options', data });
  } catch (error) { await logError(error, { function: "get_sku_options", payload: req.body }); }
}

// Bulk Order
  export async function create_bulk_order(req: ExtendedRequest, res: NextApiResponse) {
    try {
      const data = req.body;
      if (!data?.name || !data?.email || !data?.phone ) { return res.status(400).json({ message: 'Required fields missing' }); }

      const user_id = await getUserIdFromToken(req);    
      const newEntry = new BulkOrder({
          user_id: user_id,
          product_id: data.product_id,
          sku_id: data.sku_id,
          seller_id: data.seller_id,
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
    } catch (error) { await logError(error, { function: "create_bulk_order", payload: req.body }); }
  }

  export async function get_single_bulk_order(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { id } = req.body;
      if ( !id ) { return res.status(400).json({ message: 'Invalid or missing Id' }); }
  
      const data = await BulkOrder.findById(id).populate([ { path: 'product_id', select: 'name url' }, { path: 'seller_id', select: 'name email phone' }, { path: 'sku_id', select: 'name' } ]).exec();
  
      return res.status(200).json({ message: 'Single Bulk Order Fetched', data });
    } catch (error) { return await logError(error, { function: "get_single_bulk_order", payload: req.body }); }
  }

  export async function get_all_bulk_orders(req: NextApiRequest, res: NextApiResponse) {
    try {
      const data = await BulkOrder.find().populate([ { path: 'product_id', populate: [ { path: 'mediaHubs', populate: { path: 'media_id' } } ]}, { path: 'seller_id', select: 'name email phone' }, { path: 'sku_id' } ]);     
  
      return res.status(200).json({ message: 'All Bulk Orders Fetched', data });
    } catch (error) { return await logError(error, { function: "get_all_bulk_orders", payload: req.body }); }
  }

  export async function update_bulk_order(req: ExtendedRequest, res: NextApiResponse) {
    try {
      const data = req.body;
      if (!data?.name || !data?.email || !data?.phone ) { return res.status(400).json({ message: 'Required fields missing' }); }
      const entry = await BulkOrder.findByIdAndUpdate(data._id, {
          product_id: data.product_id,
          sku_id: data.sku_id,
          seller_id: data.seller_id,
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
    } catch (error) { await logError(error, { function: "update_bulk_order", payload: req.body }); }
  }
// Bulk Order

export const functions: APIHandlers = {
  get_filtered_products : { middlewares: ["checkUserId", "checkPostMethod"] },
  get_single_product : { middlewares: [] },
  create_update_product : { middlewares: ["checkUserId", "checkPostMethod"] },

  get_product_modules : { middlewares: ["checkPostMethod"] },
  get_products : { middlewares: [] },
  get_single_product_module : { middlewares: [] },
  get_single_product_by_url : { middlewares: [] },
  get_product_module : { middlewares: [] },
  get_sku_options : { middlewares: [] },
  get_sku_modules : { middlewares: [] },

  create_bulk_order : { middlewares: [] },
  update_bulk_order : { middlewares: ["checkUserId", "checkPostMethod"] },
  get_all_bulk_orders : { middlewares: ["checkUserId", "checkPostMethod"] },
  get_single_bulk_order : { middlewares: [] },
}

export const productHandlers = {
  get_filtered_products,
  get_single_product,
  create_update_product,

  get_product_modules,
  get_products,
  get_single_product_module,
  get_single_product_by_url,
  get_product_module,
  get_sku_options,
  get_sku_modules,

  create_bulk_order,
  update_bulk_order,
  get_all_bulk_orders,
  get_single_bulk_order,
};

export const config = { api: { bodyParser: false } };
export default createApiHandler(functions, productHandlers);