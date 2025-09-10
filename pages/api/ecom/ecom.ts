import mongoose, { isValidObjectId, Types } from 'mongoose';
import { createApiHandler, ExtendedRequest } from '../apiHandler';
import { NextApiRequest, NextApiResponse } from 'next';
import { getUserIdFromToken, log } from '../utils';
import { deleteCookie, getCartIdFromRequest, setCookie } from '../cartUtils';
import { Cart, CartSku, CartSkuProps } from 'lib/models/ecom/Cart';
import { Sku, SkuDocument } from 'lib/models/product/Sku';

export async function add_to_cart(req: NextApiRequest, res: NextApiResponse) {
  try {
    let cart_id = await getCartIdFromRequest(req, res);

    if( !cart_id ){
      cart_id = await create_cart(req, res);
    }

    if( !cart_id ){
      return res.status(200).json({ status: false, message: 'Cart not found' });
    }

    const cartSkuResponse = await update_cart(req, cart_id);
    if (cartSkuResponse.status) {
      return res.status(200).json(cartSkuResponse);
    } else {
      return res.status(400).json(cartSkuResponse);
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

    console.log("TP", total, payable_amount)

    await updatedCart.save();

    return { status: true, message };
  } catch (error) { 
    return {status: false, message: "" }
    log(error); }
}







const functions = {
  add_to_cart,
};

export default createApiHandler(functions);