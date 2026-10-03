import mongoose, { isValidObjectId, Types } from 'mongoose';
import type { NextApiRequest, NextApiResponse } from 'next';
import { logError } from '../utils';
import { createApiHandler, ExtendedRequest, } from '../apiHandler';
import Coupon from 'lib/models/coupon/Coupon';
import { uploadMedia } from '../basic/media';
import BuyOneGetOne from 'lib/models/ecom/BuyOneGetOne';
import { recalculateCart } from './ecom';
import { getEffectiveSkuPrice } from './sales';
import { APIHandlers } from 'lib/server/middleware';
import CartCoupon, { CartCouponDoc } from 'lib/models/coupon/CartCoupon';
import Cart from 'lib/models/ecom/Cart';
import { buildFilterQuery } from 'lib/server/plugins/buildFilterQuery';
import Product from 'lib/models/product/Product';
import ProductBrand from 'lib/models/product/ProductBrand';
import ProductProductmeta from 'lib/models/product/ProductProductmeta';
import Productmeta from 'lib/models/product/Productmeta';
import CouponTarget from 'lib/models/coupon/CouponTarget';
import { getCartIdFromRequest } from '../cartUtils';
import CouponUser from 'lib/models/coupon/CouponUser';
import CouponUsageLog from 'lib/models/coupon/CouponUsageLog';

export async function get_filtered_coupon(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { filters = {}, page = 0, limit = 10 } = req.body || {};
    const { matchQuery, skip, limit: safeLimit } = buildFilterQuery(filters, { page, limit, defaultLimit: 10, maxLimit: 100, searchableFields: ["name", "url"] });
    const total = await Coupon.countDocuments(matchQuery);
    
    const data = await Coupon.find(matchQuery).populate([ 
      { path: "media_id" }, 
      { path: "seller_id", select: "_id name email phone" }, 
      { path: "bogo_items", populate: [ { path: "buy_id", select: "_id sku name" }, { path: "get_id", select: "_id sku name" }, ] } 
    ]).skip(skip).limit(safeLimit).sort({ createdAt: -1 });

    return res.status(200).json({ message: "Fetched all coupons", data, pagination: { total, page, limit: safeLimit, pages: Math.ceil(total / safeLimit) } });

  } catch (error) { await logError(error, { function: "get_filtered_coupon", payload: req.body }); }
}

export async function get_single_coupon(req: NextApiRequest, res: NextApiResponse){
  const id = (req.method === 'GET' ? req.query.id : req.body.id) as string;
  if (!id || !Types.ObjectId.isValid(id)) { return res.status(400).json({ message: 'Invalid or missing ID' }); }

  const entry = await Coupon.findById(id).populate([ { path: "media_id" }, { path: "seller_id", select: "_id name email phone" }, { path: "bogo_items", populate: [ { path: "buy_id", select: "_id sku name" }, { path: "get_id", select: "_id sku name" }, ] } ]).exec();
  if (!entry) { return res.status(404).json({ message: `Page with ID ${id} not found` }); }

  const targets = await CouponTarget.find({ coupon_id: entry._id }).lean();

  return res.status(200).json({ message: '✅ Single Entry Fetched', data: { entry, targets }});
};

export async function create_update_coupon(req: ExtendedRequest, res: NextApiResponse) {
  try {
    const data = req.body;  
    if ( !data?.usage_type || !data?.discount_type  || !data?.name || !data?.coupon_code || !data?.sales || !data?.status || !data?.valid_from || !data?.valid_to ) { 
      return res.status(400).json({ message: 'Required fields missing' }); 
    }
    
    const modelId = typeof data._id === 'string' || data._id instanceof Types.ObjectId ? data._id : null;

    let media_id: string | null = null;
    if (data.media_id && isValidObjectId(data.media_id)) { media_id = data.media_id; }
    const file = Array.isArray(req.files?.image) ? req.files.image[0] : req.files?.image;
    if (file) { media_id = await uploadMedia({ file, name: data.name, pathType: "Coupon", media_id: data.media_id ?? null, user_id: null }); }    
    
    let coupon_code = data.coupon_code.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    
    let coupon: any;

    const couponPayload = {
      coupon_by: data.coupon_by,
      usage_type: data.usage_type,
      seller_id: data.seller_id,
      media_id: media_id,
      discount_type: data.discount_type,
      discount: data.discount,
      name: data.name,
      coupon_code,
      sales: data.sales,
      status: data.status,
      valid_from: data.valid_from,
      valid_to: data.valid_to,
      buy_one: data.buy_one,
      description: data.description,
      updatedAt: new Date(),
    };

    if (modelId && isValidObjectId(modelId)) {
      coupon = await Coupon.findByIdAndUpdate(modelId, couponPayload, { new: true });
    } else {
      coupon = new Coupon({ ...couponPayload, createdAt: new Date() });
      await coupon.save();
    }

    if (data.selected_targets) {
      let targets = [];
      targets = typeof data.selected_targets === "string" ? JSON.parse(data.selected_targets) : data.selected_targets;

      await CouponTarget.deleteMany({ coupon_id: coupon._id });

      if (Array.isArray(targets) && targets.length > 0) {
        const targetDocs = targets.map((t: any) => ({ coupon_id: coupon._id, module: t.module, module_id: new Types.ObjectId(t.module_id) }));
        await CouponTarget.insertMany(targetDocs, { ordered: false }).catch(() => {});
      }
    }
    
    if (Array.isArray(data.bogo_items)) {
      await BuyOneGetOne.deleteMany({ coupon_id: coupon._id });
      await BuyOneGetOne.insertMany(
        data.bogo_items.map((item: any) => ({
          coupon_id: coupon._id,
          buy_id: item.buy_id,
          get_id: item.get_id,
        }))
      );
    }

    return res.status(modelId ? 200 : 201).json({ message: modelId ? "✅ Coupon updated successfully" : "✅ Coupon created successfully", data: coupon });
  } catch (error) { 
    await logError(error, { function: "create_update_coupon", payload: req.body }); 
    return res.status(500).json({ message: "Server error", error });
  }
}

export async function get_coupon_target_options(req: ExtendedRequest, res: NextApiResponse) {
  try {
    const { module, seller_id, search, selected_ids } = req.body || req.query;

    const modules: string[] = Array.isArray(module) ? module : [module].filter(Boolean);
    const selectedIdsArray: string[] = Array.isArray(selected_ids) 
      ? selected_ids 
      : (selected_ids ? [selected_ids] : []);

    const selectedObjectIds = selectedIdsArray
      .filter((id) => Types.ObjectId.isValid(id))
      .map((id) => new Types.ObjectId(id));
    
    const searchFilter = search && search.trim() !== "" ? { name: { $regex: search, $options: "i" } } : {};
    const sellerFilter = seller_id ? { seller_id: new Types.ObjectId(seller_id) } : {};

    let productsPromise: Promise<any[]> = Promise.resolve([]);
    let productBrandsPromise: Promise<any[]> = Promise.resolve([]);
    let productTypesPromise: Promise<any[]> = Promise.resolve([]);

    if (modules.includes("Product")) {
      productsPromise = (async () => {
        // 1. Fetch matching search/seller filter
        const searchResults = await Product.find({ ...sellerFilter, ...searchFilter })
          .populate([{ path: "skus" }])
          .limit(50)
          .lean();

        // 2. Fetch explicitly selected products if any are missing from search results
        const searchResultIds = new Set(searchResults.map((p: any) => p._id.toString()));
        const missingSelectedIds = selectedObjectIds.filter((id) => !searchResultIds.has(id.toString()));

        let forcedProducts: any[] = [];
        if (missingSelectedIds.length > 0) {
          forcedProducts = await Product.find({ _id: { $in: missingSelectedIds } })
            .populate([{ path: "skus" }])
            .lean();
        }

        // Combine and ensure uniqueness by ID
        const combined = [...forcedProducts, ...searchResults];
        const uniqueMap = new Map();
        combined.forEach((item) => uniqueMap.set(item._id.toString(), item));
        return Array.from(uniqueMap.values());
      })();
    }

    if (modules.includes("Product Brand")) {
      productBrandsPromise = (async () => {
        const searchResults = await ProductBrand.find({ ...searchFilter })
          .select("_id name")
          .limit(50)
          .lean();

        const searchResultIds = new Set(searchResults.map((b: any) => b._id.toString()));
        const missingSelectedIds = selectedObjectIds.filter((id) => !searchResultIds.has(id.toString()));

        let forcedBrands: any[] = [];
        if (missingSelectedIds.length > 0) {
          forcedBrands = await ProductBrand.find({ _id: { $in: missingSelectedIds } })
            .select("_id name")
            .lean();
        }

        const combined = [...forcedBrands, ...searchResults];
        const uniqueMap = new Map();
        combined.forEach((item) => uniqueMap.set(item._id.toString(), item));
        return Array.from(uniqueMap.values());
      })();
    }

    if (modules.includes("Product Type")) {
      productTypesPromise = (async () => {
        const sellerProducts = await Product.find(sellerFilter).select("_id").lean();
        const productIds = sellerProducts.map((p) => p._id);

        const productMetas = productIds.length > 0 
          ? await ProductProductmeta.find({ product_id: { $in: productIds } }).select("productmeta_id").lean()
          : [];
        
        const metaIds = [...new Set(productMetas.map((pm) => pm.productmeta_id))];

        const searchResults = metaIds.length > 0 ? await Productmeta.find({ 
          _id: { $in: metaIds }, 
          module: "Type", 
          ...searchFilter 
        }).select("_id name").limit(50).lean() : [];

        // Also fetch forced selected metadata types if not in search
        const searchResultIds = new Set(searchResults.map((t: any) => t._id.toString()));
        const missingSelectedIds = selectedObjectIds.filter((id) => !searchResultIds.has(id.toString()));

        let forcedTypes: any[] = [];
        if (missingSelectedIds.length > 0) {
          forcedTypes = await Productmeta.find({
            _id: { $in: missingSelectedIds },
            module: "Type"
          }).select("_id name").lean();
        }

        const combined = [...forcedTypes, ...searchResults];
        const uniqueMap = new Map();
        combined.forEach((item) => uniqueMap.set(item._id.toString(), item));
        return Array.from(uniqueMap.values());
      })();
    }

    const [products, productBrands, productTypes] = await Promise.all([
      productsPromise,
      productBrandsPromise,
      productTypesPromise,
    ]);

    return res.status(200).json({
      message: "✅ Coupon Targets Fetched successfully",
      data: {
        products,
        productBrands,
        productTypes,
      },
    });
  } catch (error) {
    await logError(error, { function: "get_coupon_target_options", payload: req.body });
    return res.status(500).json({ message: "Server error", error });
  }
}

export async function validateCoupon(coupon_code: string, user_id?: string) {
  const coupon = await Coupon.findOne({ coupon_code, status: true }).populate("seller_id").exec();
  if (!coupon) return { valid: false, message: "Invalid or inactive coupon code" };

  const now = new Date();
  if (now < new Date(coupon.valid_from) || now > new Date(coupon.valid_to)) { return { valid: false, message: "Coupon has expired or is not yet active" }; }
  
  if (user_id) {
    if (coupon.usage_type === "Single Usage") {
      const priorUsageCount = await CouponUsageLog.countDocuments({ coupon_id: coupon._id, user_id });
      if (priorUsageCount > 0) { return { valid: false, message: "This single-usage coupon has already been used by you." }; }
    }

    if (coupon.usage_type === "Specific Users") {
      const isAllowed = await CouponUser.findOne({ coupon_id: coupon._id, user_id });
      if (!isAllowed) { return { valid: false, message: "You are not authorized to use this coupon." }; }
    }
  } else if (coupon.usage_type === "Single Usage" || coupon.usage_type === "Specific Users") {
    return { valid: false, message: "Please login to use this coupon." };
  }

  return { valid: true, message: "Coupon is valid", coupon };
}

export async function remove_coupon(cart_id: string) {
  await CartCoupon.deleteOne({ cart_id }); 
  await recalculateCart(cart_id);
}

export async function upsertCartCoupon( cart_id: string | Types.ObjectId, data: Partial<CartCouponDoc>): Promise<CartCouponDoc> {
  let cartCoupon = await CartCoupon.findOne({ cart_id });

  if (!cartCoupon) {
    cartCoupon = new CartCoupon({ cart_id, ...data });
  } else {
    Object.assign(cartCoupon, data);
  }

  return await cartCoupon.save();
}

export async function handleApplyCoupon(cart_id: string, coupon_code: string) {
  const cart = await Cart.findById(cart_id).populate([
    { path: "cartCharges" },
    { 
      path: "cartSkus", 
      populate: [
        { path: "sku_id" }, 
        { path: "product_id", 
          populate: [
            { path: "seller_id" },
            { path: "brands", populate: { path: "productBrand_id" } }
          ] 
        }
      ] 
    },
  ]).exec();
  if (!cart) return { success: false, message: "Cart not found" };

  const userId = cart.user_id?.toString();
  const { valid, message, coupon } = await validateCoupon(coupon_code, userId);
  if (!valid || !coupon) { await remove_coupon(cart_id); return { success: false, message }; }

  const coupon_seller_id = String(coupon?.seller_id?._id);
  const targets = await CouponTarget.find({ coupon_id: coupon._id }).lean();
  const hasTargets = targets.length > 0;
  const targetSkus = new Set(targets.filter(t => t.module === "Sku").map(t => t.module_id.toString()));
  const targetProducts = new Set(targets.filter(t => t.module === "Product").map(t => t.module_id.toString()));
  const targetBrands = new Set(targets.filter(t => t.module === "Product Brand").map(t => t.module_id.toString()));
  const targetTypes = new Set(targets.filter(t => t.module === "Product Type").map(t => t.module_id.toString()));

  let productTypeMap = new Set<string>();
  if (targetTypes.size > 0) {
    const allProductIds = cart.cartSkus.map((item: any) => item.product_id?._id || item.product_id);
    const metas = await ProductProductmeta.find({ 
      product_id: { $in: allProductIds }, 
      productmeta_id: { $in: Array.from(targetTypes) } 
    }).lean();
    metas.forEach(m => productTypeMap.add(m.product_id.toString()));
  }

  let totalEligibleAmount = 0;

  for (const item of cart.cartSkus) {
    const sku = item.sku_id;
    const quantity = item.quantity ?? 0;
    if (!sku) continue;

    const product = item.product_id;
    const productId = product?._id?.toString() || product?.toString();
    const skuId = sku._id?.toString();
    const itemSellerId = item.seller_id?.toString();

    if (coupon_seller_id) {
      if (itemSellerId !== coupon_seller_id) continue;
    }

    if (hasTargets) {
      let isEligible = false;

      // Check if product belongs to any of the target brands via the `brands` virtual array
      const productBrandIds = product?.brands?.map((b: any) => 
        b.productBrand_id?._id?.toString() || b.productBrand_id?.toString()
      ) || [];
      const matchesBrand = productBrandIds.some((bId: string) => targetBrands.has(bId));

      if (skuId && targetSkus.has(skuId)) {
        isEligible = true;
      } else if (productId && targetProducts.has(productId)) {
        isEligible = true;
      } else if (targetBrands.size > 0 && matchesBrand) {
        isEligible = true;
      } else if (productId && productTypeMap.has(productId)) {
        isEligible = true;
      }

      if (!isEligible) continue;
    }

    totalEligibleAmount += (sku.price || 0) * quantity;
  }
  
  if (coupon.sales && totalEligibleAmount < coupon.sales) {
    await remove_coupon(cart_id);
    const sellerName = coupon?.seller_id?.name;

    const message = coupon?.seller_id
      ? `To apply this coupon, your eligible purchases from **${sellerName}** must reach at least ₹${coupon.sales}. Current eligible amount is ₹${totalEligibleAmount}.`
      : `Minimum eligible order amount must be ₹${coupon.sales} to apply this coupon. Current eligible amount is ₹${totalEligibleAmount}.`;

    return { success: false, message };
  }

  if (totalEligibleAmount <= 0) {
    await remove_coupon(cart_id);
    return { success: false, message: "No eligible items in cart for this coupon." };
  }

  let discount_amount = coupon.discount_type === "Percent Based" ? (totalEligibleAmount * (coupon.discount || 0)) / 100 : (coupon.discount || 0);
  let admin_coupon_discount = coupon.coupon_by === "Seller" ? 0 : discount_amount;
  let vendor_coupon_discount = coupon.coupon_by === "Seller" ? discount_amount : 0;

  await upsertCartCoupon(cart_id, {
    coupon_id: coupon._id,
    admin_coupon_discount,
    vendor_coupon_discount,
    coupon_code,
  });

  if (userId) {
    await CouponUsageLog.create({
      coupon_id: coupon._id,
      user_id: userId,
      module: "Cart",
      module_id: cart._id,
      discount_applied: discount_amount,
    });
  }

  await recalculateCart(cart_id);
  return { success: true, message: "Coupon Applied Successfully" };
}

export async function apply_coupon(req: NextApiRequest, res: NextApiResponse) {
  try {
    const cart_id = await getCartIdFromRequest(req, res);
    if (!cart_id) { return res.status(400).json({ status: false, message: "Cart not found", data: null }); }

    const { coupon_code } = req.body;
    if (!coupon_code) {
      await remove_coupon(cart_id);
      return res.status(400).json({ status: false, message: "Coupon code is required", data: null });
    }

    const result = await handleApplyCoupon(cart_id, coupon_code);
    return res.status(200).json({ status: result?.success, message: result?.message, data: null });
  } catch (error) { await logError(error, { function: "apply_coupon", payload: req.body }); }
}

export const functions: APIHandlers = {
  create_update_coupon : { middlewares: ["checkUserId", "checkPostMethod" ] },
  get_filtered_coupon : { middlewares: ["checkUserId", "checkPostMethod" ] },
  get_coupon_target_options : { middlewares: ["checkUserId", "checkPostMethod" ] },
  get_single_coupon : { middlewares: [] },
  apply_coupon : { middlewares: ["checkPostMethod"] },
}

export const couponHandlers = {
  create_update_coupon,
  get_filtered_coupon,
  get_coupon_target_options,
  get_single_coupon,
  apply_coupon,
};

export const config = { api: { bodyParser: false } };
export default createApiHandler(functions, couponHandlers);