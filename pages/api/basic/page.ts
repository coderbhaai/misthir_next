import mongoose, { isValidObjectId, Types } from 'mongoose';
import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from 'pages/lib/mongodb';
import Meta from 'lib/models/basic/Meta';
import Page from 'lib/models/basic/Page';
import { uploadMedia } from './media';
import { IncomingForm, Fields, Files } from 'formidable';
import fs from 'fs';
import path from 'path';
import { upsertMeta } from './meta';
import PageDetail from 'lib/models/basic/PageDetail';
import { getRelatedContent, getUserIdFromToken, log } from '../utils';

import models from "lib/models";
import Faq from 'lib/models/basic/Faq';
import Testimonial from 'lib/models/basic/Testimonial';
import { clo, slugify } from '@amitkk/basic/utils/utils';
import Blog from 'lib/models/blog/Blog';
import { Search, SearchResult } from 'lib/models/basic/Search';
import UserBrowsingHistory from 'lib/models/basic/UserBrowsingHistory';
import dayjs from 'dayjs';

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

type PageInput = {
  name: string;
  url: string;
  module: string;
  meta_id?: mongoose.Types.ObjectId | string | null;
  media_id?: mongoose.Types.ObjectId | string | null;
  page_id?: mongoose.Types.ObjectId | string | null;
};

export async function status_switch(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { model, _id, status } = req.body;    

    if (!model) return res.status(400).json({ message: "Model name is required" });
    if (!_id) return res.status(400).json({ message: "Row ID (_id) is required" });
    if (status === undefined) return res.status(400).json({ message: "Status is required" });
    
    const Model = (models as any)[model];
    if (!Model) return res.status(400).json({ message: `Invalid model: ${model}` });

    const modelId = typeof req.body._id === 'string' || req.body._id instanceof Types.ObjectId ? req.body._id : null;

    const row = await Model.findById(modelId);
    if (!row) return res.status(404).json({ message: `No record found with ID: ${_id}` });

    row.status = status;
    await row.save();

    return res.status(200).json({ message: `Status updated for ${model}`, data: row });
  } catch (error) { log(error); }
}

// PAGE
  export async function create_update_page(req: ExtendedRequest, res: NextApiResponse) {
      try {
        if (req.method !== 'POST') { return res.status(405).json({ message: 'Method Not Allowed' }); }
        
        const data = req.body;

        const modelId = (typeof data._id === 'string' || data._id instanceof Types.ObjectId) ? data._id : null;
        const slug = await slugify(data.url, Meta, modelId);

        let media_id: string | null = null;
        if (data.media_id && isValidObjectId(data.media_id)) { media_id = data.media_id; }
        const file = Array.isArray(req.files?.image) ? req.files.image[0] : req.files?.image;
        
        if (file) {
          media_id = await uploadMedia({ file, name: data.name, pathType: data.path, media_id: data.media_id ?? null, user_id: null });
        }

        let meta_id: string | null = null;
        meta_id = await upsertMeta({ meta_id: data.meta_id ?? null, url: data.url, title: data.title, description: data.description });

        if (data._id) {
          const updated = await Meta.findByIdAndUpdate(
            data._id,
            {
              url: slug,
              module: data.module,
              name: data.name,
              content: data.content,
              status: data.status,
              sitemap: data.sitemap,
              schema_status: data.schema_status,
              updatedAt: new Date(),
            },
            { new: true }
          );

          await PageDetail.findOneAndUpdate(
            { page_detail_id: data._id },
            {
              faq_title: data.faq_title,
              faq_text: data.faq_text,
              blog_title: data.blog_title,
              blog_text: data.blog_text,
              contact_title: data.contact_title,
              contact_text: data.contact_text,
              testimonial_title: data.testimonial_title,
              testimonial_text: data.testimonial_text,
            },
            { upsert: true, new: true }
          );
          return res.status(200).json({ message: 'Entry updated successfully', data: updated });
        }

        const newEntry = new Page({
          url: slug,
          module: data.module,
          name: data.name,
          content: data.content,
          status: data.status,
          sitemap: data.sitemap,
          schema_status: data.schema_status,
          media_id: media_id,
          meta_id: meta_id,
        });

        await newEntry.save();

        const detail = await PageDetail.create({
          page_detail_id: newEntry._id,
          faq_title: data.faq_title,
          faq_text: data.faq_text,
          blog_title: data.blog_title,
          blog_text: data.blog_text,
          contact_title: data.contact_title,
          contact_text: data.contact_text,
          testimonial_title: data.testimonial_title,
          testimonial_text: data.testimonial_text,
        });

        return res.status(201).json({ message: 'Entry created successfully', data: newEntry });
      } catch (error) { log(error); }
  }

  export async function get_all_pages(req: NextApiRequest, res: NextApiResponse) {
    try {
      const data = await Page.find().populate([ { path: 'media_id' }, { path: 'meta_id' } ]).exec();
      return res.status(200).json({ message: 'Fetched all Pages', data });
    } catch (error) { log(error); }
  }

  export async function get_single_page(req: NextApiRequest, res: NextApiResponse){
    const id = (req.method === 'GET' ? req.query.id : req.body.id) as string;

    if (!id || !Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid or missing ID' });
    }

    const entry = await Page.findById(id).populate([ { path: 'media_id' }, { path: 'meta_id' }, { path: 'details' } ]).exec();
    if (!entry) { return res.status(404).json({ message: `Page with ID ${id} not found` }); }

    return res.status(200).json({ message: '✅ Single Entry Fetched', data: entry });
  };

  export async function upsertPage({ name, url, module, meta_id, media_id, page_id }: PageInput): Promise<string | null> {
    try {
      if (!name || !url || !module) { return null; }
    
      let entry;
      if (page_id && isValidObjectId(page_id)) {
        entry = await Page.findByIdAndUpdate(
          page_id,
          { name, url, module, meta_id, media_id },
          { new: true }
        );
      }
      if (!entry) {
        entry = await Page.create({ 
          name, url, module, meta_id, media_id, 
          status: 1, sitemap: 1, schema_status: 1 
        });
      }
      
      return entry?._id?.toString() || null;
      
    } catch (error) { clo(error); return null;
    }
  };

  export async function get_single_page_module(req: NextApiRequest, res: NextApiResponse){
    const id = (req.method === 'GET' ? req.query.id : req.body.id) as string;

    if (!id || !Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid or missing ID' });
    }

    const entry = await Page.findById(id).exec();
    if (!entry) { return res.status(404).json({ message: `Page with ID ${id} not found` }); }

    return res.status(200).json({ message: '✅ Single Entry Fetched', data: entry });
  };

  export async function get_page_module(req: NextApiRequest, res: NextApiResponse) {
    try {
      const data = await Page.find().select("_id name").exec();

      return res.status(200).json({ message: 'Fetched all Page Modules', data });
    } catch (error) { log(error); }
  }
// PAGE

// FAQs
  export async function get_all_faqs(req: NextApiRequest, res: NextApiResponse) {
    try {
      const data = await Faq.find().populate([ { path: "module_id", select: "name url" } ]).exec();
      return res.status(200).json({ message: 'Fetched all FAQs', data });
    } catch (error) { log(error); }
  }

  export async function create_update_faq(req: NextApiRequest, res: NextApiResponse) {
      try {
        if (req.method !== 'POST') { return res.status(405).json({ message: 'Method Not Allowed' }); }
        
        const data = req.body;

        if (data._id) {
          const updated = await Faq.findByIdAndUpdate(
            data._id,
            {
              module: data.module,
              module_id: data.module_id,
              question: data.question,
              answer: data.answer,
              status: data.status,
              displayOrder: data.displayOrder,
              updatedAt: new Date(),
            },
            { new: true }
          );

          return res.status(200).json({ message: 'Entry updated successfully', data: updated });
        }

        const newEntry = new Faq({
          module: data.module,
          module_id: data.module_id,
          question: data.question,
          answer: data.answer,
          status: data.status,
          displayOrder: data.displayOrder,
        });

        await newEntry.save();
        return res.status(201).json({ message: 'Entry created successfully', data: newEntry });
      } catch (error) { log(error); }
  }

  export async function get_single_faq(req: NextApiRequest, res: NextApiResponse){
    const id = (req.method === 'GET' ? req.query.id : req.body.id) as string;

    if (!id || !Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid or missing ID' });
    }

    const data = await Faq.findById(id).populate([ { path: "module_id", select: "name url" } ]).exec();
    if (!data) { return res.status(404).json({ message: `FAQ with ID ${id} not found` }); }

    return res.status(201).json({ message: 'Single FAQ Fetched', data: data });
  };

  export async function get_faq(req: NextApiRequest, res: NextApiResponse){
    const module_id = (req.method === 'GET' ? req.query.module_id : req.body.module_id) as string;
    const module = (req.method === 'GET' ? req.query.module : req.body.module) as string;

    if ( !module || !module_id || !Types.ObjectId.isValid(module_id)) { 
      return res.status(400).json({ message: 'Invalid or missing ID' });
    }

    const data = await Faq.find({ module, module_id }).populate([ { path: "module_id", select: "name url" } ]).exec();
    if (!data) { return res.status(404).json({ message: `FAQ with ID ${module_id} not found` }); }

    return res.status(201).json({ message: 'Single FAQ Fetched', data: data });
  };
// FAQs

// Testimonials
  export async function get_all_testimonials(req: NextApiRequest, res: NextApiResponse) {
    try {
      const data = await Testimonial.find().populate([ { path: "module_id", select: "name url" }, { path: "media_id" } ]).exec();
      return res.status(200).json({ message: 'Fetched all Testimonials', data });
    } catch (error) { log(error); }
  }

  export async function create_update_testimonial(req: ExtendedRequest, res: NextApiResponse) {
      try {
        if (req.method !== 'POST') { return res.status(405).json({ message: 'Method Not Allowed' }); }
        
        const data = req.body;
        const modelId = typeof data._id === 'string' || data._id instanceof Types.ObjectId ? data._id : null;

        let media_id: string | null = null;
        if (data.media_id && isValidObjectId(data.media_id)) { media_id = data.media_id; }
        const file = Array.isArray(req.files?.image) ? req.files.image[0] : req.files?.image;
        
        if (file) {
          media_id = await uploadMedia({ file, name: data.name, pathType: data.path, media_id: data.media_id ?? null, user_id: null });
        }

        if (modelId && isValidObjectId(modelId)) {
          const updated = await Testimonial.findByIdAndUpdate(
            data._id,
            {
              module: data.module,
              module_id: data.module_id,
              media_id: media_id ?? undefined,
              name: data.name,
              role: data.role,
              content: data.content,
              status: data.status,
              displayOrder: data.displayOrder,
              updatedAt: new Date(),
            },
            { new: true }
          );

          return res.status(200).json({ message: 'Entry updated successfully', data: updated });
        }

        const newEntry = new Testimonial({
          module: data.module,
          module_id: data.module_id,
          media_id: media_id ?? undefined,
          name: data.name,
          role: data.role,
          content: data.content,
          status: data.status,
          displayOrder: data.displayOrder,
        });

        await newEntry.save();
        return res.status(201).json({ message: 'Entry created successfully', data: newEntry });
      } catch (error) { log(error); }
  }

  export async function get_single_testimonial(req: NextApiRequest, res: NextApiResponse){
    const id = (req.method === 'GET' ? req.query.id : req.body.id) as string;

    if (!id || !Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid or missing ID' });
    }

    const data = await Testimonial.findById(id).populate([ { path: "module_id", select: "name url" }, { path: "media_id" } ]).exec();
    if (!data) { return res.status(404).json({ message: `Testimonial with ID ${id} not found` }); }

    return res.status(201).json({ message: 'Single Testimonial Fetched', data: data });
  };

  export async function get_testimonial(req: NextApiRequest, res: NextApiResponse){
    const module_id = (req.method === 'GET' ? req.query.module_id : req.body.module_id) as string;
    const module = (req.method === 'GET' ? req.query.module : req.body.module) as string;

    if ( !module || !module_id || !Types.ObjectId.isValid(module_id)) { 
      return res.status(400).json({ message: 'Invalid or missing ID' });
    }

    const data = await Testimonial.find({ module, module_id }).populate([ { path: "module_id", select: "name url" }, { path: "media_id" } ]).exec();
    if (!data) { return res.status(404).json({ message: `Testimonial with ID ${module_id} not found` }); }

    return res.status(201).json({ message: 'Single Testimonial Fetched', data: data });
  };
// Testimonials

// Search
  export async function get_all_searches(req: NextApiRequest, res: NextApiResponse) {
    try {
      const data = await Search.find().populate([ { path: "user_id" } ]).exec();
      return res.status(200).json({ message: 'Fetched all Searches', data });
    } catch (error) { log(error); }
  }

  export async function create_update_search(req: NextApiRequest, res: NextApiResponse) {
    try {
      if (req.method !== 'POST') { return res.status(405).json({ message: 'Method Not Allowed' }); }
      
      const data = req.body;
      const user_id = getUserIdFromToken(req);
      const isValidUserId = user_id && mongoose.Types.ObjectId.isValid(user_id);

     let searchEntry = await Search.findOne({ term: data.term, user_id: isValidUserId ? user_id : null });

      if (searchEntry) {
        searchEntry.frequency += 1;
        await searchEntry.save();
      } else {
        searchEntry = await Search.create({
          term: data.term,
          frequency: 1,
          user_id: isValidUserId ? user_id : null,
        });
      }
    let searchResultEntry = null;
    if (data.module && data.module_id) {
      searchResultEntry = await SearchResult.findOne({
        search_id: searchEntry._id,
        module: data.module,
        module_id: data.module_id,
        user_id: isValidUserId ? user_id : null,
      });

      if (searchResultEntry) {
        searchResultEntry.frequency += 1;
        await searchResultEntry.save();
      } else {
        searchResultEntry = await SearchResult.create({
          search_id: searchEntry._id,
          module: data.module,
          module_id: data.module_id,
          frequency: 1,
          user_id: isValidUserId ? user_id : null,
        });
      }
    }

      return res.status(200).json({ message: 'Search updated successfully', data: searchEntry });
    } catch (error) { log(error); }
  }

  export async function get_search_pages(req: NextApiRequest, res: NextApiResponse) {
    try {
      if (req.method !== 'POST') { return res.status(405).json({ message: 'Method Not Allowed' }); }
      const term = req.body.term as string;
      if (!term || typeof term !== "string") return res.json({ results: [] });

      const pages = await Page.find( { name: new RegExp(term, "i") }, "_id name url" ).limit(5).lean();
      const blogs = await Blog.find( { name: new RegExp(term, "i") }, "_id name url" ).limit(5).lean();
      const results = [
        ...pages.map((p: any) => ({ module: "Page", module_id: p._id, name: p.name, url: p.url })),
        ...blogs.map((b: any) => ({ module: "Blog", module_id: b._id, name: b.name, url: `/blog/${b.url}` })),
      ];

      return res.status(200).json({ message: 'Fetched all Searches', data:results });
    } catch (error) { log(error); }
  }

  export async function get_search_results(req: NextApiRequest, res: NextApiResponse) {
    try {
      if (req.method !== 'POST') { return res.status(405).json({ message: 'Method Not Allowed' }); }
      const term = req.body.term as string;
      if (!term || typeof term !== "string") return res.json({ results: [] });
      
      const pages = await Page.find( { name: new RegExp(term, "i") } ).populate([ { path: 'media_id' } ]).limit(5).lean();
      const blogs = await Blog.find( { name: new RegExp(term, "i") } ).populate([ { path: 'media_id' } ]).limit(5).lean();

      return res.status(200).json({ message: 'Fetched all Searches', data:{pages, blogs} });
    } catch (error) { log(error); }
  }
// Search

// Browsing
  export async function create_update_browsing_history(req: NextApiRequest, res: NextApiResponse) {
    try {
      if (req.method !== 'POST') { return res.status(405).json({ message: 'Method Not Allowed' }); }
      
      const { module, module_id } = req.body;
      if (!module || !module_id) { return res.status(400).json({ error: "module and module_id required" }); }
      const user_id = getUserIdFromToken(req);
      
      const now = dayjs();
      const twoHoursAgo = now.subtract(2, "hour").toDate();

      let history = await UserBrowsingHistory.findOne({ module, module_id, user_id });
      
      if (history && history.updatedAt > twoHoursAgo) {
        history.last_visit = now.toDate();
        history.updatedAt = now.toDate();
        await history.save();
      } else {
          history = await UserBrowsingHistory.findOneAndUpdate(
        { module, module_id, user_id },
        {
          $set: { last_visit: now.toDate(), updatedAt: now.toDate() },
          $inc: { frequency: 1 },
        },
        { new: true, upsert: true }
      );
      }

      return res.status(200).json({ message: 'Search updated successfully', data: true });
    } catch (error) { log(error); }
  }
// Browsing

export async function get_page_data(req: NextApiRequest, res: NextApiResponse) {
  try {
    const url = (req.method === 'GET' ? req.query.url : req.body.url) as string;
    const module = (req.method === 'GET' ? req.query.module : req.body.module) as string;
    if (!url) { return res.status(400).json({ message: 'Invalid or missing URL' }); }

    const data = await Page.findOne({ url }).populate([ { path: 'media_id' }, { path: 'meta_id' }, { path: 'details' } ]).exec();

    const relatedContent = await getRelatedContent({
          module: "Page",
          moduleId: data._id.toString(),
          productId: null,
          blogId : null
        });

    return res.status(200).json({ message: 'Fetched Page Data', data, relatedContent });
  } catch (error) { log(error); }
}

const functions: HandlerMap = {
  create_update_page: create_update_page,
  get_all_pages: get_all_pages,
  get_single_page: get_single_page,
  get_single_page_module: get_single_page_module,
  status_switch: status_switch,
  get_page_module: get_page_module,
  get_page_data: get_page_data,

  get_all_faqs: get_all_faqs,
  create_update_faq: create_update_faq,
  get_faq: get_faq,
  get_single_faq: get_single_faq,

  get_all_testimonials: get_all_testimonials,
  create_update_testimonial: create_update_testimonial,
  get_single_testimonial: get_single_testimonial,
  get_testimonial: get_testimonial,

  get_all_searches: get_all_searches,
  create_update_search: create_update_search,
  get_search_pages: get_search_pages,
  get_search_results: get_search_results,

  create_update_browsing_history: create_update_browsing_history,
};

const tmpDir = path.join(process.cwd(), 'tmp');
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir);
}

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
    
    if (!fnName || typeof fnName !== 'string') {
      return res.status(400).json({ message: 'Missing or invalid function name' });
    }

    const targetFn = functions[fnName];
    if (!targetFn) {
      return res.status(400).json({ message: `Invalid function name: ${fnName}` });
    }

    await connectDB();

    req.body = body;
    if (files) (req as any).files = files;

    await targetFn(req, res);
  } catch (error) { return log(error); }
}