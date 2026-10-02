// pages/api/basic/basic

import { isValidObjectId, Types } from 'mongoose';
import type { NextApiRequest, NextApiResponse } from 'next';
import { uploadMedia } from './media';
import Client from 'lib/models/basic/Client';
import Contact from 'lib/models/basic/Contact';
import { createApiHandler, ExtendedRequest } from '../apiHandler';
import SiteSetting from 'lib/models/payment/SiteSetting';
import { logError } from '../utils';
import { APIHandlers } from 'lib/server/middleware';
import UrlRegistry from 'lib/models/basic/UrlRegistry';
import { buildFilterQuery } from 'lib/server/plugins/buildFilterQuery';
import Blog from 'lib/models/blog/Blog';
import Page from 'lib/models/basic/Page';
import Product from 'lib/models/product/Product';

// Client
  export async function get_all_clients(req: NextApiRequest, res: NextApiResponse) {
    try {
      const data = await Client.find().populate('media_id').exec();
      return res.status(200).json({ message: 'Fetched all Clients', data });
    } catch (error) { await logError(error, { function: "get_filtered_country", payload: req.body }); }
  }

  export async function get_single_client(req: NextApiRequest, res: NextApiResponse){
    try{
      const id = (req.method === 'GET' ? req.query.id : req.body.id) as string;
      if (!id || !Types.ObjectId.isValid(id)) { return res.status(400).json({ message: 'Invalid or missing ID' }); }  
    
      const entry = await Client.findById(id).populate('media_id').exec();  
      if (!entry) { return res.status(404).json({ message: `Client with ID ${id} not found` }); }
    
      return res.status(200).json({ message: '✅ Single Entry Fetched', data: entry });

    }catch (error) { await logError(error, { function: "get_filtered_country", payload: req.body }); }
  };

  export async function create_update_client(req: ExtendedRequest, res: NextApiResponse) {
    try {
      const data = req.body;
      if (!data?.name || !data?.status) { return res.status(400).json({ message: '❌ Required fields missing' }); }

      const modelId = typeof data._id === 'string' || data._id instanceof Types.ObjectId ? data._id : null;

      let media_id: string | null = null;
      if (data.media_id && isValidObjectId(data.media_id)) { media_id = data.media_id; }
      const file = Array.isArray(req.files?.image) ? req.files.image[0] : req.files?.image;
      
      if (file) {
        media_id = await uploadMedia({ file, name: data.name, pathType: data.path, media_id: data.media_id ?? null, user_id: null });
      }

      if (modelId && isValidObjectId(modelId)) {
        try {
          const updated = await Client.findByIdAndUpdate(
            modelId,
            {
              name: data.name,
              email: data.email,
              phone: data.phone,
              role: data.role,
              status: data.status,
              displayOrder: data.displayOrder,
              media_id: media_id ?? undefined,
              content: data.content,
              updatedAt: new Date(),
            },
            { new: true }
          );

          return res.status(200).json({ message: '✅ Entry updated successfully', data: updated });
        } catch (error) { await logError(error, { function: "get_filtered_country", payload: req.body }); }
      }

      // === Create flow ===
      const newEntry = new Client({
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: data.role,
        status: data.status,
        displayOrder: data.displayOrder,
        media_id: media_id ?? undefined,
        content: data.content,
        createdAt: new Date(),
      });

      await newEntry.save();
      return res.status(201).json({ message: '✅ Entry created successfully', data: newEntry });
    } catch (error) { await logError(error, { function: "get_filtered_country", payload: req.body }); }
  }

  export async function get_all_client_options(req: NextApiRequest, res: NextApiResponse) {
    try {
      const data = await Client.find().select('_id name').exec();
      return res.status(200).json({ message: 'Fetched all Clients', data });
    } catch (error) { await logError(error, { function: "get_filtered_country", payload: req.body }); }
  }
// Client

// Contact
  export async function get_filtered_contacts(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { filters = {}, page = 0, limit = 10 } = req.body || {};
      const { matchQuery, skip, limit: safeLimit } = buildFilterQuery(filters, { page, limit, defaultLimit: 10, maxLimit: 100, searchableFields: ["name", "email", "phone"] });
      const total = await Contact.countDocuments(matchQuery);

      const data = await Contact.find(matchQuery).skip(skip).limit(safeLimit).sort({ createdAt: -1 });
      return res.status(200).json({ message: 'Fetched Filtered Contacts', data, pagination: { total, page, limit: safeLimit, pages: Math.ceil(total / safeLimit) } });
    } catch (error) { await logError(error, { function: "get_filtered_contacts", payload: req.body }); return res.status(500).json({ message: "Internal Server Error", data: null }); }
  }

  export async function get_single_contact(req: NextApiRequest, res: NextApiResponse){
    try{
      const id = (req.method === 'GET' ? req.query.id : req.body.id) as string;
      if (!id || !Types.ObjectId.isValid(id)) { return res.status(400).json({ message: 'Invalid or missing ID' }); }  
    
      const entry = await Contact.findById(id).exec();  
      if (!entry) { return res.status(404).json({ message: `Contact with ID ${id} not found` }); }
    
      return res.status(200).json({ message: '✅ Single Entry Fetched', data: entry });

    }catch (error) { await logError(error, { function: "get_filtered_country", payload: req.body }); }
  };

  export async function create_update_contact(req: ExtendedRequest, res: NextApiResponse) {
    try {
      const data = req.body;
      if (!data?.name || !data?.email || !data?.phone ) { return res.status(400).json({ message: '❌ Required fields missing' }); }

      const modelId = typeof data._id === 'string' || data._id instanceof Types.ObjectId ? data._id : null;

      if (modelId && isValidObjectId(modelId)) {
        try {
          const updated = await Contact.findByIdAndUpdate(
            modelId,
            {
              name: data.name,
              email: data.email,
              phone: data.phone,
              user_remarks: data.user_remarks,
              admin_remarks: data.admin_remarks,
              status: data.status,
              updatedAt: new Date(),
            },
            { new: true }
          );

          return res.status(200).json({ message: '✅ Entry updated successfully', data: updated });
        } catch (error) { await logError(error, { function: "get_filtered_country", payload: req.body }); }
      }

      // === Create flow ===
      const newEntry = new Contact({
        name: data.name,
        email: data.email,
        phone: data.phone,
        user_remarks: data.user_remarks,
        admin_remarks: data.admin_remarks,
        status: data.status,
        createdAt: new Date(),
      });

      await newEntry.save();
      return res.status(201).json({ message: '✅ Entry created successfully', data: newEntry });
    } catch (error) { await logError(error, { function: "get_filtered_country", payload: req.body }); }
  }
// Contact



export const functions: APIHandlers = {
  get_all_clients : { middlewares: [] },	
  get_single_client : { middlewares: [] },	
  create_update_client : { middlewares: [] },	
  get_all_client_options : { middlewares: [] },	

  get_filtered_contacts : { middlewares: [] },	
  get_single_contact : { middlewares: [] },	
  create_update_contact : { middlewares: [] },
}

export const basicHandlers = {
  get_all_clients,
  get_single_client,
  create_update_client,
  get_all_client_options,

  get_filtered_contacts,
  get_single_contact,
  create_update_contact,
};

export const config = { api: { bodyParser: false } };
export default createApiHandler(functions, basicHandlers);