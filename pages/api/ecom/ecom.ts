import mongoose, { isValidObjectId, Types } from 'mongoose';
import { createApiHandler, ExtendedRequest } from '../apiHandler';
import { NextApiRequest, NextApiResponse } from 'next';
import { getUserIdFromToken, log } from '../utils';
import { deleteCookie, getCartIdFromRequest, setCookie } from '../cartUtils';
import { Cart, CartSku, CartSkuProps } from 'lib/models/ecom/Cart';
import { Sku, SkuDocument } from 'lib/models/product/Sku';
import Product from 'lib/models/product/Product';

export async function add_to_cart(req: NextApiRequest, res: NextApiResponse) {
  try {
    let cart_id = await getCartIdFromRequest(req, res);

    if( !cart_id ){
      cart_id = await create_cart(req, res);
    }
    if( !cart_id ){ return res.status(200).json({ status: false, message: 'Cart not found' }); }

    const cartSkuResponse = await update_cart(req, cart_id);

    if (cartSkuResponse.status) {
      return res.status(200).json({ ...cartSkuResponse });
    } else {
      return res.status(400).json({ ...cartSkuResponse });
    }

  } catch (error) { return log(error); }
}

export async function create_cart(req: NextApiRequest, res: NextApiResponse) {
  try {
    const data = req.body;

    const user_id = getUserIdFromToken(req);

    let payable_amount = 0;
    
    const newEntry = new Cart({
      user_id: user_id,
      billing_address_id: data.billing_address_id,
      shipping_address_id: data.shipping_address_id,
      paymode: "cod",
      weight: data.weight,
      total: data.total,
      payable_amount: payable_amount,
      user_remarks: data.user_remarks,
    });

    const savedCart = await newEntry.save();

    const cartId = savedCart._id.toString();
    
    setCookie(res, 'cartId', cartId);

    return cartId;
  } catch (error) { return log(error); }
}

export async function update_cart(req: NextApiRequest, cart_id: string): Promise<{ status: boolean; message: string }> {
  try {
    const data = req.body;

    const sku = await Sku.findOne({ _id: data.sku_id }).populate('product_id').exec();
    if (!sku) { return { status: false, message: 'SKU not found' }; }
    if (!sku.product_id){ return { status: false, message: 'SKU does not have a linked product' }; }

    if (!cart_id || !mongoose.Types.ObjectId.isValid(cart_id)) {
      return { status: false, message: 'Invalid cart_id' };
    }
    const cart = await Cart.findById(cart_id).exec();
    if (!cart) { return { status: false, message: 'Cart not found' }; }

    let cartSku = await CartSku.findOne({ cart_id, sku_id: data.sku_id, flavor_id: data.flavor_id }).exec();

    let message = "";

    if (cartSku) {
      if (req.body.action === 'add_to_cart') {
        cartSku.quantity += data.quantity || 1;
      } else if (req.body.action === 'remove_from_cart') {
        cartSku.quantity -= 1;
      }

      if (cartSku.quantity <= 0) {
        await cartSku.remove();
        message = 'Cart SKU entry removed as quantity became 0';
      } else {
        const updated = await cartSku.save();
        message = "Cart Updated";
      }
    } else {
      if (req.body.action === 'add_to_cart') {
        const newCartSku = new CartSku({
          cart_id,
          sku_id: data.sku_id,
          flavor_id: data.flavor_id,
          quantity: data.quantity || 1,
          product_id: sku.product_id._id,
          vendor_id: (sku.product_id as any).vendor_id,
        });

        const savedCartSku = await newCartSku.save();
        message = "Cart Entry Created";
      } else {
        return { status: false, message: 'Cannot remove from cart; entry does not exist' };
      }
    }

    await recalculateCart(cart_id);

    return { status: true, message };
  } catch (error) { log(error); return {status: false, message: "" } }
}

export async function recalculateCart ( cart_id: string){
  try{
    const updatedCart = await Cart.findById(cart_id).populate([ { path: 'cartSkus', populate: { path: 'sku_id', model: 'Sku' } }, { path: 'cartCharges' } ]).exec();
    
    let total = updatedCart.cartSkus.reduce((sum: number, cartSku: CartSkuProps & { sku_id: SkuDocument | null }) => {
      const sku = cartSku.sku_id;

      const skuPrice = sku?.price ? Number(sku.price) : 0;
      const quantity = cartSku.quantity ?? 0;

      return sum + skuPrice * quantity;
    }, 0);

    const charges = updatedCart.cartCharges || {};
    const shippingCharges = Number(charges.shipping_charges || 0);
    const salesDiscount = Number(charges.sales_discount || 0);
    const additionalDiscount = Number(charges.additional_discount || 0);
    const codCharges = Number(charges.cod_charges || 0);

    const payable_amount = total + shippingCharges + codCharges - (salesDiscount + additionalDiscount);
    updatedCart.total = total;
    updatedCart.payable_amount = payable_amount;

    await updatedCart.save();
  }catch (error) { log(error); }
}

export async function get_cart_data(req: NextApiRequest, res: NextApiResponse) {
  try {
    let cart_id = await getCartIdFromRequest(req, res);
    if( !cart_id ){ return res.status(200).json({ message: 'Cart not found', data: null }); }

    const data = await Cart.findById(cart_id).populate([ { path: 'cartSkus', populate: [ { path: 'sku_id' }, { path: 'product_id', populate: [ { path: 'mediaHubs', populate: { path: 'media_id' } } ] } ]  }, { path: 'cartCharges' }]).exec();

    const cartProductIds = data?.cartSkus.map((item: any) => item.product_id._id);
    const relatedProducts = await Product.find().populate({ path: "mediaHubs", populate: { path: "media_id", model: "Media", select: "_id path alt" } }).exec();

    // { _id: { $nin: cartProductIds }, }

    return res.status(200).json({ message: 'Cart Fetched', data, relatedProducts });
  } catch (error) { return log(error); }
}

export async function increment_cart(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { cart_sku_id } = req.body;
    if (!cart_sku_id) { return res.status(400).json({ status: false, message: 'cart_sku_id is required' }); }
    
    let cart_id = await getCartIdFromRequest(req, res);
    if( !cart_id ){ return res.status(200).json({ status: false, message: 'Cart not found' }); }
    
    let cartSku = await CartSku.findOne({ cart_id, _id: cart_sku_id });
    if (!cartSku) { return res.status(400).json({ status: false, message: 'Cart item not found' }); }
    
    cartSku.quantity += 1;
    await cartSku.save();

    await recalculateCart(cart_id);

    return res.status(200).json({ status: true, message: 'Quantity incremented successfully' });
  } catch (error) { return log(error); }
}

export async function decrement_cart(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { cart_sku_id } = req.body;
    if (!cart_sku_id) { return res.status(400).json({ status: false, message: 'cart_sku_id is required' }); }

    const cart_id = await getCartIdFromRequest(req, res);
    if (!cart_id) { return res.status(200).json({ status: false, message: 'Cart not found' }); }

    let cartSku = await CartSku.findOne({ cart_id, _id: cart_sku_id });
    if (!cartSku) { return res.status(400).json({ status: false, message: 'Cart item not found' }); }

    cartSku.quantity -= 1;

    let message = "";
    if (cartSku.quantity <= 0) {
      await CartSku.deleteOne({ _id: cartSku._id });
      message =  'Cart item removed from cart';
    } else {
      await cartSku.save();
      message = 'Quantity decremented successfully';
    }    
    
    await recalculateCart(cart_id);

    return res.status(200).json({ status: true, message });
  } catch (error) { return log(error); }
};

export async function update_user_remarks(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { user_remarks } = req.body;
    if (!user_remarks) { return res.status(400).json({ status: false, message: 'user_remarks is required' }); }

    const cart_id = await getCartIdFromRequest(req, res);
    if (!cart_id) { return res.status(200).json({ status: false, message: 'Cart not found' }); }

    let cart = await Cart.findOne({ _id: cart_id });
    if (!cart) { return res.status(400).json({ status: false, message: 'Cart not found' }); }

    cart.user_remarks = user_remarks;
    await cart.save();

    return res.status(200).json({ status: true, message: "Order Note Updated" });
  } catch (error) { return log(error); }
};

const functions = {
  add_to_cart,
  get_cart_data,
  increment_cart,
  decrement_cart,
  update_user_remarks
};

export default createApiHandler(functions);