import { NextApiRequest, NextApiResponse } from "next";
import { authMiddleware } from "./tokenUtils";
import { setRequestContext } from "lib/server/requestContext";
import { validateSyncRequest } from "lib/utils/syncAuth";
import { checkPermissionLogic, getUserIdFromToken } from "pages/api/basic/auth";

export interface MiddlewareConfig {
  name: string;
  options?: any;
}

export type MiddlewareFn<TOptions = any> = (
  req: NextApiRequest,
  res: NextApiResponse,
  options?: TOptions
) => Promise<boolean | string>;

export interface ApiFunction {
  middlewares?: (string | MiddlewareConfig)[];
  handler?: (req: NextApiRequest, res: NextApiResponse) => Promise<void>;
}

export type FunctionsMap = Record<string, ApiFunction>;

export interface HandlerConfig {
  middlewares?: (string | MiddlewareConfig)[];
  url?: string;
}

export type APIHandlers = Record<string, HandlerConfig>;

interface UploadedFile {
  filepath: string;
  originalFilename?: string;
  mimetype?: string;
  size: number;
}

export function requireUserId(fn: MiddlewareFn): MiddlewareFn {
  return async (req, res, options) => {
    const user_id = await getUserIdFromToken(req);
    if (!user_id) return "Not logged in";
    return fn(req, res, options);
  };
}

function cleanObject(obj: any): any {
    if (Array.isArray(obj)) {
        return obj.map(cleanObject);
    }

    if (obj && typeof obj === "object") {
        return Object.fromEntries(
            Object.entries(obj)
                .filter(([_, value]) =>
                    value !== undefined &&
                    value !== "undefined"
                )
                .map(([key, value]) => [
                    key,
                    cleanObject(value),
                ])
        );
    }

    return obj;
}

export const middlewareRegistry: Record<string, MiddlewareFn> = {
  checkPermissions: async (req, res, options?: { url?: string }) => {
    if (options?.url) { req.query.url = options.url; }

    const result = await checkPermissionLogic(req, options?.url);
    return result?.data === true;
  },

  checkPostMethod: async (req, res) => {
    console.log("req.body", req.body)
    
    if (req.method !== "POST") { return "Invalid request method"; }

    req.body = cleanObject(req.body);
    return true;
  },

  checkUserId: async (req, res) => {
    const user_id = await getUserIdFromToken(req);
    if (!user_id) { return "User ID is missing"; }
    return true;
  },

  checkOrigin : async (req, res) => {
    const allowedOrigins = [
      "https://www.misthir.com",
      "https://misthir.com",
      "http://localhost:3000",
    ];

    const origin = req.headers.origin || req.headers.referer || "";

    if (!origin) {
      return "Missing Origin or Referer header";
    }

    const isAllowed = allowedOrigins.some((allowed) => origin.startsWith(allowed));
    if (!isAllowed) {
      console.warn(`Blocked request from unauthorized origin: ${origin}`);
      return "Unauthorized origin";
    }

    return true;
  },

  syncAuth: async (req) => {
    const auth = validateSyncRequest(req);
    if (!auth.ok) { return auth.message ?? "syncAuth Error"; }
    return true;
  },

  // BELOW IS not working and not tested //
  
  checkRole: requireUserId(async (req, res, options?: { roles: string[] }) => {
    const role = req.body.role;
    if (!role || !options?.roles?.includes(role)) return "Role not allowed";
    return true;
  }),  

  checkOwnership: requireUserId(async (req, res, options?: { resourceOwnerId?: string }) => {
    const ownerId = options?.resourceOwnerId;
    if (!ownerId || ownerId !== req.body.user_id) return "Not owner";
    return true;
  }),
  
  rateLimit: async (req, res, options?: { limit?: number }) => {
    const limit = options?.limit || 100;
    return true;
  },
  
  validateInput: async (req, res, options?: { requiredFields?: string[] }) => {
    const missing = options?.requiredFields?.filter(f => !req.body[f]);
    if (missing && missing.length) return `Missing fields: ${missing.join(", ")}`;
    return true;
  },

  validateFileType: async (req: NextApiRequest, res: NextApiResponse, options?: { allowedTypes?: string[] }) => {
    const files = (req as any).files || {};
    const allowed = options?.allowedTypes || [];

    for (const key of Object.keys(files)) {
      const file = files[key] as UploadedFile | UploadedFile[];
      const fileArray = Array.isArray(file) ? file : [file];

      for (const f of fileArray) {
        if (!f.mimetype || !allowed.includes(f.mimetype)) {
          return `Invalid file type: ${f.mimetype || "unknown"}`;
        }
      }
    }
    return true;
  },

  validateFileSize: async (req: NextApiRequest, res: NextApiResponse, options?: { maxSizeMB?: number }) => {
    const files = (req as any).files || {};
    const maxSize = (options?.maxSizeMB || 5) * 1024 * 1024;

    for (const key of Object.keys(files)) {
      const file = files[key] as UploadedFile | UploadedFile[];
      const fileArray = Array.isArray(file) ? file : [file];

      for (const f of fileArray) {
        if (f.size > maxSize) {
          return `File too large: ${f.originalFilename || "unknown"}`;
        }
      }
    }
    return true;
  },

  logActivity: async (req, res, options?: { action?: string }) => {
    return true;
  },
};

export const middlewareGroups: Record<string, (string | MiddlewareConfig)[]> = {
  authRequired: [ "checkUserId" ],
  postMethod: [ "checkPostMethod" ],

  roleOwnerVendorStaff: [
    { name: "checkRole", options: { roles: ["owner", "vendor", "staff"] } },
  ],

  canCreateOrUpdateReview: [
    { name: "checkPermissions", options: { permissions: ["create_review", "update_review"] } },
  ],
};

async function resolveMiddlewares( list: (string | MiddlewareConfig)[] ): Promise<MiddlewareConfig[]> {
  const resolved: MiddlewareConfig[] = [];

  for (const item of list) {
    if (typeof item === "string") {
      if (middlewareGroups[item]) {
        const group = await resolveMiddlewares(middlewareGroups[item]);
        resolved.push(...group);
      } else {
        resolved.push({ name: item });
      }
    } else {
      resolved.push(item);
    }
  }

  return resolved;
}

export async function runMiddlewares( req: NextApiRequest, res: NextApiResponse, list: (string | MiddlewareConfig)[], handlerConfig?: HandlerConfig ): Promise<boolean> {
  const isSyncRequest = list.includes("syncAuth");

  let user_id = null;
  if (!isSyncRequest) {
    try {
      user_id = await getUserIdFromToken(req);
    } catch (e) {
      // Suppress token errors
    }
    await new Promise<void>((resolve) => authMiddleware(req, res, resolve));
  }
  
  setRequestContext({ req, user_id });
  
  const hasAllowCross = list.some(
    (item) => (typeof item === "string" && item === "allowCrossOrigin") || 
              (typeof item !== "string" && item.name === "allowCrossOrigin")
  );
  
  if (!hasAllowCross && !isSyncRequest) { 
    list = ["checkOrigin", ...list]; 
  }

  if (handlerConfig?.url) {
    list = [ ...list, { name: "checkPermissions", options: { url: handlerConfig.url } }, ];
  }

  const middlewares = await resolveMiddlewares(list);
  
  for (const mw of middlewares) {
    const fn = middlewareRegistry[mw.name];
    if (!fn) continue;

    const result = await fn(req, res, mw.options);
    
    if (result !== true) {
      const msg = typeof result === "string" ? result : `${mw.name} failed`;
      res.status(403).json({ success: false, message: msg });
      return false;
    }
  }

  return true;
}