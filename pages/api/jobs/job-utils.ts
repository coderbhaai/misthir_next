// pages > api > jobs > job-utils

import { Types } from "mongoose";
import { AnyModel } from "lib/models";
import path from "path";
import * as XLSX from "xlsx";
import fs from "fs";
import { CleanConfig, ExcelCounterDoc, ExistsCheckResult, FieldCheckRule, FinalNameValidationResult, LoadExcelToTempParams, ProcessingDoneParams, ProcessSummary, ResolverConfig, StandardResponse, STATUS_COUNT_MAP, StrictNameOptions, StrictNameResult, UpdateCountsParams } from "lib/excel/types";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { deleteAction, initAction } from "pages/api/basic/action";
import { logError } from "../utils";
import Action from "lib/models/basic/Action";
import ExcelUpload from "lib/models/excel/ExcelUpload";
dayjs.extend(customParseFormat);

export interface LookupResult<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

export async function updateExcelCount<T extends ExcelCounterDoc>(
  ExcelModel: AnyModel,
  excelId: string | Types.ObjectId | any,
  result: "Success" | "Failed"
) {
  try {
    if (!excelId) return;

    const normalizedId = typeof excelId === "object" && excelId._id ? excelId._id : excelId;
    const inc: Record<string, number> = {};

    if (result === "Success") inc.success_count = 1;
    if (result === "Failed") inc.failed_count = 1;

    if (!Object.keys(inc).length) return;

    const res = await ExcelModel.updateOne(
      { _id: normalizedId },
      { $inc: inc }
    );
  } catch (error) { await logError(error, { function: "updateExcelCount", payload: { excelId }, }); }
}

export const safeTrim = (val: any): string | null => {
  if (typeof val === "string") return val.trim().toLowerCase();
  if (typeof val === "number") return String(val).trim();
  return null;
};

export function readExcelFromFolder( folder: string, fileName: string ) {
  const filePath = path.join(process.cwd(), folder, fileName);

  if (!fs.existsSync(filePath)) { throw new Error(`❌ Excel file not found at: ${filePath}`); }
  const workbook = XLSX.readFile(filePath);

  return workbook;
}

export function cleanTableCell(str: any): any {
  if (str === null || str === undefined) return null;

  // Clean only strings
  if (typeof str === "string") {
    const cleaned = str
      .replace(/[\u200B-\u200D\uFEFF]/g, "") // all zero-width chars
      .replace(/\u00A0/g, " ")              // non-breaking spaces
      .replace(/\s+/g, " ")                 // collapse spaces
      .trim();

    // Convert empty → null
    if (cleaned === "") return null;

    return cleaned;
  }

  return str;
}

export async function normalizeExcelRow(row: any): Promise<Record<string, any> | null> {
  try {
    const out: Record<string, any> = {};

    for (const key in row) {
      const cleanedKey = key.trim().toLowerCase().replace(/[\s\-]+/g, "_");
      let value = cleanTableCell(row[key]);

      const isDateKey = ["valid_from", "valid_to"].includes(cleanedKey) || key.toLowerCase().includes("valid");
      const isTimeKey = ["open_from", "open_to"].includes(cleanedKey) || key.toLowerCase().includes("open");

      // 🛠️ DATE PROCESSING
      if (isDateKey && value != null && value !== "") {
        const numericValue = Number(value);
        let parsedDate: Date | null = null;

        if (!isNaN(numericValue) && numericValue > 1000) {
          const excelEpoch = new Date(Date.UTC(1899, 11, 30));
          parsedDate = new Date(excelEpoch.getTime() + numericValue * 86400000);
        } else {
          const str = String(value).replace(/[\u00A0\xA0\s]+/g, " ").trim();
          const formats = ["YYYY-MM-DD", "DD-MM-YYYY", "DD/MM/YYYY", "MM/DD/YYYY", "M/D/YY", "D/M/YY", "MM/DD/YY", "DD/MM/YY"];
          for (const format of formats) {
            const parsed = dayjs(str, format, true);
            if (parsed.isValid()) { parsedDate = parsed.toDate(); break; }
          }
          if (!parsedDate) {
            const native = new Date(str);
            if (!isNaN(native.getTime())) parsedDate = native;
          }
        }

        if (parsedDate && !isNaN(parsedDate.getTime())) {
          value = dayjs(parsedDate).format("YYYY-MM-DD");
        }
        out[cleanedKey] = value;
        continue;
      }

      // 🛠️ TIME PROCESSING
      if (isTimeKey && value != null && value !== "") {
        const num = Number(value);
        
        if (!isNaN(num) && num >= 0 && num < 1) {
          const totalSeconds = Math.round(num * 86400);
          const hours = Math.floor(totalSeconds / 3600);
          const minutes = Math.floor((totalSeconds % 3600) / 60);
          const ampm = hours >= 12 ? "PM" : "AM";
          const displayHour = hours % 12 === 0 ? 12 : hours % 12;
          const displayMinute = String(minutes).padStart(2, "0");
          value = `${displayHour}:${displayMinute} ${ampm}`;
        } 
        else {
          const cleanStr = String(value).replace(/[\u00A0\xA0\s]+/g, " ").trim().toUpperCase();
          const formatsToTry = ["h:mm A", "hh:mm A", "H:mm", "HH:mm"];
          const parsedTime = dayjs(cleanStr, formatsToTry, true);
          
          if (parsedTime.isValid()) {
            value = parsedTime.format("h:mm A");
          } else {
            const match = cleanStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
            if (match) {
              const [_, h, m, p] = match;
              const period = p ? p.toUpperCase() : (Number(h) >= 12 ? "PM" : "AM");
              const normalizedHour = p ? h : (Number(h) % 12 === 0 ? 12 : Number(h) % 12);
              value = `${normalizedHour}:${m} ${period}`;
            } else {
              value = cleanStr;
            }
          }
        }
        
        out[cleanedKey] = value;
        continue;
      }

      if (!isDateKey && !isTimeKey && typeof value === "string" && /^[0-9]+(\.[0-9]+)?$/.test(value) && !/^0[0-9]/.test(value)) {
        value = Number(value);
      }

      if (value instanceof Date) { value = value.toISOString(); }
      out[cleanedKey] = value;
    }
    return out;
  } catch (error) {
    await logError(error, { function: "normalizeExcelRow", payload: { row } });
    return null;
  }
}

export async function validateName({
  rawValue,
  processedNames,
  model,
  field,
  extraQuery = {},
  strictOptions = {},
}: {
  rawValue: unknown;
  processedNames: Set<string>;
  model: any;
  field: string;
  extraQuery?: Record<string, any>;
  strictOptions?: StrictNameOptions;
}): Promise<FinalNameValidationResult> {

  // 1. Strict format validation
  const strictResult = strictNameCheck(rawValue, strictOptions);
  if (!strictResult.success) {
    return strictResult;
  }

  // 2. Normalize once
  const { normalized, key } = normalizeStrictValue(strictResult.value!);

  // 3. Excel duplicate check
  if (processedNames.has(key)) {
    return {
      success: false,
      message: "Duplicate name in Excel (case-insensitive)",
    };
  }

  // 4. DB duplicate check
  const existsResult = await checkValueExistsInModel(
    model,
    field,
    normalized,
    extraQuery
  );

  if (!existsResult.success) {
    return existsResult;
  }

  // 5. Mark as processed
  processedNames.add(key);

  return {
    success: true,
    normalized,
    key,
  };
}

export async function checkValueExistsInModel(
  model: any,
  field: string,
  value: string,
  extraQuery: Record<string, any> = {}
): Promise<ExistsCheckResult> {
  const { key } = normalizeStrictValue(value);

  const query = {
    ...extraQuery,
    [field]: { $regex: `^${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
  };

  const exists = await model.exists(query);

  if (exists) {
    return {
      success: false,
      message: `Name already exists in system`,
    };
  }

  return { success: true };
}

export function normalizeStrictValue(value: string): { normalized: string; key: string; } {
  const normalized = value.normalize("NFKC").trim().replace(/\s+/g, " ");
  const key = normalized.toLowerCase();
  return { normalized, key };
}

export function strictNameCheck( input: unknown, options: StrictNameOptions = {} ): StrictNameResult {
  const {
    minLength = 2,
    maxLength = 50,
    allowSpaces = true,
    allowHyphens = false,
    allowUnderscore = false,
  } = options;

  if (typeof input !== "string") { return { success: false, message: "Name must be a string" }; }

  const normalized = input.normalize("NFKC").trim();
  if (!normalized) { return { success: false, message: "Name is empty" }; }

  if (normalized.length < minLength || normalized.length > maxLength) {
    return { success: false, message: `Name must be between ${minLength}-${maxLength} characters`, };
  }

  let pattern = "A-Za-z0-9";
  if (allowSpaces) pattern += " ";
  if (allowHyphens) pattern += "\\-";
  if (allowUnderscore) pattern += "_";

  const regex = new RegExp(`^[${pattern}]+$`);

  // if (!regex.test(normalized)) {
  //   return { success: false, message: "Name contains invalid characters" };
  // }

  // if (!/[A-Za-z]/.test(normalized)) {
  //   return { success: false, message: "Name must contain at least one letter", };
  // }

  const collapsed = normalized.replace(/\s+/g, " ");

  return { success: true, value: collapsed };
}

export async function updateAllStatusCounts({ model, parentModel, parentId, foreignKey, statusField = "status" }: UpdateCountsParams) {
  try{
    const objectId = new Types.ObjectId(parentId);
  
    const results = await model.aggregate([
      { $match: { [foreignKey]: objectId } },
      {
        $group: {
          _id: `$${statusField}`,
          count: { $sum: 1 },
        },
      },
    ]);
    const updatePayload: Record<string, number> = {};
  
    for (const [status, field] of Object.entries(STATUS_COUNT_MAP)) {
      const found = results.find((r) => r._id === status);
      updatePayload[field] = found?.count || 0;
    }
  
    await parentModel.findByIdAndUpdate(objectId, updatePayload);
  } catch (error) { await logError(error, { function: "loadTransferIntoTemp", payload: { model, parentModel, parentId, foreignKey, statusField } }); }
}

export async function cleanBatch({ parentModel, childModel, parentId, foreignKey, module, childIdFields = [] }: CleanConfig) {
  try{
    const objectId = new Types.ObjectId(parentId);  
    const total = await childModel.countDocuments({ [foreignKey]: objectId });
  
    await parentModel.findByIdAndUpdate(objectId, {
      status: "Pre-Processing",
      success_count: 0,
      failed_count: 0,
      pending_count: total,
    });
  
    const childUpdate: Record<string, any> = {
      status: "Init",
      message: null,
    };
  
    childIdFields.forEach((field) => { childUpdate[field] = null; });

    await childModel.updateMany(
      { [foreignKey]: objectId },
      { $set: childUpdate }
    );

    if (module) {
      await Action.updateMany({ module, module_id: objectId },
        { $set: { status: "Pre-Processing" }, }
      );
    }
  } catch (error) { await logError(error, { function: "loadTransferIntoTemp", payload: { parentModel: parentModel?.modelName, childModel: childModel?.modelName,  parentId, foreignKey, childIdFields } }); }
}

interface DeleteConfig {
  childModel: any;
  parentId: string | Types.ObjectId;
  foreignKey: string;
}

export async function deleteBatch({ childModel, parentId, foreignKey }: DeleteConfig) {
  try {
    const objectId = typeof parentId === "string" ? new Types.ObjectId(parentId) : parentId;
    const result = await childModel.deleteMany({ [foreignKey]: objectId });
    
    return result;
  } catch (error) {
    await logError(error, { 
      function: "deleteBatch", 
      payload: { childModel: childModel?.modelName, parentId, foreignKey } 
    });
    throw error;
  }
}

export async function processingDone({
  parentId,
  action_id,
  childModel,
  parentModel,
  foreignKey,
  status = "Completed",
  actionName = "Processing Completed",
}: ProcessingDoneParams) {
  try {
    await updateAllStatusCounts({
      model: childModel,
      parentModel,
      parentId,
      foreignKey,
    });

    await parentModel.findByIdAndUpdate(parentId, { status });

    await deleteAction(action_id);

    await initAction(actionName, parentId);
  } catch (error) {
    console.error("processingDone error:", error);
    throw error;
  }
}

export async function processRows({
  excel_id,
  action_id,
  model,
  parentModel,
  foreignKey,
  processRow,
  batchSize = 100,
  actionName,
  statusFilter = "Init",
}: {
  excel_id: string;
  action_id: string;
  model: any;
  parentModel: any;
  foreignKey: string;
  processRow: (row: any, ctx: any) => Promise<{ success: boolean; message?: string }>;
  batchSize?: number;
  actionName: string;
  statusFilter?: string;
}): Promise<ProcessSummary> {

  try {
    const rows = await model.find({ [foreignKey]: excel_id, status: statusFilter });
    if (!rows.length) { return { total: 0, success: 0, failed: 0, failedRows: [] }; }

    let success = 0;
    let failed = 0;

    for (const row of rows) {
      try {
        const { success: ok, message } = await processRow(row, {});

        row.status = ok ? "Success" : "Failed";
        row.message = message;

        if (ok) success++;
        else failed++;

      } catch (err) {
        row.status = "Failed";
        row.message = "Unhandled processing error";
        failed++;

        await logError(err, { function: "processRows_row", payload: { rowId: row._id } });
      }
      await row.save();
    }
    
    await parentModel.findByIdAndUpdate(excel_id, {
      status: "Completed",
      success_count: success,
      failed_count: failed,
      pending_count: 0,
    });

    await deleteAction(action_id);
    await initAction(actionName, excel_id);

    return {
      total: rows.length,
      success,
      failed,
      failedRows: [],
    };

  } catch (error) {
    await logError(error, {
      function: "processRows",
      payload: { excel_id },
    });

    return {
      total: 0,
      success: 0,
      failed: 0,
      failedRows: [],
    };
  }
}

export async function mapRowFields<T extends Record<string, any>>(row: T, fields: readonly (keyof T)[]) {
  const result: any = {};

  for (const key of fields) {
    result[key] = safeTrim(row[key]);
  }

  return result;
}

const RESERVED_FIELDS = ["status", "message", "_id", "createdAt", "updatedAt"];

export async function loadExcelIntoTemp({
  excel_id,
  action_id,
  tempModel,
  fields,
  actionName,
  getFilePath,
}: LoadExcelToTempParams<any, any>) {
  const parentModel = ExcelUpload;
  const foreignKey = "excelUpload_id";

  try {
    const excelEntry = await parentModel.findById(excel_id);
    if (!excelEntry) throw new Error("Excel entry not found");

    const workbook = readExcelFromFolder("private/excel", getFilePath(excelEntry));
    const sheetName = workbook.SheetNames[0];
    let rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(
                    workbook.Sheets[sheetName], {
                      defval: null,
                      raw: false,
                      dateNF: "YYYY-MM-DD"
                    });

    const normalizedRows = await Promise.all( rawRows.map((r) => normalizeExcelRow(r)) );
    const rows: Record<string, any>[] = normalizedRows.filter( (r): r is Record<string, any> => r !== null );

   const tempRows = rows.map((row) => {
    const cleanRow = { ...row };

    for (const field of RESERVED_FIELDS) { delete cleanRow[field]; }
    return { [foreignKey]: excel_id, status: "Init", message: null, ...cleanRow };
  });

    if (tempRows.length) {
      await tempModel.insertMany(tempRows);
    }

    await parentModel.findByIdAndUpdate(excel_id, { status: "Pre-Processing", total_rows: rows.length });
    await deleteAction(action_id);
    await initAction(actionName, excel_id);
  } catch (error) {
    await logError(error, {
      function: "loadExcelIntoTemp",
      payload: { excel_id },
    });
  }
}

export async function resolveAndAssign(row: any, configs: ResolverConfig[]): Promise<StandardResponse> {
  try {
    for (const config of configs) {
      const {
        field,
        model,
        queryKey = "name",
        target,
        required = true,
        extraFilter = {},
        onMissing = "skip",
      } = config;

      const rawValue = row[field];
      const value = typeof rawValue === "string" ? rawValue.trim() : rawValue;
      
      if (value === null || value === undefined || value === "") {
        if (required) {
          return { success: false, message: `${field} is required` };
        }

        if (onMissing === "null") {
          row[target] = null;
        }

        continue;
      }

      const doc = await model.findOne({ [queryKey]: value, ...extraFilter }).select("_id");

      if (!doc) {
        const onInvalid = config.onInvalid ?? "fail";

        if (onInvalid === "null") {
          row[target] = null;
          row.unresolved = row.unresolved || [];

          // --- FIX: Check if the entry already exists before pushing ---
          const isDuplicate = row.unresolved.some(
            (item: any) => item.field === field && item.value === value
          );

          if (!isDuplicate) {
            row.unresolved.push({ field, value });
          }
          // -------------------------------------------------------------
          
          continue;
        }

        if (onInvalid === "skip") {
          continue;
        }

        return { success: false, message: `Invalid ${field}` };
      }
      
      row[target] = doc._id;
    }

    return { success: true };
  } catch (error) {
    await logError(error, { function: "resolveAndAssign", payload: { row } });
    return { success: false, message: "Resolver failed" };
  }
}

export async function validateAndTransform(row: any, rules: FieldCheckRule[]): Promise<StandardResponse> {
  try {
    for (const rule of rules) {
      const { field, required = false, type } = rule;

      let value = row[field];

      if (value == null || value === "") {
        if (required) { return { success: false, message: `${field} is required` }; }
        continue;
      }
      
      if (type === "number") {
        const num = parseFloat(value);
        if (isNaN(num)) { return { success: false, message: `${field} must be a number` }; }

        row[field] = num;
        continue;
      }

      if (type === "string") {
        row[field] = String(value).trim();
        continue;
      }

      if (type === "date") {
        const parsedDate = parseExcelDate(value);
        
        if (!parsedDate) { 
          console.error(`[Validation Debug] ❌ DATE PARSING FAILED FOR: "${value}"`);
          return { success: false, message: `${field} must be a valid date` }; 
        }
        
        const finalizedDateStr = dayjs(parsedDate).format("YYYY-MM-DD");
        row[field] = finalizedDateStr;
        continue;
      } 

      // 🔍 TIME LOGGING BLOCK
      if (type === "time") {
        const normalizedTime = normalize12HourTime(value);
        if (!normalizedTime || normalizedTime.includes("INVALID") || normalizedTime === "") { 
          console.error(`[Validation Debug] ❌ TIME PARSING FAILED FOR: "${value}"`);
          return { success: false, message: `${field} must be a valid time` }; 
        }
        
        row[field] = normalizedTime;
        continue;
      }
    }

    return { success: true };
  } catch (error) {
    await logError(error, {
      function: "validateAndTransform",
      payload: { row, rules },
    });

    return {
      success: false,
      message: "Validation failed",
    };
  }
}

export async function failRow(row: any, message?: string) {
  row.status = "Failed";
  row.message = message || "Unknown error";
  await row.save();
  return { success: false, message: row.message };
}

export function isValid12HourTime(value: any): boolean {
  if (!value) return true;

  const str = String(value).trim();
  return /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i.test(str);
}

export function normalize12HourTime(value: any): string | null {
  if (value == null || value === "") return null;

  // 🛠️ FIX: Handle raw Excel time decimal fractions (e.g., 0.04166 or 0.75347)
  const num = Number(value);
  if (!isNaN(num) && num >= 0 && num < 1) {
    // Total seconds in a full day = 86400
    const totalSeconds = Math.round(num * 86400);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    // Build a safe absolute date structure using dayjs to format the time components smoothly
    return dayjs().hour(hours).minute(minutes).format("h:mm A");
  }

  // Fallback if the cell already arrived parsed as a string primitive
  const cleanStr = String(value).trim().toUpperCase().replace(/\s+/g, " ");
  
  // Validate if it is structured as a valid time string layout
  const validTimeCheck = dayjs(`2026-01-01 ${cleanStr}`, ["YYYY-MM-DD h:mm A", "YYYY-MM-DD HH:mm"], true);
  if (validTimeCheck.isValid()) {
    return validTimeCheck.format("h:mm A");
  }

  return cleanStr; // Return raw string fallback if dayjs validation is skipped
}

export function parseBoolean(value: any): boolean {
  if (typeof value === "boolean") { return value; }

  const normalized = String(value).trim().toLowerCase();
  return [ "true", "1", "yes", "y" ].includes(normalized);
}

export function parseExcelDate(value: any): Date | null {
  if (value == null || value === "") { return null; }
  if (value instanceof Date && !isNaN(value.getTime())) { return value; }

  const numericValue = Number(value);

  if (!isNaN(numericValue) && numericValue > 1000) {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    const parsed = new Date(excelEpoch.getTime() + numericValue * 86400000);
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  const str = String(value).trim();
  const formats = [ "YYYY-MM-DD", "DD-MM-YYYY", "DD/MM/YYYY", "MM/DD/YYYY", ];

  for (const format of formats) {
    const parsed = dayjs(str, format, true);
    if (parsed.isValid()) { return parsed.toDate(); }
  }
  const native = new Date(str);

  if (!isNaN(native.getTime())) { return native; }
  return null;
}

interface ResolverDocument {
  _id: Types.ObjectId;
  [key: string]: any;
}

export interface ResolveMultiValueConfig {
  row: any;
  field: string;
  model: any;
  query?: Record<string, any>;
  queryField?: string;
  required?: boolean;
}

export async function resolveMultiValueField({ 
  row, 
  field, 
  model, 
  query = {}, 
  queryField = "name", 
  required = true 
}: ResolveMultiValueConfig): Promise<{
  success: boolean;
  message: string | null;
  ids: Types.ObjectId[];
  docs: ResolverDocument[];
  missing: string[];
}> {
  const raw = row[field];
  if (!raw || !String(raw).trim()) {
    if (required) { 
      return { success: false, message: `Missing required field: ${field}`, ids: [], docs: [], missing: [] }; 
    }
    return { success: true, message: null, ids: [], docs: [], missing: [] };
  }

  // Helper to normalize curly quotes/apostrophes to straight quotes
  const normalizeText = (text: string) => 
    text.replace(/[\u2018\u2019\u201B\u2032]/g, "'").replace(/[\u201C\u201D\u2033]/g, '"').trim();

  // 1. Split and normalize inputs
  const rawValues = String(raw).split("|").map((v) => v.trim()).filter(Boolean);
  const normalizedValues = [...new Set(rawValues.map(normalizeText))];

  // 2. Build case-insensitive regex patterns for each normalized value
  const regexPatterns = normalizedValues.map((val) => {
    // Escape special regex characters except apostrophe, and allow both straight & curly apostrophes
    const escaped = val.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/'/g, "['’`]");
    return new RegExp(`^${escaped}$`, "i");
  });

  // 3. Query DB using $or with regex matching
  const docs = (await model.find({
    ...query,
    $or: regexPatterns.map((pattern) => ({ [queryField]: pattern })),
  })) as ResolverDocument[];

  const ids: Types.ObjectId[] = [];
  const missing: string[] = [];

  // 4. Map returned documents back to original inputs
  for (const rawVal of rawValues) {
    const normalizedInput = normalizeText(rawVal).toLowerCase();
    
    const matchedDoc = docs.find((doc) => {
      const docName = normalizeText(String(doc[queryField])).toLowerCase();
      return docName === normalizedInput;
    });

    if (!matchedDoc) {
      missing.push(rawVal);
    } else {
      ids.push(matchedDoc._id);
    }
  }

  if (missing.length > 0) {
    const errorMsg = `Invalid ${field}:${missing.join(", ")}`;
    return { success: false, message: errorMsg, ids, docs, missing }; 
  }

  return { success: true, message: null, ids, docs, missing: [] };
}