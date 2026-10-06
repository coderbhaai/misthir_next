import { MediaProps } from '@amitkk/basic/types/media';
import { apiRequest } from './client-api';
import { Types } from 'mongoose';

export interface LayoutLinks {
  adminLinks: any[];
  userSubmenus: any[];
  sellerSubmenus: any[];
}

export const getLayoutLinks = async (): Promise<LayoutLinks> => {
  const res = await apiRequest("GET", "basic/menu?function=get_admin_menu");
  const links = res?.data;

  return links || { adminLinks: [], userSubmenus: [] };
};

export const extractMediaId = (media: unknown): string | null => {
  if (!media) return null;

  if (typeof media === "string") {
    if (media === "null" || media === "") return null;
    return media;
  }

  if (typeof media === "object" && "_id" in media) {
    return String((media as { _id: string })._id);
  }

  return null;
};

export function getProp<T>(value: unknown, prop: keyof T, fallback: any = ""): any {
  if ( value && typeof value === "object" && !("toHexString" in (value as any)) ) {
    return (value as T)[prop] ?? fallback;
  }
  return fallback;
}

export const getId = (obj: any): string => {
    if (!obj) return "";
    return typeof obj === "string" ? obj : obj._id ?? "";
};

export const lead_options = [
  { label: "Requested", value: "Requested" },
  { label: "Quoted", value: "Quoted" },
  { label: "Open", value: "Open" },
  { label: "Closed", value: "Closed" },
  { label: "Fake", value: "Fake" },
  { label: "Duplicate", value: "Duplicate" },
  { label: "In Progress", value: "In Progress" },
  { label: "Booked", value: "Booked" },
];

export const renderDecimal = (value: any): number | string => {
  if (value === "" || value === null || value === undefined) return "";
  if (typeof value === "number") return value;
  
  if (value && typeof value === "object" && "toString" in value) {
    const parsed = parseFloat(value.toString());
    return isNaN(parsed) ? "" : parsed;
  }
  
  if (typeof value === "object" && value !== null) {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? "" : parsed;
  }

  return String(value);
};

export interface PopulatedRefMap {
  media_id: MediaProps;
}

export function resolvePopulated<K extends keyof PopulatedRefMap>(parent: unknown, key: K): PopulatedRefMap[K] | null {
  if (parent && typeof parent === "object" && key in parent && typeof (parent as any)[key] === "object" && (parent as any)[key] !== null) {
    return (parent as any)[key];
  }

  return null;
}