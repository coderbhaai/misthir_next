import mongoose, { isValidObjectId, Types } from 'mongoose';
import { createApiHandler, ExtendedRequest } from '../apiHandler';
import { NextApiRequest, NextApiResponse } from 'next';
import { getUserIdFromToken, log } from '../utils';
import { deleteCookie, getCartIdFromRequest, setCookie } from '../cartUtils';
import { Cart } from 'lib/models/ecom/Cart';
import { Sku, SkuDocument } from 'lib/models/product/Sku';
import Product from 'lib/models/product/Product';
import { Order, OrderCharges, OrderSku } from 'lib/models/ecom/Order';
import Razorpay from 'lib/models/payment/Razorpay';
import TaxCollected from 'lib/models/payment/TaxCollected';
import { createOrderFromCart, place_order } from '../ecom/ecom';
import Tax from 'lib/models/payment/Tax';

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
  } catch (error) { return log(error); }
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
  }catch (error) { log(error); return null; }
}

export function getPaymentConfig() {
  const isProd = process.env.MODE === "Prod";
  const key_id = isProd ? process.env.NEXT_PUBLIC_RAZORPAY_KEY_PROD_ID : process.env.NEXT_PUBLIC_RAZORPAY_KEY_TEST_ID;
  const key_secret = isProd ? process.env.RAZORPAY_KEY_PROD_SECRET : process.env.RAZORPAY_KEY_TEST_SECRET;
  return { isProd, key_id, key_secret };
}

export async function payment_response(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { module, module_id, payment_gateway, response, source } = req.body;
    if( !module || !module_id ){ return res.status(400).json({ message: 'Fields are missing', data: null }); }
    
    let data = null;
    if( module ==="Cart"){
      data = await Cart.findById(module_id).populate([ { path: 'billing_address_id' }, { path: 'shipping_address_id' }, { path: 'cartSkus', populate: [ { path: 'sku_id' }, { path: 'product_id', populate: [ { path: 'mediaHubs', populate: { path: 'media_id' } } ] } ]  }, { path: 'cartCharges' }]).exec();
    }

    if( !data ){ return res.status(400).json({ message: 'Entry is missing', data: null }); }

    let res_summary = null;
    if (payment_gateway === "Razorpay") {
      const razorpay_payment_id = response?.razorpay_payment_id; 
      if( !razorpay_payment_id ){ return res.status(400).json({ message: 'razorpay_payment_id is missing', data: null }); }

      res_summary = await razorpay_summary( module, module_id, source, razorpay_payment_id)
    }

    let order_response = null;
    if( module === "Cart" ){
      order_response       = await createOrderFromCart(module_id, res);
    }

    return res.status(200).json({ message: 'Payment Response', data:order_response });
  } catch (error) { return log(error); }
}

interface Tax {
  cgst?: number;
  sgst?: number;
  igst?: number;
  total?: number;
}

export async function razorpay_summary( module: string, module_id: number, source: string, razorpay_payment_id: string) {
  try {
    const razorpayEntry  = new Razorpay({
            module: module,
            module_id: module_id,
            source: source,
            razorpay_payment_id: razorpay_payment_id,
            createdAt: new Date(),
          });

          await razorpayEntry.save();
  }catch (error) { log(error); return null; }
}

// Taxes
  export async function get_all_taxes(req: NextApiRequest, res: NextApiResponse) {
    try {
      const data = await Tax.find().exec();
      return res.status(200).json({ message: 'Fetched all Taxes', data });
    } catch (error) { return log(error); }
  }

  export async function get_single_tax(req: NextApiRequest, res: NextApiResponse){
    try{
      const id = (req.method === 'GET' ? req.query.id : req.body.id) as string;
      if (!id || !Types.ObjectId.isValid(id)) { return res.status(400).json({ message: 'Invalid or missing ID' }); }  
    
      const entry = await Tax.findById(id).exec();  
      if (!entry) { return res.status(404).json({ message: `Tax with ID ${id} not found` }); }
    
      return res.status(200).json({ message: '✅ Single Entry Fetched', data: entry });

    }catch (error) { return log(error); }
  };

  export async function create_update_tax(req: ExtendedRequest, res: NextApiResponse) {
    try {
      if (req.method !== 'POST') { return res.status(405).json({ message: 'Method Not Allowed' }); }

      const data = req.body;
      if (!data?.name || !data?.rate || !data?.status) { return res.status(400).json({ message: '❌ Required fields missing' }); }

      const modelId = typeof data._id === 'string' || data._id instanceof Types.ObjectId ? data._id : null;

      if (modelId && isValidObjectId(modelId)) {
        try {
          const updated = await Tax.findByIdAndUpdate(
            modelId,
            {
              name: data.name,
              rate: data.rate,
              status: data.status,
              displayOrder: Number(data.displayOrder),
              updatedAt: new Date(),
            }, { new: true }
          );

          return res.status(200).json({ message: '✅ Entry updated successfully', data: updated });
        } catch (error) { return log(error); }
      }
      
      const newEntry = new Tax({
       name: data.name,
        rate: data.rate,
        status: data.status,
        displayOrder: Number(data.displayOrder),
        createdAt: new Date(),
      });

      await newEntry.save();
      return res.status(201).json({ message: '✅ Entry created successfully', data: newEntry });
    } catch (error) { return log(error); }
  }

  export async function get_tax_module(req: NextApiRequest, res: NextApiResponse) {
    try {
      const data = await Tax.find().select('_id name').exec();
      return res.status(200).json({ message: 'Fetched all Tax Module', data });
    } catch (error) { return log(error); }
  }

  export async function get_all_tax_collected(req: NextApiRequest, res: NextApiResponse) {
    try {
      const data = await TaxCollected.find().exec();
      return res.status(200).json({ message: 'Fetched all TaxCollected', data });
    } catch (error) { return log(error); }
  }
// Taxes


const functions = {
  get_payment_data,
  payment_response,

  get_all_taxes,
  get_single_tax,
  create_update_tax,
  get_tax_module,
  get_all_tax_collected,
};

export const config = { api: { bodyParser: false } };
export default createApiHandler(functions);