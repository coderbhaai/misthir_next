import mongoose, { isValidObjectId, Types } from 'mongoose';
import type { NextApiRequest, NextApiResponse } from 'next';
import Page from 'lib/models/basic/Page';
import { uploadMedia } from './media';
import { generateSitemap, slugify, upsertMeta } from './meta';
import PageDetail from 'lib/models/basic/PageDetail';
import { checkNullValue, getBlockContent, getRelatedContent, logError } from '../utils';

import models from "lib/models";
import Faq from 'lib/models/basic/Faq';
import Testimonial from 'lib/models/basic/Testimonial';
import Blog from 'lib/models/blog/Blog';
import { Search, SearchResult } from 'lib/models/basic/Search';
import UserBrowsingHistory from 'lib/models/basic/UserBrowsingHistory';
import dayjs from 'dayjs';
import { createApiHandler, ExtendedRequest } from '../apiHandler';
import { APIHandlers } from '../../../lib/server/middleware';
import { buildFilterQuery } from 'lib/server/plugins/buildFilterQuery';
import Product from 'lib/models/product/Product';
import { getUserIdFromToken } from './auth';
import Achievement from 'lib/models/basic/Achievement';
import UrlRegistry, { UrlRegistryProps } from 'lib/models/basic/UrlRegistry';

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
  } catch (error) { await logError(error, { function: "status_switch", payload: req.body }); }
}

// PAGE
  export async function create_update_page(req: ExtendedRequest, res: NextApiResponse) {
      try {
        const data = req.body;

        const modelId = (typeof data._id === 'string' || data._id instanceof Types.ObjectId) ? data._id : null;
        const slug = await slugify(data.url, Page, modelId);

        let media_id: string | null = null;
        if (data.media_id && isValidObjectId(data.media_id)) { media_id = data.media_id; }
        const file = Array.isArray(req.files?.image) ? req.files.image[0] : req.files?.image;
        
        if (file) {
          media_id = await uploadMedia({ file, name: data.name, pathType: data.path, media_id: data.media_id ?? null, user_id: null });
      }

        let meta_id: string | null = null;
        meta_id = await upsertMeta({ meta_id: data.meta_id ?? null, url: slug, title: data.title, description: data.description });

        if (data._id) {
          const updated = await Page.findByIdAndUpdate(data._id, {
              media_id,
              meta_id,
              url: slug,
              module: data.module,
              module_id: data.module_id,
              name: data.name,
              content: data.content,
              status: data.status,
              sitemap: data.sitemap,
              schema_status: data.schema_status,
              updatedAt: new Date(),
            }, { new: true });

          await PageDetail.findOneAndUpdate({ page_id: data.page_id }, {
              faq_title: data.faq_title,
              faq_text: data.faq_text,
              blog_title: data.blog_title,
              blog_text: data.blog_text,
              contact_title: data.contact_title,
              contact_text: data.contact_text,
              achievement_title: data.achievement_title,
              achievement_text: data.achievement_text,
              testimonial_title: data.testimonial_title,
              testimonial_text: data.testimonial_text,
              mediaHub_title: data.mediaHub_title,
              mediaHub_text: data.mediaHub_text,
            }, { upsert: true, new: true });

            await generateSitemap();
          return res.status(200).json({ message: 'Entry updated successfully', data: updated });
        }

        const newEntry = new Page({
          media_id,
          meta_id,
          url: slug,
          module: data.module,
          module_id: data.module_id,
          name: data.name,
          content: data.content,
          status: data.status,
          sitemap: data.sitemap,
          schema_status: data.schema_status,
        });

        await newEntry.save();

        const detail = await PageDetail.create({
          page_id: newEntry._id,
          faq_title: data.faq_title,
          faq_text: data.faq_text,
          blog_title: data.blog_title,
          blog_text: data.blog_text,
          contact_title: data.contact_title,
          contact_text: data.contact_text,
          achievement_title: data.achievement_title,
          achievement_text: data.achievement_text,
          testimonial_title: data.testimonial_title,
          testimonial_text: data.testimonial_text,
          destination_title: data.destination_title,
          destination_text: data.destination_text,
          mediaHub_title: data.mediaHub_title,
          mediaHub_text: data.mediaHub_text,
        });

        await generateSitemap();

        return res.status(201).json({ message: 'Entry created successfully', data: newEntry });
      } catch (error) { await logError(error, { function: "create_update_page", payload: req.body }); }
  }

  export async function get_filtered_pages(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { filters = {}, page = 0, limit = 10 } = req.body || {};
      const { matchQuery, skip, limit: safeLimit } = buildFilterQuery(filters, { page, limit, defaultLimit: 10, maxLimit: 100, searchableFields: ["name", "url"] });
      const total = await Page.countDocuments(matchQuery);

      const data = await Page.find(matchQuery).populate([ { path: 'media_id' }, { path: 'meta_id' } ]).skip(skip).limit(safeLimit).sort({ createdAt: -1 });
      return res.status(200).json({ message: 'Fetched all Pages', data, pagination: { total, page, limit: safeLimit, pages: Math.ceil(total / safeLimit) } });
    } catch (error) { await logError(error, { function: "get_filtered_pages", payload: req.body }); }
  }

  export async function get_single_page(req: NextApiRequest, res: NextApiResponse){
    try{
      const id = (req.method === "GET" ? req.query.id : req.body.id) as string;
      if (!id || !Types.ObjectId.isValid(id)) { return res.status(400).json({ message: 'Invalid or missing ID' }); }
  
      const data = await Page.findById(id).populate([ { path: 'media_id' }, { path: 'meta_id' }, { path: 'details' } ]).exec();
      if (!data) { return res.status(404).json({ message: `Page with ID ${id} not found` }); }
  
      return res.status(200).json({ message: '✅ Single Entry Fetched', data });
    }catch (error) { await logError(error, { function: "get_single_page", payload: req.body }); }
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
      
    } catch (error) { await logError(error, { function: "upsertPage", payload: { name, url, module, meta_id, media_id, page_id } }); return null; }
  };

  const moduleMap: Record<string, any> = { Blog, Page, Product, };
  export async function fetch_modules(req: NextApiRequest, res: NextApiResponse){
    try{
      const { module } = req.body;
      if (!module || typeof module !== "string") { return res.status(400).json({ message: "Module is required", data: [] }); }

      const Model = moduleMap[module];
      if (!Model) { return res.status(400).json({ message: "Invalid module", data: [] }); }

      const data = await Model.find().select("_id name url").lean();
      return res.status(200).json({ message: `Fetched ${module}`, data });
    }catch (error) { await logError(error, { function: "get_single_page", payload: req.body }); }
  };

  export async function get_page_entry(url: string) {
    try {
      const data = await Page.findOne({ url }).populate([ { path: 'media_id' }, { path: 'meta_id' }, { path: 'details' } ]).exec();
      return data;
    } catch (error) { await logError(error, { function: "get_page_entry", payload: {url} }); }
  }
// PAGE

// FAQs
  export async function get_filtered_faqs(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { filters = {}, page = 0, limit = 10, module, module_id } = req.body || {};
      const { matchQuery, skip, limit: safeLimit } = buildFilterQuery(filters, { page, limit, defaultLimit: 10, maxLimit: 100, searchableFields: ["question"] });
      if (module && module_id) {
        matchQuery.module = module;
        matchQuery.module_id = module_id;
      }

      const total = await Faq.countDocuments(matchQuery);
      const data = await Faq.find(matchQuery).populate([{ path: "module_id", select: "_id name url" }]).skip(skip).limit(safeLimit).sort({ createdAt: -1 });

      return res.status(200).json({ message: "Fetched filtered FAQs", data, pagination: { total, page, limit: safeLimit, pages: Math.ceil(total / safeLimit) } });
    } catch (error) { await logError(error, { function: "get_filtered_faqs", payload: req.body }); }
  }

  export async function create_update_faq(req: NextApiRequest, res: NextApiResponse) {
    try {
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
            displayOrder: checkNullValue(data.displayOrder),
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
        displayOrder: checkNullValue(data.displayOrder),
      });

      await newEntry.save();
      return res.status(201).json({ message: 'Entry created successfully', data: newEntry });
    } catch (error) { await logError(error, { function: "create_update_faq", payload: req.body }); }
  }

  export async function get_single_faq(req: NextApiRequest, res: NextApiResponse){
    try{
      const id = (req.method === "GET" ? req.query.id : req.body.id) as string;
      if (!id || !Types.ObjectId.isValid(id)) { return res.status(400).json({ message: 'Invalid or missing ID' }); }
  
      const data = await Faq.findById(id).populate([ { path: "module_id", select: "name url" } ]).exec();
      if (!data) { return res.status(404).json({ message: `FAQ with ID ${id} not found` }); }
  
      return res.status(201).json({ message: 'Single FAQ Fetched', data: data });
    }catch (error) { await logError(error, { function: "create_update_faq", payload: req.body }); }
  };
// FAQs

// Testimonials
  export async function get_filtered_testimonials(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { filters = {}, page = 0, limit = 10, module, module_id } = req.body || {};
      const { matchQuery, skip, limit: safeLimit } = buildFilterQuery(filters, { page, limit, defaultLimit: 10, maxLimit: 100, searchableFields: ["content"] });
      if (module && module_id) {
        matchQuery.module = module;
        matchQuery.module_id = module_id;
      }

      const total = await Testimonial.countDocuments(matchQuery);

      const data = await Testimonial.find(matchQuery).populate([ { path: "module_id", select: "name url" }, { path: 'media_id' },  ]).skip(skip).limit(safeLimit).sort({ createdAt: -1 });
      return res.status(200).json({ message: 'Fetched Filtered Testimonials', data, pagination: { total, page, limit: safeLimit, pages: Math.ceil(total / safeLimit) } });
    } catch (error) { await logError(error, { function: "get_filtered_testimonials", payload: req.body }); }
  }

  export async function create_update_testimonial(req: ExtendedRequest, res: NextApiResponse) {
    try {
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
            displayOrder: checkNullValue(data.displayOrder),
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
        displayOrder: checkNullValue(data.displayOrder),
      });

      await newEntry.save();
      return res.status(201).json({ message: 'Entry created successfully', data: newEntry });
    } catch (error) { await logError(error, { function: "create_update_testimonial", payload: req.body }); }
  }

  export async function get_single_testimonial(req: NextApiRequest, res: NextApiResponse){
    try{
      const id = (req.method === "GET" ? req.query.id : req.body.id) as string;
      if (!id || !Types.ObjectId.isValid(id)) { return res.status(400).json({ message: 'Invalid or missing ID' }); }
  
      const data = await Testimonial.findById(id).populate([ { path: "module_id", select: "name url" }, { path: 'media_id' } ]).exec();
      if (!data) { return res.status(404).json({ message: `Testimonial with ID ${id} not found` }); }
  
      return res.status(201).json({ message: 'Single Testimonial Fetched', data: data });
    } catch (error) { await logError(error, { function: "get_single_testimonial", payload: req.body }); }
  };
// Testimonials

// Achievement
  export async function get_filtered_achievements(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { filters = {}, page = 0, limit = 10 } = req.body || {};
      const targetModule = filters.ModuleFilter;
      const targetModuleId = filters.ModuleIdFilter;
      const cleanFilters = { ...filters };
      delete cleanFilters.ModuleFilter;
      delete cleanFilters.ModuleIdFilter;
      const { matchQuery, skip, limit: safeLimit } = buildFilterQuery(cleanFilters, { 
        page, 
        limit, 
        defaultLimit: 10, 
        maxLimit: 100, 
        searchableFields: ["name"] 
      });
      if (targetModule) {
        matchQuery.module = targetModule;
      }
      if (targetModuleId) {
        matchQuery.module_id = targetModuleId; 
      }

      const total = await Achievement.countDocuments(matchQuery);

      const achievements = await Achievement.find(matchQuery)
        .populate([ { path: "module_id", select: "name url" }, { path: "media_id" }])
        .sort({ module: 1, module_id: 1, displayOrder: 1 })
        .skip(skip)
        .limit(safeLimit)
        .lean();

      const grouped: Record<string, any> = {};

      for (const item of achievements) {
        const key = `${item.module}_${item.module_id?._id || item.module_id}`;
        if (!grouped[key]) {
          grouped[key] = {
            module: item.module,
            module_id: item.module_id?._id || item.module_id,
            module_name: item.module_id?.name || "",
            module_url: item.module_id?.url || "",
            achievements: [],
          };
        }

        grouped[key].achievements.push({
          _id: item._id,
          name: item.name,
          value: item.value,
          status: item.status,
          displayOrder: checkNullValue(item.displayOrder),
          createdAt: item.createdAt,
          media_id: item.media_id || null,
        });
      }

      const groupedArray = Object.values(grouped);

      return res.status(200).json({ 
        message: "✅ Fetched grouped achievements successfully", 
        data: groupedArray, 
        total,
        page,
        pages: Math.ceil(total / safeLimit),
        pagination: { total, page, limit: safeLimit, pages: Math.ceil(total / safeLimit) } 
      });
      
    } catch (error) { 
      await logError(error, { function: "get_filtered_achievements", payload: req.body }); 
      return res.status(500).json({ message: "❌ Internal Server Error", error: String(error) }); 
    }
  }

  export async function get_single_achievement(req: NextApiRequest, res: NextApiResponse){
    try{
      const { module, module_id } = req.body;
      if( !module || !module_id ){ return res.status(400).json({ message: 'Invalid or missing Module Details' }); }

      const data = await Achievement.find({ module, module_id }).populate([ { path: "module_id", select: "name url" }, { path: "media_id" }]).exec();  
      if (!data) { return res.status(404).json({ message: `Achievement not found` }); }
    
      return res.status(200).json({ message: '✅ Single Entry Fetched', data });
    }catch (error) { await logError(error, { function: "get_single_achievement", payload: req.body }); return res.status(500).json({ message: "Internal Server Error", data: null }); }
  };

  export async function create_update_achievement(req: ExtendedRequest, res: NextApiResponse) {
    try {
      const { module, module_id, path } = req.body;
      const achievements: any[] = [];

      Object.keys(req.body).forEach((key) => {
        const match = key.match(/^achievements\[(\d+)\]\[(\w+)\]$/);
        if (match) {
          const index = parseInt(match[1]);
          const field = match[2];
          if (!achievements[index]) achievements[index] = {};
          achievements[index][field] = req.body[key];
        }
      });

      if (!Array.isArray(achievements) || achievements.length === 0){
        return res.status(400).json({ message: "❌ No achievements provided" });
      }

      const results: any[] = [];

      for (let i = 0; i < achievements.length; i++) {
        const item = achievements[i];

        const { _id, name, value, status, displayOrder, media_id: bodyMediaId } = item;
        if (!name || value == null || !module || !module_id) continue;
        let media_id: string | null = null;
        if (bodyMediaId && isValidObjectId(bodyMediaId)) {
          media_id = bodyMediaId;
        }
        const fileKey = `achievements[${i}][image]`;
        const file = Array.isArray(req.files?.[fileKey]) ? req.files[fileKey][0] : req.files?.[fileKey];

        if (file) {
          const timestamp = Date.now();
          const webMediaName = `web_${module}_${i}_${timestamp}`;
          media_id = await uploadMedia({
            file,
            name: webMediaName,
            pathType: "achievements",
            media_id, // keep existing if updating
            user_id: null,
          });
        }

        let result;
        if (_id && isValidObjectId(_id)) {
          result = await Achievement.findByIdAndUpdate(
            _id,
            {
              module,
              module_id,
              name,
              value: Number(value),
              status: status === "true",
              displayOrder: checkNullValue(displayOrder),
              ...(media_id && { media_id }), // only overwrite if exists
              updatedAt: new Date(),
            },
            { new: true }
          );
        } else {
          result = await Achievement.create({
            module,
            module_id,
            name,
            value: Number(value),
            status: status === "true",
            displayOrder: checkNullValue(displayOrder),
            media_id,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
        
        results.push(result);
      }

    return res.status(200).json({ message: "✅ Achievements processed successfully", data: results, });
    } catch (error) { await logError(error, { function: "create_update_achievement", payload: req.body }); return res.status(500).json({ message: "❌ Internal Server Error", error }); }
  }
// Achievement

// Search
  export async function get_filtered_searches(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { filters = {}, page = 0, limit = 10 } = req.body || {};
      const { matchQuery, skip, limit: safeLimit } = buildFilterQuery(filters, { page, limit, defaultLimit: 10, maxLimit: 100, searchableFields: ["term"] });
      const total = await Search.countDocuments(matchQuery);

      const data = await Search.find(matchQuery).populate([ { path: "user_id" } ]).skip(skip).limit(safeLimit).exec();
      return res.status(200).json({ message: 'Fetched all Searches', data, pagination: { total, page, limit: safeLimit, pages: Math.ceil(total / safeLimit) } });
    } catch (error) { await logError(error, { function: "get_filtered_searches", payload: req.body }); }
  }

  export async function create_update_search(req: NextApiRequest, res: NextApiResponse) {
    try {
      const data = req.body;
      const user_id = await getUserIdFromToken(req);
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
    } catch (error) { await logError(error, { function: "create_update_search", payload: req.body }); }
  }

  export async function get_search_pages(req: NextApiRequest, res: NextApiResponse) {
    try {
      const term = req.body.term as string;
      if (!term || typeof term !== "string") return res.json({ results: [] });

      const [pages, blogs] = await Promise.all([
        Page.find({ name: new RegExp(term, "i") }, "_id module name url").limit(5).lean(),
        Blog.find({ name: new RegExp(term, "i") }, "_id name url").limit(5).lean(),
      ]);

      const results = [
        ...pages.map((p: any) => ({ module: p.module || "Page", module_id: p._id, name: p.name, url: p.url })),
        ...blogs.map((b: any) => ({ module: "Blog", module_id: b._id, name: b.name, url: `/${b.url}` })),
      ];
      
      results.sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" }));

      return res.status(200).json({ message: 'Fetched all Searches', data:results });
    } catch (error) { await logError(error, { function: "get_search_pages", payload: req.body }); }
  }

  export async function get_search_results(req: NextApiRequest, res: NextApiResponse) {
    try {
      const term = req.body.term as string;
      if (!term || typeof term !== "string") return res.json({ results: [] });

      const regex = new RegExp(term, "i");

      const [pages, blogs] = await Promise.all([
        Page.find({ name: regex, module: "Page" }).populate("media_id").sort({ name: 1 }).limit(10).lean(),
        Blog.find({ name: regex }).populate("media_id").sort({ name: 1 }).limit(10).lean(),
      ]);

      return res.status(200).json({ message: 'Fetched all Searches', data:{pages, blogs } });
    } catch (error) { await logError(error, { function: "get_search_results", payload: req.body }); }
  }
// Search

// Browsing
  export async function create_update_browsing_history(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { module, module_id } = req.body;
      if (!module || !module_id) { return res.status(400).json({ error: "module and module_id required" }); }
      const user_id = await getUserIdFromToken(req);
      
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
    } catch (error) { await logError(error, { function: "create_update_browsing_history", payload: req.body }); }
  }
// Browsing

// export async function get_page_by_url(req: NextApiRequest, res: NextApiResponse) {
//   try {
//     const url = (req.method === "GET" ? req.query.url : req.body.url) as string;
//     if (!url) { return res.status(400).json({ message: 'Invalid or missing URL', data: null }); }

//     const data = await Page.findOne({ url }).populate([ { path: 'media_id' }, { path: 'meta_id' }, { path: 'details' } ]).exec();
//     if (!data) { return res.status(200).json({ message: 'Page not found', data: null }); }

//     const relatedContent = await getRelatedContent({ module: "Page", moduleId: data._id.toString() });
//     const blockContent = await getBlockContent({ module: "Page", moduleId: data._id.toString() });

//     return res.status(200).json({ message: 'Fetched Page Data', data, relatedContent, blockContent });
//   } catch (error) { await logError(error, { function: "get_page_by_url", payload: req.body }); }
// }

export async function get_page_by_url(req: NextApiRequest, res: NextApiResponse) {
  try {
    const url = (req.method === "GET" ? req.query.url : req.body.url) as string;
    const module = (req.method === "GET" ? req.query.module : req.body.module) as string;
    if (!url || !module) { return res.status(400).json({ message: 'Invalid or missing URL', data: null }); }
    
    const [data, registryEntry] = await Promise.all([
      Page.findOne({ url }).populate([ { path: 'media_id' }, { path: 'meta_id' }, { path: 'details' } ]).exec(),
      UrlRegistry.findOne({ url }).lean<UrlRegistryProps>()
    ]);

    if (!data) { return res.status(404).json({ message: 'Page not found' }); }

    const relatedContent = await getRelatedContent({ module, moduleId: data._id.toString() });
    const blockContent = await getBlockContent({ module, moduleId: data._id.toString() });

    const seo = registryEntry?.seo || null;
    const schema = registryEntry?.schema || null;

    return res.status(200).json({ 
      message: 'Fetched Page Data', 
      data, 
      relatedContent, 
      blockContent, 
      seo, 
      schema 
    });
  } catch (error) { 
    await logError(error, { function: "get_page_by_url", payload: req.body });
    return res.status(500).json({ message: "Internal Server Error", data: null });
  }
}

export async function get_page_static_data(req: NextApiRequest, res: NextApiResponse) {
  try {
    const [ blogs, products ] = await Promise.all([
      Blog.find({ status: true, media_id: { $exists: true, $ne: null } }).populate("media_id").sort({ name: 1 }).limit(12).lean(),
      Product.find({ status: true }).limit(12).lean().exec(),
    ]);

    return res.status(200).json({ message: 'Fetched Page Static Data', data:{blogs, products} });
  }catch (error) { await logError(error, { function: "get_page_static_data", payload: req.body }); }
}

export const functions: APIHandlers = {
  create_update_page : { middlewares: [ "checkUserId", "checkPostMethod" ], url: "/admin/pages" },
  get_filtered_pages : { middlewares: [ "checkUserId", "checkPostMethod" ], url: "/admin/pages" },
  get_single_page : { middlewares: [ "checkUserId", ], url: "/admin/pages" },
  status_switch : { middlewares: [ "checkUserId", "checkPostMethod" ] },
  get_page_by_url : { middlewares: [ "allowCrossOrigin" ] },
  fetch_modules : { middlewares: [ "allowCrossOrigin", "checkPostMethod" ] },

  get_filtered_faqs : { middlewares: [ "checkUserId", "checkPostMethod" ], url: "/admin/faqs" },
  create_update_faq : { middlewares: [ "checkUserId", "checkPostMethod" ], url: "/admin/faqs" },
  get_single_faq : { middlewares: [ "checkUserId" ], url: "/admin/faqs" },

  get_filtered_testimonials : { middlewares: [ "checkUserId", "checkPostMethod" ], url: "/admin/testimonials" },
  create_update_testimonial : { middlewares: [ "checkUserId", "checkPostMethod" ], url: "/admin/testimonials" },
  get_single_testimonial : { middlewares: [ "checkUserId" ], url: "/admin/testimonials" },

  get_filtered_achievements : { middlewares: [ "checkUserId", "checkPostMethod" ], },	
  get_single_achievement : { middlewares: [ "checkUserId", ], },
  create_update_achievement : { middlewares: [ "checkUserId", "checkPostMethod", { name: "validateInput", options: { requiredFields: [ "module",  "module_id"] }} ], },

  get_filtered_searches : { middlewares: [ "checkUserId", "checkPostMethod" ], url: "/admin/searches" },
  create_update_search : { middlewares: [ "checkUserId", "checkPostMethod" ] },
  get_search_pages : { middlewares: [ "checkPostMethod" ] },
  get_search_results : { middlewares: [ "checkPostMethod" ] },

  create_update_browsing_history : { middlewares: [ "checkUserId", "checkPostMethod" ] },
  get_page_static_data : { middlewares: [ "allowCrossOrigin" ] },
}

export const pageHandlers = {
  create_update_page,
  get_filtered_pages,
  get_single_page,
  status_switch,
  get_page_by_url,
  fetch_modules,

  get_filtered_faqs,
  create_update_faq,
  get_single_faq,

  get_filtered_testimonials,
  create_update_testimonial,
  get_single_testimonial,

  get_filtered_achievements,
  get_single_achievement,
  create_update_achievement,

  get_filtered_searches,
  create_update_search,
  get_search_pages,
  get_search_results,

  create_update_browsing_history,
  get_page_static_data
};

export const config = { api: { bodyParser: false } };
export default createApiHandler(functions, pageHandlers);