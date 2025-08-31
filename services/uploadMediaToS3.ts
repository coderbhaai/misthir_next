// services/cloudflareImages.ts
import fs from "fs";
import FormData from "form-data";
import fetch from "node-fetch";
import Media from "lib/models/basic/Media";
import { isValidObjectId } from "@amitkk/basic/utils/utils";
import { log } from "pages/api/utils";

interface UploadMediaParams {
  file: any;
  name: string;
  pathType: string;
  media_id?: string | null;
}

const CLOUDFLARE_IMAGES_URL = `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/images/v1`;
const CLOUDFLARE_AUTH_HEADER = {
  Authorization: `Bearer ${process.env.CLOUDFLARE_IMAGES_API_TOKEN}`,
};

export const uploadMediaToS3 = async ({ file, name, pathType, media_id = null }: UploadMediaParams): Promise<string | null> => {
  try {
    if (!file) return media_id ?? null;

    // 🔹 If updating, delete the old one first
    if (media_id && isValidObjectId(media_id)) {
      await deleteMediaFromCloudflareImages(media_id);
    }

    // 🔹 Prepare form data
    const form = new FormData();
    form.append("file", fs.createReadStream(file.filepath), {
      filename: file.originalFilename,
      contentType: file.mimetype,
    });
    form.append("metadata", JSON.stringify({ name, alt: name }));

    // 🔹 Upload to Cloudflare
    const response = await fetch(CLOUDFLARE_IMAGES_URL, {
      method: "POST",
      headers: CLOUDFLARE_AUTH_HEADER,
      body: form,
    });

    type CloudflareResponse = {
      success: boolean;
      errors: { code: number; message: string }[];
      messages: string[];
      result: {
        id: string;
        filename: string;
        uploaded: string;
        variants: string[];
        metadata?: Record<string, any>;
      };
    };

    const result: CloudflareResponse = (await response.json()) as CloudflareResponse;

    if (!result.success) { log(result.errors); return null; }

    const image = result.result;
    const publicUrl = image.variants[0];

    
    const entry = media_id
      ? await Media.findByIdAndUpdate(
          media_id,
          {
            alt: name,
            path: publicUrl,
            cloudflare: {
              id: image.id,
              filename: image.filename,
              uploaded: image.uploaded,
              variants: image.variants,
              metadata: image.metadata ?? {},
            },
          },
          { new: true }
        )
      : await Media.create({
          alt: name,
          path: publicUrl,
          cloudflare: {
            id: image.id,
            filename: image.filename,
            uploaded: image.uploaded,
            variants: image.variants,
            metadata: image.metadata ?? {},
          },
        });

    return entry._id.toString();
  } catch (err) { log(err); return null; }
};

export const deleteMediaFromCloudflareImages = async ( media_id: string ): Promise<boolean> => {
  try {
    if (!media_id || !isValidObjectId(media_id)) return false;

    const oldMedia = await Media.findById(media_id);
    if (!oldMedia?.cloudflareId) return false;
    
    await fetch(`${CLOUDFLARE_IMAGES_URL}/${oldMedia.cloudflareId}`, {
      method: "DELETE",
      headers: CLOUDFLARE_AUTH_HEADER,
    });

    return true;
  } catch (err) { log(err); return false; }
};

export const getImageVariantUrl = ( imageId: string, variant: string ): string => {
  return `https://imagedelivery.net/${process.env.CLOUDFLARE_IMAGES_HASH}/${imageId}/${variant}`;
};
