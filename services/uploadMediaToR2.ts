import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getPaths } from "pages/api/basic/media";
import { addUpdateMediaModel, log } from "pages/api/utils";
import { isValidObjectId, sanitizeText } from "@amitkk/basic/utils/utils";
import Media from "lib/models/basic/Media";

interface UploadMediaParams {
  file: any;
  name: string;
  pathType: string;
  media_id?: string | null;
}

const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
  },
});

const objectExists = async (bucket: string, key: string): Promise<boolean> => {
  try {
    await r2Client.send(
      new HeadObjectCommand({
        Bucket: bucket,
        Key: key,
      })
    );
    return true;
  } catch (err: any) {
    if (err.name === "NotFound") return false;
    return false;
  }
};

const getUniqueFilenameFromCloudFlare = async ( folder: string, name: string, ext: string ): Promise<string> => {
  const sanitName = sanitizeText(name);
  let finalName = `${sanitName}${ext}`;
  let key = folder ? `${folder}/${finalName}` : finalName;

  const exists = await objectExists( process.env.CLOUDFLARE_R2_BUCKET!, key );
  if (exists) {
    const uniqueId = uuidv4();
    finalName = `${sanitName}-${uniqueId}${ext}`;
  }

  return finalName;
};

export const deleteMediaFromR2 = async (media_id: string): Promise<boolean> => {
  try {
    if (!media_id || !isValidObjectId(media_id)) return false;

    const oldMedia = await Media.findById(media_id);
    if (!oldMedia?.path) return false;

    const oldKey = oldMedia.path.replace(
      `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com/${process.env.CLOUDFLARE_R2_BUCKET}/`,
      ""
    );
    await r2Client.send( new DeleteObjectCommand({ Bucket: process.env.CLOUDFLARE_R2_BUCKET!, Key: oldKey, }) );
    
    return true;
  } catch (err) { log(err); return false; }
};

export const uploadMediaToR2 = async ({ file, name, pathType, media_id = null }: UploadMediaParams): Promise<string | null> => {
  try {
    if (!file) return media_id ?? null;

    const { folder } = getPaths(pathType);
    const originalName = (file as any).originalFilename || "file.jpg";
    const ext = path.extname(originalName);
    
    if (media_id) { await deleteMediaFromR2(media_id); }

    const filename = await getUniqueFilenameFromCloudFlare(folder, name, ext);
    const key = folder ? `${folder}/${filename}` : filename;
    
    const fileStream = fs.createReadStream(file.filepath);
    await r2Client.send( new PutObjectCommand({ Bucket: process.env.CLOUDFLARE_R2_BUCKET!, Key: key, Body: fileStream, ContentType: file.mimetype }) );

    const publicUrl = `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com/${process.env.CLOUDFLARE_R2_BUCKET}/${key}`;
    const new_media_id = await addUpdateMediaModel({ path: publicUrl, alt: name, media_id })

    return new_media_id;
  } catch (err) { log(err); return null; }
};

