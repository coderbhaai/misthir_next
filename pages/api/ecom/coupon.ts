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

  return res.status(200).json({ message: '✅ Single Entry Fetched', data: entry });
};

export async function create_update_coupon(req: ExtendedRequest, res: NextApiResponse) {
  try {
    const data = req.body;  
    if ( !data?.coupon_by || !data?.usage_type || !data?.discount_type  || !data?.name || !data?.code || !data?.sales || !data?.status || !data?.valid_from || !data?.valid_to ) { return res.status(400).json({ message: 'Required fields missing' }); }
    
    const modelId = typeof data._id === 'string' || data._id instanceof Types.ObjectId ? data._id : null;

    let media_id: string | null = null;
    if (data.media_id && isValidObjectId(data.media_id)) { media_id = data.media_id; }
    const file = Array.isArray(req.files?.image) ? req.files.image[0] : req.files?.image;
    
    if (file) {
      media_id = await uploadMedia({ file, name: data.name, pathType: "Coupon", media_id: data.media_id ?? null, user_id: null });
    }
    
    let code = data.code.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    
    let coupon: any;

    if (modelId && isValidObjectId(modelId)) {
      coupon = await Coupon.findByIdAndUpdate(
        modelId,
        {
          coupon_by: data.coupon_by,
          usage_type: data.usage_type,
          seller_id: data.seller_id,
          media_id: media_id,
          discount_type: data.discount_type,
          discount: data.discount,
          name: data.name,
          code,
          sales: data.sales,
          status: data.status,
          valid_from: data.valid_from,
          valid_to: data.valid_to,
          buy_one: data.buy_one,
          description: data.description,
          updatedAt: new Date(),
        },
        { new: true }
      );
    } else {
      coupon = new Coupon({
        coupon_by: data.coupon_by,
        usage_type: data.usage_type,
        seller_id: data.seller_id,
        media_id: media_id,
        discount_type: data.discount_type,
        discount: data.discount,
        name: data.name,
        code,
        sales: data.sales,
        status: data.status,
        valid_from: data.valid_from,
        valid_to: data.valid_to,
        buy_one: data.buy_one,
        description: data.description,
        updatedAt: new Date(),
        createdAt: new Date(),
      });
      await coupon.save();
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
  } catch (error) { await logError(error, { function: "create_update_coupon", payload: req.body }); return res.status(500).json({ message: "Server error", error });}
}

export async function get_coupon_target_options(req: ExtendedRequest, res: NextApiResponse) {
  try {
    const { module, seller_id, search } = req.body || req.query;

    const modules: string[] = Array.isArray(module) ? module : [module].filter(Boolean);
    const searchFilter = search ? { name: { $regex: search, $options: "i" } } : {};
    const sellerFilter = seller_id ? { seller_id: new Types.ObjectId(seller_id) } : {};

    let productsPromise: Promise<any[]> = Promise.resolve([]);
    let productBrandsPromise: Promise<any[]> = Promise.resolve([]);
    let productTypesPromise: Promise<any[]> = Promise.resolve([]);

    if (modules.includes("Product")) {
      productsPromise = Product.find({ ...sellerFilter, ...searchFilter }).populate([{ path: "sku" }]).limit(50).lean();
    }

    if (modules.includes("Product Brand")) {
      productBrandsPromise = ProductBrand.find({ ...sellerFilter, ...searchFilter }).select("_id name").limit(50).lean();
    }

    if (modules.includes("Product Type")) {
      productTypesPromise = (async () => {
        const productQuery = seller_id ? { seller_id: new Types.ObjectId(seller_id) } : {};
        const sellerProducts = await Product.find(productQuery).select("_id").lean();
        const productIds = sellerProducts.map((p) => p._id);

        if (productIds.length === 0) return [];

        const productMetas = await ProductProductmeta.find({ product_id: { $in: productIds } }).select("productmeta_id").lean();
        const metaIds = [...new Set(productMetas.map((pm) => pm.productmeta_id))];
        if (metaIds.length === 0) return [];

        return await Productmeta.find({ _id: { $in: metaIds }, module: "Type", ...searchFilter }).select("_id name").limit(50).lean();
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

export async function validateCoupon( code: string ): Promise<{ valid: boolean; message: string; coupon?: any }> {
  const coupon = await Coupon.findOne({ code: code }).exec();
  if (!coupon) { return { valid: false, message: "Coupon not found" }; }
  if (!coupon.status) { return { valid: false, message: "Coupon is inactive" }; }

  const now = new Date();
  if (coupon.valid_from && now < coupon.valid_from) { return { valid: false, message: "Coupon not yet valid" }; }
  if (coupon.valid_to && now > coupon.valid_to) { return { valid: false, message: "Coupon has expired" }; }

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
    { path: "cartSkus", populate: [{ path: "sku_id" }, { path: "product_id" }] },
    { path: "cartCharges" },
  ]).exec();

  const { valid, message, coupon } = await validateCoupon(coupon_code);
  if (!valid) {
    await remove_coupon(cart_id);
    return { success: false, message };
  }

  let total = 0;
  for (const cartSku of cart.cartSkus) {
    const sku = cartSku.sku_id;
    const quantity = cartSku.quantity ?? 0;
    if (!sku) continue;

    const effectivePrice = await getEffectiveSkuPrice(sku, cartSku.seller_id);
    if (coupon.coupon_by === "Vendor") {
      if (cartSku.seller_id?.toString() === coupon.seller_id.toString()) {
        total += effectivePrice * quantity;
      }
    } else {
      total += effectivePrice * quantity;
    }
  }

  if (coupon.sales && total < coupon.sales) {
    await remove_coupon(cart_id);
    return { success: false, message: `Coupon valid only for sales up to ${coupon.sales}` };
  }

  let discount_amount = coupon.usage_type === "Percent Based" ? (total * coupon.discount) / 100 : coupon.discount;

  let admin_coupon_discount = 0;
  let vendor_coupon_discount = 0;

  if (coupon.coupon_by === "Vendor") {
    vendor_coupon_discount = discount_amount;
  } else {
    admin_coupon_discount = discount_amount;
  }

  await upsertCartCoupon(cart_id, {
    coupon_id: coupon.id,
    admin_coupon_discount,
    vendor_coupon_discount,
    coupon_code,
  });

  await recalculateCart(cart_id);

  return { success: true, message: "Coupon Applied Successfully" };
}

export const functions: APIHandlers = {
  create_update_coupon : { middlewares: ["checkUserId", "checkPostMethod" ] },
  get_filtered_coupon : { middlewares: ["checkUserId", "checkPostMethod" ] },
  get_coupon_target_options : { middlewares: ["checkUserId", "checkPostMethod" ] },
  get_single_coupon : { middlewares: [] },
}

export const couponHandlers = {
  create_update_coupon,
  get_filtered_coupon,
  get_coupon_target_options,
  get_single_coupon,
};

export const config = { api: { bodyParser: false } };
export default createApiHandler(functions, couponHandlers);