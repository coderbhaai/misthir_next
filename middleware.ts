import { ignoreWellKnown } from "@amitkk/basic/middlewares/ignoreWellKnown";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  return ignoreWellKnown(req);
}

// Tell Next.js which routes use this
export const config = {
  matcher: ["/:path*"],
};