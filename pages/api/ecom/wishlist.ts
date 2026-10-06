import mongoose, { Types } from 'mongoose';
import type { NextApiRequest, NextApiResponse } from 'next';
import { logError } from '../utils';
import { createApiHandler } from '../apiHandler';
import { APIHandlers } from '../../../lib/server/middleware';
import { buildFilterQuery } from 'lib/server/plugins/buildFilterQuery';
import Wishlist from 'lib/models/wishlist/Wishlist';
import WishlistCart from 'lib/models/wishlist/WishlistCart';
import { add_to_cart } from './ecom';
import OrderGuide from 'lib/models/wishlist/OrderGuide';
import OrderGuideProducts from 'lib/models/wishlist/OrderGuideProducts';
import { getUserIdFromToken } from '../basic/auth';

export async function get_filtered_wishlist(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { filters = {}, page = 0, limit = 10 } = req.body || {};
    const { matchQuery, skip, limit: safeLimit } = buildFilterQuery(filters, { page, limit, defaultLimit: 10, maxLimit: 100, searchableFields: ["name", "email", "phone"] });
    const total = await Wishlist.countDocuments(matchQuery);

    const data = await Wishlist.find(matchQuery).populate([ 
      {path: "user_id" },
      { path: 'wishlistCarts', populate: [{ path: 'product_id', populate: { path: "mediaHubs", populate: { path: "media_id" } } }, { path: 'sku_id' } ]}, ]).skip(skip).limit(safeLimit).sort({ createdAt: -1 });
    return res.status(200).json({ message: 'Fetched all Wishlists', data, pagination: { total, page, limit: safeLimit, pages: Math.ceil(total / safeLimit) } });
  } catch (error) {
    await logError(error, { function: "get_filtered_wishlist", payload: req.body });
    return res.status(500).json({ status: false, message: "Something went wrong" });
  }
}

export async function add_to_wishlist(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { wishlist_id, product_id, seller_id, sku_id, quantity = 1 } = req.body;
    const user_id = await getUserIdFromToken(req);

    if (!product_id) { return res.status(400).json({ status: false, message: "product_id is required" }); }

    let wishlist = null;
    if (wishlist_id && !mongoose.Types.ObjectId.isValid(wishlist_id)) {
      wishlist = await Wishlist.findById(wishlist_id);
    }

    if (!wishlist && user_id) {
      wishlist = await Wishlist.findOne({ user_id });
    }
    
    if (!wishlist) {
      wishlist = await Wishlist.create({
        user_id: user_id || null,
        buyer_id: user_id || null,
        status: "Requested",
      });
    }

    res.setHeader( "Set-Cookie", `wishlist_id=${wishlist._id}; Path=/; SameSite=Lax`);

    const query: any = { wishlist_id: wishlist._id, product_id };
    if (sku_id) { query.sku_id = sku_id; }

    const existingItem = await WishlistCart.findOne(query);

    if (existingItem) {
      existingItem.quantity = (existingItem.quantity || 1) + quantity;
      await existingItem.save();
    } else {
      await WishlistCart.create({
        wishlist_id: wishlist._id,
        user_id: user_id || null,
        buyer_id: user_id || null,
        seller_id,
        product_id,
        sku_id: sku_id || null,
        quantity,
      });
    }

    return res.status(200).json({ status: true, message: "Added to wishlist", data:{ wishlist_id : wishlist._id } });
  } catch (error) {
    await logError(error, { function: "add_to_wishlist", payload: req.body });
    return res.status(500).json({ status: false, message: "Something went wrong" });
  }
}

export async function get_user_wishlist(req: NextApiRequest, res: NextApiResponse) {
  try {
    const user_id = await getUserIdFromToken(req);
    const wishlist_id = req.body?.wishlist_id || req.cookies?.wishlist_id || null;
    let wishlist = null;

    if (wishlist_id && mongoose.Types.ObjectId.isValid(wishlist_id)) {
      wishlist = await Wishlist.findById(wishlist_id);
    }

    if (!wishlist && user_id) {
      wishlist = await Wishlist.findOne({ user_id });
    }

    if (!wishlist) {
      return res.status(200).json({ status: true, data: null });
    }

    let wishlistItems = await WishlistCart.find({ wishlist_id: wishlist._id }).populate([ { path: "product_id", populate: { path: "mediaHubs", populate: { path: "media_id" } } }, { path: "sku_id" } ]).sort({ createdAt: -1 });

    const invalidItems = wishlistItems.filter((item: any) => !item.product_id || !item.sku_id);
    if (invalidItems.length > 0) {
      await WishlistCart.deleteMany({ _id: { $in: invalidItems.map((i: any) => i._id) } });
    }
    wishlistItems = wishlistItems.filter((item: any) => item.product_id && item.sku_id);
    const totalQuantity = wishlistItems.reduce((sum: number, item: any) => sum + (Number(item.quantity) || 0), 0);
    return res.status(200).json({ status: true, data: { wishlist_id: wishlist._id, wishlistItems, wishlistCount: totalQuantity } });
  } catch (error) {
    await logError(error, { function: "get_user_wishlist", payload: req.body });
    return res.status(500).json({ status: false, message: "Something went wrong" });
  }
}

export async function get_user_filtered_wishlist(req: NextApiRequest, res: NextApiResponse) {
  try {
    const user_id = await getUserIdFromToken(req);

    const data = await WishlistCart.find({ user_id }).populate([ { path: "product_id", populate: { path: "mediaHubs", match: { module: "Product" }, populate: { path: "media_id", model: "Media", select: "_id path alt" } }  }, { path: "sku_id" } ]).sort({ createdAt: -1 });
    
    return res.status(200).json({ status: true, data });
  } catch (error) {
    await logError(error, { function: "get_user_filtered_wishlist", payload: req.body });
    return res.status(500).json({ status: false, message: "Something went wrong" });
  }
}

export async function delete_wishlist_cart(req: NextApiRequest,res: NextApiResponse) {
  try {
    const { wishlist_cart_id } = req.body;

    if (!wishlist_cart_id || !mongoose.Types.ObjectId.isValid(wishlist_cart_id)) {
      return res.status(400).json({ status: false, message: "Invalid wishlist cart id", data:false });
    }

    const wishlist_id = req.body?.wishlist_id || req.cookies?.wishlist_id || null;
    
    if (wishlist_id && mongoose.Types.ObjectId.isValid(wishlist_id)) {
      const deleted = await WishlistCart.findOneAndDelete({ _id: wishlist_cart_id, wishlist_id });

      if (!deleted) { return res.status(404).json({ status: false, message: "Wishlist item not found", data:false }); }
      return res.status(200).json({ status: true, message: "Wishlist item removed", data:true });
    }    

    const user_id = await getUserIdFromToken(req);
    if (!user_id) { return res.status(401).json({ status: false, message: "Unauthorized" }); }

    const deleted = await WishlistCart.findOneAndDelete({ _id: wishlist_cart_id, user_id });
    if (!deleted) { return res.status(404).json({ status: false, message: "Wishlist item not found", data:false }); }

    return res.status(200).json({ status: true, message: "Wishlist item removed", data:true });
  } catch (error) {
    await logError(error, { function: "delete_wishlist_cart", payload: req.body });
    return res.status(500).json({ status: false, message: "Something went wrong", data:false });
  }
}

export async function remove_from_wishlist(req: NextApiRequest,res: NextApiResponse) {
  try {
    const { wishlist_cart_id, product_id } = req.body;

    if (!wishlist_cart_id || !mongoose.Types.ObjectId.isValid(wishlist_cart_id)) {
      return res.status(400).json({ status: false, message: "Invalid wishlist cart id", data:false });
    }

    const deleted = await WishlistCart.findOneAndDelete({ _id: wishlist_cart_id, product_id: product_id });
    if (!deleted) { return res.status(404).json({ status: false, message: "Wishlist item not found", data:false }); }

    return res.status(200).json({ status: true, message: "Wishlist item removed", data:true });
  } catch (error) {
    await logError(error, { function: "delete_wishlist_cart", payload: req.body });
    return res.status(500).json({ status: false, message: "Something went wrong", data:false });
  }
}

export async function move_to_cart(req: NextApiRequest,res: NextApiResponse) {
  try {
    const { wishlist_cart_id, product_id } = req.body;

    if (!wishlist_cart_id || !mongoose.Types.ObjectId.isValid(wishlist_cart_id)) {
      return res.status(400).json({ status: false, message: "Invalid wishlist cart id", data:false });
    }

    const wishlistItem = await WishlistCart.findById(wishlist_cart_id);
    if (!wishlistItem) { return res.status(404).json({ status: false, message: "Wishlist item not found" }); }

    req.body.action = "add_to_cart";
    req.body.quantity = wishlistItem.quantity || 1;
    req.body.sku_id = wishlistItem.sku_id;

    const cartResponse = await add_to_cart(req, res);

    if (!cartResponse) {
      return res.status(404).json({ status: false, message: "Product could not be added to Cart" });
    }

    const deleted = await WishlistCart.findOneAndDelete({ _id: wishlist_cart_id, product_id: product_id });
    if (!deleted) { return res.status(404).json({ status: false, message: "Wishlist item not found", data:false }); }

    return res.status(200).json({ status: true, message: "Wishlist item added to Cart", data:true });
  } catch (error) {
    await logError(error, { function: "delete_wishlist_cart", payload: req.body });
    return res.status(500).json({ status: false, message: "Something went wrong", data:false });
  }
}

// Order Guides
  export async function get_my_order_guides(req: NextApiRequest,res: NextApiResponse) {
    try {
      const user_id = await getUserIdFromToken(req);

      const data = await OrderGuide.find({ user_id}).populate({ path: 'products', populate: [ { path: 'sku_id' }, { path: 'product_id', populate: { path: 'mediaHubs', populate: { path: 'media_id' }, }, } ] }).sort({ name: -1 });
      return res.status(200).json({ status: true, message: "Wishlist item added to Cart", data });
    } catch (error) {
      await logError(error, { function: "get_my_order_guides", payload: req.body });
      return res.status(500).json({ status: false, message: "Something went wrong", data:false });
    }
  }

  export async function get_single_order_guide(req: NextApiRequest, res: NextApiResponse) {
    try {
      const id = (req.method === "GET" ? req.query.id : req.body.id) as string;
      const byPassUser = (req.method === "GET" ? req.query.byPassUser : req.body.byPassUser) === true || (req.method === "GET" ? req.query.byPassUser : req.body.byPassUser) === "true";
      if (!id || !Types.ObjectId.isValid(id)) { return res.status(400).json({ message: 'Invalid or missing ID' }); }

      const query: Record<string, any> = { _id: id };
      if (!byPassUser) { query.user_id = await getUserIdFromToken(req); }

      const data = await OrderGuide.findOne(query).populate({ path: 'products', populate: [ { path: 'sku_id' }, { path: 'product_id', populate: { path: 'mediaHubs', populate: { path: 'media_id' }, }, } ] }).sort({ name: -1 });
      return res.status(200).json({ status: true, message: "Order guide retrieved successfully", data });
    } catch (error) {
      await logError(error, { function: "get_single_order_guide", payload: req.body });
      return res.status(500).json({ status: false, message: "Something went wrong", data: false });
    }
  }

  export async function create_update_order_guide(req: NextApiRequest, res: NextApiResponse) {
    try {
      const user_id = await getUserIdFromToken(req);
      const { _id, name } = req.body;
      if (!name?.trim()) { return res.status(400).json({ status: false, message: 'Guide name is required', data: false }); }

      let guide;

      if (_id) {
        guide = await OrderGuide.findOneAndUpdate(
          { name, ...(user_id && { user_id }) },
          { new: true, runValidators: true }
        );
        if (!guide) { return res.status(404).json({ status: false, message: 'Order guide not found', data: false }); }
      } else {
        guide = await OrderGuide.create({
          user_id,
          name,
        });
      }

      return res.status(200).json({ message: `Order guide ${!_id ? 'created' : 'updated'} successfully`, data: guide });
    } catch (error) {
      await logError(error, { function: 'create_update_order_guide', payload: req.body });
      return res.status(500).json({ status: false, message: 'Something went wrong', data: false });
    }
  }

  export async function add_to_order_guide(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { order_guide_id, product_id, sku_id, quantity = '1' } = req.body;
      if (!order_guide_id || !product_id) { return res.status(400).json({ message: 'order_guide_id and product_id are required fields', data: false }); }

      const parsedQuantity = parseInt(quantity, 10);
      if (isNaN(parsedQuantity) || parsedQuantity <= 0) { return res.status(400).json({ message: 'Quantity must be a positive integer', data: false }); }

      const guideExists = await OrderGuide.findOne({ _id: order_guide_id });
      if (!guideExists) { return res.status(404).json({ message: 'Order guide not found or access denied', data: false }); }
      
      const filterQuery: Record<string, any> = {
        order_guide_id, product_id, ...(sku_id ? { sku_id } : { sku_id: { $exists: false } }),
      };
      
      const guideProduct = await OrderGuideProducts.findOneAndUpdate(filterQuery, {
          $inc: { quantity: parsedQuantity },
          $setOnInsert: {
            order_guide_id,
            product_id,
            ...(sku_id ? { sku_id } : {}),
          },
        }, { upsert: true, new: true, runValidators: true });

      return res.status(200).json({ message: 'Item added to Order Guide successfully', data: guideProduct });
    } catch (error) {
      await logError(error, { function: 'add_to_order_guide', payload: req.body });
      return res.status(500).json({ message: 'Failed to process item addition to order guide', data: false });
    }
  }

  export async function update_order_guide_item(req: NextApiRequest, res: NextApiResponse) {
    try {
      const user_id = await getUserIdFromToken(req);
      const { order_guide_id, product_id, sku_id, action } = req.body;
      if (!order_guide_id || !product_id) { return res.status(400).json({ status: false, message: 'order_guide_id and product_id are required fields', data: false }); }
      if (!['increment', 'decrement', 'remove'].includes(action)) { return res.status(400).json({ status: false, message: 'Invalid action provided', data: false }); }

      const guideExists = await OrderGuide.findOne({ _id: order_guide_id, user_id });
      if (!guideExists) { return res.status(404).json({ status: false, message: 'Order guide not found or access denied', data: false }); }

      const filterQuery: Record<string, any> = { order_guide_id, product_id, ...(sku_id ? { sku_id } : { sku_id: { $exists: false } }) };
      
      if (action === 'remove') {
        await OrderGuideProducts.deleteOne(filterQuery);
        return res.status(200).json({ status: true, message: 'Item removed successfully', data: true });
      }

      if (action === 'decrement') {
        const existingItem = await OrderGuideProducts.findOne(filterQuery);
        if (!existingItem) { return res.status(404).json({ status: false, message: 'Item not found in order guide', data: false }); }

        if (existingItem.quantity <= 1) {
          await OrderGuideProducts.deleteOne(filterQuery);
          return res.status(200).json({ status: true, message: 'Item removed from order guide', data: true });
        }

        const updated = await OrderGuideProducts.findOneAndUpdate( filterQuery,
          { $inc: { quantity: -1 } },
          { new: true }
        );
        return res.status(200).json({ status: true, message: 'Quantity decreased', data: updated });
      }
      
      const updated = await OrderGuideProducts.findOneAndUpdate(filterQuery, {
          $inc: { quantity: 1 },
          $setOnInsert: {
            order_guide_id,
            product_id,
            ...(sku_id ? { sku_id } : {}),
          },
        }, { upsert: true, new: true, runValidators: true });

      return res.status(200).json({ status: true, message: 'Quantity increased', data: updated });
    } catch (error) {
      await logError(error, { function: 'update_order_guide_item', payload: req.body });
      return res.status(500).json({ status: false, message: 'Failed to update order guide item', data: false });
    }
  }

  export async function get_filtered_order_guides(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { filters = {}, page = 0, limit = 10 } = req.body || {};
      const { matchQuery, skip, limit: safeLimit } = buildFilterQuery(filters, { page, limit, defaultLimit: 10, maxLimit: 100, searchableFields: ["name"] });
      const total = await OrderGuide.countDocuments(matchQuery);

      const data = await OrderGuide.find(matchQuery).populate([
        {path: "user_id" },
        { path: 'products', populate: [ { path: 'sku_id' }, { path: 'product_id', populate: { path: 'mediaHubs', populate: { path: 'media_id' }, }, } ] }
      ]).skip(skip).limit(safeLimit).sort({ createdAt: -1 });
      return res.status(200).json({ message: 'Fetched all Wishlists', data, pagination: { total, page, limit: safeLimit, pages: Math.ceil(total / safeLimit) } });
    } catch (error) {
      await logError(error, { function: "get_filtered_order_guides", payload: req.body });
      return res.status(500).json({ status: false, message: "Something went wrong" });
    }
  }

  export async function get_single_admin_order_guides(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { id, search, filters = {}, page = 0, limit = 10 } = req.body || {};
      if (!id || !Types.ObjectId.isValid(id)) { return res.status(400).json({ status: false, message: 'Invalid or missing Order Guide ID' }); }

      // Explicitly type or cast the lean result to avoid array confusion
      const targetGuide = await OrderGuide.findById(id).select("user_id").lean() as { user_id?: any } | null;
      
      if (!targetGuide || !targetGuide?.user_id) { return res.status(404).json({ status: false, message: 'Order Guide or associated user not found', data: [] }); }
      
      const mergedFilters = { ...filters, user_id: targetGuide.user_id, ...(search ? { search } : {}) };
      const { matchQuery, skip, limit: safeLimit } = buildFilterQuery(mergedFilters, { page, limit, defaultLimit: 10, maxLimit: 100, searchableFields: ["name"] });
      const total = await OrderGuide.countDocuments(matchQuery);
      
      const data = await OrderGuide.find(matchQuery)
        .populate([
          { path: "user_id" },
          { path: 'products', populate: [
              { path: 'sku_id' },
              { path: 'product_id', populate: { path: 'mediaHubs', populate: { path: 'media_id' } } }
            ]
          }
        ]).skip(skip).limit(safeLimit).sort({ createdAt: -1 });

      return res.status(200).json({ message: 'Fetched user Order Guides successfully', data, pagination: { total, page, limit: safeLimit, pages: Math.ceil(total / safeLimit) } });
    } catch (error) {
      await logError(error, { function: "get_single_admin_order_guides", payload: req.body });
      return res.status(500).json({ status: false, message: "Something went wrong" });
    }
}
// Order Guides

export const functions: APIHandlers = {
  get_filtered_wishlist : { middlewares: [ "checkUserId", "checkPostMethod" ], url: "/admin/wishlist" },
  get_user_filtered_wishlist : { middlewares: [ "checkUserId", "checkPostMethod" ] },
  get_user_wishlist : { middlewares: [ "checkPostMethod" ] },
  add_to_wishlist : { middlewares: [ "checkUserId", "checkPostMethod" ] },
  delete_wishlist_cart : { middlewares: [ "checkUserId", "checkPostMethod" ] },
  remove_from_wishlist : { middlewares: [ "checkPostMethod" ] },
  move_to_cart : { middlewares: [ "checkPostMethod" ] },
  
  get_my_order_guides : { middlewares: [ "checkUserId", ] },
  get_single_order_guide : { middlewares: [ "checkUserId", "checkPostMethod" ] },
  create_update_order_guide : { middlewares: [ "checkUserId", "checkPostMethod" ] },
  add_to_order_guide : { middlewares: [ "checkUserId", "checkPostMethod" ] },
  update_order_guide_item : { middlewares: [ "checkUserId", "checkPostMethod" ] },

  get_filtered_order_guides : { middlewares: [ "checkUserId", "checkPostMethod" ] },
  get_single_admin_order_guides : { middlewares: [ "checkUserId", "checkPostMethod" ] },
}

export const wishlistHandlers = {
  get_filtered_wishlist,
  get_user_filtered_wishlist,
  get_user_wishlist,
  add_to_wishlist,
  delete_wishlist_cart,
  remove_from_wishlist,
  move_to_cart,

  get_my_order_guides,
  get_single_order_guide,
  create_update_order_guide,
  add_to_order_guide,
  update_order_guide_item,

  get_filtered_order_guides,
  get_single_admin_order_guides,
};

export const config = { api: { bodyParser: false } };
export default createApiHandler(functions, wishlistHandlers);