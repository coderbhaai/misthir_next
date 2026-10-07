import { isValidObjectId, Types } from 'mongoose';
import { createApiHandler, ExtendedRequest } from '../apiHandler';
import { NextApiRequest, NextApiResponse } from 'next';
import TaxCollected from 'lib/models/payment/TaxCollected';
import Tax from 'lib/models/payment/Tax';
import { APIHandlers } from 'lib/server/middleware';
import { logError } from '../utils';

export async function get_filtered_taxes(req: NextApiRequest, res: NextApiResponse) {
  try {
    const data = await Tax.find().exec();
    return res.status(200).json({ message: 'Fetched all Taxes', data });
  } catch (error) { return await logError(error, { function: "get_filtered_taxes", payload: req.body }); }
}

export async function get_single_tax(req: NextApiRequest, res: NextApiResponse){
  try{
    const id = (req.method === 'GET' ? req.query.id : req.body.id) as string;
    if (!id || !Types.ObjectId.isValid(id)) { return res.status(400).json({ message: 'Invalid or missing ID' }); }  
  
    const entry = await Tax.findById(id).exec();  
    if (!entry) { return res.status(404).json({ message: `Tax with ID ${id} not found` }); }
  
    return res.status(200).json({ message: '✅ Single Entry Fetched', data: entry });
  }catch (error) { return await logError(error, { function: "get_single_tax", payload: req.body }); }
};

export async function create_update_tax(req: ExtendedRequest, res: NextApiResponse) {
  try {
    const data = req.body;
    if (!data?.name || !data?.rate || !data?.status) { return res.status(400).json({ message: '❌ Required fields missing' }); }

    const modelId = typeof data._id === 'string' || data._id instanceof Types.ObjectId ? data._id : null;

    if (modelId && isValidObjectId(modelId)) {
      try {
        const updated = await Tax.findByIdAndUpdate(modelId, {
            name: data.name,
            rate: data.rate,
            status: data.status,
            displayOrder: Number(data.displayOrder),
            updatedAt: new Date(),
          }, { new: true });

        return res.status(200).json({ message: '✅ Entry updated successfully', data: updated });
      } catch (error) { return await logError(error, { function: "create_update_tax", payload: req.body }); }
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
  } catch (error) { return await logError(error, { function: "create_update_tax", payload: req.body }); }
}

export async function get_filtered_tax_collected(req: NextApiRequest, res: NextApiResponse) {
  try {
    const data = await TaxCollected.find().sort({ createdAt: -1 }).exec();
    return res.status(200).json({ message: 'Fetched all TaxCollected', data });
  } catch (error) { return await logError(error, { function: "get_filtered_tax_collected", payload: req.body }); }
}

export const functions: APIHandlers = {
  get_filtered_taxes : { middlewares: ["checkUserId", "checkPostMethod"] },
  get_single_tax : { middlewares: ["checkUserId", "checkPostMethod"] },
  create_update_tax : { middlewares: ["checkUserId", "checkPostMethod"] },
  get_filtered_tax_collected : { middlewares: ["checkUserId", "checkPostMethod"] },
}

export const taxHandlers = {
  get_filtered_taxes,
  get_single_tax,
  create_update_tax,
  get_filtered_tax_collected,
};

export const config = { api: { bodyParser: false } };
export default createApiHandler(functions, taxHandlers);