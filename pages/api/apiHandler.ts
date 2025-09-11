import { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import fs from "fs";
import { IncomingForm, Fields, Files } from 'formidable';
import connectDB from "pages/lib/mongodb";
import { log } from "./utils";

const tmpDir = path.join(process.cwd(), 'tmp');
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir);
}

function normalizeFormFields(fields: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const key in fields) {
    const value = fields[key];
    const v = Array.isArray(value) && value.length === 1 ? value[0] : value;
    result[key] = v === 'null' || v === '' ? undefined : v;
  }
  return result;
}

function parseForm(req: NextApiRequest): Promise<{ fields: Fields; files: Files }> {
  return new Promise((resolve, reject) => {
    const form = new IncomingForm({
      uploadDir: tmpDir,
      keepExtensions: true,
      multiples: true,
    });

    form.parse(req, (err: Error | null, fields: Fields, files: Files) => {
      if (err) {
        console.error('❌ Formidable parse error:', err);
        reject(err);
      } else {
        resolve({ fields, files });
      }
    });
  });
}

export type HandlerMap = {
  [key: string]: (req: NextApiRequest, res: NextApiResponse) => Promise<void>;
};

export interface ExtendedRequest extends NextApiRequest { file?: File; files?: { [key: string]: File | File[] }; }

export function createApiHandler(functions: HandlerMap) {
  return async function handler(req: NextApiRequest, res: NextApiResponse) {
    console.log('➡️ Incoming request:', req.method, req.url);

    try {
      let fnName: string;
      let body: any = {};
      let files: any = null;

      if (req.method === 'POST') {
        console.log('📁 Parsing form-data');
        const { fields, files: uploadedFiles } = await parseForm(req);
        body = normalizeFormFields(fields);
        files = uploadedFiles;

        fnName = body.function;
      } else {
        fnName = req.method === 'GET' ? (req.query.function as string) : (req.body.function as string);
      }

      console.log('🔧 Target function name:', fnName);

      if (!fnName || typeof fnName !== 'string') {
        return res.status(400).json({ message: 'Missing or invalid function name' });
      }

      const targetFn = functions[fnName];
      if (typeof targetFn !== 'function') {
        return res.status(400).json({ message: `Invalid function name: ${fnName}` });
      }

      await connectDB();

      req.body = body;
      if (files) (req as any).files = files;

      await targetFn(req, res);
    } catch (error) {
      console.error('❌ API handler error:', error);
      if (!res.headersSent) {
        return res.status(500).json({ message: 'Internal Server Error' });
      }
    }
  };
}