// pages/api/basic/basic

import { isValidObjectId, Types } from 'mongoose';
import type { NextApiRequest, NextApiResponse } from 'next';
import { createApiHandler, ExtendedRequest } from '../apiHandler';
import { logError, ROUTE_EXCEPTION_MAP } from '../utils';
import { APIHandlers } from 'lib/server/middleware';
import UrlRegistry from 'lib/models/basic/UrlRegistry';
import { buildFilterQuery } from 'lib/server/plugins/buildFilterQuery';
import Blog from 'lib/models/blog/Blog';
import Page from 'lib/models/basic/Page';
import Product from 'lib/models/product/Product';
import AuditLog from 'lib/models/basic/AuditLog';
import Cta from 'lib/models/basic/Cta';
import CtaCounter from 'lib/models/basic/CtaCounter';
import { clearDebugFile } from '../debug';
import { get_single_blog_by_url } from '../blog/blogs';
import { get_single_product_by_url } from '../product/product';
import { get_page_by_url } from './page';
import ErrorLog from 'lib/models/basic/ErrorLog';

// Modules
  interface ModuleData {
    _id: string;
    name: string;
    url: string;
    module: string;
  }

  export async function get_all_modules(req: NextApiRequest, res: NextApiResponse) {
    try {
      const [blogs, pages, products ] = await Promise.all([
        Blog.find({status: true}).select("_id name url").lean(),
        Page.find({ status: true, module: "Page" }).select("_id name url").lean(),
        Product.find({status: true}).select("_id name url").lean(),
      ]);

      const formattedBlogs: ModuleData[] = blogs.map((b: any) => ({ ...b, module: "Blog" }));
      const formattedPages: ModuleData[] = pages.map((b: any) => ({ ...b, module: "Page" }));
      const formattedProducts: ModuleData[] = products.map((s: any) => ({ ...s, module: "Product" }));
      const data: ModuleData[] = [ ...formattedBlogs, ...formattedPages, ...formattedProducts ];
      data.sort( (a, b) => (a.module || "").localeCompare(b.module || "") || (a.name || "").localeCompare(b.name || "") );

      return res.status(200).json({ message: "Fetched all modules successfully", data });
    } catch (error) { await logError(error, { function: "get_all_modules", payload: req.body }); return res.status(500).json({ message: "Internal Server Error" });
    }
  }
// Modules

// Audit Log
  export async function get_filtered_audit_logs(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { filters = {}, page = 0, limit = 10 } = req.body || {};
      const { matchQuery, skip, limit: safeLimit } = buildFilterQuery(filters, { page, limit, defaultLimit: 10, maxLimit: 100, searchableFields: ["module"] });
      const total = await AuditLog.countDocuments(matchQuery);

      const data = await AuditLog.find(matchQuery).populate([ { path: "module_id", select: "_id name url" }, { path: "user_id", select: "_id name email phone" }]).skip(skip).limit(safeLimit).sort({ createdAt: -1 });
      return res.status(200).json({ message: 'Fetched Filtered AuditLog', data, pagination: { total, page, limit: safeLimit, pages: Math.ceil(total / safeLimit) } });
    } catch (error) { await logError(error, { function: "get_filtered_audit_logs", payload: req.body }); }
  }

  export async function get_single_audit_log(req: NextApiRequest, res: NextApiResponse) {
    try {
      const id = (req.method === "GET" ? req.query.id : req.body.id) as string;
      if (!id || !Types.ObjectId.isValid(id)) { return res.status(400).json({ message: 'Invalid or missing ID' }); }

      const data = await AuditLog.findById(id).populate([ { path: "module_id", select: "_id name url" }, { path: "user_id", select: "_id name email phone" }]).exec();
      return res.status(200).json({ message: 'Fetched Single Audit Log', data });
    } catch (error) { await logError(error, { function: "get_single_audit_log", payload: req.body }); }
  }
// Audit Log

// Error Log
  export async function get_filtered_error_logs(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { filters = {}, page = 0, limit = 10 } = req.body || {};
      const { matchQuery, skip, limit: safeLimit } = buildFilterQuery(filters, { page, limit, defaultLimit: 10, maxLimit: 100, searchableFields: ["module", "message", "function"] });
      const total = await ErrorLog.countDocuments(matchQuery);

      const data = await ErrorLog.find(matchQuery).populate([ { path: "user_id", select: "_id name email phone" }]).skip(skip).limit(safeLimit).sort({ createdAt: -1 });
      return res.status(200).json({ message: 'Fetched Filtered ErrorLog', data, pagination: { total, page, limit: safeLimit, pages: Math.ceil(total / safeLimit) } });
    } catch (error) { await logError(error, { function: "get_filtered_error_logs", payload: req.body }); return res.status(500).json({ message: "Internal Server Error", data: null }); }
  }

  export async function clear_error_log(req: NextApiRequest, res: NextApiResponse) {
    try {
      await Promise.all([
              ErrorLog.deleteMany({}),
            ]);
      return res.status(200).json({ message: 'ErrorLogs Cleared', data: true });
    } catch (error) { await logError(error, { function: "clear_error_log", payload: req.body }); return res.status(500).json({ message: "Internal Server Error", data: null }); }
  }

  export async function clear_single_error_log(req: NextApiRequest, res: NextApiResponse) {
    try {
      const {_id} = req.body;
      if (!_id || !Types.ObjectId.isValid(_id)) { return res.status(400).json({ message: 'Invalid or missing ID' }); }

      await ErrorLog.deleteOne({ _id });
      return res.status(200).json({ message: 'Single ErrorLog Deleted', data: true });
    } catch (error) { await logError(error, { function: "clear_single_error_log", payload: req.body }); return res.status(500).json({ message: "Internal Server Error", data: null }); }
  }
// Error Log

// WhatsApp
  export async function track_whats_app(req: ExtendedRequest, res: NextApiResponse) {
    try {
      const { type, page_url, message, clicked_on, utm_source, utm_medium, utm_campaign, } = req.body;
      if (!page_url) { return res.status(400).json({ message: '❌ page_url is required', }); }

      const ctaEntry = await Cta.create({
        type,
        page_url,
        message,
        clicked_on,
        device: req.headers['user-agent'],
        utm_source,
        utm_medium,
        utm_campaign,
      });

      const counterDate = new Date();
      counterDate.setHours(0, 0, 0, 0);

      await CtaCounter.findOneAndUpdate(
        { type, counter_date: counterDate },
        {
          $inc: { clicks: 1 },
        }, { upsert: true, new: true, }
      );

      return res.status(201).json({ message: '✅ Entry created successfully', data: true });
    } catch (error) { await logError(error, { function: "create_update_module_model", payload: req.body }); }
  }

  export async function get_filtered_ctas(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { filters = {}, page = 0, limit = 10 } = req.body || {};
      const { matchQuery, skip, limit: safeLimit } = buildFilterQuery(filters, { page, limit, defaultLimit: 10, maxLimit: 100, searchableFields: ["module", "message", "function"] });
      const total = await Cta.countDocuments(matchQuery);

      const data = await Cta.find(matchQuery).skip(skip).limit(safeLimit).sort({ createdAt: -1 });
      return res.status(200).json({ message: 'Fetched Filtered Cta', data, pagination: { total, page, limit: safeLimit, pages: Math.ceil(total / safeLimit) } });
    } catch (error) { await logError(error, { function: "get_filtered_ctas", payload: req.body }); return; }
  }

  export async function get_filtered_cta_counter(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { filters = {}, page = 0, limit = 10 } = req.body || {};
      const { matchQuery, skip, limit: safeLimit } = buildFilterQuery(filters, { page, limit, defaultLimit: 10, maxLimit: 100, searchableFields: ["module", "message", "function"] });
      const total = await CtaCounter.countDocuments(matchQuery);

      const data = await CtaCounter.find(matchQuery).skip(skip).limit(safeLimit).sort({ createdAt: -1 });
      return res.status(200).json({ message: 'Fetched Filtered Cta Counter', data, pagination: { total, page, limit: safeLimit, pages: Math.ceil(total / safeLimit) } });
    } catch (error) { await logError(error, { function: "get_filtered_cta_counter", payload: req.body }); return; }
  }
// WhatsApp

// Routing
  export const MODULE_HANDLER_MAP: Record<string, (req: NextApiRequest, res: NextApiResponse) => Promise<any>> = {
    Blog: get_single_blog_by_url,
    Page: get_page_by_url,
    Product: get_single_product_by_url,
  };
  
  export async function resolve_route(req: NextApiRequest, res: NextApiResponse) {
    clearDebugFile();

    try {
      const rawUrl = (req.method === "GET" ? req.query.url || req.query.slug : req.body.url) as string;
      if (!rawUrl) { return res.status(400).json({ message: "Invalid or missing URL", data: null }); }

      let decodedUrl = rawUrl;

      try {
        decodedUrl = decodeURIComponent(rawUrl);
      } catch {
        decodedUrl = rawUrl;
      }

      const cleanInputUrl = decodedUrl.replace(/^\/+/, "").trim();
      const normalizedUrlWithSlash = `/${cleanInputUrl}`;

      let registryEntry = await UrlRegistry.findOne({
        $or: [
          { url: rawUrl },
          { url: decodedUrl },
          { url: cleanInputUrl },
          { url: normalizedUrlWithSlash },
        ],
      }).lean() as any;
      if (!registryEntry) { return res.status(404).json({ message: `Route with URL '${rawUrl}' not found`, data: null }); }

      const moduleType = registryEntry.module;
      const routeExceptionKey = registryEntry.name?.trim().toLowerCase();
      const routeException = ROUTE_EXCEPTION_MAP[routeExceptionKey];
      const handler = MODULE_HANDLER_MAP[moduleType];
      req.query.module = moduleType;
      req.query.type = moduleType;
      req.query.id = registryEntry.module_id?.toString();

      let capturedData: any = null;
      let statusCode = 200;

      const mockRes: any = {
        ...res,
        status: (code: number) => {
          statusCode = code;
          return mockRes;
        },
        json: (payload: any) => {
          capturedData = payload;
          return payload;
        },
        send: (payload: any) => {
          capturedData = payload;
          return payload;
        },
      };
      await handler(req, mockRes as NextApiResponse);

      capturedData.module = moduleType;

      return res.status(statusCode).send(capturedData);
    } catch (error) {
      await logError(error, {
        function: "resolve_route",
        payload: req.body || req.query,
      });

      return res.status(500).json({
        message: "Internal Server Error",
        data: null,
      });
    }
  }

  export async function get_filtered_url_registry(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { filters = {}, page = 0, limit = 10 } = req.body || {};
      const { matchQuery, skip, limit: safeLimit } = buildFilterQuery(filters, { page, limit, defaultLimit: 10, maxLimit: 100, searchableFields: ["name", "url"],
       objectIdFields: ["module_id"] });
      const total = await UrlRegistry.countDocuments(matchQuery);

      const data = await UrlRegistry.find(matchQuery).skip(skip).limit(safeLimit).sort({ createdAt: -1 });
      return res.status(200).json({ message: 'Fetched Filtered UrlRegistry', data, pagination: { total, page, limit: safeLimit, pages: Math.ceil(total / safeLimit) } });
    } catch (error) { await logError(error, { function: "get_filtered_url_registry", payload: req.body }); return; }
  }

  export async function get_single_url_registry(req: NextApiRequest, res: NextApiResponse){
    try{
      const { id } = req.body;
      if (!id || !Types.ObjectId.isValid(id)) { return res.status(400).json({ success: false, error: 'Invalid or missing ID' }); }    
    
      const entry = await UrlRegistry.findById(id).exec();  
      if (!entry) { return res.status(404).json({ message: `UrlRegistry with ID ${id} not found` }); }
    
      return res.status(200).json({ message: '✅ Single Entry Fetched', data: entry });
    }catch (error) { await logError(error, { function: "get_single_url_registry", payload: req.body }); }
  };

  export async function update_url_registry(req: ExtendedRequest, res: NextApiResponse) {
    try {
      const data = req.body;

      const modelId = typeof data._id === 'string' || data._id instanceof Types.ObjectId ? data._id : null;

      if (modelId && isValidObjectId(modelId)) {
        try {
          const updated = await UrlRegistry.findByIdAndUpdate(modelId, {
              name: data.name,
              url: data.url,
              updatedAt: new Date(),
            }, { new: true });

          return res.status(200).json({ message: '✅ Entry updated successfully', data: updated });
        } catch (error) { await logError(error, { function: "update_url_registry", payload: req.body }); }
      }

      return res.status(500).json({ message: 'Error: Creation is prohibuted', data: null });
    } catch (error) { await logError(error, { function: "update_url_registry", payload: req.body }); }
  }
// Routing

export const functions: APIHandlers = {
  get_all_modules : { middlewares: [ "checkUserId", ] },
  get_filtered_audit_logs : { middlewares: [ "checkUserId", "checkPostMethod" ], url: "/admin/audit-log" },
  get_single_audit_log : { middlewares: [ "checkUserId" ], url: "/admin/audit-log" },

  get_filtered_error_logs : { middlewares: [ "checkUserId", "checkPostMethod" ], url: "/admin/error-log" },
  clear_error_log : { middlewares: [ "checkUserId", "checkPostMethod" ], url: "/admin/error-log" },
  clear_single_error_log : { middlewares: [ "checkUserId", "checkPostMethod" ], url: "/admin/error-log" },

  track_whats_app : { middlewares: [] },
  get_filtered_ctas : { middlewares: [ "checkUserId", "checkPostMethod" ], url: "/admin/cta" },
  get_filtered_cta_counter : { middlewares: [ "checkUserId", "checkPostMethod" ], url: "/admin/cta-counter" },

  resolve_route : { middlewares: [] },
  get_filtered_url_registry : { middlewares: [ "checkUserId", "checkPostMethod" ], url: "/admin/url-registry" },
  get_single_url_registry : { middlewares: [ "checkUserId", "checkPostMethod"] },
  update_url_registry : { middlewares: [ "checkUserId", "checkPostMethod" ], url: "/admin/client" },
}

export const routingHandlers = {
  get_all_modules,
  get_filtered_audit_logs,
  get_single_audit_log,

  get_filtered_error_logs,
  clear_error_log,
  clear_single_error_log,

  track_whats_app,
  get_filtered_ctas,
  get_filtered_cta_counter,

  resolve_route,
  get_filtered_url_registry,
  get_single_url_registry,
  update_url_registry,
};

export const config = { api: { bodyParser: false } };
export default createApiHandler(functions, routingHandlers);