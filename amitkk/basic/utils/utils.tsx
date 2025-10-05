import mongoose from 'mongoose';
import toast, {Toaster} from 'react-hot-toast';
import axios, {AxiosError} from 'axios';
import Cookies from "js-cookie";
import { SelectChangeEvent } from '@mui/material';
import { Types, Model } from "mongoose";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { useRouter } from 'next/navigation';
import { useEffect, useMemo } from "react";
import { NextApiResponse } from 'next';
import React from 'react';
import { applyFilter, getComparator } from './AdminUtils';
import { Box, Typography, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import * as MuiIcons from "@mui/icons-material";
import { SvgIconProps } from "@mui/material";
import { getCookie } from 'hooks/CookieHook';

// import { logErrorToFile } from './log';

// import fetch from 'node-fetch';
// import FormData from 'form-data';
export type TableRowPropsBase = {
  selected: boolean;
  showCheckBox: boolean;
  onSelectRow: () => void;
};

export type TableDataFormProps = {
  open: boolean;
  handleClose: () => void;
  selectedDataId: string | number | null | object;
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

export const axiosInstance = axios.create({
  baseURL: process.env.MODE === 'dev' ? process.env.DEV_URL : process.env.PROD_URL,
  timeout: 10000,
});

export const apiRequest = async (
  method: "get" | "post" | "put" | "delete",
  url: string,
  data?: any,
  con: boolean  = false,
) => {
  try {
    const token = getCookie("authToken") || "";

    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
    };

    // Handling FormData and JSON data
    let finalData = data;
    if (data && data instanceof FormData) {
      headers["Content-Type"] = "multipart/form-data";
    } else {
      headers["Content-Type"] = "application/json";
      finalData = JSON.stringify(data);
    }

    // Perform the request
    const res = await axiosInstance({
      method,
      url: `/api/${url}`,
      data: finalData,
      headers,
      validateStatus: () => true,
    });

    console.log(url, res?.data);

    const isSuccess = res.status >= 200 && res.status < 300;
    const message = res.data?.message || (isSuccess ? "Operation successful" : "Something went wrong");
    if (con || !isSuccess) { hitToastr(isSuccess ? "success" : "error", message); }
    
    if (!isSuccess) { return { error: true, status: res.status, message }; }

    return res.data;
  } catch ( error ) { 
    // logErrorToFile(error);
    console.error("API error:", error);
    hitToastr("error", "Something went wrong. Please try again.");
    return { error: true, message: "Request failed" };
  }
};

export const getAuthToken = (): string | undefined => {
  const token = Cookies.get("authToken");
  return token;
};

export const hitToastr = ( type: string, message: string) => {
  if( type == "error" ){ toast.error(message); }
  if( type == "success" ){ toast.success(message); }
};

export function withAuth(Component: any) {
  return function AuthenticatedComponent(props: any) {
    const token = getCookie("authToken");

    useEffect(() => {
      if (!token) {
        const redirectUrl = process.env.MODE === "dev" ? process.env.DEV_URL : process.env.PROD_URL;
        window.location.href = `${redirectUrl}/404`;
      }
    }, [token]);

    return token ? <Component {...props} /> : null;
  };
}

export function clo(error: any, res?: NextApiResponse) {
  hitToastr("error", error.message || "An unexpected error occurred");

  if (res) {
    return res.status(500).json({ message: error.message || "Internal Server Error" });
  }
}

export const handleMultiSelectChange = ( event: SelectChangeEvent<string[]>, setState: React.Dispatch<React.SetStateAction<string[]>> ) => {
  const { target: { value }, } = event;
  setState(typeof value === 'string' ? value.split(',') : value);
};

export const handleChange = <T extends object>( setState: React.Dispatch<React.SetStateAction<T>> ) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent
  ) => {
    const { name, value } = e.target;
    setState((prev) => ({ ...prev, [name]: value }));
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const sanitizeText = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

export const slugify = async ( url: string, model: Model<any>, model_id?: string | Types.ObjectId | null ): Promise<string> => {
  const id = model_id instanceof Types.ObjectId ? model_id.toString() : model_id;

  let slug = url.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  if (url === "/") { slug = "/"; }

  const existingDoc = await model.findOne({ url: slug });

  if (existingDoc && (!id || existingDoc._id.toString() !== id)) {
    let counter = 1;
    let newSlug = `${slug}-${counter}`;

    while (await model.findOne({ url: newSlug })) {
      counter++;
      newSlug = `${slug}-${counter}`;
    }

    slug = newSlug;
  }

  return slug;
};

export const isValidObjectId = (id: any): boolean => typeof id === 'string' && mongoose.Types.ObjectId.isValid(id);

export function useForm<T>(initialState: T) {
  const [formData, setFormData] = React.useState<T>(initialState);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "status" ? value === "true" : value,
    }));
  };

  return { formData, setFormData, handleChange };
}

export interface LayoutLinks {
  adminLinks: any[];
  userSubmenus: any[];
}

export const getLayoutLinks = async (): Promise<LayoutLinks> => {
  const token                 = getCookie("authToken") || "";
  if( !token ){ return { adminLinks: [], userSubmenus: [] }; }

  const res = await apiRequest("get", `basic/spatie?function=get_admin_menu`);
  const links = res?.data;

  return links || { adminLinks: [], userSubmenus: [] };
};

export type IconifyProps = SvgIconProps & {
  icon?: keyof typeof MuiIcons;
};

export function Iconify({ icon = "Search", ...props }: IconifyProps) {
  const IconComponent = MuiIcons[icon];

  if (!IconComponent) {
    console.warn(`Icon '${icon}' not found in @mui/icons-material`);
    return null;
  }

  return <IconComponent {...props} />;
}

export function getBaseUrl() {
  const mode = process.env.MODE || "dev";
  let url = mode === "dev" ? process.env.DEV_URL || "http://localhost:3000" : process.env.PROD_URL || "https://www.example.com";

  return url;
}

export const formatDate = (date: Date | string | null | undefined): string => {
  if (date) {
    return new Date(date).toISOString().replace("T", " ").replace(/\.\d+Z$/, " +00:00");
  }
  
  const now = new Date();
  return now.toISOString().replace("T", " ").replace(/\.\d+Z$/, " +00:00");
};

export const stripHtml = (html: string): string => {
  return html.replace(/<[^>]*>?/gm, "");
};

export const trimWords = (text: string, wordLimit: number): string => {
  const words = text.split(/\s+/);
  return words.slice(0, wordLimit).join(" ") + (words.length > wordLimit ? "..." : "");
};

export const cleanBaseUrl = (): string => {
  const baseUrl = getBaseUrl();
  return  baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
};

export const cleanUrl = (url: string) => (url.startsWith("/") ? url.slice(1) : url);

export async function updateBrowsingHistory( module: string, module_id: string ) {
  try {
    apiRequest("post", `basic/page`, { function: "create_update_browsing_history", module, module_id });
  } catch (error) { clo(error); }
}

export async function checkPermission(slug: string | string[]): Promise<boolean> {
  try {
    const res = await apiRequest("get", `basic/spatie?function=check_permission&url=${slug}`);
    return res?.data === true;
  } catch (err) { clo(err); return false; }
}

export const arraysEqual = (a: string[], b: string[]) => {
  if (a.length !== b.length) return false;
  return a.every((val, i) => val === b[i]);
};

export const isValidEmail = (email: string) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const isValidWhatsapp = (whatsapp: string) => {
  const regex = /^\d{10}$/; // only 10 digits
  return regex.test(whatsapp);
};

export const renderDecimal = (value: number | "" | Types.Decimal128 | { $numberDecimal: string }): number | string => {
  if (value === "" || value === null || value === undefined) return "";
  if (typeof value === "number") return value;

  // Handle Mongoose Decimal128 instance
  if (value instanceof Types.Decimal128) {
    const parsed = parseFloat(value.toString());
    return isNaN(parsed) ? "" : parsed;
  }

  // Handle Mongoose JSON-decoded Decimal128
  if (typeof value === "object" && "$numberDecimal" in value) {
    const parsed = parseFloat((value as { $numberDecimal: string }).$numberDecimal);
    return isNaN(parsed) ? "" : parsed;
  }

  return String(value);
};

export async function downloadExcel({ url, payload, filename }: { url: string; payload?: any; filename?: string; }) {
  try {
    const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json", }, body: JSON.stringify(payload) });
    if (!response.ok) throw new Error("Failed to download file");

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = filename ?? `export_${new Date().toISOString()}.xlsx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(downloadUrl);
  } catch (err) { clo( err ); }
}

export function get404Url(): string {
  const mode = process.env.MODE;
  const baseUrl = mode === "dev" ? process.env.DEV_URL : process.env.PROD_URL;

  const safeBase = (baseUrl || "http://localhost:3000").replace(/\/$/, "");
  return `${safeBase}/404`;
}

export default function test(){ <></>}