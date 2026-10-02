// // lib/excel/types.ts

import { Document, Types } from "mongoose";
import { AnyModel } from "../models";

export interface ExcelConfig {
  label: string;
  route: string;
  excelModel: any;
  tempModel: any;
  foreignKey: string;  
  getExcel: (id: string) => Promise<any>;
  countTemps: (id: string) => Promise<number>;  
  requiresDmcExport?: boolean;
  requiresDmcImport?: boolean;
  action: {
    upload: string;
    processing: string;
    completed: string;
  };

  loader: (id: string, action_id: string) => Promise<void>;
  processor: (row: any, ctx: any) => Promise<any>;
  migrator: (id: string, action_id: string) => Promise<MigrationResult | void>;
  recheckCleanup?: (excel_id: string) => Promise<void>;
}

export interface LoadExcelToTempParams<TTempModel, TParentModel>{
  excel_id: string;
  action_id: string;
  tempModel: TTempModel;
  fields: readonly string[];
  actionName: string;
  getFilePath: (entry: any) => string;
};

export interface StrictNameResult {
  success: boolean;
  value?: string;
  message?: string;
};

export interface ExistsCheckResult {
  success: boolean;
  message?: string;
};

export interface ExcelCounterDoc {
  success_count?: number;
  failed_count?: number;
};

export interface StrictNameOptions {
  minLength?: number;
  maxLength?: number;
  allowSpaces?: boolean;
  allowHyphens?: boolean;
  allowUnderscore?: boolean;
};

export interface FinalNameValidationResult {
  success: boolean;
  normalized?: string;
  key?: string;
  message?: string;
};

export interface UpdateCountsParams {
  model: AnyModel;
  parentModel: AnyModel;
  parentId: string;
  foreignKey: string;
  statusField?: string;
};

export interface CleanConfig {
  parentModel: AnyModel;
  childModel: AnyModel;
  parentId: string;
  foreignKey: string;
  module?: string;
  childIdFields?: string[];
};

export const STATUS_COUNT_MAP = {
  Success: "success_count",
  Failed: "failed_count",
  Pending: "pending_count",
  Processing: "processing_count",
} as const;

export interface ProcessingDoneParams {
  parentId: string;
  action_id: string;

  childModel: any;
  parentModel: any;

  foreignKey: string;

  status?: string;
  actionName?: string;
};

export interface ProcessSummary {
  total: number;
  success: number;
  failed: number;
  failedRows: { rowId: string; message: string }[];
}

export interface ProcessRowResult {
  success: boolean;
  message: string;
}

export interface ResolverConfig {
  field: string;
  model: any;
  queryKey?: string;
  target: string;
  required?: boolean;
  extraFilter?: Record<string, any>;
  onMissing?: "skip" | "null";
  onInvalid?: "skip" | "null";
};

export interface FieldCheckRule {
  field: string;
  required?: boolean;
  type?: "string" | "number" | "date" | "time";
};

export type MigrationResult = {
  migrated: number;
  skipped: number;
  failed: number;
  remaining?: number;
};

export interface StandardResponse{
  success: boolean;
  message?: string
}

export interface BaseExcelProps<TTemp = any> extends Document<Types.ObjectId> {
  batch_no: string;
  status: string;
  total_rows?: number;
  success_count?: number;
  failed_count?: number;
  pending_count?: number;
  file_path?: string;
  createdAt: Date;
  updatedAt: Date;
  temps?: TTemp[];
  temp_ids?: Types.ObjectId[];
}