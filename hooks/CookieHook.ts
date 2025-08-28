// hooks/useCookies.ts
import { useState, useEffect } from "react";

interface CookieOptions {
  expires?: Date | number;
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

const DEFAULT_OPTIONS: CookieOptions = {
  path: '/',
  sameSite: 'lax',
  secure: false
};

export function getCookie(key: string): string | null {
  if (typeof document === 'undefined') return null;

  const name = key + '=';
  const decodedCookie = decodeURIComponent(document.cookie);
  const cookieArray = decodedCookie.split(';');

  for (let i = 0; i < cookieArray.length; i++) {
    let cookie = cookieArray[i].trim();
    if (cookie.indexOf(name) === 0) {
      return cookie.substring(name.length, cookie.length);
    }
  }
  return null;
}

export function setCookie( key: string, value: string, options: CookieOptions = {} ): void {
  if (typeof document === 'undefined') return;

  const mergedOptions: CookieOptions = { ...DEFAULT_OPTIONS, ...options };
  const { expires, path, domain, secure, sameSite } = mergedOptions;

  let cookieString = `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;

  if (expires) {
    if (typeof expires === 'number') {
      const date = new Date();
      date.setTime(date.getTime() + expires * 24 * 60 * 60 * 1000);
      cookieString += `; expires=${date.toUTCString()}`;
    } else {
      cookieString += `; expires=${expires.toUTCString()}`;
    }
  }

  if (path) cookieString += `; path=${path}`;
  if (domain) cookieString += `; domain=${domain}`;
  if (secure) cookieString += '; secure';
  if (sameSite) cookieString += `; samesite=${sameSite}`;

  document.cookie = cookieString;
}

export const forceDeleteCookie = (key: string): void => {
  if (typeof document === 'undefined') return;
  document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
};

export const useCookies = (key: string) => {
  const [value, setValue] = useState<string | null>(null);

  useEffect(() => {
    const item = getCookie(key);
    setValue(item);
  }, [key]);

  return { value };
};
