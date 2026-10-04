import mongoose, { isValidObjectId, Types } from 'mongoose';
import { createApiHandler, ExtendedRequest } from '../apiHandler';
import { NextApiRequest, NextApiResponse } from 'next';
import Sale, { SaleDoc } from 'lib/models/sales/Sale';
import Product from 'lib/models/product/Product';
import SkuProps from 'lib/models/product/Sku';
import { APIHandlers } from 'lib/server/middleware';
import { logError } from '../utils';
import { buildFilterQuery } from 'lib/server/plugins/buildFilterQuery';
import SaleTarget from 'lib/models/sales/SaleTarget';
import BuyOneGetOne from 'lib/models/ecom/BuyOneGetOne';
import { uploadMedia } from '../basic/media';
import CartSku from 'lib/models/ecom/CartSku';
import SaleUpsell from 'lib/models/sales/SaleUpsell';

export async function get_filtered_sales(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { filters = {}, page = 0, limit = 10 } = req.body || {};
    const { matchQuery, skip, limit: safeLimit } = buildFilterQuery(filters, { page, limit, defaultLimit: 10, maxLimit: 100, searchableFields: ["name", "url"] });
    const total = await Sale.countDocuments(matchQuery);
    
    const data = await Sale.find(matchQuery).populate([ 
      { path: "media_id" }, 
      { path: "seller_id", select: "_id name email phone" }, 
      { path: "bogo_items", populate: [ { path: "buy_id", select: "_id sku name" }, { path: "get_id", select: "_id sku name" }, ] } 
    ]).skip(skip).limit(safeLimit).sort({ createdAt: -1 });

    return res.status(200).json({ message: "Fetched all Sales", data, pagination: { total, page, limit: safeLimit, pages: Math.ceil(total / safeLimit) } });

  } catch (error) { await logError(error, { function: "get_filtered_sales", payload: req.body }); }
}

export async function get_single_sale(req: NextApiRequest, res: NextApiResponse){
  try{
    const id = (req.method === 'GET' ? req.query.id : req.body.id) as string;
    if (!id || !Types.ObjectId.isValid(id)) { return res.status(400).json({ message: 'Invalid or missing ID' }); }
  
    const entry = await Sale.findById(id).populate([ { path: "media_id" }, { path: "seller_id", select: "_id name email phone" }, { path: "bogo_items", populate: [ { path: "buy_id", select: "_id sku name" }, { path: "get_id", select: "_id sku name" }, ] } ]).exec();
    if (!entry) { return res.status(404).json({ message: `Sale with ID ${id} not found` }); }
  
    const targets = await SaleTarget.find({ sale_id: entry._id }).lean();
    return res.status(200).json({ message: '✅ Single Entry Fetched', data: { entry, targets }});
  } catch (error) { await logError(error, { function: "get_single_sale", payload: req.body }); }
};

export async function create_update_sale(req: ExtendedRequest, res: NextApiResponse) {
  try {
    const data = req.body;  
    if ( !data?.name || !data?.discount_type || !data?.discount || !data?.sales || !data?.status || !data?.valid_from || !data?.valid_to ) { 
      return res.status(400).json({ message: 'Required fields missing' }); 
    }
    
    const modelId = typeof data._id === 'string' || data._id instanceof Types.ObjectId ? data._id : null;

    let media_id: string | null = null;
    if (data.media_id && isValidObjectId(data.media_id)) { media_id = data.media_id; }
    const file = Array.isArray(req.files?.image) ? req.files.image[0] : req.files?.image;
    if (file) { media_id = await uploadMedia({ file, name: data.name, pathType: "Sale", media_id: data.media_id ?? null, user_id: null }); }

    let sale: any;

    const payload = {
      seller_id: data.seller_id,
      media_id: media_id,
      discount_type: data.discount_type,
      discount: Number(data.discount),
      name: data.name,
      sales: data.sales,
      status: data.status,
      valid_from: data.valid_from,
      valid_to: data.valid_to,
      buy_one: data.buy_one,
      description: data.description,
      updatedAt: new Date(),
    };

    if (modelId && isValidObjectId(modelId)) {
      sale = await Sale.findByIdAndUpdate(modelId, payload, { new: true });
    } else {
      sale = new Sale({ ...payload, createdAt: new Date() });
      await sale.save();
    }

    if (data.selected_targets) {
      let targets = [];
      targets = typeof data.selected_targets === "string" ? JSON.parse(data.selected_targets) : data.selected_targets;

      await SaleTarget.deleteMany({ sale_id: sale._id });

      if (Array.isArray(targets) && targets.length > 0) {
        const targetDocs = targets.map((t: any) => ({ 
          sale_id: sale._id, 
          module: t.module,
          quantity: Number(t.quantity),
          module_id: new Types.ObjectId(t.module_id) 
        }));

        await SaleTarget.insertMany(targetDocs, { ordered: false }).catch(() => {});
      }
    }
    
    if (Array.isArray(data.bogo_items)) {
      await BuyOneGetOne.deleteMany({ sale_id: sale._id });
      await BuyOneGetOne.insertMany(
        data.bogo_items.map((item: any) => ({
          sale_id: sale._id,
          buy_id: item.buy_id,
          get_id: item.get_id,
        }))
      );
    }

    return res.status(modelId ? 200 : 201).json({ message: modelId ? "✅ Sales updated successfully" : "✅ Sales created successfully", data: sale });
  } catch (error) { 
    await logError(error, { function: "create_update_sale", payload: req.body }); 
    return res.status(500).json({ message: "Server error", error });
  }
}

interface SkuProps {
  _id: Types.ObjectId | string;
  name: string;
  price: number;
}

export async function get_product_sale_modules(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { seller_id } = req.query;
    const filter: any = {};
    if (seller_id && mongoose.Types.ObjectId.isValid(seller_id as string)) {
      filter.seller_id = new mongoose.Types.ObjectId(seller_id as string);
    }

    const data = await Product.find(filter).sort({ name: 1 }).select("_id name url").populate([
                    { path: "mediaHubs", populate: { path: "media_id", model: "Media", select: "_id path alt" } },
                    { path: "sku", select: "_id name price" },
                  ]).exec();

    return res.status(200).json({ message: 'Fetched all Products', data });
  } catch (error) { return await logError(error, { function: "get_product_sale_modules", payload: req.body }); }
}

export async function getEffectiveSkuPrice(sku: SkuProps, vendorId: Types.ObjectId): Promise<number> {
  if (!sku?.price) return 0;

  const now = new Date();
  const activeSales = await Sale.find({
    seller_id: vendorId,
    valid_from: { $lte: now },
    valid_to: { $gte: now },
    status: true,
  }).sort({ valid_from: 1 }).populate("saleSkus");

  let finalPrice = Number(sku.price);
  
  const applicableSale = activeSales.find((sale: any) =>
    (sale as any).saleSkus.some((s: any) => s.sku_id.toString() === (sku._id as Types.ObjectId).toString())
  );

  if (applicableSale) {
    const saleSku = (applicableSale as any).saleSkus.find(
      (s: any) => s.sku_id.toString() === (sku._id as Types.ObjectId).toString()
    );

    const discount = Number(saleSku.discount);

    if (applicableSale.type === "Amount Based") {
      finalPrice = Math.max(0, finalPrice - discount);
    } else if (applicableSale.type === "Percent Based") {
      finalPrice = finalPrice - (finalPrice * discount) / 100;
    }
  }

  return parseFloat(finalPrice.toFixed(2));
}

export async function applySalesAndGetUpsells(cart_id: string) {
  try {
    // NOTE: Do NOT use .lean() here so we can call item.save() later
    const cartSkus = await CartSku.find({ cart_id }).populate({
      path: 'product_id',
      populate: [{ path: 'brands' }]
    }).populate('sku_id').exec();

    if (!cartSkus || cartSkus.length === 0) {
      console.log("[Sales Debug] Cart is empty or not found for cart_id:", cart_id);
      return { totalCartSubtotal: 0, totalCartSavings: 0, upsellMessage: null };
    }

    const now = new Date();
    // 1. Fetch active sales
    const activeSales = await Sale.find({
      status: true,
      valid_from: { $lte: now },
      valid_to: { $gte: now }
    }).lean() as unknown as Array<SaleDoc & { _id: Types.ObjectId; discount: number; discount_type: string; name: string }>;

    console.log(`[Sales Debug] Found ${activeSales.length} active sales.`);

    const saleIds = activeSales.map(s => s._id);

    // 2. Fetch targets and upsells concurrently
    const [allTargets, allUpsells] = await Promise.all([
      SaleTarget.find({ sale_id: { $in: saleIds } }).lean(),
      SaleUpsell.find({ sale_id: { $in: saleIds } }).lean()
    ]);

    console.log(`[Sales Debug] Fetched ${allTargets.length} total targets and ${allUpsells.length} total upsells.`);

    const targetsBySale = new Map<string, any[]>();
    for (const t of allTargets) {
      const sId = t.sale_id.toString();
      if (!targetsBySale.has(sId)) targetsBySale.set(sId, []);
      targetsBySale.get(sId)!.push(t);
    }

    let totalCartSubtotal = 0;
    let totalCartSavings = 0;
    let totalCartQuantity = cartSkus.reduce((acc, item) => acc + (item.quantity || 0), 0);

    for (const item of cartSkus) {
      const product = item.product_id as any;
      const sku = item.sku_id as any;
      
      if (!sku) {
        console.log(`[Sales Debug] Warning: CartSku item missing sku_id reference.`);
        continue;
      }

      const originalPrice = sku.price || 0;
      const quantity = item.quantity || 1;
      totalCartSubtotal += originalPrice * quantity;

      let bestDiscountedPrice = originalPrice;
      let appliedSale: any = null;

      const productBrandIds = (product?.brands || []).map((b: any) => 
        (b.productBrand_id?._id || b.productBrand_id || b._id)?.toString()
      ).filter(Boolean);

      const productTypeId = product?.type_id?._id?.toString() || product?.type_id?.toString() || null;
      const skuId = sku._id?.toString();
      const productId = product?._id?.toString();

      // Priority Order: Sku > Product > ProductBrand > ProductType
      const levels = [
        { module: 'Sku', ids: [skuId] },
        { module: 'Product', ids: [productId] },
        { module: 'ProductBrand', ids: productBrandIds },
        { module: 'ProductType', ids: [productTypeId] }
      ];

      console.log(`[Sales Debug] Evaluating Item -> SKU ID: ${skuId}, Product ID: ${productId}, Original Price: ${originalPrice}`);

      for (const level of levels) {
        if (!level.ids || level.ids.length === 0) continue;

        for (const sale of activeSales) {
          const saleIdStr = sale._id.toString();
          const targets = targetsBySale.get(saleIdStr) || [];
          
          const matchedTarget = targets.find(
            t => t.module === level.module && level.ids.includes(t.module_id.toString())
          );

          if (matchedTarget) {
            console.log(`[Sales Match Found!] Sale Name: "${sale.name}" matched via Module: ${level.module} (Target ID: ${matchedTarget.module_id})`);
            console.log(`[Discount Details] Type: ${sale.discount_type}, Value: ${sale.discount}`);

            const dtype = String(sale.discount_type).trim().toLowerCase();

            if (dtype === 'percent based' || dtype === 'percentage') {
              bestDiscountedPrice = originalPrice - (originalPrice * sale.discount) / 100;
            } else if (dtype === 'amount based' || dtype === 'flat' || dtype === 'amount') {
              bestDiscountedPrice = Math.max(0, originalPrice - sale.discount);
            }

            appliedSale = sale;
            break; 
          }
        }
        if (appliedSale) break;
      }

      const finalSalePrice = Number(bestDiscountedPrice.toFixed(2));
      const itemSavings = (originalPrice - finalSalePrice) * quantity;
      totalCartSavings += itemSavings;

      console.log(`[Price Update] SKU ${skuId} | Original: ${originalPrice} | Sale Price: ${finalSalePrice}`);

      // Assign values and persist using Mongoose model instance
      item.price = originalPrice;
      item.sale = finalSalePrice;
      await item.save();
    }

    // 3. Evaluate Upsell Suggestions
    let bestUpsellMessage: string | null = null;
    let smallestGap = Infinity;

    for (const upsell of allUpsells) {
      if (upsell.min_spend && totalCartSubtotal < upsell.min_spend) {
        const gap = upsell.min_spend - totalCartSubtotal;
        if (gap < smallestGap) {
          smallestGap = gap;
          bestUpsellMessage = `Add $${gap.toFixed(2)} more to ${upsell.message}`;
        }
      }

      if (upsell.min_quantity && totalCartQuantity < upsell.min_quantity) {
        const qtyGap = upsell.min_quantity - totalCartQuantity;
        if (qtyGap * 10 < smallestGap) { 
          smallestGap = qtyGap * 10;
          bestUpsellMessage = `Add ${qtyGap} more item(s) to ${upsell.message}`;
        }
      }
    }

    return {
      totalCartSubtotal,
      totalCartSavings,
      upsellMessage: bestUpsellMessage
    };
  } catch (error) {
    console.error("Error in applySalesAndGetUpsells:", error);
    return { totalCartSubtotal: 0, totalCartSavings: 0, upsellMessage: null };
  }
}

export const functions: APIHandlers = {
  get_filtered_sales : { middlewares: ["checkUserId", "checkPostMethod" ] },
  get_single_sale : { middlewares: [] },
  create_update_sale : { middlewares: ["checkUserId", "checkPostMethod" ] },
  get_product_sale_modules : { middlewares: ["checkUserId", "checkPostMethod" ] },
}

export const salesHandlers = {
  get_filtered_sales,
  get_single_sale,
  create_update_sale,
  get_product_sale_modules,
};

export const config = { api: { bodyParser: false } };
export default createApiHandler(functions, salesHandlers);