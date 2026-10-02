// amitkk > basic > utils > my-utils > admin-utils.tsx

import { getCookie } from 'hooks/CookieHook';
import { NextApiResponse } from 'next';
import { useMemo } from 'react';
import React from 'react';
import { Types } from 'mongoose';
import axios from 'axios';
import { getCurrentFilters, getCurrentPagination } from 'contexts/FilterContext';
import toast from 'react-hot-toast';

export function clo(error: any, res?: NextApiResponse) {
  hitToastr("error", error.message || "An unexpected error occurred");

  if (res) {
    return res.status(500).json({ message: error.message || "Internal Server Error" });
  }
}

export type TableDataFormProps = {
  open: boolean;
  handleClose: () => void;
  selectedDataId: string | number | null | object;
}

export type TableDataFormPropsModule = {
  open: boolean;
  handleClose: () => void;
  selectedModule: string | number | null | object;
  selectedModuleId: string | number | null | object;
}

export function useTableFilter<T>( data: T[] = [],  order: "asc" | "desc", orderBy: keyof T, filterData: string, filterFields: Array<keyof T> ) {
  return useMemo(
    () =>
      applyFilter<T>({
        inputData: Array.isArray(data) ? data : [],
        comparator: getComparator(order, orderBy),
        filterData,
        filterFields,
      }),
    [data, order, orderBy, filterData, filterFields]
  );
}

export const handleMultiSelectChange = (
  value: string | string[],
  setState: React.Dispatch<
    React.SetStateAction<string[]>
  >
) => {
  setState(
    typeof value === "string"
      ? value.split(",")
      : value
  );
};

export function useForm<T extends Record<string, any>>(initialState: T) {
  const [formData, setFormData] = React.useState<T>(initialState);

  const handleChange = (e: | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { name: string; value: any }) => {
  if ("target" in e) {
    const { name, value } = e.target;
    setFormData((prev) => ({...prev, [name]: value}));
  } else {
    const { name, value } = e;
    setFormData((prev) => ({...prev, [name]: value}));
  }
};

  const setFieldValue = <K extends keyof T>(
    field: K,
    value: T[K]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return {
    formData,
    setFormData,
    handleChange,
    setFieldValue,
  };
}

export async function updateBrowsingHistory( module: string, module_id: string ) {
  try {
    apiRequest("POST", `basic/page`, { function: "create_update_browsing_history", module, module_id });
  } catch (error) { clo(error); }
}

export async function checkPermission(slug: string | string[]): Promise<boolean> {
  try {
    const res = await apiRequest("GET", `basic/spatie?function=check_permission&url=${slug}`);
    return res?.data === true;
  } catch (err) { clo(err); return false; }
}

export function isPopulated<T>(value: unknown): value is T {
  if (!value) { return false; }
  if (typeof value === "string") { return false; }
  if (value instanceof Types.ObjectId) { return false; }
  return typeof value === "object";
}

export function formatTime12Hour(value?: string | null) {
  if (!value) { return null; }

  const cleanValue = String(value).trim();

  // 🛠️ FIX: If the string already contains AM or PM, it's already perfectly formatted! Return it directly.
  if (/AM|PM/i.test(cleanValue)) {
    return cleanValue;
  }

  // Fallback handler: If it's a raw 24-hour database string ("13:00" -> "1:00 PM")
  const [hoursStr, minutesStr] = cleanValue.split(":");
  const hours = Number(hoursStr);
  const minutes = Number(minutesStr);

  if (isNaN(hours) || isNaN(minutes)) {
    return cleanValue; // Defensive fallback to prevent "Invalid Date" layout breaks
  }

  const ampm = hours >= 12 ? "PM" : "AM";
  const displayHour = hours % 12 === 0 ? 12 : hours % 12;
  const displayMinute = String(minutes).padStart(2, "0");

  return `${displayHour}:${displayMinute} ${ampm}`;
}

export function extractId(value: any): string | undefined {
  if (!value) return undefined;

  if (typeof value === "string") return value;

  if (typeof value === "object" && value._id) {
    return value._id;
  }

  return undefined;
}

export const fetchAllModules = async () => {
  const res = await apiRequest("GET", "basic/routing?function=get_all_modules");
  return res?.data ?? [];
};

export interface ModuleData {
  _id: string;
  name: string;
  url: string;
  module: string;
}

export const filterModules = (module?: string, module_id?: string, module_options: ModuleData[] = []): ModuleData[] => {
  try {
    if (!Array.isArray(module_options)) { return []; }

    let filtered = module? module_options.filter((m) => m?.module ?.toLowerCase() === module?.toLowerCase()) : module_options;
    if (module_id) {
      filtered = filtered.filter((m) => m?._id === module_id);
    }

    return filtered;
  } catch (error) { console.error("Error filtering modules:", error); return []; }
};

export const fetchModuleData = async (module: string) => {
  const res = await apiRequest("POST", `basic/page`, { function: "fetch_modules", module }); 
  return res?.data ?? [];
};

export const formatDate = (date: Date | string | null | undefined): string => {
  if (!date) return "-"; // Returns a fallback if date is missing
  
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric"
  });
};

export function applyFilter<T>({inputData, comparator, filterData, filterFields = []}: {inputData: T[]; filterData: string; comparator: (a: T, b: T) => number; filterFields: Array<keyof T>}): T[] {
  if (!Array.isArray(inputData)) {
    return [];
  }
  
  const stabilizedThis = inputData?.map((el, index) => [el, index] as const);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis?.map(el => el[0]);

  if (filterData && filterFields.length > 0) {
    inputData = inputData.filter(item =>
      filterFields.some(field => {
        const value = item[field];
        return (
          (typeof value === 'string' && value.toLowerCase().includes(filterData.toLowerCase())) ||
          (typeof value === 'number' && value.toString().includes(filterData)) ||
          (typeof value === 'boolean' && (filterData.toLowerCase() === 'true' ? value : !value))
        );
      })
    );
  }
  return inputData;
}

export function getComparator<T>(order: 'asc' | 'desc', orderBy: keyof T): (a: T, b: T) => number {
  return (a, b) => {
    const aValue = a[orderBy];
    const bValue = b[orderBy];

    let comparison = 0;

    if (aValue > bValue) {
      comparison = 1;
    } else if (aValue < bValue) {
      comparison = -1;
    }

    return order === 'asc' ? comparison : -comparison;
  };
}

import { Search, Edit, Trash, Download, } from "lucide-react";
const icons = { Search, Edit, Trash, Download, } as const;
export type IconName = keyof typeof icons;

type IconifyProps = React.SVGProps<SVGSVGElement> & {
  icon?: IconName;
};

export function Iconify({ icon = "Search", className = "", ...props }: IconifyProps) {
  const IconComponent = icons[icon];

  if (!IconComponent) {
    console.warn(`Icon '${icon}' not found in lucide-react`);
    return null;
  }

  return <IconComponent className={`cursor-pointer ${className}`} {...props} />;
}

export const axiosInstance = axios.create({
  baseURL: process.env.NEXT_MODE === 'dev' ? process.env.NEXT_DEV_URL : process.env.NEXT_PROD_URL,
  timeout: 10000,
});

export const apiRequest = async (
  method: "GET" | "POST" | "PUT" | "DELETE", 
  url: string, 
  data?: any
) => {
  try {
    const token = getCookie("authToken") || "";

    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
    };

    const filters = getCurrentFilters() || {};
    const pagination = getCurrentPagination() || { page: 0, limit: 25 };

    let finalData: any = data;

    if (["POST", "PUT"].includes(method)) {
      if (data instanceof FormData) {
        finalData = data;
        finalData.append("filters", JSON.stringify(filters));
        finalData.append("page", String(pagination.page));
        finalData.append("limit", String(pagination.limit));
        headers["Content-Type"] = "multipart/form-data";
      } else {
        finalData = JSON.stringify({ ...(data || {}), filters, page: pagination.page, limit: pagination.limit });
        headers["Content-Type"] = "application/json";
      }
    } else if (data && !(data instanceof FormData)) {
      finalData = JSON.stringify({ ...(data || {}), filters, page: pagination.page, limit: pagination.limit });
      headers["Content-Type"] = "application/json";
    }

    const isServer = typeof window === "undefined";
    let baseURL = "";

    if (isServer) {
      const mode = process.env.NEXT_MODE || "prod";
      baseURL = mode === "dev" ? process.env.NEXT_DEV_URL! : process.env.NEXT_PROD_URL!;
    }
    
    const res = await axiosInstance({
      method,
      url: isServer ? `${baseURL}/api/${url}` : `/api/${url}`,
      data: finalData,
      headers,
      validateStatus: () => true,
    });

    const isSuccess = res.status >= 200 && res.status < 300;
    const message = res.data?.message || (isSuccess ? "Operation successful" : "Something went wrong");

    if (!isSuccess) {
      hitToastr("error", message);
      return { error: true, status: res.status, message };
    }

    return res.data;
  } catch (error) {
    clo(error);
    hitToastr("error", "Something went wrong. Please try again.");
    return { error: true, message: "Request failed" };
  }
};

export const hitToastr = ( type: string, message: string) => {
  if( type == "error" ){ toast.error(message); }
  if( type == "success" ){ toast.success(message); }
};

interface MatchedModuleResult {
  name: string;
  url: string;
}

export async function getSelectedModuleInfo(module: string, module_id: string): Promise<MatchedModuleResult | null> {
  if (!module || !module_id) return null;

  try {
    const modulesData = await fetchAllModules();
    const filtered = filterModules(module, module_id, modulesData);

    if (Array.isArray(filtered) && filtered.length === 1) {
      const selected = filtered[0];
      const cleanUrl = !selected?.url || selected.url === "/" ? "/" : `/${selected.url.replace(/^\/+/, "")}`;

      return {
        name: selected?.name || "",
        url: cleanUrl
      };
    }
  } catch (error) { clo(error); }

  return null;
}

export async function downloadExcel({ url, payload, filename }: { url: string; payload?: any; filename?: string; }) {
  try {
    const token = getCookie("authToken") || "";

    const filters = getCurrentFilters() || {};
    const pagination = getCurrentPagination() || { page: 0, limit: 25 };

    const isFormData = payload instanceof FormData;

    const headers: HeadersInit = {
      Authorization: `Bearer ${token}`,
    };

    let body: BodyInit;

    if (isFormData) {
      payload.append("filters", JSON.stringify(filters));
      payload.append("page", String(pagination.page));
      payload.append("limit", String(pagination.limit));

      body = payload;
    } else {
      headers["Content-Type"] = "application/json";

      body = JSON.stringify({
        ...(payload || {}),
        filters,
        page: pagination.page,
        limit: pagination.limit,
      });
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body,
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(errText || "Failed to download file");
    }

    const blob = await response.blob();

    const downloadUrl = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download =
      filename ??
      `export_${new Date().toISOString().split("T")[0]}.xlsx`;

    document.body.appendChild(a);
    a.click();
    a.remove();

    window.URL.revokeObjectURL(downloadUrl);
  } catch (err) { clo(err); }
}


export const isValidEmail = (email: string) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const isValidWhatsapp = (whatsapp: string) => {
  const regex = /^\d{10}$/; // only 10 digits
  return regex.test(whatsapp);
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

export function hasCircularParent<T extends { _id: any; parent_id: any }>(
  items: T[],
  currentId: any,
  newParentId: any
): boolean {
  if (!newParentId) return false; // nothing to check

  const normalize = (v: any) => (v ? v.toString() : null);

  const targetId = normalize(currentId);
  let parent = normalize(newParentId);

  while (parent) {
    if (parent === targetId) return true;

    const next = items.find(i => normalize(i._id) === parent);
    if (!next) break;

    parent = normalize(next.parent_id);
  }

  return false;
}