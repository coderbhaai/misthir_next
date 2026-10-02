// ./lib/server/requestContext.ts
import type { NextApiRequest } from "next";

interface RequestContext {
  req?: NextApiRequest;
  user_id?: string | null;
}

let store: any = null;

function getStore() {
  if (store) return store;

  // Ensure this only executes on the Node.js server side
  if (typeof window !== "undefined") return null;

  try {
    // eval("require") prevents Webpack from trying to bundle 'async_hooks' for client builds
    const { AsyncLocalStorage } = eval('require("async_hooks")');
    store = new AsyncLocalStorage();
    return store;
  } catch (e) {
    return null;
  }
}

export function setRequestContext(context: RequestContext) {
  const s = getStore();
  if (!s) return;
  s.enterWith(context);
}

export function getRequestContext(): RequestContext | null {
  const s = getStore();
  if (!s) return null;
  return s.getStore() || null;
}