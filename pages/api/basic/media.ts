import path from 'path';
import fs from "fs";
import sharp from 'sharp';
import Media from 'lib/models/basic/Media';
import { v4 as uuidv4 } from 'uuid';
import { type File } from 'formidable';
import mongoose, { isValidObjectId, Model, Types } from 'mongoose';
import {logError, safeParse, sanitizeText } from '../utils';
import { NextApiRequest, NextApiResponse } from 'next';
// import { uploadMediaToS3 } from 'services/uploadMediaToS3';
import MediaHub, { MediaHubDoc } from 'lib/models/basic/MediaHub';
import { createApiHandler } from '../apiHandler';
import { APIHandlers } from '../../../lib/server/middleware';
import { buildFilterQuery } from 'lib/server/plugins/buildFilterQuery';
import type { File as FormidableFile } from "formidable";
import { AnyModel } from 'lib/models';

const MEDIA_PATH = path.join(process.cwd(), 'public', 'storage');

export const getUniqueFilename = (uploadDir: string, name: string, fileName: string, fileExt: string): string => {
  const sanitName = sanitizeText(name);
  let finalName = `${sanitName}${fileExt}`;
  const filePath = path.join(uploadDir, finalName);

  if (fs.existsSync(filePath)) {
    const uniqueId = uuidv4();
    finalName = `${sanitName}-${uniqueId}${fileExt}`;
  }
  return finalName;
};

export const getPaths = (type: string) => {
  const paths = {
    blog: { folder: 'blog', small: [150, 150], thumbnail: [300, 200] },
    author: { folder: 'author', small: [100, 100], thumbnail: [200, 150] },
    banner: { folder: 'banner', small: [1920, 500], thumbnail: [1920, 500] },
    blocks: { folder: 'blocks', small: [], thumbnail: [] },
    product: { folder: 'product', small: [], thumbnail: [] },
    product_brand: { folder: 'product/brand', small: [], thumbnail: [] },
    product_meta: { folder: 'product/meta', small: [], thumbnail: [] },
    product_type: { folder: 'product/type', small: [], thumbnail: [] },
    review: { folder: 'review', small: [], thumbnail: [] },
    uploads: { folder: 'uploads', small: [], thumbnail: [] },
  };
  return paths[type as keyof typeof paths] ?? paths.uploads;
};

const ensureDirs = (basePath: string, small: number[], thumbnail: number[]) => {
  if (!fs.existsSync(basePath)) fs.mkdirSync(basePath, { recursive: true });
  if (small.length) fs.mkdirSync(path.join(basePath, 'small'), { recursive: true });
  if (thumbnail.length) fs.mkdirSync(path.join(basePath, 'thumbnail'), { recursive: true });
};

const resizeImage = async (inputPath: string, outputPath: string, size: number[]) => {
  await sharp(inputPath).resize(...size).toFile(outputPath);
};

interface UploadMediaParams {
  file: any;
  name: string;
  alt?: string;
  pathType: string;
  media_id?: string | null;
  user_id?: string | null;
}

export const deleteOldImage = async ( mediaModel: AnyModel, media_id: string | mongoose.Types.ObjectId ) => {
  if (!media_id) return;

  try {
    const media = await mediaModel.findById(media_id);
    if (!media) return;

    // ============ 🧩 CASE 1: Cloudflare ==============
    if (media.cloudflare?.id) {
      try {
        // You can integrate your Cloudflare delete logic here.
        // For example:
        //
        // await deleteFromCloudflare(media.cloudflare.id);
        //
        // (You’d define deleteFromCloudflare to call Cloudflare’s Images API)
      } catch (cloudErr) {
        console.error(`⚠️ Cloudflare deletion failed:`, cloudErr);
      }

      return; // Exit early — nothing to delete locally.
    }

    // ============ 💾 CASE 2: Local File System ==========
    const filename = media.cloudflare?.filename || path.basename(media.path || "");

    if (!filename) { console.warn("⚠️ No filename found for media_id:", media_id); return; }

    let cleanedPath = media.path?.replace(/^[/\\]*storage[/\\]*/, "") || "";
    const relativeDir = path.dirname(cleanedPath);

    const variants = [
      path.join(MEDIA_PATH, relativeDir, filename),
      path.join(MEDIA_PATH, relativeDir, "small", filename),
      path.join(MEDIA_PATH, relativeDir, "thumbnail", filename),
    ];

    for (const filePath of variants) {
      fs.unlink(filePath, (error) => {
        if (error && error.code !== "ENOENT") {
          console.error("❌ File delete error:", error);
        }
      });
    }

  } catch (error) {
    console.error("deleteOldImage error:", error);
  }
};

export const uploadMedia = async ({ file, name, pathType, media_id = null, user_id = null }: UploadMediaParams): Promise<string | null> => {
  try {
    // return await uploadMediaToS3({ file, name, pathType, media_id, user_id });
    return uploadMediaToLocal({ file, name, pathType, media_id, user_id });
  } catch (error) { await logError(error, { function: "uploadMedia", payload: { name, pathType, media_id, user_id } }); return null; } 
};

export const uploadMediaToLocal = async ({ file, name, pathType, media_id = null, user_id = null }: UploadMediaParams) => {  
  try {
    if ( !file ) { return media_id ? media_id : null; }

    if (file && media_id && isValidObjectId(media_id)) {
      await deleteOldImage(Media, media_id);
    }
    const { folder, small, thumbnail } = getPaths(pathType);
    const basePath = path.join(MEDIA_PATH, folder);
    ensureDirs(basePath, small, thumbnail);
    const originalName = (file as any).originalFilename || 'file.jpg';
    const ext = path.extname(originalName);
    const filename = getUniqueFilename(basePath, name, originalName, ext);
    const finalPath = path.join(basePath, filename);

    fs.renameSync(file.filepath, finalPath);
    if (small.length) {
      await resizeImage(finalPath, path.join(basePath, 'small', filename), small);
    }

    if (thumbnail.length) {
      await resizeImage(finalPath, path.join(basePath, 'thumbnail', filename), thumbnail);
    }

    let entry;
    const storagePath = `/storage/${folder}/${filename}`;  

    if (file && media_id && isValidObjectId(media_id)) {
      entry = await Media.findByIdAndUpdate(
        media_id,
        { media: filename, path: storagePath, user_id : user_id },
        { new: true }
      );
    } else {
      entry = await Media.create({ media: filename, alt: name, path: storagePath, user_id : user_id });
    }

    return entry._id.toString(); 
  } catch (error) { await logError(error, { function: "uploadMediaToLocal", payload: { name, pathType, media_id, user_id } }); } 
};

type HandlerMap = {
  [key: string]: (req: NextApiRequest, res: NextApiResponse) => Promise<void>;
};

interface ExtendedRequest extends NextApiRequest {
  file?: File;
  files?: { [key: string]: File | File[] };
}

export async function get_filtered_media(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { filters = {}, page = 0, limit = 10 } = req.body || {};
    const { matchQuery, skip, limit: safeLimit } = buildFilterQuery(filters, { page, limit, defaultLimit: 10, maxLimit: 100, searchableFields: ["path"] });
    const total = await Media.countDocuments(matchQuery);

    const data = await Media.find(matchQuery).populate('user_id').skip(skip).limit(safeLimit).sort({ createdAt: -1 });
    return res.status(200).json({ message: 'Fetched all Media', data, pagination: { total, page, limit: safeLimit, pages: Math.ceil(total / safeLimit) } })

  } catch (error) { await logError(error, { function: "get_filtered_media", payload: req.body }); }
}

export async function get_all_media(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { seller_id, mediaLimit } = req.body;
    const filter: any = {};
    if (seller_id && seller_id !== "null" && mongoose.isValidObjectId(seller_id)) {
      filter.user_id = new mongoose.Types.ObjectId(seller_id as string);
    }

    const data = await Media.find(filter).populate('user_id').sort({ createdAt: -1 }).limit(mediaLimit).exec();
    return res.status(200).json({ message: 'Fetched all Media', data })

  } catch (error) { await logError(error, { function: "get_all_media", payload: req.body }); }
}

export async function get_single_media(req: NextApiRequest, res: NextApiResponse){
  try{
    const id = (req.method === "GET" ? req.query.id : req.body.id) as string;
    if (!id || !Types.ObjectId.isValid(id)) { return res.status(400).json({ message: 'Invalid or missing ID' }); }
    
    const data = await Media.findById(id).populate('user_id').exec();
    if(!data) { return res.status(404).json({message:`Media meta with ID ${id} not found`}); }
    
    return res.status(200).json({ message: '✅ Single Entry Fetched', data });
  }catch (error) { await logError(error, { function: "get_single_media", payload: req.body }); }
};

export async function create_update_media(req: ExtendedRequest, res: NextApiResponse) { 
  try {
    const data = req.body;  
    if (!data?.alt) { return res.status(400).json({ message: 'Required fields missing' }); }

    const modelId = typeof data._id === 'string' || data._id instanceof Types.ObjectId ? data._id : null;

    let media_id: string | null = null;
    if (data._id && isValidObjectId(data._id)) { media_id = data._id; }
    const file = Array.isArray(req.files?.image) ? req.files.image[0] : req.files?.image;
    
    if (file) {
      await uploadMedia({ file, name: data.alt, pathType: data.path, media_id: media_id ?? null, user_id:data.user_id });
    }else if(media_id){
      await Media.findByIdAndUpdate(
        media_id,
        { alt: data.alt },
        { new: true }
      );
    }

    const entry = await Media.findById(media_id).exec();
    
    return res.status(201).json({ message: '✅ Entry created successfully', data: entry });
  } catch (error) { await logError(error, { function: "create_update_media", payload: req.body }); }
}

export async function create_update_media_library(req: ExtendedRequest, res: NextApiResponse) { 
  try {
    if (req.method !== "POST") { return res.status(405).json({ message: "Method Not Allowed" }); }

    const data = req.body;
    const files = Array.isArray(req.files?.["images[]"]) ? req.files?.["images[]"] : req.files?.image ? [req.files.image] : [];
    if (!files.length) { return res.status(400).json({ message: "No files uploaded" }); }

    const results: any[] = [];

    for (const file of files) {
      const media_id = data._id && isValidObjectId(data._id) ? data._id : null;
      const uploaded = await uploadMedia({ file, name: 'Image', pathType: data.module, media_id, user_id: data.user_id });
      results.push(uploaded);
    }

    return res.status(201).json({ message: "✅ Files uploaded successfully", data: results });
  } catch (error) { await logError(error, { function: "create_update_media_library", payload: req.body }); return res.status(500).json({ message: "Server error", error });}
}

export async function get_selected_media(req: ExtendedRequest, res: NextApiResponse) { 
  try {
    let { module, module_id } = req.body;
    if( !module || !module_id ){ return res.status(200).json({ message: "Module or ModuleId Not Found", data: true }); }

    const hubData = await MediaHub.find({ module, module_id, status: true }).populate({ path: "media_id", model: "Media" }).sort({ displayOrder: 1, createdAt: -1 }).lean<MediaHubDoc[]>().exec();
    const media = hubData.map((item: { media_id?: any }) => item.media_id).filter(Boolean);
    return res.status(200).json({ message: "Media fetched successfully", data: media });    
  } catch (error) { await logError(error, { function: "get_selected_media", payload: req.body }); return res.status(500).json({ message: "Server error", error });}
}

interface SyncMediaHubOptions {
  module: string;
  module_id: string | Types.ObjectId;
  mediaArray: string[];
}

export async function syncMediaHub({ module, module_id, mediaArray }: SyncMediaHubOptions) {
  try{
    if (!Array.isArray(mediaArray)) { throw new Error("mediaArray must be an array"); }
  
    for (const [index, i] of mediaArray.entries()) {
      await MediaHub.findOneAndUpdate({ module, module_id, media_id: i },
        { $setOnInsert: { primary: index === 0, status: true, displayOrder: index, }, },
        { upsert: true, new: true }
      );
    }
  
    await MediaHub.deleteMany({ module, module_id, media_id: { $nin: mediaArray } });
  }catch (error) { await logError(error, { function: "syncMediaHub", payload: { module, module_id, mediaArray } }); }
}

export async function uploadFileLocal( file: FormidableFile, folder: string, oldFilePath?: string ) {
  const uploadDir = path.join(process.cwd(), "private", folder);

  await new Promise<void>((resolve, reject) => {
    fs.mkdir(uploadDir, { recursive: true }, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });

  if (oldFilePath) {
    const oldPath = path.isAbsolute(oldFilePath) ? oldFilePath : path.join(uploadDir, oldFilePath);

    fs.access(oldPath, fs.constants.F_OK, (err) => {
      if (!err) {
        fs.unlink(oldPath, (unlinkErr) => {
          if (unlinkErr) console.error("❌ Failed to delete old file:", unlinkErr);
        });
      }
    });
  }

  const ext = path.extname(file.originalFilename || "");
  const filename = `${uuidv4()}${ext}`;
  const newPath = path.join(uploadDir, filename);

  await new Promise<void>((resolve, reject) => {
    fs.copyFile(file.filepath, newPath, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });

  return { path: newPath, filename, mimetype: file.mimetype, size: file.size };
}

export async function downloadFile(req: NextApiRequest, res: NextApiResponse) {
  try {
    let { filePath } = req.body;

    if (!filePath || Array.isArray(filePath)) {
      return res.status(400).json({ message: "Invalid file path" });
    }

    // 🧹 Clean filePath — remove leading slashes or backslashes
    filePath = filePath.replace(/^[/\\]+/, "");

    const baseDir = path.join(process.cwd(), "private");
    const resolvedPath = path.join(baseDir, filePath);

    if (!resolvedPath.startsWith(baseDir)) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (!fs.existsSync(resolvedPath)) {
      return res.status(404).json({ message: "File not found" });
    }

    const fileBuffer = fs.readFileSync(resolvedPath);
    const base64 = Buffer.from(fileBuffer).toString("base64");
    const filename = path.basename(resolvedPath);
    const mimetype = "application/octet-stream";

    return res.status(200).json({
      message: "File ready for download",
      data: { base64, filename, mimetype },
    });
  } catch (error) {
    console.error("❌ Download error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function attach_media(req: NextApiRequest, res: NextApiResponse) {
  try {
    const data = req.body;
    if (!data.module || !data.module_id) { 
      return res.status(200).json({ message: "Module or ModuleId Not Found", data: true }); 
    }

    const parsedMedia = safeParse(data.mediaArray || []);
    const mediaArray: string[] = parsedMedia.map((id: any) => id.toString());

    await syncMediaHub({ module: data.module, module_id: data.module_id, mediaArray });

    return res.status(200).json({ message: "Media Updated", data: true });
  } catch (error) { 
    await logError(error, { function: "attach_media", payload: req.body }); 
    return res.status(500).json({ message: "Internal Server Error", data: false });
  }
}

export async function detach_media(req: NextApiRequest, res: NextApiResponse) {
  try {
    const data = req.body;
    if (!data.module || !data.module_id) { 
      return res.status(200).json({ message: "Module or ModuleId Not Found", data: true }); 
    }

    const parsedMedia = safeParse(data.mediaArray || []);
    const mediaArray: string[] = parsedMedia.map((id: any) => id.toString());

    await syncMediaHub({ module: data.module, module_id: data.module_id, mediaArray });

    return res.status(200).json({ message: "Media Updated", data: true });
  } catch (error) { 
    // Fixed log function name to match detach_media
    await logError(error, { function: "detach_media", payload: req.body }); 
    return res.status(500).json({ message: "Internal Server Error", data: false });
  }
}

export async function attach_media_to_module(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { module, module_id } = req.body;
    const rawMediaIds = typeof req.body.media_ids === "string" 
      ? safeParse(req.body.media_ids) 
      : req.body.media_ids;

    if (!module || !module_id || !Array.isArray(rawMediaIds)) { 
      console.warn("⚠️ [DEBUG] Validation failed: Missing module, module_id, or media_ids is not an array");
      return res.status(400).json({ message: "module, module_id and media_ids[] are required" }); 
    }

    const objectModuleId = typeof module_id === "string" ? new Types.ObjectId(module_id) : module_id;

    const mediaIds = rawMediaIds.map((id: string) => {
      const converted = typeof id === "string" ? new Types.ObjectId(id) : id;
      return converted;
    });

    const deleteResult = await MediaHub.deleteMany({
      module,
      module_id: objectModuleId,
      media_id: { $nin: mediaIds },
    });
    
    const upsertResults = await Promise.all(
      mediaIds.map((mediaId, index) => {
        return MediaHub.findOneAndUpdate(
          {
            module,
            module_id: objectModuleId,
            media_id: mediaId,
          },
          {
            $set: {
              status: true,
              primary: index === 0,
              displayOrder: index + 1,
              updatedAt: new Date(),
            },
            $setOnInsert: {
              createdAt: new Date(),
            },
          },
          { upsert: true, new: true, runValidators: true }
        );
      })
    );
    return res.status(200).json({ message: 'Media Attached to Module', data: true });
  } catch (error) { await logError(error, { function: "attach_media_to_module", payload: req.body }); }
}

export async function detach_media_to_module(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { module, module_id } = req.body;
    if (!module || !module_id ) { return res.status(400).json({ message: "module, module_id are required" }); }

    const objectModuleId = typeof module_id === "string" ? new Types.ObjectId(module_id) : module_id;
    await MediaHub.deleteMany({ module, module_id: objectModuleId });

    return res.status(200).json({ message: 'Media Detached to Module', data: true })
  } catch (error) { await logError(error, { function: "get_filtered_video", payload: req.body }); }
}

export async function detach_single_media_to_module(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { module, module_id, media_id } = req.body;
    if (!module || !module_id ) { return res.status(400).json({ message: "module, module_id and mdeia_id are required" }); }

    const objectModuleId = typeof module_id === "string" ? new Types.ObjectId(module_id) : module_id;
    await MediaHub.deleteMany({ module, module_id: objectModuleId, media_id });

    return res.status(200).json({ message: 'Media Detached to Module', data: true })
  } catch (error) { await logError(error, { function: "get_filtered_video", payload: req.body }); }
}

export const deleteLocalFile = async (filePath: string) => {
  try {
    if (!filePath) return;

    const absolutePath = path.isAbsolute(filePath)? path.join(process.cwd(), filePath) : path.join(process.cwd(), filePath);

    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    }

  } catch (error) {
    console.error("❌ File delete failed:", error);
  }
};

export const functions: APIHandlers = {
  get_all_media : { middlewares: [ "checkUserId" ] },
  get_filtered_media : { middlewares: [ "checkUserId", "checkPostMethod" ] },
  get_single_media : { middlewares: [ "checkUserId", "checkPostMethod" ] },
  create_update_media : { middlewares: [ "checkUserId", "checkPostMethod" ] },
  create_update_media_library : { middlewares: [ "checkUserId", "checkPostMethod" ] },
  get_selected_media : { middlewares: [ "checkUserId", "checkPostMethod" ] },
  attach_media : { middlewares: [ "checkUserId", "checkPostMethod" ] },
  detach_media : { middlewares: [ "checkUserId", "checkPostMethod" ] },
  downloadFile : { middlewares: [ "checkPostMethod" ] },

  attach_media_to_module : { middlewares: [ "checkUserId", "checkPostMethod" ] },
  detach_media_to_module : { middlewares: [ "checkUserId", "checkPostMethod" ] },
  detach_single_media_to_module : { middlewares: [ "checkUserId", "checkPostMethod" ] },
}

export const mediaHandlers = {
  get_all_media,
  get_filtered_media,
  get_single_media,
  create_update_media,
  create_update_media_library,
  get_selected_media,
  attach_media,
  detach_media,
  downloadFile,

  attach_media_to_module,
  detach_media_to_module,
  detach_single_media_to_module,
};

export const config = { api: { bodyParser: false } };
export default createApiHandler(functions, mediaHandlers);