import mongoose, { isValidObjectId, Types } from 'mongoose';
import { createApiHandler, ExtendedRequest } from '../apiHandler';
import { NextApiRequest, NextApiResponse } from 'next';
import { getUserIdFromToken, log } from '../utils';
import { deleteCookie, getCartIdFromRequest, setCookie } from '../cartUtils';
import { Cart, CartCharges, CartSku, CartSkuProps } from 'lib/models/ecom/Cart';
import { Sku, SkuDocument } from 'lib/models/product/Sku';
import Product from 'lib/models/product/Product';
import { Order, OrderCharges, OrderSku } from 'lib/models/ecom/Order';
import TaxCollected from 'lib/models/payment/TaxCollected';

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

    let admin_discount = Number(charges.admin_discount || 0);

    if (charges.admin_discount_validity) {
      const now = new Date();
      const expiry = new Date(charges.admin_discount_validity);

      if (expiry.getTime() < now.getTime()) {
        admin_discount = 0;
        charges.admin_discount = 0;
        charges.admin_discount_validity = null;
        charges.admin_discount_unit = null;
        charges.admin_discount_validity_value = null;
        await charges.save();
      }
    }

    let totalVendorDiscount = updatedCart.cartSkus.reduce( (sum: number, cartSku: CartSkuProps) => {
        let discount = 0;

        if (cartSku.vendor_discount) {
          let isValid = true;

          if (cartSku.vendor_discount_validity) {
            const now = new Date();
            const expiry = new Date(cartSku.vendor_discount_validity);
            if (expiry.getTime() < now.getTime()) {
              isValid = false;
            }
          }

          if (isValid) {
            discount = Number(cartSku.vendor_discount) * (cartSku.quantity ?? 0);
          }
        }

        return sum + discount;
      },
      0
    );

    charges.total_vendor_discount = totalVendorDiscount;
    await charges.save();

    const shippingCharges = Number(charges.shipping_charges || 0);
    const salesDiscount = Number(charges.sales_discount || 0);
    const codCharges = Number(charges.cod_charges || 0);

    const payable_amount = total + shippingCharges + codCharges - (salesDiscount + admin_discount + totalVendorDiscount);
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

export async function update_cart_array(req: NextApiRequest, res: NextApiResponse) {
  try {
    const cart_id = await getCartIdFromRequest(req, res);
    if (!cart_id) { return res.status(400).json({ status: false, message: 'Cart not found' }); }

    const { update } = req.body;
    if (typeof update !== 'object' || !update) { return res.status(400).json({ status: false, message: 'Invalid update payload' }); }

    const cart = await Cart.findOne({ _id: cart_id });
    if (!cart) { return res.status(400).json({ status: false, message: 'Cart not found' }); }
    
    for (const [key, value] of Object.entries(update)) {
      cart.set(key, value);
    }

    await cart.save();
    return res.status(200).json({ status: true, message: "Cart Updated" });
  } catch (error) { return log(error); }
};

export async function place_order(req: NextApiRequest, res: NextApiResponse) {
  try {
    const cart_id = await getCartIdFromRequest(req, res);
    if (!cart_id) { return res.status(200).json({ status: false, message: 'Cart not found' }); }

    const result = await createOrderFromCart(cart_id, res);

    return res.status(200).json({ status: true, message: "Order Placed", result });
  } catch (error) { return log(error); }
};

export async function createOrderFromCart(cart_id: string, res: NextApiResponse) {
  const cart = await Cart.findOne({ _id: cart_id }).populate("cartSkus").populate("cartCharges");
  if (!cart) { return { status: false, message: "Cart not found" }; }

  const newEntry = new Order({
    user_id: cart.user_id,
    billing_address_id: cart.billing_address_id,
    shipping_address_id: cart.shipping_address_id,
    paymode: cart.paymode,
    weight: cart.weight,
    total: cart.total,
    payable_amount: cart.payable_amount,
    user_remarks: cart.user_remarks,
    admin_remarks: cart.admin_remarks,
  });

  const savedOrder = await newEntry.save();
  const orderId = savedOrder._id.toString();
  setCookie(res, "orderId", orderId);

  if (cart.cartCharges) {
    await new OrderCharges({
      order_id: savedOrder._id,
      shipping_charges: cart.cartCharges.shipping_charges,
      shipping_chargeable_value: cart.cartCharges.shipping_chargeable_value,
      sales_discount: cart.cartCharges.sales_discount,
      admin_discount: cart.cartCharges.admin_discount,
      total_vendor_discount: cart.cartCharges.total_vendor_discount,
      cod_charges: cart.cartCharges.cod_charges,
    }).save();
  }

  let totalQuantity = 0;
  if (Array.isArray(cart.cartSkus)) {
    totalQuantity = cart.cartSkus.reduce((sum: number, item: any) => sum + item.quantity, 0);
  }

  let perUnitAdminDiscount = 0;
  if (cart.cartCharges?.admin_discount && totalQuantity > 0) {
    perUnitAdminDiscount = cart.cartCharges.admin_discount / totalQuantity;
  }

  console.log("totalQuantity", totalQuantity)
  console.log("perUnitAdminDiscount", perUnitAdminDiscount)

  let totalTax = 0;

  if (Array.isArray(cart.cartSkus) && cart.cartSkus.length > 0) {
    const orderSkuDocs = cart.cartSkus.map((item: any) => {
      let effectivePrice = item.sku?.price || 0;
      effectivePrice -= perUnitAdminDiscount;
      if (item.vendor_discount) {
        effectivePrice -= item.vendor_discount;
      }
      
      const quantity = item.quantity || 0;
      const taxRate = item.sku?.tax_id?.rate || 0;
      const taxableAmount = effectivePrice * quantity;
      const taxAmount = (taxableAmount * taxRate) / 100;

      totalTax += taxAmount;

      return {
        order_id: savedOrder._id,
        product_id: item.product_id,
        sku_id: item.sku_id,
        vendor_id: item.vendor_id,
        tax_id: item.sku?.tax_id,
        price: item.sku?.price,
        quantity,
        vendor_discount: item.vendor_discount,
        flavor_id: item.flavor_id,
      };
    });

    await OrderSku.insertMany(orderSkuDocs);
  }

  let cgst = 0, sgst = 0, igst = 0;
  const stateName = cart.billing_address_id?.state?.toLowerCase() || "";

  console.log("stateName", stateName, totalTax)

  if (stateName === "haryana") {
    cgst = totalTax;
  } else {
    sgst = totalTax / 2;
    igst = totalTax / 2;
  }
  
  const taxDoc = new TaxCollected({
    module: "Order",
    module_id: savedOrder._id,
    cgst: mongoose.Types.Decimal128.fromString(cgst.toFixed(2)),
    sgst: mongoose.Types.Decimal128.fromString(sgst.toFixed(2)),
    igst: mongoose.Types.Decimal128.fromString(igst.toFixed(2)),
    total: mongoose.Types.Decimal128.fromString(totalTax.toFixed(2)),
  });

  await taxDoc.save();

  return { status: true, message: "Order Placed", orderId };
}

export async function get_abandoned_carts(req: NextApiRequest, res: NextApiResponse) {
  try {
    const data = await Cart.find().populate([ { path: 'cartCharges' }, { path: 'user_id' }, { path: 'cartSkus', populate: [ { path: 'sku_id' }, { path: 'product_id', populate: [ { path: 'mediaHubs', populate: { path: 'media_id' } } ] } ]  }]);

    return res.status(200).json({ message: 'Cart Fetched', data });
  } catch (error) { return log(error); }
}

export async function get_single_abdandoned_cart(req: NextApiRequest, res: NextApiResponse) {
  try {
    const id = (req.method === 'GET' ? req.query.id : req.body.slug) as string;
    if ( !id ) { return res.status(400).json({ message: 'Invalid or missing Id' }); }

    const data = await Cart.findById(id).populate([ { path: 'cartCharges' }, { path: 'billing_address_id' }, { path: 'shipping_address_id' }, { path: 'cartSkus', populate: [ { path: 'sku_id' }, { path: 'product_id', populate: [ { path: 'mediaHubs', populate: { path: 'media_id' } } ] } ]  }]).exec();

    return res.status(200).json({ message: 'Single ABandoned Cart Fetched', data });
  } catch (error) { return log(error); }
}

export async function get_vendor_abandoned_carts(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { vendor_id } = req.query;

    if ( !vendor_id || !mongoose.Types.ObjectId.isValid(vendor_id as string)) {
      return res.status(400).json({ message: "Issue with Vendor ID", data:[] });
    }
    
    const cartIdsAgg = await CartSku.aggregate([
      { $match: { vendor_id: new mongoose.Types.ObjectId(vendor_id as string) } },
      { $group: { _id: "$cart_id" } },
      { $limit: 10 }
    ]);

    const cartIds = cartIdsAgg.map(c => c._id);

    const data = await Cart.find({ _id: { $in: cartIds } })
      .populate([ { path: 'cartCharges' }, { path: 'user_id' }, { path: 'cartSkus', populate: [ { path: 'sku_id' }, { path: 'product_id', populate: [ { path: 'mediaHubs', populate: { path: 'media_id' } } ] } ]  }]).exec();

    return res.status(200).json({ message: "Carts fetched", data });
  } catch (error) { return log(error); }
}

export async function apply_admin_discount(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { data } = req.body;
    
    console.log("data", data)
    if (!data.cart_id || !data.additional_discount || !data.admin_discount_unit || !data.admin_discount_validity_value) { return res.status(400).json({ status: false, message: 'Fields are Missing' }); }    

    let expiry: Date | null = null;
    if (data.admin_discount_validity_value && data.admin_discount_unit) {
      const now = new Date();
      if (data.admin_discount_unit === "hours") {
        expiry = new Date(now.getTime() + data.admin_discount_validity_value * 60 * 60 * 1000);
      } else if (data.admin_discount_unit === "days") {
        expiry = new Date(now.getTime() + data.admin_discount_validity_value * 24 * 60 * 60 * 1000);
      }
    }

    let cartCharges = await CartCharges.findOne({ cart_id: data.cart_id });

    if (!cartCharges) {
      cartCharges = new CartCharges({
        cart_id: data.cart_id,
        admin_discount: data.additional_discount,
        admin_discount_validity: expiry,
        admin_discount_validity_value: data.admin_discount_validity_value,
        admin_discount_unit: data.admin_discount_unit,
      });
    } else {
      cartCharges.admin_discount = data.additional_discount;
      cartCharges.admin_discount_validity = expiry;
      cartCharges.admin_discount_validity_value =  data.admin_discount_validity_value;
      cartCharges.admin_discount_unit = data.admin_discount_unit;
    }

    await cartCharges.save();

    await recalculateCart(data.cart_id);

    return res.status(200).json({ status: true, message: "Cart Updated" });
  } catch (error) { return log(error); }
};

export async function apply_vendor_discount(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { data } = req.body;
    
    if (!data.cartSku_id || !data.vendor_discount || !data.vendor_discount_validity_value || !data.vendor_discount_unit) { 
      return res.status(400).json({ status: false, message: 'Fields are Missing' }); 
    }

    let cartSku = await CartSku.findOne({ _id: data.cartSku_id });
    if (!cartSku) { return res.status(400).json({ status: false, message: 'Sku Not Found' }); }

    let expiry: Date | null = null;
    if (data.vendor_discount_validity_value && data.vendor_discount_unit) {
      const now = new Date();
      if (data.vendor_discount_unit === "hours") {
        expiry = new Date(now.getTime() + data.vendor_discount_validity_value * 60 * 60 * 1000);
      } else if (data.vendor_discount_unit === "days") {
        expiry = new Date(now.getTime() + data.vendor_discount_validity_value * 24 * 60 * 60 * 1000);
      }
    }    

    cartSku.vendor_discount = data.vendor_discount;
    cartSku.vendor_discount_validity = expiry;
    cartSku.vendor_discount_validity_value =  data.vendor_discount_validity_value;
    cartSku.vendor_discount_unit = data.vendor_discount_unit;

    await cartSku.save();

    await recalculateCart(cartSku.cart_id);

    return res.status(200).json({ status: true, message: "Cart Updated" });
  } catch (error) { return log(error); }
};

const functions = {
  add_to_cart,
  get_cart_data,
  increment_cart,
  decrement_cart,
  update_user_remarks,
  update_cart_array,
  get_abandoned_carts,
  get_single_abdandoned_cart,
  place_order,
  apply_admin_discount,
  apply_vendor_discount,
  get_vendor_abandoned_carts
};

export const config = { api: { bodyParser: false } };
export default createApiHandler(functions);