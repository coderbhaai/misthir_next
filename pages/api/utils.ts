import mongoose, { Types } from "mongoose";
import Page from "lib/models/basic/Page";
import Blog from "lib/models/blog/Blog";
import Faq from "lib/models/basic/Faq";
import Testimonial from "lib/models/basic/Testimonial";
import CommentModel from 'lib/models/basic/Comment';
import GenericBlock from "lib/models/block/GenericBlock";
import BlockDetail from "lib/models/block/BlockDetail";
import Achievement from "lib/models/basic/Achievement";
import ErrorLog from "lib/models/basic/ErrorLog";
import { AnyModel } from "lib/models";
import sanitizeHtml from "sanitize-html";
import { NextApiRequest } from "next";
import { getSitemapData } from "./basic/meta";
import Client from "lib/models/basic/Client";
import Product from "lib/models/product/Product";
import ProductProductmeta from "lib/models/product/ProductProductmeta";

export const sanitizeText = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

// Logging & Errors
  type ErrorContext = {
    api?: string;
    function?: string;
    module?: string;
    payload?: any;
    user_id?: string;
  };

  function normalizePayload(payload: any) {
    if (payload === undefined) return undefined;

    // If it's already a plain object, stringify values safely
    if (typeof payload === "object") {
      return Object.fromEntries(
        Object.entries(payload).map(([key, value]) => [
          key,
          Array.isArray(value) || typeof value === "object"
            ? JSON.stringify(value)
            : value,
        ])
      );
    }

    // Fallback for primitives
    return JSON.stringify(payload);
  }

  export async function logError(error: any, context?: ErrorContext) {
    try {
      console.log("ERROR", error)

      console.log("logError", {
        message: error?.message || "Unknown error",
        stack: error?.stack,
        api: context?.api,
        function: context?.function,
        module: context?.module,
        payload: normalizePayload(context?.payload),
        user_id: context?.user_id,
        level: "ERROR",
      });

      await ErrorLog.create({
        message: error?.message || "Unknown error",
        stack: error?.stack,
        api: context?.api,
        function: context?.function,
        module: context?.module,
        payload: normalizePayload(context?.payload),
        user_id: context?.user_id,
        level: "ERROR",
      });
    } catch (loggingError) { console.error("❌ Failed to log error:", loggingError); }
  }
// Logging & Errors

export async function pivotEntry(
  model: AnyModel,
  parentId: mongoose.Types.ObjectId | string,
  childIds: (mongoose.Types.ObjectId | string)[] | undefined | null,
  parentKey: string,
  childKey: string
): Promise<void> {
  try {
    const parentObjectId = new mongoose.Types.ObjectId(parentId);
    await model.deleteMany({ [parentKey]: parentObjectId });

    if (Array.isArray(childIds) && childIds.length > 0) {
      const uniqueChildIds = Array.from(new Set(childIds.map(id => id.toString())));

      const entries = uniqueChildIds.map((childId) => ({
        [parentKey]: parentObjectId,
        [childKey]: new mongoose.Types.ObjectId(childId),
        createdAt: new Date(),
      }));

      await model.insertMany(entries);
    }
  } catch (error) {
    await logError(error, { function: "pivotEntry", payload: {model, parentId, childIds, parentKey, childKey} });
  }
}

export async function getRelatedContent({ module, moduleId }: { module: string; moduleId: string }) {
  try {
    const id = new Types.ObjectId(moduleId);
    const moduleFilter = { module, module_id: id, status: true };
    const blogFilter = { status: true, ...(module === "Blog" && { _id: { $ne: id } }) };
    const mediaSelect = "_id url path alt";

    let products: any[] = [];
    if (module === "Product") {
      const currentProductTypes = await ProductProductmeta.find({ product_id: id }).select("productmeta_id").lean().exec();
      const typeIds = currentProductTypes.map((pt: any) => pt.productmeta_id);
      let relatedProductIds: Types.ObjectId[] = [];
    
      if (typeIds.length > 0) {
        const matchingRelations = await ProductProductmeta.find({ productmeta_id: { $in: typeIds }, product_id: { $ne: id } }).select("product_id").lean().exec();
        relatedProductIds = matchingRelations.map((rel: any) => rel.product_id);
      }
    
      if (relatedProductIds.length > 0) {
        products = await Product.find({ _id: { $in: relatedProductIds }, status: true }).populate([{ path: "mediaHubs", populate: { path: "media_id", model: "Media", select: "_id path alt" } }]).limit(10).lean().exec();
      }
    }

    if (products.length < 10) {
      const excludeIds = module === "Product" ? [id, ...products.map((p: any) => p._id)] : products.map((p: any) => p._id);
  
      const fallbackProducts = await Product.find({ _id: { $nin: excludeIds }, status: true }).populate([{ path: "mediaHubs", populate: { path: "media_id", model: "Media", select: "_id path alt" } }]).limit(10 - products.length).lean().exec();
        
      products = [...products, ...fallbackProducts];
    }

    console.log("PRODUCTS", products);

    const [faq, testimonials, achievements, comments, blogs] = await Promise.all([
      Faq.find(moduleFilter).select("_id question answer displayOrder").sort({ displayOrder: 1, createdAt: -1 }).lean().exec(),
      Testimonial.find(moduleFilter).select("_id content name designation company_name user_id displayOrder").sort({ displayOrder: 1, createdAt: -1 }).lean().exec(),
      Achievement.find(moduleFilter).select("_id title description value displayOrder").sort({ displayOrder: 1, createdAt: -1 }).lean().exec(),
      CommentModel.find({ module, module_id: moduleId, status: true }).select("_id name comment createdAt").sort({ displayOrder: 1, createdAt: -1 }).lean().exec(),
      Blog.find(blogFilter).select('_id name url media_id createdAt').populate([ { path: 'media_id', select: mediaSelect } ]).limit(10).lean().exec(),
    ]);

    const sanitizedTestimonials = testimonials.map((t: any) => ({ ...t, content: typeof t.content === "string" ? sanitizeHtml(t.content) : "" }));
  
    return { faq, testimonials: sanitizedTestimonials, achievements, comments, blogs, products };
  } catch (error) { 
    await logError(error, { function: 'getRelatedContent', payload: {} });
    return { faq: [], testimonials: [], achievements: [], comments: [], blogs: [], products: [] }; 
  }
}

export async function getBlockContent({ module, moduleId }: { module: string; moduleId: string }) {
  try {
    const id = new Types.ObjectId(moduleId);
    const mediaSelect = "url alt path";

    const [genericBlocks, blockDetails] = await Promise.all([
      GenericBlock.find({ module, module_id: id, status: true }).sort({ displayOrder: 1, createdAt: -1 }).populate([ { path: "media_id", select: mediaSelect }, { path: "mobile_media_id", select: mediaSelect } ]).lean().exec(),
      BlockDetail.find({ module, module_id: id, status: true }).populate([ { path: "media_id", select: mediaSelect }, { path: "mobile_media_id", select: mediaSelect } ]).lean().exec()
    ]);

    return { genericBlocks, blockDetails };
  } catch (error) { await logError(error, { function: "getBlockContent", payload: { module, moduleId } }); return { genericBlocks: [], blockDetails: [] }; }
}

export async function getGenericContent() {
  try{
    const [blogs, products] = await Promise.all([
      Blog.find({ status: true }).populate([ { path: 'media_id' }, { path: 'metas', populate: { path: 'blogmeta_id', model: 'Blogmeta', select: '_id type name url' } } ]).limit(10).lean().exec(),
      Product.find({ status: true }).populate([{ path: "mediaHubs", populate: { path: "media_id", model: "Media", select: "_id path alt" } }]).limit(10).lean().exec(),
    ]);
  
    return { blogs, products };
  }catch (error) { await logError(error, { function: 'getGenericContent', payload: {} }); }
}

export function toObjectId(id: string | mongoose.Types.ObjectId | null | undefined) {
  if (!id) return null;

  try {
    return typeof id === "string" ? new mongoose.Types.ObjectId(id) : id;
  }catch (error) { logError(error, { function: 'toObjectId', payload: {id} }); return null; }
}

export const safeParse = (value: any) => {
  try {
    return typeof value === "string" ? JSON.parse(value) : [];
  } catch {
    return [];
  }
};

export function getDuplicateKeyErrorMessage(error: any): string | null {
  if (error && error.code === 11000 && error.keyValue) {
    const fields = Object.keys(error.keyValue);
    // Capitalize the field name for the toast message
    const fieldName = fields[0] ? fields[0].charAt(0).toUpperCase() + fields[0].slice(1) : "Field";
    const duplicateValue = error.keyValue[fields[0]];
    
    return `❌ ${fieldName} '${duplicateValue}' is already registered. Please use another one.`;
  }
  return null;
}

export const cleanContent = (html: string | undefined | null) => {
  if (!html || typeof html !== 'string') return '';

  const removeEmptyParagraphs = html.replace(/<p>(\s|&nbsp;|<br\s*\/?>)*<\/p>/gi, '');

  return sanitizeHtml(removeEmptyParagraphs, {
    allowedTags: [ 
      'p', 'b', 'i', 'em', 'strong', 'a', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4',
      'figure', 'img', 'blockquote', 'table', 'thead', 'tbody', 'tr', 'th', 'td'
    ],
    allowedAttributes: {
      'a': [ 'href', 'name', 'target' ],
      'img': [ 'src', 'alt', 'width', 'height', 'style' ],
      'figure': [ 'class' ]
    },
    allowedStyles: {
      'img': {
        'aspect-ratio': [/^\d+\/\d+$/],
        'width': [/^\d+(px|%)?$/],
        'height': [/^\d+(px|%)?$/]
      }
    }
  });
};

export const checkNullValue = (value: any) => {
  try {
    if ( value === 0 || value === null || value === "undefined" ) { return null; }
    return value;
  } catch { return value; }
}

export function normalizeError(error: any) {
  if (error?.code === 11000) {
    return {
      type: "DUPLICATE_KEY",
      field: Object.keys(error.keyPattern || {})[0],
      message: "Duplicate value found"
    };
  }

  return {
    type: "UNKNOWN",
    message: error?.message || "Error in normalizeError"
  };
}

export async function findIdInDB(id: string) {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log("❌ Invalid ObjectId:", id);
      return [];
    }

    const objectId = new mongoose.Types.ObjectId(id);
    const db = mongoose.connection.db;

    if (!db) {
      throw new Error("MongoDB database connection is not available");
    }

    const collections = await db.listCollections().toArray();

    const results: any[] = [];

    for (const collection of collections) {
      try {
        const document = await db.collection(collection.name).findOne({
          _id: objectId
        });

        if (document) {
          results.push({
            collection: collection.name,
            id: document._id?.toString(),
            document
          });
        }
      } catch (error) { await logError(error, { function: "findIdInDB", payload: { id } }); }
    }

    return results;
  } catch (error) {
    console.error("❌ [findIdInDB] ERROR:", error);
    return [];
  }
}

export function numberOrDefault(value: any): number {
  const n = Number(value);
  return isNaN(n) ? 0 : n;
}

// Exceptions
type RouteExceptionContext = {
  req: NextApiRequest;
  registryEntry: any;
  englishRegistryEntry: any;
  englishLangDoc: any;
  targetLangDoc: any;
  lang: string;
  moduleType: string;
  cleanMasterSlug: string;
};

type RouteExceptionHandler = (
  context: RouteExceptionContext
) => Promise<any>;

export const ROUTE_EXCEPTION_MAP: Record<string, RouteExceptionHandler> = {
  sitemap: getSitemapRouteData,
  "our clients": getClientData,
};

export async function getSitemapRouteData({registryEntry, englishRegistryEntry}: {
  req: NextApiRequest;
  registryEntry: any;
  englishRegistryEntry: any;
  lang: string;
}) {
  const sitemapData = await getSitemapData();

  return { data: sitemapData };
}

export async function getClientData() {
  const clients = await Client.find({ status: true }).populate("media_id").lean();

  return { data: clients };
}
// Exceptions

export function escapeRegExp(string: string) { return string.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }