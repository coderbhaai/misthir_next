import { isValidObjectId, Types } from 'mongoose';
import type { NextApiRequest, NextApiResponse } from 'next';
import { uploadMedia } from '../basic/media';
import { createApiHandler, ExtendedRequest } from '../apiHandler';
import { APIHandlers } from '../../../lib/server/middleware';
import GenericBlock from 'lib/models/block/GenericBlock';
import BlockDetail from 'lib/models/block/BlockDetail';
import { buildFilterQuery } from 'lib/server/plugins/buildFilterQuery';
import TabBlock from 'lib/models/block/TabBlock';
import { cleanContent, logError } from '../utils';

// Generic Block
  export async function get_filtered_generic_blocks(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { filters = {}, page = 0, limit = 10 } = req.body || {};
      const { matchQuery, skip, limit: safeLimit } = buildFilterQuery(filters, { page, limit, defaultLimit: 10, maxLimit: 100, searchableFields: ["heading"] });
      const total = await GenericBlock.countDocuments(matchQuery);

      const data = await GenericBlock.find(matchQuery).populate([ { path: "media_id" }, { path: "mobile_media_id" }, { path: "module_id", select: "name url" } ]).skip(skip).limit(safeLimit).sort({ createdAt: -1 });
      return res.status(200).json({ message: 'Fetched all Generic Blocks', data, pagination: { total, page, limit: safeLimit, pages: Math.ceil(total / safeLimit) } });
    } catch (error) { await logError(error, { function: "get_filtered_generic_blocks", payload: req.body }); }
  }

  export async function get_single_generic_block(req: NextApiRequest, res: NextApiResponse){
    try{
      const id = (req.method === "GET" ? req.query.id : req.body.id) as string;
      if (!id || !Types.ObjectId.isValid(id)) { return res.status(400).json({ message: 'Invalid or missing ID' }); }  
    
      const entry = await GenericBlock.findById(id).populate([ { path: "media_id" }, { path: "mobile_media_id" }, { path: "module_id", select: "name url" } ]).exec();  
      if (!entry) { return res.status(404).json({ message: `GenericBlock with ID ${id} not found` }); }
    
      return res.status(200).json({ message: '✅ Single Entry Fetched', data: entry });

    }catch (error) { await logError(error, { function: "get_single_generic_block", payload: req.body }); }
  };

  export async function create_update_generic_block(req: ExtendedRequest, res: NextApiResponse) {
    try {
      const data = req.body;
      if ( !data?.module || !data?.module_id || !data?.status ) { return res.status(400).json({ message: '❌ Required fields missing' }); }

      const modelId = typeof data._id === 'string' || data._id instanceof Types.ObjectId ? data._id : null;

      const webMediaName = `web_${data.heading ?? data.module}`;
      const mobileMediaName = `mobile_${data.heading ?? data.module}`;

      let media_id: string | null = null;
      if (data.media_id && isValidObjectId(data.media_id)) { media_id = data.media_id; }
      const file = Array.isArray(req.files?.image) ? req.files.image[0] : req.files?.image;
      if (file) { media_id = await uploadMedia({ file, name: webMediaName, pathType: "block", media_id: data.media_id ?? null, user_id: null }); }

      let mobile_media_id: string | null = null;
      if (data.mobile_media_id && isValidObjectId(data.mobile_media_id)) { mobile_media_id = data.mobile_media_id; }
      const mob_file = Array.isArray(req.files?.mobileImage) ? req.files.mobileImage[0] : req.files?.mobileImage;
      if (mob_file) { mobile_media_id = await uploadMedia({ file: mob_file, name: mobileMediaName, pathType: "block", media_id: data.mobile_media_id ?? null, user_id: null }); }    

      if (modelId && isValidObjectId(modelId)) {
        try {
          const updated = await GenericBlock.findByIdAndUpdate( modelId, {
              module: data.module,
              module_id: data.module_id,
              block_id: data.block_id,
              heading: data.heading,
              url: data.url,
              media_id,
              mobile_media_id,
              status: data.status ?? true,
              displayOrder: Number(data.displayOrder) || 0,
              content: cleanContent(data.content),
              updatedAt: new Date(),
            }, { new: true } 
          );

          if (updated) {
            return res.status(200).json({ message: '✅ Entry updated successfully', data: updated });
          } else {
            return res.status(404).json({ message: '❌ GenericBlock not found for update' });
          }
        } catch (error) { await logError(error, { function: "create_update_generic_block", payload: req.body }); }
      }

      const newMeta = new GenericBlock({
        module: data.module,
        module_id: data.module_id,
        block_id: data.block_id,
        heading: data.heading,
        url: data.url,
        media_id,
        mobile_media_id,
        status: data.status ?? true,
        displayOrder: Number(data.displayOrder) || 0,
        content: cleanContent(data.content),
        createdAt: new Date(),
      });

      await newMeta.save();
      return res.status(201).json({ message: '✅ Entry created successfully', data: newMeta });
    } catch (error) { await logError(error, { function: "create_update_generic_block", payload: req.body }); }
  }

  export async function update_block_id(req: ExtendedRequest, res: NextApiResponse) {
    try {
      const { _id, block_id } = req.body;
      if (!_id || !block_id || !isValidObjectId(_id)) { return res.status(400).json({ message: '❌ Invalid ID or block_id missing' }); }

      const updated = await GenericBlock.findByIdAndUpdate(_id, { 
          block_id, 
          updatedAt: new Date() 
        }, { new: true });

      if (!updated) { return res.status(404).json({ message: '❌ GenericBlock not found for update' }); }

      return res.status(200).json({ message: '✅ Block ID updated successfully', data: updated });
    } catch (error) {
      await logError(error, { function: "update_block_id", payload: req.body });
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }
// Generic Block

// Tab Blocks
  export async function get_filtered_tab_blocks(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { filters = {}, page = 0, limit = 10 } = req.body || {};
      const { matchQuery, skip, limit: safeLimit } = buildFilterQuery(filters, { page, limit, defaultLimit: 10, maxLimit: 100, searchableFields: ["name"] });
      const total = await GenericBlock.countDocuments(matchQuery);

      const blocks = await TabBlock.find(matchQuery).populate({ path: "module_id", select: "name url" }).sort({ displayOrder: 1, createdAt: -1 });

      const grouped: Record<string, any> = {};

    for (const block of blocks) {
      const groupKey = `${block.module}_${block.module_id?._id}`;

      if (!grouped[groupKey]) {
        grouped[groupKey] = {
          module: block.module,
          module_id: block.module_id,
          blocks: []
        };
      }

      grouped[groupKey].blocks.push({
        _id: block._id,
        menu: block.menu,
        content: block.content,
        status: block.status,
        displayOrder: block.displayOrder
      });
    }

    const groupedArray = Object.values(grouped);

    const start = page * limit;
    const paginatedData = groupedArray.slice(start, start + limit);

    return res.status(200).json({ message: "Grouped Tab Blocks", data: paginatedData, pagination: { page, limit, total: groupedArray.length, pages: Math.ceil(groupedArray.length / limit) } });
    } catch (error) { await logError(error, { function: "get_filtered_tab_blocks", payload: req.body }); }
  }

  export async function get_single_tab_block(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { module, module_id } = req.body;
      if (!module || !module_id) { return res.status(400).json({ message: "module & module_id are required" }); }

      const data = await TabBlock.find({ module, module_id }).sort({ displayOrder: 1 }).exec();
      return res.status(200).json({ message: "Fetched Tab Blocks", data });
    } catch (error) { await logError(error, { function: "get_single_tab_block", payload: req.body }); }
  }

  export async function create_update_tab_block(req: ExtendedRequest, res: NextApiResponse) {
    try {
      const { module, module_id, blocks } = req.body;
      if (!module || !module_id) { return res.status(400).json({ success: false, message: "Module & Module ID are required" }); }
      if (!Array.isArray(blocks) || blocks.length === 0) { return res.status(400).json({ success: false, message: "Blocks array is required" }); }

      const results = [];

      for (const block of blocks) {
        if (!block.menu || !block.content) { return res.status(400).json({ success: false, message: "Each block must have menu &  content" }); }

        if ( block._id && Types.ObjectId.isValid(block._id) ) {
          const updated = await TabBlock.findByIdAndUpdate(
            block._id,
            {
              module,
              module_id,
              menu: block.menu,
              content: block.content,
              status: block.status ?? true,
              displayOrder: block.displayOrder ?? null,
            },
            { new: true }
          );

          results.push(updated);
          continue;
        }

        const created = await TabBlock.create({
          module,
          module_id,
          menu: block.menu,
          content: block.content,
          status: block.status ?? true,
          displayOrder: block.displayOrder ?? null,
        });

        results.push(created);
      }

      return res.status(200).json({ success: true, message: "Tab Blocks processed successfully", data: results });
    } catch (error) { await logError(error, { function: "create_update_tab_block", payload: req.body }); }
  }
// Tab Blocks

// Block Detail
  export async function get_filtered_block_detail(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { filters = {}, page = 0, limit = 10 } = req.body || {};
      const { matchQuery, skip, limit: safeLimit } = buildFilterQuery(filters, { page, limit, defaultLimit: 10, maxLimit: 100, searchableFields: ["heading"] });
      const total = await BlockDetail.countDocuments(matchQuery);

      const data = await BlockDetail.find(matchQuery).populate([ { path: "media_id" }, { path: "mobile_media_id" }, { path: "module_id" } ]).skip(skip).limit(safeLimit).sort({ createdAt: -1 });
      return res.status(200).json({ message: 'Fetched all Block Details', data, pagination: { total, page, limit: safeLimit, pages: Math.ceil(total / safeLimit) } });
    } catch (error) { await logError(error, { function: "get_filtered_block_detail", payload: req.body }); }
  }

  export async function get_single_block_detail(req: NextApiRequest, res: NextApiResponse){
    try{
        const data = req.body;
        if ( !data?.module || !data?.module_id || !data?.block_id ) { return res.status(400).json({ message: '❌ Required fields missing' }); }

        const entry = await BlockDetail.findOne({ module: data.module, module_id: data.module_id, block_id: data.block_id }).populate([ { path: "media_id" }, { path: "mobile_media_id" }, { path: "module_id" } ]).exec();
    
      return res.status(200).json({ message: '✅ Single Entry Fetched', data: entry });
    }catch (error) { await logError(error, { function: "get_single_block_detail", payload: req.body }); }
  };

  export async function create_update_block_detail(req: ExtendedRequest, res: NextApiResponse) {
    try {
      const data = req.body;
      if ( !data?.module || !data?.module_id || !data?.block_id || !data?.status ) { return res.status(400).json({ message: '❌ Required fields missing' }); }

      const webMediaName = `web_${data.heading ?? data.module}`;
      const mobileMediaName = `mobile_${data.heading ?? data.module}`;

      let media_id: string | null = null;
      if (data.media_id && isValidObjectId(data.media_id)) { media_id = data.media_id; }
      const file = Array.isArray(req.files?.image) ? req.files.image[0] : req.files?.image;
      if (file) { media_id = await uploadMedia({ file, name: webMediaName, pathType: "block", media_id: data.media_id ?? undefined, user_id: null }); }

      let mobile_media_id: string | null = null;
      if (data.mobile_media_id && isValidObjectId(data.mobile_media_id)) { mobile_media_id = data.mobile_media_id; }
      const mob_file = Array.isArray(req.files?.mobileImage) ? req.files.mobileImage[0] : req.files?.mobileImage;
      if (mob_file) { mobile_media_id = await uploadMedia({ file: mob_file, name: mobileMediaName, pathType: "block", media_id: data.mobile_media_id ?? undefined, user_id: null }); }
      
      try {
        const updated = await BlockDetail.findOneAndUpdate({
          module: data.module,
          module_id: data.module_id,
          block_id: data.block_id,
        }, {          
            heading: data.heading,
            url: data.url,
            bg_colour: data.bg_colour,
            media_id,
            mobile_media_id,
            status: data.status ?? true,
            content_1: cleanContent(data.content_1),
            content_2: cleanContent(data.content_2),
            content_3: cleanContent(data.content_3),
            createdAt: new Date(),
            updatedAt: new Date(),
          }, { new: true, upsert: true, setDefaultsOnInsert: true, }
        );
    
        return res.status(200).json({ message: '✅ Entry updated successfully', data: updated });
      } catch (error) { await logError(error, { function: "create_update_block_detail", payload: req.body }); }
      
    } catch (error) { await logError(error, { function: "create_update_block_detail", payload: req.body }); }
  }
// Block Detail

export const functions: APIHandlers = {
  get_filtered_generic_blocks : { middlewares: [ "checkUserId", "checkPostMethod" ], url: "/admin/generic-block" },
  get_single_generic_block : { middlewares: ["checkUserId", ], url: "/admin/generic-block"  },
  create_update_generic_block : { middlewares: [ "checkUserId", "checkPostMethod" ], url: "/admin/generic-block" },

  get_filtered_tab_blocks : { middlewares: [ "checkUserId", "checkPostMethod" ], url: "/admin/generic-block" },
  get_single_tab_block : { middlewares: ["checkUserId", ], url: "/admin/generic-block"  },
  create_update_tab_block : { middlewares: [ "checkUserId", "checkPostMethod" ], url: "/admin/generic-block" },

  get_filtered_block_detail : { middlewares: [ "checkUserId", "checkPostMethod" ] },
  get_single_block_detail: { middlewares: [ "checkUserId", "checkPostMethod" ], url: "/admin/generic-block" },
  create_update_block_detail : { middlewares: [ "checkUserId", "checkPostMethod" ], url: "/admin/generic-block" },
  update_block_id : { middlewares: [ "checkUserId", "checkPostMethod" ], url: "/admin/generic-block" },
}

export const genericBlockHandlers = {
  get_filtered_generic_blocks,
  get_single_generic_block,
  create_update_generic_block,

  get_filtered_block_detail,
  create_update_block_detail,
  get_single_block_detail,
  
  get_filtered_tab_blocks,
  get_single_tab_block,
  create_update_tab_block,
  update_block_id,

};

export const config = { api: { bodyParser: false } };
export default createApiHandler(functions, genericBlockHandlers);