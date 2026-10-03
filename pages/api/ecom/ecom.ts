import mongoose, { Types } from 'mongoose';
import { createApiHandler } from '../apiHandler';
import { NextApiRequest, NextApiResponse } from 'next';
import { getGenericContent, logError } from '../utils';
import { getCartIdFromRequest, setCookie } from '../cartUtils';
import Sku from 'lib/models/product/Sku';
import Product from 'lib/models/product/Product';
import TaxCollected from 'lib/models/payment/TaxCollected';
import { handleApplyCoupon } from './coupon';
import { getEffectiveSkuPrice } from './sales';
import { initAction } from '../basic/action';
import { APIHandlers } from 'lib/server/middleware';
import { getUserIdFromToken } from '../basic/auth';
import Cart, { CartDoc } from 'lib/models/ecom/Cart';
import CartCharges from 'lib/models/ecom/CartCharges';
import CartCoupon from 'lib/models/coupon/CartCoupon';
import CartSku from 'lib/models/ecom/CartSku';
import Order from 'lib/models/ecom/Order';
import OrderCharges from 'lib/models/ecom/OrderCharges';
import OrderCoupon from 'lib/models/coupon/OrderCoupon';
import OrderSku from 'lib/models/ecom/OrderSku';
import CartSkuDetail from 'lib/models/ecom/CartSkuDetail';
import Address from 'lib/models/address/Address';
import CartConsent from 'lib/models/ecom/CartConsent';
import OrderConsent from 'lib/models/ecom/OrderConsent';
import OrderOrderConsent from 'lib/models/ecom/OrderOrderConsent';

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

  } catch (error) { return await logError(error, { function: "add_to_cart", payload: req.body }); }
}

export async function create_cart(req: NextApiRequest, res: NextApiResponse) {
  try {
    const data = req.body;
    const user_id = await getUserIdFromToken(req);
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
  } catch (error) { return await logError(error, { function: "create_cart", payload: req.body }); }
}

export async function update_cart(req: NextApiRequest, cart_id: string): Promise<{ status: boolean; message: string }> {
  try {
    const data = req.body;
    const sku = await Sku.findOne({ _id: data.sku_id })
      .populate({
        path: 'product_id',
        populate: { path: 'seller_id' }
      })
      .exec();
    if (!sku) { return { status: false, message: 'SKU not found' }; }
    if (!sku.product_id){ return { status: false, message: 'SKU does not have a linked product' }; }
    if (!cart_id || !mongoose.Types.ObjectId.isValid(cart_id)) { return { status: false, message: 'Invalid cart_id' }; }

    const cart = await Cart.findById(cart_id).exec();
    if (!cart) { return { status: false, message: 'Cart not found' }; }

    const flavor_id = data.flavor_id || null;
    const color_id = data.color_id || null;

    let cartSkus = await CartSku.find({ cart_id, sku_id: data.sku_id }).populate('details').exec();

    let cartSku = cartSkus.find(item => {
      const details = (item as any).details || [];
      const itemFlavor = details.find((d: any) => d.module_id.toString() === flavor_id)?.module_id?.toString() || null;
      const itemColor = details.find((d: any) => d.module_id.toString() === color_id)?.module_id?.toString() || null;
      
      return itemFlavor === flavor_id && itemColor === color_id;
    });

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
        const product = sku.product_id as any;
        const newCartSku = new CartSku({
          cart_id,
          sku_id: data.sku_id,
          quantity: data.quantity || 1,
          product_id: product._id,
          seller_id: product.seller_id?._id,
        });
        const savedCartSku = await newCartSku.save();

        const detailPromises = [];
        const module = 'ProductFeature';

        if (flavor_id) {
          detailPromises.push( CartSkuDetail.create({ cart_id, cart_sku_id: savedCartSku._id, module, module_id: flavor_id }) );
        }

        if (color_id) {
          detailPromises.push( CartSkuDetail.create({ cart_id, cart_sku_id: savedCartSku._id, module, module_id: color_id }) );
        }

        await Promise.all(detailPromises);
        message = "Cart Entry Created";
      } else {
        return { status: false, message: 'Cannot remove from cart; entry does not exist' };
      }
    }
    await recalculateCart(cart_id);

    return { status: true, message };
  } catch (error) { await logError(error, { function: "update_cart", payload: req.body }); return {status: false, message: "" } }
}

export async function recalculateCart ( cart_id: string){
  try{
    const updatedCart = await Cart.findById(cart_id).populate([ { path: 'cartSkus', populate: { path: 'sku_id', model: 'Sku' } }, { path: 'cartCharges' }, { path: 'cartCoupon' } ]).exec();
    
    let total = 0;
    let sales_discount = 0;
    for (const cartSku of updatedCart.cartSkus) {
      const sku = cartSku.sku_id;
      const quantity = cartSku.quantity ?? 0;
    
      if (sku) {
        const originalPrice = sku.price ? Number(sku.price) : 0;
        const effectivePrice = await getEffectiveSkuPrice(sku, cartSku.seller_id);
        total += originalPrice * quantity;

        if (originalPrice > effectivePrice) {
          sales_discount += (originalPrice - effectivePrice) * quantity;
        }
      }
    }

    await upsertCartCharges(updatedCart._id, { sales_discount });

    let charges = updatedCart.cartCharges || {};
    let admin_discount = Number(charges.admin_discount || 0);

    const chargesUpdates: any = {};

    if (charges.admin_discount_validity) {
      const now = new Date();
      const expiry = new Date(charges.admin_discount_validity);

      if (expiry.getTime() < now.getTime()) {
        admin_discount = 0;
        chargesUpdates.admin_discount = 0;
        chargesUpdates.admin_discount_validity = null;
        chargesUpdates.admin_discount_unit = null;
        chargesUpdates.admin_discount_validity_value = null;
      }
    }

    let totalVendorDiscount = updatedCart.cartSkus.reduce( (sum: number, cartSku: CartDoc) => {
        let discount = 0;
        return sum + discount;
      },
      0
    );

    chargesUpdates.total_vendor_discount = totalVendorDiscount;

    if (Object.keys(chargesUpdates).length > 0) {
      await upsertCartCharges(updatedCart._id, chargesUpdates);
    }
    
    const finalCharges = await CartCharges.findOne({ cart_id: updatedCart._id }).lean() || charges;

    const shippingCharges = Number(finalCharges.shipping_charges || charges.shipping_charges || 0);
    const salesDiscount = Number(finalCharges.sales_discount || charges.sales_discount || 0);
    const codCharges = Number(finalCharges.cod_charges || charges.cod_charges || 0);

    const payable_amount = total + shippingCharges + codCharges - (salesDiscount + admin_discount + totalVendorDiscount + Number(updatedCart.cartCoupon?.admin_coupon_discount || 0) + Number(updatedCart.cartCoupon?.vendor_coupon_discount || 0));
    
    updatedCart.total = total;
    updatedCart.payable_amount = payable_amount;

    await updatedCart.save();
  }catch (error) { await logError(error, { function: "recalculateCart", payload: { cart_id } }); }
}

export async function get_cart_data(req: NextApiRequest, res: NextApiResponse) {
  try {
    let cart_id = await getCartIdFromRequest(req, res);
    if( !cart_id ){ return res.status(200).json({ message: 'Cart not found', data: null }); }

    let cartCoupon = await CartCoupon.findOne({ cart_id });
    if( cartCoupon ){ await handleApplyCoupon(cart_id, cartCoupon.coupon_code); }

    const data = await Cart.findById(cart_id).populate([ 
      { path: 'cartSkus', populate: [ { path: 'sku_id' }, { path: 'product_id', populate: [ { path: 'seller_id' }, { path: 'mediaHubs', populate: { path: 'media_id' } } ] } ]  }, 
      { path: 'cartCharges' }, 
      { path: 'cartCoupon' },
      { path: 'cartConsent' },
    ]).exec();

    const cartProductIds = data?.cartSkus.map((item: any) => item.product_id._id);
    const relatedProducts = await Product.find({ _id: { $nin: cartProductIds }, }).populate({ path: "mediaHubs", populate: { path: "media_id", model: "Media", select: "_id path alt" } }).exec();

    return res.status(200).json({ message: 'Cart Fetched', data, relatedProducts });
  } catch (error) { return await logError(error, { function: "get_cart_data", payload: req.body }); }
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
  } catch (error) { return await logError(error, { function: "increment_cart", payload: req.body }); }
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
  } catch (error) { return await logError(error, { function: "decrement_cart", payload: req.body }); }
};

export async function delete_cart_item(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { cart_sku_id } = req.body;
    if (!cart_sku_id) { return res.status(400).json({ status: false, message: 'cart_sku_id is required' }); }

    const cart_id = await getCartIdFromRequest(req, res);
    if (!cart_id) { return res.status(200).json({ status: false, message: 'Cart not found' }); }

    let cartSku = await CartSku.findOne({ cart_id, _id: cart_sku_id });
    if (!cartSku) { return res.status(400).json({ status: false, message: 'Cart item not found' }); }

    await CartSku.deleteOne({ _id: cartSku._id });    
    await recalculateCart(cart_id);

    return res.status(200).json({ status: true, message: 'Cart item removed from cart' });
  } catch (error) { await logError(error, { function: "delete_cart_item", payload: req.body }); return; }
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
  } catch (error) { return await logError(error, { function: "update_user_remarks", payload: req.body }); }
};

export async function update_cart_array(req: NextApiRequest, res: NextApiResponse) {
  try {
    const cart_id = await getCartIdFromRequest(req, res);
    if (!cart_id) { return res.status(400).json({ status: false, message: 'Cart not found' }); }

    const { update } = req.body;
    if (typeof update !== 'object' || !update) { return res.status(400).json({ status: false, message: 'Invalid update payload' }); }

    const cart = await Cart.findOne({ _id: cart_id });
    if (!cart) { return res.status(400).json({ status: false, message: 'Cart not found' }); }
    
    const { email, phone, emailConsent, phoneConsent, ...cartUpdates } = update;

    for (const [key, value] of Object.entries(cartUpdates)) {
      cart.set(key, value);
    }
    await cart.save();

    let consentData: any = {
      cart_id: cart._id,
      user_id: cart.user_id,
    };

    if (email !== undefined) consentData.email = email;
    if (phone !== undefined) consentData.phone = phone;
    if (emailConsent !== undefined) consentData.emailConsent = emailConsent;
    if (phoneConsent !== undefined) consentData.phoneConsent = phoneConsent;
    
    const activeShippingId = cartUpdates.shipping_address_id || cart.shipping_address_id;
    if (activeShippingId) {
      const addressDoc = await Address.findById(activeShippingId);
      if (addressDoc) {
        consentData.city_id = addressDoc.city_id;
        if (addressDoc.state_id) consentData.state_id = addressDoc.state_id;
        if (addressDoc.country_id) consentData.country_id = addressDoc.country_id;
      }
    }

    await CartConsent.findOneAndUpdate(
      { cart_id: cart._id },
      { $set: consentData },
      { upsert: true, new: true }
    );

    return res.status(200).json({ status: true, message: "Cart Updated" });
  } catch (error) { 
    return await logError(error, { function: "update_cart_array", payload: req.body }); 
  }
}

export async function upsertCartCharges(cart_id: string, data: Partial<typeof CartCharges.prototype>) {
  let cartCharges = await CartCharges.findOne({ cart_id });

  if (!cartCharges) {
    cartCharges = new CartCharges({ cart_id, ...data });
  } else {
    Object.assign(cartCharges, data);
  }

  return await cartCharges.save();
}

export async function place_order(req: NextApiRequest, res: NextApiResponse) {
  try {
    const cart_id = await getCartIdFromRequest(req, res);
    if (!cart_id) { return res.status(200).json({ status: false, message: 'Cart not found' }); }

    const result = await createOrderFromCart(cart_id, res);

    return res.status(200).json({ status: true, message: "Order Placed", data: result });
  } catch (error) { return await logError(error, { function: "place_order", payload: req.body }); }
};

export async function createOrderFromCart(cart_id: string, res: NextApiResponse) {
  try{
    const cart = await Cart.findOne({ _id: cart_id }).populate([ 
      { path: "cartCharges"}, 
      { path: "cartConsent"}, 
      { path: "cartCoupon", populate: { path: "coupon_id", model: "Coupon" } }, 
      { path: "billing_address_id", populate: { path: "city_id", populate: { path: "state_id", }, }, }, 
      { path: "cartSkus", populate: { path: "sku_id" } } 
    ]);
    if (!cart) { return { status: false, message: "Cart not found" }; }
  
    const newEntry = new Order({
      user_id: cart.user_id,
      billing_address_id: cart.billing_address_id,
      shipping_address_id: cart.shipping_address_id,
      paymode: cart.paymode,
      weight: cart.weight,
      total: cart.total,
      paid: cart.payable_amount,
      user_remarks: cart.user_remarks,
      admin_remarks: cart.admin_remarks,
    });
  
    const savedOrder = await newEntry.save();
    const order_id = savedOrder._id.toString();
    setCookie(res, "order_id", order_id);
  
    if(cart.cartCharges) {
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

    if (cart.cartConsent) {
      const { email, phone } = cart.cartConsent;
      let orderConsentId;
      let emailDuplicateFlag = false;
      let phoneDuplicateFlag = false;

      // 1. Check for existing records matching email or phone individually
      const [existingByEmail, existingByPhone] = await Promise.all([
        email ? OrderConsent.findOne({ email }) : null,
        phone ? OrderConsent.findOne({ phone }) : null,
      ]);

      if (existingByEmail && existingByPhone) {
        // Scenario A: Both exist (could be the same document or two separate ones)
        // If they point to the exact same document, reuse it. Otherwise, pick one (e.g., email's record).
        orderConsentId = existingByEmail._id;
        emailDuplicateFlag = true;
        phoneDuplicateFlag = true;
      } else if (existingByEmail) {
        // Scenario B: Only email exists
        orderConsentId = existingByEmail._id;
        emailDuplicateFlag = true;
        phoneDuplicateFlag = false;
      } else if (existingByPhone) {
        // Scenario C: Only phone exists
        orderConsentId = existingByPhone._id;
        emailDuplicateFlag = false;
        phoneDuplicateFlag = true;
      } else {
        // Scenario D: Neither exists, create a brand new entry
        const newConsent = await new OrderConsent({
          user_id: cart.user_id,
          email: email,
          phone: phone,
          city_id: cart.cartConsent.city_id,
          state_id: cart.cartConsent.state_id,
          country_id: cart.cartConsent.country_id,
          emailConsent: cart.cartConsent.emailConsent,
          phoneConsent: cart.cartConsent.phoneConsent,
          email_duplicate: false,
          phone_duplicate: false,
        }).save();

        orderConsentId = newConsent._id;
      }
      
      if (orderConsentId && (emailDuplicateFlag || phoneDuplicateFlag)) {
        await OrderConsent.updateOne(
          { _id: orderConsentId },
          { 
            $set: { 
              email_duplicate: emailDuplicateFlag, 
              phone_duplicate: phoneDuplicateFlag 
            } 
          }
        );
      }

      // 2. Link the consent ID to the order via OrderOrderConsent
      await new OrderOrderConsent({ 
        order_id: savedOrder._id, 
        orderConsent_id: orderConsentId 
      }).save();
    }
  
    if (cart.cartCoupon && typeof cart.cartCoupon === 'object' && cart.cartCoupon.coupon_id) {
      const coupon = cart.cartCoupon.coupon_id as any;
      
      await new OrderCoupon({
        order_id: savedOrder._id,
        coupon_id: cart.cartCoupon.coupon_id,
        admin_coupon_discount: cart.cartCoupon.admin_coupon_discount,
        vendor_coupon_discount: cart.cartCoupon.vendor_coupon_discount,
        coupon_code: cart.cartCoupon.coupon_code,
        coupon_by: coupon.coupon_by,
        usage_type: coupon.usage_type,
        seller_id: coupon.seller_id,
        discount_type: coupon.discount_type,
        discount: coupon.discount,
        name: coupon.name,
        code: coupon.code,
        sales: coupon.sales,
        status: coupon.status,
        valid_from: coupon.valid_from,
        valid_to: coupon.valid_to,
        buy_one: coupon.buy_one,
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
          seller_id: item.seller_id,
          price: item.sku_id?.price,
          tax_id: item.sku_id?.tax_id,
          quantity,
          vendor_discount: item.vendor_discount,
          flavor_id: item.flavor_id,
        };
      });
  
      await OrderSku.insertMany(orderSkuDocs);
    }
  
    let cgst = 0, sgst = 0, igst = 0;
    const stateName = cart.billing_address_id?.city_id?.state_id?.name?.toLowerCase() || "";
  
    if (stateName === "haryana") {
      cgst = totalTax;
    } else {
      sgst = totalTax / 2;
      igst = totalTax / 2;
    }
    
    const taxDoc = new TaxCollected({
      module: "Order",
      module_id: savedOrder._id,
      cgst: cgst.toFixed(2),
      sgst: sgst.toFixed(2),
      igst: igst.toFixed(2),
      total: totalTax.toFixed(2),
    });
    await taxDoc.save();
    await initAction('Ecom', savedOrder._id as Types.ObjectId);

    await handleConsent(savedOrder._id, cart.cartConsent);
    return { status: true, message: "Order Placed", order_id };

  } catch (error) { return await logError(error, { function: "createOrderFromCart", payload: { cart_id } }); }
}

interface CartConsentProps {
  user_id?: string | Types.ObjectId;
  email?: string;
  phone?: string;
  city_id?: string | Types.ObjectId;
  state_id?: string | Types.ObjectId;
  country_id?: string | Types.ObjectId;
  emailConsent?: boolean;
  phoneConsent?: boolean;
}

async function handleConsent(order_id: Types.ObjectId | string, cartConsent?: CartConsentProps) {
  try{

    if (!cartConsent) { return; }
  
    const { email, phone, user_id, city_id, state_id, country_id, emailConsent, phoneConsent } = cartConsent;
    let orderConsentId: Types.ObjectId;
    let emailDuplicateFlag = false;
    let phoneDuplicateFlag = false;
    
    const [existingByEmail, existingByPhone] = await Promise.all([
      email ? OrderConsent.findOne({ email }) : null,
      phone ? OrderConsent.findOne({ phone }) : null,
    ]);
  
    if (existingByEmail && existingByPhone) {
      orderConsentId = existingByEmail._id;
      emailDuplicateFlag = true;
      phoneDuplicateFlag = true;
    } else if (existingByEmail) {
      orderConsentId = existingByEmail._id;
      emailDuplicateFlag = true;
      phoneDuplicateFlag = false;
    } else if (existingByPhone) {
      orderConsentId = existingByPhone._id;
      emailDuplicateFlag = false;
      phoneDuplicateFlag = true;
    } else {
      const newConsent = await new OrderConsent({
        user_id,
        email,
        phone,
        city_id,
        state_id,
        country_id,
        emailConsent,
        phoneConsent,
        email_duplicate: false,
        phone_duplicate: false,
      }).save();
  
      orderConsentId = newConsent._id;
      await new OrderOrderConsent({ order_id, orderConsent_id: orderConsentId }).save();
    }
  
    if (emailDuplicateFlag || phoneDuplicateFlag) {
      await OrderConsent.updateOne({ _id: orderConsentId }, { 
          $set: { 
            email_duplicate: emailDuplicateFlag, 
            phone_duplicate: phoneDuplicateFlag 
          }});
    }
  } catch (error) { return await logError(error, { function: "handleConsent", payload: { order_id, cartConsent } }); }
}

export async function get_filtered_abandoned_carts(req: NextApiRequest, res: NextApiResponse) {
  try {
    const data = await Cart.find().populate([ 
      { path: 'cartCharges' },
      { path: 'cartCoupon', populate: { path: 'coupon_id' } },
      { path: 'user_id' },
      { path: 'cartSkus', populate: [ { path: 'sku_id' }, { path: 'product_id', populate: [ { path: 'mediaHubs', populate: { path: 'media_id' } } ] } ]  }
    ]);

    return res.status(200).json({ message: 'Cart Fetched', data });
  } catch (error) { return await logError(error, { function: "get_filtered_abandoned_carts", payload: req.body }); }
}

export async function get_single_abdandoned_cart(req: NextApiRequest, res: NextApiResponse) {
  try {
    const id = (req.method === 'GET' ? req.query.id : req.body.slug) as string;
    if ( !id ) { return res.status(400).json({ message: 'Invalid or missing Id' }); }

    const data = await Cart.findById(id).populate([ 
      { path: 'cartCharges' }, { path: 'cartCoupon' }, { path: 'cartConsent' }, { path: 'billing_address_id' }, { path: 'shipping_address_id' }, 
      { path: 'cartSkus', populate: [ { path: 'sku_id' }, { path: 'product_id', populate: [ { path: 'mediaHubs', populate: { path: 'media_id' } } ] } ] }
    ]).exec();

    return res.status(200).json({ message: 'Single ABandoned Cart Fetched', data });
  } catch (error) { return await logError(error, { function: "get_single_abdandoned_cart", payload: req.body }); }
}

export async function get_vendor_abandoned_carts(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { seller_id } = req.query;

    if ( !seller_id || !mongoose.Types.ObjectId.isValid(seller_id as string)) {
      return res.status(400).json({ message: "Issue with Vendor ID", data:[] });
    }
    
    const cartIdsAgg = await CartSku.aggregate([
      { $match: { seller_id: new mongoose.Types.ObjectId(seller_id as string) } },
      { $group: { _id: "$cart_id" } },
      { $limit: 10 }
    ]);

    const cartIds = cartIdsAgg.map(c => c._id);

    const data = await Cart.find({ _id: { $in: cartIds } })
      .populate([ { path: 'cartCharges' }, { path: 'user_id' }, { path: 'cartSkus', populate: [ { path: 'sku_id' }, { path: 'product_id', populate: [ { path: 'mediaHubs', populate: { path: 'media_id' } } ] } ]  }]).exec();

    return res.status(200).json({ message: "Carts fetched", data });
  } catch (error) { return await logError(error, { function: "get_vendor_abandoned_carts", payload: req.body }); }
}

export async function apply_admin_discount(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { data } = req.body;
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
  } catch (error) { return await logError(error, { function: "apply_admin_discount", payload: req.body }); }
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
  } catch (error) { return await logError(error, { function: "apply_vendor_discount", payload: req.body }); }
};

export async function get_all_orders(req: NextApiRequest, res: NextApiResponse) {
  try {
    const data = await Order.find().populate([ { path: 'orderCharges' }, { path: 'user_id' }, { path: 'orderSkus', populate: [ { path: 'sku_id' }, { path: 'product_id', populate: [ { path: 'mediaHubs', populate: { path: 'media_id' } } ] } ]  }]);

    return res.status(200).json({ message: 'All ORders Fetched', data });
  } catch (error) { return await logError(error, { function: "get_all_orders", payload: req.body }); }
}

export async function get_seller_orders(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { seller_id } = req.body;

    if (!seller_id || !mongoose.Types.ObjectId.isValid(seller_id as string)) {
      return res.status(400).json({ message: "Invalid seller_id", data: [] });
    }

    const vendorObjectId = new mongoose.Types.ObjectId(seller_id as string);
    
    const orderSkus = await OrderSku.find({ seller_id: vendorObjectId }).select("order_id").exec();
    const orderIds = orderSkus.map((s) => s.order_id);

    if (orderIds.length === 0) { return res.status(200).json({ message: "No orders found for this vendor", data: [] }); }
    
    const orders = await Order.find({ _id: { $in: orderIds } })
      .populate([
        { path: "orderCharges" }, { path: "user_id" },
        {
          path: "orderSkus",
          match: { seller_id: vendorObjectId },
          populate: [
            { path: "sku_id" },
            {
              path: "product_id",
              populate: [
                { path: "mediaHubs", populate: { path: "media_id" } }
              ]
            }
          ]
        }
      ])
      .exec();

    return res.status(200).json({ message: "Vendor orders fetched", data: orders });
  } catch (error) { return await logError(error, { function: "get_seller_orders", payload: req.body }); }
}

export async function get_single_order(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { order_id } = req.body;
    if ( !order_id ) { return res.status(400).json({ message: 'Invalid or missing Id' }); }
    const objectId = new mongoose.Types.ObjectId(order_id);

    const data = await Order.findById(objectId).populate([ { path: 'orderCharges' }, { path: 'billing_address_id' }, { path: 'shipping_address_id' }, { path: 'orderSkus', populate: [ { path: 'sku_id' }, { path: 'product_id', populate: [ { path: 'mediaHubs', populate: { path: 'media_id' } } ] } ]  }]).exec();
    const relatedContent = await getGenericContent();

    return res.status(200).json({ message: 'Single Order Fetched', data, relatedContent });
  } catch (error) { return await logError(error, { function: "get_single_order", payload: req.body }); }
}

export async function get_user_orders(req: NextApiRequest, res: NextApiResponse) {
  try {
    const user_id = await getUserIdFromToken(req);

    if (!user_id || !mongoose.Types.ObjectId.isValid(user_id as string)) {
      return res.status(400).json({ message: "Invalid user_id", data: [] });
    }
    
    const orders = await Order.find({ user_id })
      .populate([
        { path: "orderCharges" }, { path: "user_id" },
        {
          path: "orderSkus",
          populate: [
            { path: "sku_id" },
            {
              path: "product_id",
              populate: [
                { path: "mediaHubs", populate: { path: "media_id" } }
              ]
            }
          ]
        }
      ])
      .exec();

    return res.status(200).json({ message: "User orders fetched", data: orders });
  } catch (error) { return await logError(error, { function: "get_user_orders", payload: req.body }); }
}

export const functions: APIHandlers = {
  add_to_cart : { middlewares: ["checkPostMethod"] },
  get_cart_data : { middlewares: [] },
  increment_cart : { middlewares: ["checkPostMethod"] },
  decrement_cart : { middlewares: ["checkPostMethod"] },
  delete_cart_item : { middlewares: ["checkPostMethod"] },
  update_user_remarks : { middlewares: ["checkPostMethod"] },
  update_cart_array : { middlewares: ["checkPostMethod"] },
  
  get_filtered_abandoned_carts : { middlewares: [] },
  get_single_abdandoned_cart : { middlewares: [] },
  place_order : { middlewares: [] },
  apply_admin_discount : { middlewares: [] },
  apply_vendor_discount : { middlewares: [] },
  get_vendor_abandoned_carts : { middlewares: [] },

  get_all_orders : { middlewares: [] },
  get_seller_orders : { middlewares: [] },
  get_single_order : { middlewares: ["checkPostMethod"] },

  get_user_orders : { middlewares: [] },
}

export const ecomHandlers = {
  add_to_cart,
  get_cart_data,
  increment_cart,
  decrement_cart,
  delete_cart_item,
  update_user_remarks,
  update_cart_array,
  get_filtered_abandoned_carts,
  get_single_abdandoned_cart,
  place_order,
  apply_admin_discount,
  apply_vendor_discount,
  get_vendor_abandoned_carts,

  get_all_orders,
  get_seller_orders,
  get_single_order,

  get_user_orders,
};

export const config = { api: { bodyParser: false } };
export default createApiHandler(functions, ecomHandlers);