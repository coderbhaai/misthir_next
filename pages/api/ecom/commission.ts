import mongoose, { isValidObjectId, Types } from 'mongoose';
import { createApiHandler, ExtendedRequest } from '../apiHandler';
import { NextApiRequest, NextApiResponse } from 'next';
import { APIHandlers } from 'lib/server/middleware';
import { logError } from '../utils';
import Commission from 'lib/models/product/Commission';
import { buildFilterQuery } from 'lib/server/plugins/buildFilterQuery';
import Product from 'lib/models/product/Product';
import ProductBrand from 'lib/models/product/ProductBrand';
import Productmeta from 'lib/models/product/Productmeta';

export async function get_all_commission_modules(req: ExtendedRequest, res: NextApiResponse) {
  try {
    const { seller_id } = req.body;
    if (!seller_id) { return res.status(400).json({ message: "Missing seller_id" }); }

    const sellerProducts = await Product.find({ seller_id }).select("_id").lean();
    const productIds = sellerProducts.map(p => p._id);

    const [products, productBrands] = await Promise.all([
      Product.find({ seller_id, status: true }).select("_id name").lean(),
      ProductBrand.find({ seller_id, status: true }).select("_id name").lean(),
    ]);

    const productMetaRelations = await mongoose.model("ProductProductmeta").find({ product_id: { $in: productIds } }).select("productmeta_id").lean();
    const productMetaIds = [...new Set(productMetaRelations.map(r => r.productmeta_id))];
    
    const [productTypes, productMeta] = await Promise.all([
      Productmeta.find({ _id: { $in: productMetaIds }, module: "Type", status: true }).select("_id name module").lean(),
      Productmeta.find({ _id: { $in: productMetaIds }, module: { $in: ["Type", "Category Tag"] }, status: true }).select("_id name module").lean(),
    ]);

    const formattedData: Array<{ module: string; module_id: any; name: string }> = [
      ...products.map(p => ({ module: "Product", module_id: p._id, name: p.name })),
      ...productBrands.map(b => ({ module: "ProductBrand", module_id: b._id, name: b.name })),
      ...productTypes.map(t => ({ module: "ProductMeta", module_id: t._id, name: t.name })),
      ...productMeta.map(m => ({ module: "ProductMeta", module_id: m._id, name: m.name })),
    ];
    
    const existingCommissions = await Commission.find({ user_id: seller_id }).lean();
    const dataWithCommissions = formattedData.map(item => { const match = existingCommissions.find(c => c.module === item.module && c.module_id?.toString() === String(item.module_id) );

      return {
        _id: match ? match._id : null,
        module: item.module,
        module_id: item.module_id,
        name: item.name,
        percentage: match ? match.percentage : null,
      };
    });
    return res.status(200).json({ message: "Fetched commission modules with data successfully", data: dataWithCommissions });
  } catch (error) {
    return await logError(error, { function: "get_all_commission_modules", payload: req.body });
  }
}

export async function get_filtered_commissions(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { filters = {}, page = 0, limit = 10 } = req.body || {};
    const { matchQuery, skip, limit: safeLimit } = buildFilterQuery(filters, { page, limit, defaultLimit: 10, maxLimit: 100, searchableFields: ["percentage"] });
    const total = await Commission.countDocuments(matchQuery);

    const data = await Commission.find(matchQuery).populate([{ path: "seller_id" }, { path: "productmeta_id" }]).skip(skip).limit(safeLimit).sort({ createdAt: -1 });
    return res.status(200).json({ message: 'Fetched all Commission', data, pagination: { total, page, limit: safeLimit, pages: Math.ceil(total / safeLimit) } });
  } catch (error) { return await logError(error, { function: "get_filtered_commissions", payload: req.body }); }
}

export async function get_single_commission(req: NextApiRequest, res: NextApiResponse){
  try{
    const id = (req.method === 'GET' ? req.query.id : req.body.id) as string;
    if (!id || !Types.ObjectId.isValid(id)) { return res.status(400).json({ message: 'Invalid or missing ID' }); }  
  
    const entry = await Commission.findById(id).populate([ { path: 'seller_id' }, { path: 'productmeta_id' } ]).exec();  
    if (!entry) { return res.status(404).json({ message: `Commission with ID ${id} not found` }); }
  
    return res.status(200).json({ message: '✅ Single Entry Fetched', data: entry });

  }catch (error) { return await logError(error, { function: "get_single_commission", payload: req.body }); }
};

export async function create_update_commission(req: ExtendedRequest, res: NextApiResponse) {
  try {
    const data = req.body;

    if (!data?.productmeta_id || !data?.seller_id || !data?.percentage) { return res.status(400).json({ message: '❌ Required fields missing' }); }

    const existing = await Commission.findOne({ productmeta_id: data.productmeta_id, seller_id: data.seller_id });

    if (existing) {
      existing.percentage = data.percentage;
      existing.updatedAt = new Date();

      const updated = await existing.save();
      return res.status(200).json({ message: "✅ Entry updated successfully", data: updated });
    }
    
    const newEntry = new Commission({
      productmeta_id: data.productmeta_id,
      seller_id: data.seller_id,
      percentage: data.percentage,
      createdAt: new Date(),
    });

    await newEntry.save();
    return res.status(201).json({ message: '✅ Entry created successfully', data: newEntry });
  } catch (error) { return await logError(error, { function: "create_update_commission", payload: req.body }); }
}

export async function create_update_seller_commission(req: ExtendedRequest, res: NextApiResponse) {
  try {
    const { data, user_id } = req.body;
    if (!Array.isArray(data)) { return res.status(400).json({ message: "❌ No commission entries provided or invalid format" }); }
    if (!user_id) { return res.status(400).json({ message: "❌ Missing seller_id for commission cleanup/processing" }); }

    const incomingModuleIds = data.filter((entry) => entry?.module_id && entry?.module).map((entry) => entry.module_id);

    await Commission.deleteMany({ user_id, module_id: { $nin: incomingModuleIds } });
    const results = [];
    for (const entry of data) {
      if (!entry?.module || !entry?.module_id || !user_id || entry.percentage === undefined) {
        results.push({ success: false, entry, message: "❌ Required fields missing (module, module_id, seller_id, percentage)" });
        continue;
      }

      const query = { 
        module: entry.module, 
        module_id: entry.module_id, 
        user_id
      };

      const existing = await Commission.findOne(query);

      if (existing) {
        existing.percentage = entry.percentage;
        existing.updatedAt = new Date();

        const updated = await existing.save();
        results.push({ success: true, type: "update", data: updated });
      } else {
        const newEntry = new Commission({
          module: entry.module,
          module_id: entry.module_id,
          user_id,
          percentage: entry.percentage,
          createdAt: new Date(),
        });

        await newEntry.save();
        results.push({ success: true, type: "create", data: newEntry });
      }
    }

    return res.status(200).json({ message: "✅ Bulk commissions processed and cleaned up", results });
  } catch (error) { 
    return await logError(error, { function: "create_update_seller_commission", payload: req.body }); 
  }
}

export const functions: APIHandlers = {
  get_filtered_commissions : { middlewares: ["checkUserId", "checkPostMethod"] },
  get_single_commission : { middlewares: [] },
  create_update_commission : { middlewares: ["checkUserId", "checkPostMethod"] },
  create_update_seller_commission : { middlewares: [] },
  get_all_commission_modules : { middlewares: ["checkUserId", "checkPostMethod"] },
}

export const commissionHandlers = {
  get_filtered_commissions,
  get_single_commission,
  create_update_commission,
  create_update_seller_commission,
  get_all_commission_modules,
};

export const config = { api: { bodyParser: false } };
export default createApiHandler(functions, commissionHandlers);