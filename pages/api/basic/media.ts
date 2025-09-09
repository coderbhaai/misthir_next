import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import Media from 'lib/models/basic/Media';
import { v4 as uuidv4 } from 'uuid';
import { type File } from 'formidable';
import mongoose, { isValidObjectId, Model, Types } from 'mongoose';
import { log } from '../utils';
import { NextApiRequest, NextApiResponse } from 'next';
import { sanitizeText } from '@amitkk/basic/utils/utils';
import { uploadMediaToS3 } from 'services/uploadMediaToS3';
import MediaHub from 'lib/models/basic/MediaHub';
import { createApiHandler } from '../apiHandler';

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

export const deleteOldImage = async ( mediaModel: Model<any>, media_id: string | mongoose.Types.ObjectId ) => {
  if (!media_id) return;

  try {
    const media = await mediaModel.findById(media_id);
    if (!media || !media.path || !media.media) return;

    let cleanedPath = media.path.replace(/^[/\\]*storage[/\\]*/, '');
    const relativeDir = path.dirname(cleanedPath);
    const variants = [
      path.join(MEDIA_PATH, relativeDir, media.media),
      path.join(MEDIA_PATH, relativeDir, 'small', media.media),
      path.join(MEDIA_PATH, relativeDir, 'thumbnail', media.media),
    ];

    for (const filePath of variants) {
      fs.unlink(filePath, (error) => { if (error) { log(error); } });
    }
  } catch (error) { log(error); }
};

export const uploadMedia = async ({ file, name, pathType, media_id = null, user_id = null }: UploadMediaParams): Promise<string | null> => {
  try {
    // return await uploadMediaToS3({ file, name, pathType, media_id, user_id });
    return uploadMediaToLocal({ file, name, pathType, media_id, user_id });
  } catch (error) { log(error); return null; } 
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
  } catch (error) { log(error); } 
};

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

export async function get_all_media(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { vendor_id, limit } = req.query;
    const filter: any = {};
    if (vendor_id && vendor_id !== "null" && mongoose.isValidObjectId(vendor_id)) {
      filter.user_id = new mongoose.Types.ObjectId(vendor_id as string);
    }
    const parsedLimit = typeof limit === "string" && !isNaN(Number(limit)) ? Math.min(Number(limit), 200) : 50;

    const data = await Media.find(filter).populate('user_id').limit(parsedLimit).exec();
    return res.status(200).json({ message: 'Fetched all Media', data })

  } catch (error) { return log(error); }
}

export async function get_single_media(req: NextApiRequest, res: NextApiResponse){
  try{
    const id = (req.method === 'GET' ? req.query.id : req.body.id) as string;
  
    if (!id || !Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid or missing ID' });
    }
    
    const data = await Media.findById(id).populate('user_id').exec();
    if(!data) { return res.status(404).json({message:`Media meta with ID ${id} not found`}); }
    
    return res.status(200).json({ message: '✅ Single Entry Fetched', data });
    return;
  }catch (error) { return log(error); }
};

export async function create_update_media(req: ExtendedRequest, res: NextApiResponse) { 
  try {
    if (req.method !== 'POST') { return res.status(405).json({ message: 'Method Not Allowed' }); }

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
  } catch (error) { return log(error); }
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
  } catch (error) { log(error); return res.status(500).json({ message: "Server error", error });}
}

export async function get_selected_media(req: ExtendedRequest, res: NextApiResponse) { 
  try {
    if (req.method !== "POST") { return res.status(405).json({ message: "Method Not Allowed" }); }
    let { ids } = req.body;
    
    if (typeof ids === 'string') {
      ids = [ids];
    }

    if (!Array.isArray(ids)) { return res.status(400).json({ message: "IDs must be provided as an array" }); }

    const data = await Media.find({ _id: { $in: ids } }).populate('user_id').exec();

    if(!data) { return res.status(404).json({message:`Media meta with ID ${ids} not found`}); }

    return res.status(201).json({ message: "✅ Files uploaded successfully", data });
  } catch (error) { log(error); return res.status(500).json({ message: "Server error", error });}
}

interface SyncMediaHubOptions {
  module: "Product" | "Blog" | "Destination" | "Page";
  module_id: string | Types.ObjectId;
  vendor_id: string | Types.ObjectId;
  mediaArray: string[];
}

export async function syncMediaHub({ module, module_id, vendor_id, mediaArray }: SyncMediaHubOptions) {
  if (!Array.isArray(mediaArray)) { throw new Error("mediaArray must be an array"); }

  for (const [index, i] of mediaArray.entries()) {
    await MediaHub.findOneAndUpdate({ module, module_id, vendor_id, media_id: i },
      { $setOnInsert: { primary: index === 0, status: true, displayOrder: index, }, },
      { upsert: true, new: true }
    );
  }

  await MediaHub.deleteMany({ module, module_id, vendor_id, media_id: { $nin: mediaArray } });
}

const functions = {
  get_all_media,
  get_single_media,
  create_update_media,
  create_update_media_library,
  get_selected_media,
};

export default createApiHandler(functions);