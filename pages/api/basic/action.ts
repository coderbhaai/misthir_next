import { Types } from 'mongoose';
import type { NextApiRequest, NextApiResponse } from 'next';
import { createApiHandler } from '../apiHandler';
import { Action } from 'lib/models/basic/Action';
import { log } from '../utils';
import { Order } from 'lib/models/ecom/Order';
import { OrderMail } from '@amitkk/ecom/mails/OrderMail';

export async function initAction(module: string, module_id: Types.ObjectId) {
  try {
    let action = await Action.findOneAndUpdate(
      { module, module_id },
      { status: false },
      { upsert: true, new: true }
    );

    return action._id;
  } catch (error) { log(error); }
}

export async function closeAction(action_id?: string) {
  try {
    const action = await Action.findOne({ _id: action_id, status: false });
    if (!action) return;

    if (action.module === "Ecom") {
      await OrderMail(action.module_id.toString());      
    }

    action.status = true;
    await action.save();
  } catch (error) { log(error); }
}

export async function cleanActions() {
  try {
    const pending = await Action.find({ status: false });
    if (!pending.length) return;

    for (const action of pending) {
      await closeAction(action._id.toString());
    }
  } catch (error) { log(error); }
}


const functions = {
  // create_update_comment,
};

export const config = { api: { bodyParser: false } };
export default createApiHandler(functions);