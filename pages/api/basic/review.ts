import { isValidObjectId, Types } from 'mongoose';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserIdFromToken, log } from '../utils';
import { syncMediaHub, uploadMedia } from './media';
import { createApiHandler, ExtendedRequest, HandlerMap, } from '../apiHandler';
import Review from 'lib/models/basic/Review';


export async function create_update_review(req: ExtendedRequest, res: NextApiResponse) { 
  try {
    if (req.method !== "POST") { return res.status(405).json({ message: "Method Not Allowed" }); }
    
    const user_id = getUserIdFromToken(req);
    if (!user_id) { return res.status(401).json({ message: "Unauthorized" }); }

    const data = req.body;  
    if ( !data?.review || !data?.rating ) { return res.status(400).json({ message: 'Required fields missing' }); }

    const { module, module_id, rating, review } = data;

    const updatedOrCreated = await Review.findOneAndUpdate({ module, module_id, user_id }, 
          {
            $set: {
              rating,
              review,
              status: 0,
              updatedAt: new Date(),
            }, $setOnInsert: { createdAt: new Date() }
          }, { new: true, upsert: true }
        );
        
    const files = Array.isArray(req.files?.["images[]"]) ? req.files?.["images[]"] : req.files?.image ? [req.files.image] : [];

    if( !files || !files.length ){ 
      return res.status(201).json({ message: "✅ Review Submitted successfully", data: updatedOrCreated });
    }

    const mediaArray: any[] = [];

    for (const file of files) {
      const media_id = data._id && isValidObjectId(data._id) ? data._id : null;
      const uploaded = await uploadMedia({ file, name: 'Image', pathType: "Review", media_id, user_id: data.user_id });

      mediaArray.push(uploaded);
    }

    await syncMediaHub({ module: "Review", module_id: updatedOrCreated._id, mediaArray });

    return res.status(201).json({ message: "✅ Review Submitted successfully", data: updatedOrCreated });
  } catch (error) { log(error); return res.status(500).json({ message: "Server error", error });}
}

const functions = {
  create_update_review,
};

export const config = { api: { bodyParser: false } };
export default createApiHandler(functions);