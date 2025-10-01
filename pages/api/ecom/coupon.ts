import mongoose, { isValidObjectId, Types } from 'mongoose';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserIdFromToken, log } from '../utils';
import { createApiHandler, ExtendedRequest, } from '../apiHandler';
import Review from 'lib/models/basic/Review';
import "lib/models";
import Coupon from 'lib/models/ecom/Coupon';
import { uploadMedia } from '../basic/media';
import BuyOneGetOne from 'lib/models/ecom/BuyOneGetOne';
import { recalculateCart } from './ecom';
import { Cart, CartCoupon, CartCouponProps } from 'lib/models/ecom/Cart';
import { SkuDocument } from 'lib/models/product/Sku';
import { getEffectiveSkuPrice } from './sales';
import { APIHandlers } from '../middleware';

export async function create_update_coupon(req: ExtendedRequest, res: NextApiResponse) {
  try {
    if (req.method !== "POST") { return res.status(405).json({ message: "Method Not Allowed" }); }

    const data = req.body;  
    if ( !data?.coupon_by || !data?.coupon_type || !data?.usage_type  || !data?.name || !data?.code || !data?.sales || !data?.status || !data?.valid_from || !data?.valid_to ) { return res.status(400).json({ message: 'Required fields missing' }); }
    
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
          coupon_type: data.coupon_type,
          vendor_id: data.vendor_id,
          media_id: media_id,
          usage_type: data.usage_type,
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
        coupon_type: data.coupon_type,
        vendor_id: data.vendor_id,
        media_id: media_id,
        usage_type: data.usage_type,
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
  } catch (error) { log(error); return res.status(500).json({ message: "Server error", error });}
}

export async function get_all_coupons(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { vendor_id } = req.query;
    const filter: any = {};
    if (vendor_id && mongoose.Types.ObjectId.isValid(vendor_id as string)) {
      filter.vendor_id = new mongoose.Types.ObjectId(vendor_id as string);
    }
    
    const data = await Coupon.find(filter).populate([ { path: "media_id" }, { path: "vendor_id", select: "_id name email phone" }, { path: "bogo_items", populate: [ { path: "buy_id", select: "_id sku name" }, { path: "get_id", select: "_id sku name" }, ] } ]).exec();

    return res.status(200).json({ message: vendor_id ? "Fetched vendor coupons" : "Fetched all coupons", data });

  } catch (error) { log(error); }
}

export async function get_single_coupon(req: NextApiRequest, res: NextApiResponse){
  const id = (req.method === 'GET' ? req.query.id : req.body.id) as string;
  if (!id || !Types.ObjectId.isValid(id)) { return res.status(400).json({ message: 'Invalid or missing ID' }); }

  const entry = await Coupon.findById(id).populate([ { path: "media_id" }, { path: "vendor_id", select: "_id name email phone" }, { path: "bogo_items", populate: [ { path: "buy_id", select: "_id sku name" }, { path: "get_id", select: "_id sku name" }, ] } ]).exec();
  if (!entry) { return res.status(404).json({ message: `Page with ID ${id} not found` }); }

  return res.status(200).json({ message: '✅ Single Entry Fetched', data: entry });
};

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

export async function upsertCartCoupon( cart_id: string | Types.ObjectId, data: Partial<CartCouponProps>): Promise<CartCouponProps> {
  let cartCoupon = await CartCoupon.findOne({ cart_id });

  if (!cartCoupon) {
    cartCoupon = new CartCoupon({ cart_id, ...data });
  } else {
    Object.assign(cartCoupon, data);
  }

  return await cartCoupon.save();
}

interface CartSkuProps {
  _id: Types.ObjectId;
  sku_id: SkuDocument | null;
  vendor_id?: Types.ObjectId;
  quantity?: number;
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

    const effectivePrice = await getEffectiveSkuPrice(sku, cartSku.vendor_id);
    if (coupon.coupon_by === "Vendor") {
      if (cartSku.vendor_id?.toString() === coupon.vendor_id.toString()) {
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

  let discount_amount = coupon.coupon_type === "Percent Based" ? (total * coupon.discount) / 100 : coupon.discount;

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
  create_update_coupon : { middlewares: [] },
  get_all_coupons : { middlewares: [] },
  get_single_coupon : { middlewares: [] },
}

export const couponHandlers = {
  create_update_coupon,
  get_all_coupons,
  get_single_coupon,
};

export const config = { api: { bodyParser: false } };
export default createApiHandler(functions);