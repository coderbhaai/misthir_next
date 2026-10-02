export type ToastType =
  | "success"
  | "error"
  | "info";

export type ToastState = {
  type?: ToastType | null;
  message?: string | null;
} | null;

export type ShowToastFunction = (
  type?: ToastType | null,
  message?: string | null,
) => void;