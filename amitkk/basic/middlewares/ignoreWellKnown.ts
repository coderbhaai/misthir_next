import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function ignoreWellKnown(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/.well-known/")) {
    return new NextResponse(null, { status: 204 }); // No Content
  }

  return NextResponse.next();
}