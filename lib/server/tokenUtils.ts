// lib/server/tokenUtils.ts
import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import cookie from "cookie";

export interface DecodedToken {
  _id: string;
  email?: string;
  name?: string;
  roles?: any[];
  permissions?: any[];
  iat?: number;
  exp?: number;
}

/**
 * Extracts user_id from cookies or headers.
 */
export function getUserIdFromToken(req: NextApiRequest): string | null {
  try {
    // ✅ If already attached by authMiddleware
    if ((req as any).user_id) return (req as any).user_id;

    // ✅ Try Authorization header first
    const authHeader = req.headers.authorization;
    let token: string | null = null;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else {
      // ✅ Fallback to cookies
      const cookies = cookie.parse(req.headers.cookie || "");
      token = cookies.authToken || null;
    }

    if (!token) return null;

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as DecodedToken;
    return decoded?._id || null;
  } catch (err) {
    console.error("[AUTH] Error decoding token:", err);
    return null;
  }
}

/**
 * Auth middleware to attach user_id to req.
 */
export async function authMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  next: () => void
) {
  try {
    const user_id = await getUserIdFromToken(req);
    (req as any).user_id = user_id || null;
  } catch (err) {
    (req as any).user_id = null;
  }

  next();
}
