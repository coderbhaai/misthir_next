import { Types } from 'mongoose';
import { createApiHandler, ExtendedRequest } from '../apiHandler';
import { NextApiRequest, NextApiResponse } from 'next';
import Cart from 'lib/models/ecom/Cart';
import RazorpayPayment from 'lib/models/payment/RazorpayPayment';
import { createOrderFromCart } from '../ecom/ecom';
import { APIHandlers } from 'lib/server/middleware';
import { logError } from '../utils';
import SiteSetting from 'lib/models/payment/SiteSetting';
import Razorpay from 'razorpay';

// SiteSetting
  export async function get_all_settings(req: NextApiRequest, res: NextApiResponse) {
    try {
      const data = await SiteSetting.find().exec();
      return res.status(200).json({ message: 'Fetched all Settings', data });
    } catch (error) { await logError(error, { function: "get_filtered_country", payload: req.body }); }
  }

  export async function get_single_setting(req: NextApiRequest, res: NextApiResponse){
    try{
      const id = (req.method === 'GET' ? req.query.id : req.body.id) as string;
      if (!id || !Types.ObjectId.isValid(id)) { return res.status(400).json({ message: 'Invalid or missing ID' }); }  
    
      const entry = await SiteSetting.findById(id).exec();  
      if (!entry) { return res.status(404).json({ message: `SiteSetting with ID ${id} not found` }); }
    
      return res.status(200).json({ message: '✅ Single Entry Fetched', data: entry });

    }catch (error) { await logError(error, { function: "get_filtered_country", payload: req.body }); }
  };

  export async function create_update_setting(req: ExtendedRequest, res: NextApiResponse) {
    try {
      const data = req.body;
      if (!data?.module || !data?.module_value ) { return res.status(400).json({ message: '❌ Required fields missing' }); }

      const entry = await SiteSetting.findOneAndUpdate({ module: data.module }, {
          module: data.module,
          module_value: data.module_value,
          status: data.status,
          updatedAt: new Date(),
        }, { new: true, upsert: true, setDefaultsOnInsert: true }
      );

      return res.status(200).json({ message: '✅ Entry updated successfully', data: entry });
    } catch (error) { await logError(error, { function: "get_filtered_country", payload: req.body }); }
  }

  export async function get_site_settings(req: NextApiRequest, res: NextApiResponse) {
    try {
      const data = await SiteSetting.find({ status: 1 }).exec();
      return res.status(200).json({ message: 'Fetched all Settings', data });
    } catch (error) { await logError(error, { function: "get_filtered_country", payload: req.body }); }
  }
// SiteSetting

export async function get_payment_data(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { module, module_id, payment_gateway } = req.body;    
    if( !module || !module_id ){ return res.status(400).json({ message: 'Fields are missing', data: null }); }
    
    let data = null;
    if( module ==="Cart"){
      data = await Cart.findById(module_id).populate([ { path: 'billing_address_id' }, { path: 'shipping_address_id' }, { path: 'cartSkus', populate: [ { path: 'sku_id' }, { path: 'product_id', populate: [ { path: 'mediaHubs', populate: { path: 'media_id' } } ] } ]  }, { path: 'cartCharges' }]).exec();
    }

    if( !data ){ return res.status(400).json({ message: 'Entry is missing', data: null }); }

    let amount_payable = Number(data.payable_amount);

    let response = null;
    if (payment_gateway === "Razorpay") {
      response = await hit_razorpay(amount_payable);
    }

    return res.status(200).json({ message: 'Payment Data Fetched', data, response });
  } catch (error) { return await logError(error, { function: "get_payment_data", payload: req.body }); }
}

export async function hit_razorpay(amount: number) {
  try {
    const { key_id, key_secret } = getPaymentConfig();

    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Basic " +
          Buffer.from( key_id + ":" + key_secret ).toString("base64"),
      },
      body: JSON.stringify({ amount: amount * 100, currency: "INR", receipt: "rcptid_" + Date.now(), }),
    });

    const data = await response.json();
    if (!response.ok) { return null; }

    return {
      order_id: data.id,
      amount: data.amount,
      currency: data.currency,
    };
  }catch (error) { await logError(error, { function: "hit_razorpay", payload: {amount} }); return null; }
}

export function getPaymentConfig() {
  const isProd = process.env.MODE === "Prod";
  const key_id = isProd ? process.env.NEXT_PUBLIC_RAZORPAY_KEY_PROD_ID : process.env.NEXT_PUBLIC_RAZORPAY_KEY_TEST_ID;
  const key_secret = isProd ? process.env.RAZORPAY_KEY_PROD_SECRET : process.env.RAZORPAY_KEY_TEST_SECRET;
  return { isProd, key_id, key_secret };
}

export async function payment_response(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { module, module_id, payment_gateway, response, source, options } = req.body;
    if (!module || !module_id) { return res.status(400).json({ message: 'Fields are missing', data: null }); }
    
    let data = null;
    if (module === "Cart") {
      data = await Cart.findById(module_id).exec();
    }
    if (!data) { return res.status(400).json({ message: 'Entry is missing', data: null }); }

    let order_response = null;
    if (module === "Cart") {
      order_response = await createOrderFromCart(module_id, res);
    }

    if (payment_gateway === "Razorpay") {
      const razorpay_payment_id = response?.razorpay_payment_id; 
      if (!razorpay_payment_id) { return res.status(400).json({ message: 'razorpay_payment_id is missing', data: null }); }

      try {
        const isDev = process.env.MODE === 'dev';
        const key_id = isDev ? process.env.NEXT_PUBLIC_RAZORPAY_KEY_TEST_ID : process.env.NEXT_PUBLIC_RAZORPAY_KEY_PROD_ID;
        const key_secret = isDev ? process.env.RAZORPAY_KEY_TEST_SECRET : process.env.RAZORPAY_KEY_PROD_SECRET;

        const razorpayInstance = new Razorpay({ key_id, key_secret });
        const paymentDetails: any = await razorpayInstance.payments.fetch(razorpay_payment_id);

        if (options?.amount && paymentDetails.amount !== options.amount) {
          return res.status(400).json({ message: 'Payment amount mismatch', data: null });
        }

        response.razorpay_order_id = paymentDetails.id;
        response.status = paymentDetails.status;

        await razorpay_summary( module, order_response?.order_id ?? module_id, source, response, options, paymentDetails );
      } catch (error) { 
        await logError(error, { function: "RazorpayVerification in payment_response", payload: req.body });
        return res.status(400).json({ message: 'Failed to verify payment with Razorpay', data: null });
      }
    }

    return res.status(200).json({ message: 'Payment Response', data: order_response });
  } catch (error) { return await logError(error, { function: "payment_response", payload: req.body });  }
}

export async function razorpay_summary(
  module: string, 
  module_id: number | string, 
  source: string, 
  response: any, 
  options: any,
  paymentDetails: any,
) {
  try {
    if (module === "Cart") {
      module = "Order";
    }

    const razorpayEntry = new RazorpayPayment({
      module,
      module_id,
      amount: options?.amount,
      currency: options?.currency,
      source: source,
      razorpay_payment_id: response?.razorpay_payment_id,
      razorpay_order_id: response?.razorpay_order_id || null,
      paymentDetails: paymentDetails || null,
      createdAt: new Date(),
    });

    await razorpayEntry.save();
    return razorpayEntry;
  } catch (error) { 
    await logError(error, { function: "razorpay_summary", payload: { module, module_id, source, response } }); 
    return null; 
  }
}

export const functions: APIHandlers = {
  get_payment_data : { middlewares: ["checkPostMethod"] },
  payment_response : { middlewares: ["checkPostMethod"] },

  get_all_settings : { middlewares: [] },	
  get_single_setting : { middlewares: [] },	
  create_update_setting : { middlewares: ["checkPostMethod"] },	
  get_site_settings : { middlewares: [] },
}

export const paymentHandlers = {
  get_payment_data,
  payment_response,

  get_all_settings,
  get_single_setting,
  create_update_setting,
  get_site_settings,
};

export const config = { api: { bodyParser: false } };
export default createApiHandler(functions, paymentHandlers);