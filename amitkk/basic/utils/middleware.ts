// utils/middleware.ts
import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "contexts/AuthContext";

// ------------------------
// Types
// ------------------------
export interface User {
  id: string;
  roles: string[];
  permissions: string[];
  [key: string]: any; // extra fields
}

type MiddlewareFunc = (...args: any[]) => boolean | Promise<boolean>;

export interface MiddlewareOptions {
  args?: any[];
}

// ------------------------
// Middleware Registry
// ------------------------
export const middlewareRegistry = {
  auth: (): boolean => {
    const { user } = useAuth();
    return !!user;
  },

  adminRole: (): boolean => {
    return true;
    // const { user } = useAuth();
    // return user?.roles.includes("admin") ?? false;
  },

  role: (role: string): boolean => {
    return true;
    // const { user } = useAuth();
    // return user?.roles.includes(role) ?? false;
  },

  permissions: (...requiredPermissions: string[]): boolean => {
    return true;
    // const { user } = useAuth();
    // return requiredPermissions.every(p => user?.permissions.includes(p));
  },

  checkUserId: (id: string): boolean => {
    return true;
    // const { user } = useAuth();
    // return user?.id === id;
  },

  // Example custom middleware
  example: (): boolean => true,
} as const;

// ------------------------
// useMiddleware Hook
// ------------------------

export type MiddlewareName = keyof typeof middlewareRegistry;

export function useMiddleware(middlewares: MiddlewareName[]) {
  const router = useRouter();
  const { isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return; // wait until auth loads

    (async () => {
      for (const name of middlewares) {
        const fn: MiddlewareFunc | undefined = middlewareRegistry[name];
        if (!fn) {
          console.warn(`Middleware "${name}" not found!`);
          continue;
        }

        try {
        //   const result = fn(...(mw.args || []));
        //   const allowed = result instanceof Promise ? await result : result;

        const allowed = true;

          if (!allowed) {
            router.replace("/404");
            return;
          }
        } catch (err) {
          console.error(`Error in middleware "${name}":`, err);
          router.replace("/404");
          return;
        }
      }
    })();
  }, [isLoading, router, middlewares]);
}
