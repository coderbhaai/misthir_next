import { hitToastr } from '@amitkk/basic/utils/my-utils/admin-utils';
import { apiRequest } from '@amitkk/basic/utils/my-utils/client-api';
import { useAuth } from 'contexts/AuthContext';
import { IncomingMessage } from 'http';
import { useEffect } from 'react';

type WithBlockId = {
  block_id?: number | string;
};

type BlockContent<B extends WithBlockId, D extends WithBlockId> = {
  genericBlocks?: B[];
  blockDetails?: D[];
};

export const block_count = 20;

export async function groupBlockContent<B extends WithBlockId, D extends WithBlockId>( content?: BlockContent<B, D> ) {
  const createGrouped = <T extends WithBlockId>(items: T[] = []): T[][] => {
    const grouped = Array.from({ length: block_count + 1 }, () => [] as T[]);

    items.forEach((item) => {
      const id = Number(item.block_id);
      if (!id || id > block_count) return;
      grouped[id].push(item);
    });

    return grouped;
  };

  return {
    groupedBlocks: createGrouped(content?.genericBlocks),
    groupedDetails: createGrouped(content?.blockDetails),
  };
}

type MetaType = {
  title?: string;
  description?: string;
};

export function resolveMeta(meta_id: MetaType) {
  const defaultMeta: MetaType = { title: process.env.NEXT_PUBLIC_DEFAULT_TITLE, description: process.env.NEXT_PUBLIC_DEFAULT_DESCRIPTION };
  return ( meta_id || defaultMeta );
}

export async function serverApiRequest(
  req: IncomingMessage,
  method: "GET" | "POST",
  url: string,
  body?: Record<string, any>
) {
  // 1. Resolve base URL using environment variables
  const isDev = process.env.NEXT_MODE === "dev" || process.env.NODE_ENV === "development";
  const envBaseUrl = isDev ? process.env.NEXT_DEV_URL : process.env.NEXT_PROD_URL;

  let baseUrl = envBaseUrl;

  // 2. Dynamic header fallback if ENV isn't set
  if (!baseUrl) {
    const rawProtocol = req?.headers?.["x-forwarded-proto"];
    const protocol = Array.isArray(rawProtocol)
      ? rawProtocol[0]
      : rawProtocol || (isDev ? "http" : "https");

    const host = req?.headers?.host || "localhost:3000";
    baseUrl = `${protocol}://${host}`;
  }

  // Sanitize trailing/leading slashes
  const cleanBase = baseUrl.replace(/\/$/, "");
  const cleanPath = url.replace(/^\//, "");
  const fullUrl = `${cleanBase}/api/${cleanPath}`;

  let fetchBody: any = undefined;
  
  // Forward ALL incoming cookies and request metadata globally
  const headers: Record<string, string> = {
    "cookie": req?.headers?.cookie || "",
    "user-agent": req?.headers?.["user-agent"] || "NextJS-SSR-Client",
    ...(body?.function ? { "x-function": String(body.function) } : {}),
  };

  if (method === "POST" && body) {
    const form = new FormData();
    Object.entries(body).forEach(([key, value]) => {
      if (value !== undefined && value !== null) form.append(key, String(value));
    });
    fetchBody = form;
  }

  const res = await fetch(fullUrl, { method, headers, body: fetchBody });

  return res.json();
}

type Params = {
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  sourceUrl?: string;
};

export function usePrefillForm({ setFormData, sourceUrl }: Params) {
  const { isLoggedIn, user } = useAuth();

  useEffect(() => {
    setFormData((prev: any) => ({
      ...prev,
      name: isLoggedIn ? user?.name || '' : prev.name,
      email: isLoggedIn ? user?.email || '' : prev.email,
      phone: isLoggedIn ? user?.phone || '' : prev.phone,
      page_url: sourceUrl || prev.page_url || '',
    }));
  }, [isLoggedIn, user, sourceUrl, setFormData]);
}

export const trimWords = (text: string, wordLimit: number): string => {
  const words = text.split(/\s+/);
  return words.slice(0, wordLimit).join(" ") + (words.length > wordLimit ? "..." : "");
};

export function getBaseUrl() {
  const mode = process.env.NEXT_MODE || "dev";
  let url = mode === "dev" ? process.env.NEXT_DEV_URL || "http://localhost:3000" : process.env.NEXT_PROD_URL || "https://www.example.com";

  return url;
}

export const cleanBaseUrl = (): string => {
  const baseUrl = getBaseUrl();
  return  baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
};

export const cleanUrl = (url: string) => (url.startsWith("/") ? url.slice(1) : url);

export const validateStayDates = (checkIn: string | Date | null, checkOut: string | Date | null, startDate: string, endDate: string): { isValid: boolean; error?: string } => {
    if (!checkIn || !checkOut) { return { isValid: false, error: "Please select both Check-In and Check-Out dates." }; }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const minDate = new Date(startDate);
    const maxDate = new Date(endDate);

    checkInDate.setHours(0, 0, 0, 0);
    checkOutDate.setHours(0, 0, 0, 0);
    minDate.setHours(0, 0, 0, 0);
    maxDate.setHours(0, 0, 0, 0);

    if (checkInDate > checkOutDate) { return { isValid: false, error: "Check-In date cannot be after Check-Out date." }; }
    if (checkInDate < minDate || checkInDate > maxDate) { return { isValid: false, error: `Check-In date must be between ${startDate} and ${endDate}.` }; }
    if (checkOutDate < minDate || checkOutDate > maxDate) { return { isValid: false, error: `Check-Out date must be between ${startDate} and ${endDate}.` }; }
    return { isValid: true };
};

export const buildTree = (flat: any[]) => {
  const map = new Map<string, any>();
  flat.forEach((item) => {
    const idStr = item._id ? String(item._id) : "";
    if (!idStr) return;

    map.set(idStr, {
      _id: idStr,
      name: item.name,
      parent_id: item.parent_id ? String(item.parent_id) : null,
      children: [],
    });
  });

  const tree: any[] = [];
  map.forEach((node) => {
    if (node.parent_id && map.has(node.parent_id)) {
      map.get(node.parent_id).children.push(node);
    } else {
      tree.push(node);
    }
  });

  return tree;
};

export async function downloadFileSecure(filePath: string) {
  if (!filePath) {
    alert("No file path provided");
    return;
  }

  const res = await apiRequest("POST", "basic/media", {
    function: 'downloadFile',
    filePath : filePath
  });


    if (!res || !res.data) {
      hitToastr("error", "File not found");
      return;
    }

    const { base64, filename, mimetype } = res.data;

    const link = document.createElement("a");
    link.href = `data:${mimetype};base64,${base64}`;
    link.download = filename;
    link.click();
}

export function get404Url(): string {
  const mode = process.env.NEXT_MODE;
  const baseUrl = mode === "dev" ? process.env.NEXT_DEV_URL : process.env.NEXT_PROD_URL;

  const safeBase = (baseUrl || "http://localhost:3000").replace(/\/$/, "");
  return `${safeBase}/404`;
}