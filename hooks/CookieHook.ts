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

export function setCookie(key: string, value: string, days = 7) {
  if (typeof document === 'undefined') return;

  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = `; Expires=${date.toUTCString()}`;
  }

  document.cookie = `${encodeURIComponent(key)}=${encodeURIComponent(value || "")}${expires}; Path=/`;
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
