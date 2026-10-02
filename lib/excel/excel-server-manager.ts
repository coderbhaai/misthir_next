// lib/excel/excel-server-manager.ts

import { ExcelTypeKey } from "./excel-manager";
import MetaTemp from "lib/models/excel/MetaTemp";
import { loadMetaIntoTemp, migrateMetaTempRows, processSingleMetaRow } from "pages/api/jobs/metaService";
import { exportMetaTemps } from "pages/api/basic/excel";
import ExcelUpload from "lib/models/excel/ExcelUpload";

export interface ExcelExportResult {
    columns: { header: string; key: string }[];
    data: any[];
    filename?: string;
}

export interface ExcelServerConfig {
  excelModel: any;
  tempModel: any;
  foreignKey: string;
  action: { upload: string; processing: string; completed: string; };
  loader: (excel_id: string, action_id: string) => Promise<any>;
  processor: (row: any, ctx: any) => Promise<{ success: boolean; message?: string }>;
  migrator: (excel_id: string, action_id: string) => Promise<any>;
  getExcel: (id: string) => Promise<any>;
  countTemps: (id: string) => Promise<number>;
  recheckCleanup?: (excel_id: string) => Promise<void>;
  exporter: (excel_id: string, filters?: any) => Promise<ExcelExportResult>;
}

export const EXCEL_SERVER_REGISTRY: Record<ExcelTypeKey, ExcelServerConfig> = {
  meta: {
    excelModel: ExcelUpload,
    tempModel: MetaTemp,
    foreignKey: "excelUpload_id",
    action: { upload: "meta_upload", processing: "meta_processing", completed: "meta_completed" },
    loader: loadMetaIntoTemp, processor: processSingleMetaRow, migrator: migrateMetaTempRows,
    getExcel: (id: any) => ExcelUpload.findOne({ _id: id, module: { $in: ["meta", "Meta"] } }),
    countTemps: (id: any) => MetaTemp.countDocuments({ excelUpload_id: id }),
    exporter: exportMetaTemps,
  }
};

export function getExcelServerConfig(type: string): ExcelServerConfig {
  const clean = type.trim().replace("-", "_") as ExcelTypeKey;
  if (EXCEL_SERVER_REGISTRY[clean]) {
    return EXCEL_SERVER_REGISTRY[clean];
  }
  
  return EXCEL_SERVER_REGISTRY.meta;
}

export const EXCEL_STATUS = {
  PENDING: "Pending",
  PRE_PROCESSING: "Pre-Processing",
  COMPLETED: "Completed",
} as const;