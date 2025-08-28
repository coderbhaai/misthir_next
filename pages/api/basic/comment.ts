import { Types } from 'mongoose';
import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from 'pages/lib/mongodb';
import { getUserIdFromToken, log } from '../utils';
import CommentModel from 'lib/models/basic/CommentModel';

type HandlerMap = {
  [key: string]: (req: NextApiRequest, res: NextApiResponse) => Promise<void>;
};

export async function create_update_comment(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') { return res.status(405).json({ message: 'Method Not Allowed' }); }
    
    const data = req.body;
    const user_id = getUserIdFromToken(req);
    if (!user_id) { return res.status(401).json({ message: "Unauthorized" }); }

    const { module, module_id, name, email, content } = data;
    const updatedOrCreated = await CommentModel.findOneAndUpdate(
      { module, module_id, user_id }, 
      {
        $set: {
          name,
          email,
          content,
          status: 0,
          updatedAt: new Date(),
        },
        $setOnInsert: { createdAt: new Date() }
      },
      { new: true, upsert: true }
    );

    return res.status(200).json({
      message: updatedOrCreated.createdAt ? "Entry created successfully" : "Entry updated successfully",
      data: updatedOrCreated
    });
  } catch (error) { log(error); }
}

export async function get_all_comments(req: NextApiRequest, res: NextApiResponse) {
  try {
    const data = await CommentModel.find().populate([ { path: "module_id", select: "name url" }, { path: "user_id", select: "fullName email" } ]).exec();
    return res.status(200).json({ message: 'Fetched all Comments', data });
  } catch (error) { log(error); }
}

export async function get_single_comment(req: NextApiRequest, res: NextApiResponse){
  const id = (req.method === 'GET' ? req.query.id : req.body.id) as string;

  if (!id || !Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid or missing ID' });
  }

  const entry = await CommentModel.findById(id).exec();
  if (!entry) { return res.status(404).json({ message: `Page with ID ${id} not found` }); }

  return res.status(200).json({ message: '✅ Single Entry Fetched', data: entry });
};


export async function get_comments(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { module, module_id } = req.body;

    if (!module) return res.status(400).json({ message: "Module name is required" });
    if (!module_id) return res.status(400).json({ message: "Row ID (_id) is required" });

    const data = await CommentModel.find({ module, module_id, status: true }).populate([ { path: "user_id", select: "fullName email" } ]).exec();

    return res.status(200).json({ message: `All Comments sent.`, data: data });
  } catch (error) { log(error); }
}

const functions: HandlerMap = {
  create_update_comment: create_update_comment,
  get_all_comments: get_all_comments,
  get_single_comment: get_single_comment,
  get_comments: get_comments,
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const fnName = req.method === 'GET' ? (req.query.function as string) : req.body.function;
  if (!fnName || typeof fnName !== 'string') { return res.status(400).json({ message: 'Missing or invalid function name' }); }

  const targetFn = functions[fnName];
  if (!targetFn) { return res.status(400).json({ message: `Invalid function name: ${fnName}` }); }

  try {
    await connectDB();
    await targetFn(req, res);
  } catch (error) { return log(error); }
}