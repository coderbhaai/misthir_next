import { isValidObjectId, Types } from 'mongoose';
import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from 'pages/lib/mongodb';
import { uploadMedia } from './media';
import { IncomingForm, Fields, Files } from 'formidable';
import fs from 'fs';
import path from 'path';
import { log } from '../utils';
import Client from 'lib/models/basic/Client';
import Contact from 'lib/models/basic/Contact';

type HandlerMap = {
  [key: string]: (req: NextApiRequest, res: NextApiResponse) => Promise<void>;
};

export const config = {
  api: {
    bodyParser: false,
  },
};

interface ExtendedRequest extends NextApiRequest {
  file?: File;
  files?: { [key: string]: File | File[] };
}

// Client
  export async function get_all_clients(req: NextApiRequest, res: NextApiResponse) {
    try {
      const data = await Client.find().populate('media_id').exec();
      return res.status(200).json({ message: 'Fetched all Clients', data });
    } catch (error) { return log(error); }
  }

  export async function get_single_client(req: NextApiRequest, res: NextApiResponse){
    try{
      const id = (req.method === 'GET' ? req.query.id : req.body.id) as string;
      if (!id || !Types.ObjectId.isValid(id)) { return res.status(400).json({ message: 'Invalid or missing ID' }); }  
    
      const entry = await Client.findById(id).populate('media_id').exec();  
      if (!entry) { return res.status(404).json({ message: `Client with ID ${id} not found` }); }
    
      return res.status(200).json({ message: '✅ Single Entry Fetched', data: entry });

    }catch (error) { return log(error); }
  };

  export async function create_update_client(req: ExtendedRequest, res: NextApiResponse) {
    try {
      if (req.method !== 'POST') { return res.status(405).json({ message: 'Method Not Allowed' }); }

      const data = req.body;
      if (!data?.name || !data?.status) { return res.status(400).json({ message: '❌ Required fields missing' }); }

      const modelId = typeof data._id === 'string' || data._id instanceof Types.ObjectId ? data._id : null;

      let media_id: string | null = null;
      if (data.media_id && isValidObjectId(data.media_id)) { media_id = data.media_id; }
      const file = Array.isArray(req.files?.image) ? req.files.image[0] : req.files?.image;
      
      if (file) {
        media_id = await uploadMedia({ file, name: data.name, pathType: data.path, media_id: data.media_id ?? null });
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
        } catch (error) { return log(error); }
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
    } catch (error) { return log(error); }
  }

  export async function get_all_client_options(req: NextApiRequest, res: NextApiResponse) {
    try {
      const data = await Client.find().select('_id name').exec();
      return res.status(200).json({ message: 'Fetched all Clients', data });
    } catch (error) { return log(error); }
  }
// Client

// Contact
  export async function get_all_contacts(req: NextApiRequest, res: NextApiResponse) {
    try {
      const data = await Contact.find().exec();
      return res.status(200).json({ message: 'Fetched all Contacts', data });
    } catch (error) { return log(error); }
  }

  export async function get_single_contact(req: NextApiRequest, res: NextApiResponse){
    try{
      const id = (req.method === 'GET' ? req.query.id : req.body.id) as string;
      if (!id || !Types.ObjectId.isValid(id)) { return res.status(400).json({ message: 'Invalid or missing ID' }); }  
    
      const entry = await Contact.findById(id).exec();  
      if (!entry) { return res.status(404).json({ message: `Contact with ID ${id} not found` }); }
    
      return res.status(200).json({ message: '✅ Single Entry Fetched', data: entry });

    }catch (error) { return log(error); }
  };

  export async function create_update_contact(req: ExtendedRequest, res: NextApiResponse) {
    try {
      if (req.method !== 'POST') { return res.status(405).json({ message: 'Method Not Allowed' }); }

      const data = req.body;
      if (!data?.name || !data?.email || !data?.phone ) { return res.status(400).json({ message: '❌ Required fields missing' }); }

      const modelId = typeof data._id === 'string' || data._id instanceof Types.ObjectId ? data._id : null;

      console.log("data", data)

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
        } catch (error) { return log(error); }
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
    } catch (error) { return log(error); }
  }
// Contact

const functions: HandlerMap = {
  get_all_clients: get_all_clients,
  get_single_client: get_single_client,
  create_update_client: create_update_client,
  get_all_client_options: get_all_client_options,

  get_all_contacts: get_all_contacts,
  get_single_contact: get_single_contact,
  create_update_contact: create_update_contact,
};

const tmpDir = path.join(process.cwd(), 'tmp');
if (!fs.existsSync(tmpDir)) { fs.mkdirSync(tmpDir); }

function normalizeFormFields(fields: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const key in fields) {
    const value = fields[key];
    const v = Array.isArray(value) && value.length === 1 ? value[0] : value;
    result[key] = v === 'null' || v === '' ? undefined : v;
  }
  return result;
}

export const parseForm = async ( req: NextApiRequest ): Promise<{ fields: Fields; files: Files }> => {
  return new Promise((resolve, reject) => {
    const form = new IncomingForm({
      uploadDir: tmpDir,
      keepExtensions: true,
      multiples: true,
    });

    form.parse(req, (err: Error | null, fields: Fields, files: Files) => {
      if (err) {
        reject(err);
      } else {
        resolve({ fields, files });
      }
    });
  });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    let fnName: string;
    let body: any = req.body;
    let files: any = null;

    if (req.method === 'POST') {
      const parsed = await parseForm(req);
      body = normalizeFormFields(parsed.fields);
      files = parsed.files;
      fnName = body.function;
    } else {
      fnName = req.method === 'GET' ? (req.query.function as string) : req.body.function;
    }

    console.log("fnName", fnName)

    if (!fnName || typeof fnName !== 'string') { return res.status(400).json({ message: 'Missing or invalid function name' }); }    

    const targetFn = functions[fnName];
    if (!targetFn) { return res.status(400).json({ message: `Invalid function name: ${fnName}` }); }

    await connectDB();

    req.body = body;
    if (files) (req as any).files = files;

    await targetFn(req, res);
  } catch (error) { return log(error); }
}