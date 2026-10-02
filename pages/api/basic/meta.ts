import path from "path";
import fs from "fs";
import { format } from "date-fns";
import mongoose, { isValidObjectId, Types } from 'mongoose';
import type { NextApiRequest, NextApiResponse } from 'next';
import Meta from 'lib/models/basic/Meta';
import { logError } from '../utils';
import Blog from 'lib/models/blog/Blog';
import Page from 'lib/models/basic/Page';
import { createApiHandler } from '../apiHandler';
import { APIHandlers } from 'lib/server/middleware';
import UrlRegistry from 'lib/models/basic/UrlRegistry';
import Testimonial from 'lib/models/basic/Testimonial';
import Faq from 'lib/models/basic/Faq';
import { AnyModel } from 'lib/models';
import Product from "lib/models/product/Product";
import { buildFilterQuery } from "lib/server/plugins/buildFilterQuery";
import ProductBrand from "lib/models/product/ProductBrand";
import ProductFeature from "lib/models/product/ProductFeature";
import Productmeta from "lib/models/product/Productmeta";

type MetaInput = {
  meta_id: mongoose.Types.ObjectId | string | null;
  url: string;
  title: string;
  description: string;
};

async function create_update_meta(req: NextApiRequest, res: NextApiResponse) {
  try {
    const data = req.body;
    if (!data?.title || !data?.description || !data?.url) {
      return res.status(400).json({ message: 'Required fields missing' });
    }

    const modelId = (typeof data._id === 'string' || data._id instanceof Types.ObjectId) ? data._id : null;
    const slug = await slugify(data.url, Meta, modelId);

    if (data._id) {
      const updated = await Meta.findByIdAndUpdate(
        data._id,
        {
          url: slug,
          title: data.title,
          description: data.description,
          updatedAt: new Date(),
        },
        { new: true }
      );

      if (updated) {
        return res.status(200).json({ message: 'Entry updated successfully', data: updated });
      }
    }

    const newEntry = new Meta({
      url: slug,
      title: data.title,
      description: data.description,
    });

    await newEntry.save();

    return res.status(201).json({ message: 'Entry created successfully', data: newEntry });
  } catch (error) { await logError(error, { function: "create_update_meta", payload: req.body }); }
}

export async function upsertMeta({ meta_id, url, title, description }: MetaInput): Promise<string | null> {
  try {
    if (!url || !title || !description) { throw new Error('URL, title, and description are required'); }
    
    let entry;
    if (meta_id && isValidObjectId(meta_id)) {
      entry = await Meta.findByIdAndUpdate(
        meta_id,
        { url, title, description },
        { new: true, runValidators: true }
      );
    } else {
      entry = await Meta.create({ url, title, description });
    }

    if (!entry) {
      throw new Error('Database operation failed - no entry returned');
    }

    return entry._id.toString();
  } catch (error) { await logError(error, { function: "get_city_options", payload: { meta_id, url, title, description } }); return null; }
};

export async function get_filtered_meta(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { filters = {}, page = 0, limit = 10 } = req.body || {};
    const { matchQuery, skip, limit: safeLimit } = buildFilterQuery(filters, { page, limit, defaultLimit: 10, maxLimit: 100, searchableFields: ["name", "url"] });
    const total = await Meta.countDocuments(matchQuery);

    const data = await Meta.find(matchQuery).skip(skip).limit(safeLimit).exec();
    return res.status(200).json({ message: 'Fetched all Metas', data, pagination: { total, page, limit: safeLimit, pages: Math.ceil(total / safeLimit) } });
  } catch (error) { await logError(error, { function: "get_filtered_meta", payload: req.body }); }
}

export async function get_single_meta(req: NextApiRequest, res: NextApiResponse){
  const id = (req.method === 'GET' ? req.query.id : req.body.id) as string;

  if (!id || !Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid or missing ID' });
  }

  const entry = await Meta.findById(id).exec();
  if (!entry) { return res.status(404).json({ message: `Meta with ID ${id} not found` }); }

  return res.status(200).json({ message: '✅ Single Entry Fetched', data: entry });
};

// SEO Functions
  export const slugify = async (
    url: string, 
    model: AnyModel, 
    model_id?: string | Types.ObjectId | null
  ): Promise<string> => {
    const id = model_id instanceof Types.ObjectId ? model_id.toString() : model_id;

    let slug = url
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Strip diacritics for Latin-based alphabets
      .toLowerCase()
      .trim()
      .replace(/\s+/gu, '-')          // Convert all spaces/newlines to hyphens
      .replace(/[^\p{L}\p{N}-]+/gu, '') // Allow international letters, numbers, and hyphens
      .replace(/-+/g, "-")            // Collapse multiple hyphens
      .replace(/^-+|-+$/g, "");       // Trim leading/trailing hyphens

    if (url === "/" || !slug) { return "/"; }

    const existingDoc = await model.findOne({ url: slug });

    if (existingDoc && (!id || existingDoc._id.toString() !== id)) {
      let counter = 1;
      let newSlug = `${slug}-${counter}`;

      while (await model.findOne({ url: newSlug })) {
        counter++;
        newSlug = `${slug}-${counter}`;
      }

      slug = newSlug;
    }

    return slug;
  };

  export const generateSitemap = async () => {
    try {
      syncUrlRegistry();

      const site = "https://www.misthir.com";

      const urlRegistry = await UrlRegistry.find({
        url: { $ne: "/" },
        $or: [
          { "seo.robots": { $exists: false } },
          { "seo.robots": { $regex: /index/i } },
        ],
      }).select("url module module_id seo updatedAt");

      const today = format(new Date(), "yyyy-MM-dd'T'HH:mm:ssXXX");

      const uniqueUrls = new Map<string, { url: string; updatedAt?: Date; priority: number }>();

      uniqueUrls.set(site, { url: "/", priority: 1.0 });

      urlRegistry.forEach((item) => {
        if (!item.url) return;

        const url = item.url.startsWith("/") ? item.url : `/${item.url}`;
        if (uniqueUrls.has(url)) return;

        const priority = item.module === "Blog" ? 0.8 : item.module === "Page" ? 0.9 : 0.85;

        uniqueUrls.set(url, {
          url,
          updatedAt: item.updatedAt,
          priority,
        });
      });

      const urlEntry = (item: { url: string; updatedAt?: Date; priority: number }) => `
        <url>
          <loc>${site}${item.url === "/" ? "" : item.url}</loc>
          <lastmod>${item.updatedAt ? format(item.updatedAt, "yyyy-MM-dd'T'HH:mm:ssXXX") : today}</lastmod>
          <priority>${item.priority.toFixed(2)}</priority>
        </url>
      `;

      const sitemapXML = `<?xml version="1.0" encoding="UTF-8"?>
        <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
          ${Array.from(uniqueUrls.values()).map(urlEntry).join("")}
        </urlset>`;

      const sitemapPath = path.join(process.cwd(), "public", "sitemap.xml");

      fs.writeFileSync(sitemapPath, sitemapXML);

      const imageSitemapXML = `<?xml version="1.0" encoding="UTF-8"?>
        <urlset xmlns="http://www.google.com/schemas/sitemap-image/1.1">
        </urlset>`;

      fs.writeFileSync(path.join(process.cwd(), "public", "sitemap-image.xml"), imageSitemapXML);

      const newsSitemapXML = `<?xml version="1.0" encoding="UTF-8"?>
        <urlset xmlns="http://www.google.com/schemas/sitemap-news/0.9">
        </urlset>`;

      fs.writeFileSync(path.join(process.cwd(), "public", "news-sitemap.xml"), newsSitemapXML);

      const urls = Array.from(uniqueUrls.values()).map((item) => `${site}${item.url === "/" ? "" : item.url}`);

      urls.push(`${site}/sitemap.xml`);
      urls.push(`${site}/sitemap-image.xml`);
    } catch (error) {
      await logError(error, { function: "generateSitemap", payload: {} });
    }
  };

  export interface ModelSyncConfig {
    module: string;
    model: any;
    urlField?: string;
    isDynamicModule?: boolean;
  }

  const generateSchemaPayload = (
    doc: any, 
    moduleName: string, 
    urlValue: string, 
    mediaPath: string | null, 
    siteUrl: string, 
    faqs: any[], 
    testimonials: any[],
    langCode: string = "en"
  ) => {
    const docTitle = doc.title || doc.name || moduleName;
    const docDesc = doc.description || doc.summary || `${docTitle} - Detailed information and offerings.`;
    const canonicalUrl = `${siteUrl}/${urlValue}`;
    const siteName = "Amitkk";
    const logoUrl = `${siteUrl}/images/logo.svg`;

    // Ensure image is an absolute URL
    const absoluteImagePath = mediaPath 
      ? (mediaPath.startsWith('http') ? mediaPath : `${siteUrl}${mediaPath.startsWith('/') ? '' : '/'}${mediaPath}`)
      : null;

    const organizationNode = {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      "name": siteName,
      "url": siteUrl,
      "logo": {
        "@type": "ImageObject",
        "@id": `${siteUrl}/#logo`,
        "url": logoUrl
      },
      "sameAs": [
        "https://www.facebook.com/Amitkk-110578507216727",
        "https://www.instagram.com/_amitkk_/",
        "https://www.linkedin.com/in/amitkhare588/"
      ]
    };

    const breadcrumbNode = {
      "@type": "BreadcrumbList",
      "@id": `${canonicalUrl}#breadcrumb`,
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": siteUrl
        },
        ...(urlValue && urlValue !== "" ? [
          {
            "@type": "ListItem",
            "position": 2,
            "name": moduleName,
            "item": `${siteUrl}/${moduleName.toLowerCase()}`
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": docTitle,
            "item": canonicalUrl
          }
        ] : [])
      ]
    };

    let mainEntityNodeType = "WebPage";
    const normalizedModule = moduleName.toLowerCase();
    const normalizedTitle = docTitle.toLowerCase();

    if (normalizedModule === "blog") mainEntityNodeType = "BlogPosting";
    else if (normalizedModule === "service") mainEntityNodeType = "Service";
    else if (normalizedModule === "technology") mainEntityNodeType = "TechArticle";
    else if (normalizedModule === "portfolio") mainEntityNodeType = "CreativeWork";
    else if (normalizedModule === "about" || normalizedTitle.includes("about")) mainEntityNodeType = "AboutPage";
    else if (normalizedModule === "contact" || normalizedTitle.includes("contact")) mainEntityNodeType = "ContactPage";

    let mainEntityNode: any;

    if (normalizedModule === "blog") {
      mainEntityNode = {
        "@type": "BlogPosting",
        "@id": `${canonicalUrl}#webpage`,
        "url": canonicalUrl,
        "inLanguage": langCode,
        "headline": docTitle,
        "name": docTitle,
        "description": docDesc,
        ...(absoluteImagePath && { "image": { "@type": "ImageObject", "url": absoluteImagePath } }),
        "datePublished": doc.createdAt || new Date().toISOString(),
        "dateModified": doc.updatedAt || new Date().toISOString(),
        "author": {
          "@type": "Person",
          "name": doc.author || siteName
        },
        "publisher": {
          "@id": `${siteUrl}/#organization`
        },
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": canonicalUrl
        }
      };
    } else if (normalizedModule === "service") {
      mainEntityNode = {
        "@type": "Service",
        "@id": `${canonicalUrl}#service`,
        "name": docTitle,
        "description": docDesc,
        "inLanguage": langCode,
        "provider": {
          "@id": `${siteUrl}/#organization`
        },
        "areaServed": {
          "@type": "AdministrativeArea",
          "name": "Middle East"
        },
        ...(absoluteImagePath && { "image": absoluteImagePath })
      };
    } else if (normalizedModule === "technology") {
      mainEntityNode = {
        "@type": "TechArticle",
        "@id": `${canonicalUrl}#technology`,
        "headline": docTitle,
        "name": docTitle,
        "description": docDesc,
        "inLanguage": langCode,
        "publisher": {
          "@id": `${siteUrl}/#organization`
        },
        ...(absoluteImagePath && { "image": absoluteImagePath })
      };
    } else if (normalizedModule === "portfolio") {
      mainEntityNode = {
        "@type": "CreativeWork",
        "@id": `${canonicalUrl}#portfolio`,
        "name": docTitle,
        "description": docDesc,
        "inLanguage": langCode,
        "creator": {
          "@id": `${siteUrl}/#organization`
        },
        ...(absoluteImagePath && { "image": absoluteImagePath })
      };
    } else {
      mainEntityNode = {
        "@type": mainEntityNodeType,
        "@id": `${canonicalUrl}#webpage`,
        "url": canonicalUrl,
        "name": docTitle,
        "description": docDesc,
        "inLanguage": langCode,
        "publisher": {
          "@id": `${siteUrl}/#organization`
        },
        ...(absoluteImagePath && { "image": absoluteImagePath })
      };
    }

    const graphEntities: any[] = [organizationNode, breadcrumbNode, mainEntityNode];

    if (faqs && faqs.length > 0) {
      graphEntities.push({
        "@type": "FAQPage",
        "@id": `${canonicalUrl}#faq`,
        "inLanguage": langCode,
        "mainEntity": faqs.map((faq: any) => ({
          "@type": "Question",
          "name": faq.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.answer
          }
        }))
      });
    }

    if (testimonials && testimonials.length > 0) {
      const reviewNodes = testimonials.map((t: any, index: number) => {
        const clientName = t.client_id?.name || "Verified Customer";
        const ratingValue = t.rating || 5;

        return {
          "@type": "Review",
          "@id": `${canonicalUrl}#review-${index}`,
          "itemReviewed": {
            "@id": `${siteUrl}/#organization`
          },
          "author": {
            "@type": "Person",
            "name": clientName
          },
          "reviewRating": {
            "@type": "Rating",
            "ratingValue": ratingValue,
            "bestRating": "5"
          },
          "reviewBody": t.content
        };
      });

      graphEntities.push(...reviewNodes);
    }

    return {
      "@context": "https://schema.org",
      "@graph": graphEntities
    };
  };

  export async function getResolvedSeoPayload(metaId: string | Types.ObjectId | null, defaultDoc: any, moduleName: string, urlValue: string, siteUrl: string) {
    let docTitle = defaultDoc.title || defaultDoc.name || moduleName;
    let docDesc = defaultDoc.description || defaultDoc.summary || `${docTitle} - Detailed information and offerings.`;
    let noIndex = defaultDoc.noIndex || false;

    const canonicalUrl = `${siteUrl}/${urlValue}`;
    const mediaObj = defaultDoc.media_id;
    const mediaPath = mediaObj?.path || mediaObj?.url || null;

    return {
      meta_id: metaId ? String(metaId) : null,
      title: docTitle,
      description: docDesc,
      robots: noIndex ? "noindex,nofollow" : "index,follow",
      canonical: canonicalUrl,
      ogType: "website",
      ogTitle: docTitle,
      ogDescription: docDesc,
      ogImage: mediaPath,
      twitterCard: "summary_large_image",
      twitterTitle: docTitle,
      twitterDescription: docDesc,
      twitterImage: mediaPath,
      noIndex: noIndex,
      path: urlValue,
    };
  }

  export async function syncUrlRegistry(batchSize = 1000) {
  try {
    const MODELS_TO_SYNC: ModelSyncConfig[] = [
      { module: 'Blog', model: Blog },
      { module: 'ProductBrand', model: ProductBrand },
      { module: 'Product', model: Product },
      { module: 'ProductFeature', model: ProductFeature },
      { module: 'Productmeta', model: Productmeta },
      { module: 'Page', model: Page, isDynamicModule: true },
    ];

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.misthir.com";
    const processedUrls: string[] = [];
    const specializedModules = ['Blog'];

    for (const config of MODELS_TO_SYNC) {
      const { module: fallbackModuleName, model, urlField = 'url', isDynamicModule } = config;
      let bulkOps: any[] = [];

      const cursor = model.find({ [urlField]: { $exists: true,$ne: '' } }).populate([ 
          { path: 'media_id', select: 'path url', strictPopulate: false }, 
          { path: 'meta_id', select: 'title description noIndex', strictPopulate: false } 
        ]).lean().cursor();

      let docCount = 0;
      for await (const doc of cursor as any) {
        docCount++;
        const nameValue = doc.name || doc.title || doc.page_name || "Untitled Resource";
        const urlValue = doc[urlField];
        const moduleName = isDynamicModule ? (doc.module || fallbackModuleName) : fallbackModuleName;
        if (isDynamicModule && specializedModules.includes(moduleName)) { continue; }        

        const moduleIdObj = doc._id as Types.ObjectId;
        processedUrls.push(urlValue);
        const mediaObj = doc.media_id || (doc.medias && doc.medias[0]);
        const mediaPath = mediaObj?.path || mediaObj?.url || mediaObj?.cloudflare || null;        
        const moduleRegex = new RegExp(`^${moduleName}$`, "i");

        const [faqs, testimonials] = await Promise.all([
          Faq.find({ module: moduleRegex, module_id: doc._id, status: true }).lean(),
          Testimonial.find({ module: moduleRegex, module_id: doc._id, status: true }).populate({ path: 'user_id', select: 'name' }).lean()
        ]);

        const seoPayload = await getResolvedSeoPayload(doc.meta_id?._id || doc.meta_id, doc, moduleName, urlValue, siteUrl);
        const schemaPayload = generateSchemaPayload(doc, moduleName, urlValue, mediaPath, siteUrl, faqs, testimonials, 'en');

        bulkOps.push({
          updateOne: {
            filter: { module: moduleName, module_id: moduleIdObj },
            update: { 
              $set: { 
                name: nameValue,
                url: urlValue, 
                module: moduleName, 
                module_id: moduleIdObj,
                seo: seoPayload,
                schema: schemaPayload
              } 
            },
            upsert: true,
          },
        });

        if (bulkOps.length >= batchSize) {
          await UrlRegistry.bulkWrite(bulkOps);
          bulkOps = [];
        }
      }

      if (bulkOps.length > 0) {
        await UrlRegistry.bulkWrite(bulkOps);
      }
    }

    if (processedUrls.length > 0) {
      await UrlRegistry.deleteMany({ url: { $nin: processedUrls } });
    }
  } catch (error) { await logError(error, { function: 'syncUrlRegistry', payload: {} }); }
}
// SEO Functions

// Sitemap
export async function get_sitemap_links(req: NextApiRequest, res: NextApiResponse) {
  try {
    const [ blogs, pages, products ] = await Promise.all([
      Blog.find({status: true}).select("_id name url").exec(),
      Page.find({status: true}).select("_id name url").exec(),
      Product.find({status: true}).select("_id name url").exec(),
    ]);

    return res.status(200).json({ message: "Fetched all Sitemap Links", data: { blogs, pages, products } });
  } catch (error) { await logError(error, { function: "get_sitemap_links", payload: req.body }); }
}

export async function getSitemapData() {
  const [ blogs, pages, products ] = await Promise.all([
    Blog.find({ status: true }).select("_id name url").lean().exec(),
    Page.find({ status: true }).select("_id name url").lean().exec(),
    Product.find({ status: true }).select("_id name url").lean().exec(),
  ]);

  return { blogs, pages, products };
}
// Sitemap

export const functions: APIHandlers = {
  create_update_meta : { middlewares: [] },
  get_filtered_meta : { middlewares: [] },
  get_single_meta : { middlewares: [] },
  get_sitemap_links : { middlewares: [] },
}

export const metaHandlers = {
  create_update_meta,
  get_filtered_meta,
  get_single_meta,
  get_sitemap_links,
};

export const config = { api: { bodyParser: false } };
export default createApiHandler(functions, metaHandlers);