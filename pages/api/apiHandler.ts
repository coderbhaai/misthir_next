import { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import fs from "fs";
import { IncomingForm, Fields, Files } from "formidable";
import connectDB from "lib/server/mongodb";
import {FunctionsMap, runMiddlewares} from "../../lib/server/middleware";
import { normalizeError } from "./utils";

const tmpDir = path.join(process.cwd(), "tmp");
if (!fs.existsSync(tmpDir)) { fs.mkdirSync(tmpDir); }

function normalizeFormFields(fields: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};

  for (const key in fields) {
    const value = fields[key];
    const v = Array.isArray(value) && value.length === 1 ? value[0] : value;
    result[key] = v === "null" || v === "" ? undefined : v;
  }

  return result;
}

function parseForm(req: NextApiRequest): Promise<{ fields: Fields; files: Files }> {
  return new Promise((resolve, reject) => {
    const form = new IncomingForm({ uploadDir: tmpDir, keepExtensions: true, multiples: true});

    form.parse(req, ( err: Error | null, fields: Fields, files: Files ) => {
        if (err) {
          console.error("❌ Formidable parse error:", err);
          reject(err);
        } else { resolve({ fields, files }); }
      }
    );
  });
}

export type HandlerMap = {
  [key: string]: (
    req: NextApiRequest,
    res: NextApiResponse
  ) => Promise<void | NextApiResponse>;
};

export interface ExtendedRequest
  extends NextApiRequest {
  file?: File;

  files?: {
    [key: string]: File | File[];
  };
}

async function safeExecute(fn: any, req: any, res: any) {
  let lastStep = "START";

  try {
    const safeRes = new Proxy(res, {
      get(target, prop) {
        if (prop === "json" || prop === "send" || prop === "end") {
          return function (...args: any[]) {
            lastStep = "RESPONSE_SENT";
            return (target as any)[prop].apply(target, args);
          };
        }
        return (target as any)[prop];
      },
    });

    lastStep = "HANDLER_START";
    await fn(req, safeRes);
    lastStep = "HANDLER_FINISH";

    if (!res.headersSent) {
      console.error("❌ 11111 No response sent by handler", fn);

      return res.status(500).json({
        success: false,
        message: `222 No response sent by handler, ${fn}`,
        debug: {
          lastStep,
          function: req.body?.function,
        },
      });
    }
  } catch (error: any) {
    console.error("❌ safeExecute error:", error);

    return res.status(500).json({
      success: false,
      message: normalizeError(error),
      debug: {
        lastStep,
        stack: error?.stack,
        code: error?.code,
      },
    });
  }
}

export function createApiHandler(functions: FunctionsMap, handlers: HandlerMap) {
  return async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
      let fnName: string;
      let body: any = {};
      let files: any = null;
      if (req.method === "POST") {
        try {
          const {fields, files: uploadedFiles} = await parseForm(req);

          if (fields && Object.keys(fields).length > 0) {
            body = normalizeFormFields(fields);
            files = uploadedFiles;
          }
        } catch {
          body = req.body;
        }
      }

      fnName = (req.query.function as string) || body?.function || (req.method === "GET" ? undefined : req.body?.function);
      if (!fnName || typeof fnName !== "string") { return res.status(400).json({ message: "Missing or invalid function name" }); }

      const targetFn = functions[fnName];
      if (!targetFn) { return res.status(400).json({message: `Invalid function name: ${fnName}`}); }

      await connectDB();

      req.body = body;

      if (files) {
        (req as any).files = files;
      }

      if (targetFn.middlewares?.length) {
        const passed = await runMiddlewares(
          req,
          res,
          targetFn.middlewares,
          targetFn
        );

        if (!passed) {
  if (!res.headersSent) {
    res.status(401).json({
      success: false,
      message: "Middleware blocked request",
      debug: {
        middleware: "checkUserId / checkPostMethod / etc",
      },
    });
  }
  return false;
}
      }

      const handlerFn = handlers[fnName];
      if (!handlerFn) { return res.status(500).json({ message: `No handler defined for ${fnName}` }); }

      await safeExecute(handlerFn, req, res);
    } catch (error) {
      console.error("❌ API handler error:", error);

      if (!res.headersSent) {
        return res.status(500).json({ message: "Internal Server Error" });
      }
    }
  };
}