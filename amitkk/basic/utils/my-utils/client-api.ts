import axios from "axios";
import { getCookie } from "hooks/CookieHook";

export const axiosInstance = axios.create({
  baseURL: process.env.NEXT_MODE === "dev" ? process.env.NEXT_DEV_URL : process.env.NEXT_PROD_URL,
  timeout: 15000,
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

    let finalData: any = data;

    if (data instanceof FormData) {
      for (const [key, value] of data.entries()) {
        console.log(`${key}:`, value);
      }
    }

    if (["POST", "PUT"].includes(method)) {
      if (data instanceof FormData) {
        finalData = data;
        headers["Content-Type"] = "multipart/form-data";
      } else {
        finalData = JSON.stringify({ ...(data || {}) });
        headers["Content-Type"] = "application/json";
      }
    } else if (data && !(data instanceof FormData)) {
      finalData = JSON.stringify({ ...(data || {}) });
      headers["Content-Type"] = "application/json";
    }

    const res = await axiosInstance({
      method,
      url: `/api/${url}`,
      data: finalData,
      headers,
      validateStatus: () => true,
    });

    return res.data;
  } catch (error) {
    console.error(error);
  }
};

export function clo(error: any) { console.log("ERROR", error); }