// amitkk > basic > admin > excel > TempExcelConfig.ts

import { Button } from "@amitkk/components/button/button";
import { StatusAction } from "./excel_type";

export const TEMP_EXCEL_CONFIG = {
  meta: { fetchFunction: "get_single_meta_excel", redirectOnSuccess: "/admin/meta" },
} as const;

export type TempExcelType = keyof typeof TEMP_EXCEL_CONFIG;

interface Params {
  status?: string;
  migrate: () => void;
  recheckUpload: () => void;
  deleteUpload: () => void;
  reInitUpload: () => void;
  exportTemp: () => void;
}

export function getTempExcelActions({ status, migrate, recheckUpload, deleteUpload, reInitUpload,  exportTemp }: Params) {
  const STATUS_CONFIG: Record<string, StatusAction[]> = {
    Pending: [ { label: "INIT", action: recheckUpload, color: "primary" } ],
    "Pre-Processing": [ 
      { label: "ReInit", action: reInitUpload, color: "warning" },
      { label: "Process", action: recheckUpload, color: "warning" },
    ],
    Completed: [
      { label: "Migrate", action: migrate, color: "success" },
      { label: "Recheck", action: recheckUpload, color: "secondary" },
    ],
  };

  const actions = STATUS_CONFIG[ status || "" ] || [];
  
  return (
    <>
      {actions.map((btn, idx) => ( <Button key={idx} className="w-fit" onClick={btn.action}>{btn.label}</Button> ))}
      <Button className="w-fit" onClick={exportTemp}>Export</Button>
      <Button className="w-fit" onClick={deleteUpload}>Delete Uploads</Button>
    </>
  );
}