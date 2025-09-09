import { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import fs from "fs";
import { IncomingForm, Fields, Files } from 'formidable';
import connectDB from "pages/lib/mongodb";
import { log } from "./utils";

export const config = {
  api: {
    bodyParser: false,
  },
};

export type HandlerMap = {
  [key: string]: (req: NextApiRequest, res: NextApiResponse) => Promise<void>;
};

export interface ExtendedRequest extends NextApiRequest {
  file?: File;
  files?: { [key: string]: File | File[] };
}

const tmpDir = path.join(process.cwd(), 'tmp');
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir);
}

export interface ExtendedRequest extends NextApiRequest {
  file?: File;
  files?: { [key: string]: File | File[] };
}

export const parseForm = (req: NextApiRequest): Promise<{ fields: Fields; files: Files }> => {
  return new Promise((resolve, reject) => {
    const form = new IncomingForm({
      uploadDir: tmpDir,
      keepExtensions: true,
      multiples: true,
    });

    form.parse(req, (err: Error | null, fields: Fields, files: Files) => {
      if (err) {
        reject(err);
      } else {
        resolve({ fields, files });
      }
    });
  });
};

export function normalizeFormFields(fields: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const key in fields) {
    const value = fields[key];
    const v = Array.isArray(value) && value.length === 1 ? value[0] : value;
    result[key] = v === 'null' || v === '' ? undefined : v;
  }
  return result;
}

export function createApiHandler(functions: HandlerMap) {
  return async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
      let fnName: string;
      let body: any = req.body;

      if (req.method === 'POST') {
        const contentType = req.headers['content-type'] || '';
        if (contentType.includes('multipart/form-data')) {
          const { fields, files } = await parseForm(req);
          body = normalizeFormFields(fields);
          (req as any).files = files;
        }

        fnName = body.function;
      } else {
        fnName = req.method === 'GET' ? (req.query.function as string) : req.body.function;
      }

      console.log("fnName", fnName)

      if (!fnName || typeof fnName !== 'string') {
        return res.status(400).json({ message: 'Missing or invalid function name' });
      }

      const targetFn = functions[fnName];
      if (!targetFn) {
        return res.status(400).json({ message: `Invalid function name: ${fnName}` });
      }

      await connectDB();

      req.body = body;

      await targetFn(req, res);
    } catch (error) {
      console.error('API Error:', error);
      if (!res.headersSent) {
        return res.status(500).json({ message: 'Internal Server Error' });
      }
    }
  };
}
