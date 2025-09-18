import { isValidObjectId, Types } from 'mongoose';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserIdFromToken, log } from '../utils';
import { syncMediaHub, uploadMedia } from './media';
import { createApiHandler, ExtendedRequest, } from '../apiHandler';
import Review from 'lib/models/basic/Review';
import "lib/models";

export async function create_update_review(req: ExtendedRequest, res: NextApiResponse) { 
  try {
    if (req.method !== "POST") { return res.status(405).json({ message: "Method Not Allowed" }); }
    
    const user_id = getUserIdFromToken(req);
    if (!user_id) { return res.status(401).json({ message: "Unauthorized" }); }

    const data = req.body;  
    if ( !data?.review || !data?.rating ) { return res.status(400).json({ message: 'Required fields missing' }); }

    const { module, module_id, rating, review } = data;

    console.log("req.body", req.body)

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

export async function get_all_reviews(req: NextApiRequest, res: NextApiResponse) {
  try {
    const data = await Review.find().populate([ { path: "module_id", select: "_id name url" }, { path: "user_id", select: "name email phone" } ]).exec();
    return res.status(200).json({ message: 'Fetched all Reviews', data });
  } catch (error) { log(error); }
}

export async function get_single_review(req: NextApiRequest, res: NextApiResponse){
  const id = (req.method === 'GET' ? req.query.id : req.body.id) as string;
  if (!id || !Types.ObjectId.isValid(id)) { return res.status(400).json({ message: 'Invalid or missing ID' }); }

  const entry = await Review.findById(id).populate([ { path: "module_id", select: "name url" }, { path: "mediaHub", populate: { path: "media_id" } } ]).exec();
  if (!entry) { return res.status(404).json({ message: `Page with ID ${id} not found` }); }

  return res.status(200).json({ message: '✅ Single Entry Fetched', data: entry });
};

export async function update_review(req: ExtendedRequest, res: NextApiResponse) { 
  try {
    if (req.method !== "POST") { return res.status(405).json({ message: "Method Not Allowed" }); }

    const data = req.body;  
    if ( !data?.review || !data?.rating || !data?.user_id ) { return res.status(400).json({ message: 'Required fields missing' }); }

    const { module, module_id, rating, review, user_id } = data;

    console.log("req.body", req.body)

    const updatedOrCreated = await Review.findOneAndUpdate({ module, module_id, user_id }, 
          {
            $set: {
              rating,
              review,
              status:data.status,
              displayOrder: Number(data.displayOrder),
              updatedAt: new Date(),
            }, $setOnInsert: { createdAt: new Date() }
          }, { new: true, upsert: true }
        );

    return res.status(201).json({ message: "✅ Review Submitted successfully", data: updatedOrCreated });
  } catch (error) { log(error); return res.status(500).json({ message: "Server error", error });}
}

export async function getReviews({ module, moduleId }: { module: string; moduleId: string }) {
  try{
    const data = Review.find({ module, module_id: moduleId, status: true }).populate([ { path: "module_id", select: "_id name url" }, { path: "user_id", select: "name email phone" }, { path: "mediaHub", populate: { path: "media_id" } } ]).sort({ displayOrder: 1, createdAt: -1 }).lean().exec();

    return data;
  }catch (err) { log(err); }
}

const functions = {
  create_update_review,
  get_all_reviews,
  get_single_review,
  update_review,
};

export const config = { api: { bodyParser: false } };
export default createApiHandler(functions);