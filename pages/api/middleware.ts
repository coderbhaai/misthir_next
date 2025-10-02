import { NextApiRequest, NextApiResponse } from "next";

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
    const user_id = req.body.user_id;
    if (!user_id) return "Not logged in";
    return fn(req, res, options);
  };
}

export const middlewareRegistry: Record<string, MiddlewareFn> = {
  checkPostMethod: async (req, res) => req.method === "POST" || "POST method required",
  
  checkRole: requireUserId(async (req, res, options?: { roles: string[] }) => {
    const role = req.body.role;
    if (!role || !options?.roles?.includes(role)) return "Role not allowed";
    return true;
  }),

  checkPermissions: requireUserId(async (req, res, options?: { permissions: string[] }) => {
    const userPerms: string[] = req.body.permissions || [];
    if (!options?.permissions?.some((p) => userPerms.includes(p))) return "Permission denied";
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
    console.log(`[Activity] User ${req.body.user_id} performed ${options?.action}`);
    return true;
  },
};

export const middlewareGroups: Record<string, (string | MiddlewareConfig)[]> = {
  authRequired: ["checkUserId", "checkPostMethod"],

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

export async function runMiddlewares( req: NextApiRequest, res: NextApiResponse, list: (string | MiddlewareConfig)[] ): Promise<boolean> {
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