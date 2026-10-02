import type { NextApiRequest, NextApiResponse } from 'next';
import { logError } from '../utils';
import { createApiHandler } from '../apiHandler';
import { APIHandlers } from '../../../lib/server/middleware';
import { Types } from 'mongoose';
import { ExcelConfig } from 'lib/excel/types';
import { EXCEL_MANAGER, getExcelConfig, isValidExcelType } from 'lib/excel/excel-manager';
import { ExcelExportResult, getExcelServerConfig } from 'lib/excel/excel-server-manager';
import XLSX from "xlsx";
import { uploadFileLocal } from './media';
import { deleteActionByModuleId, getSingleAction, initAction } from './action';
import { cleanBatch, deleteBatch, processRows } from '../jobs/job-utils';
import { buildFilterQuery } from 'lib/server/plugins/buildFilterQuery';
import Meta, { MetaProps } from 'lib/models/basic/Meta';
import Action from 'lib/models/basic/Action';
import MetaTemp from 'lib/models/excel/MetaTemp';
import ExcelUpload from 'lib/models/excel/ExcelUpload';
import ExcelJS from "exceljs";
import { nanoid } from "nanoid";
import Product from 'lib/models/product/Product';

export interface ITaxCollectedLean {
  _id: Types.ObjectId;
  module: string;
  module_id: Types.ObjectId;
  cgst?: any;
  sgst?: any;
  igst?: any;
  total?: any;
  createdAt?: Date;
  updatedAt?: Date;
}

export const getName = (obj: any, key = "name") => obj && typeof obj === "object" ? obj[key] ?? "" : "";

export async function get_options_for_excel_export(req: NextApiRequest, res: NextApiResponse) {
  try{
    const [products] = await Promise.all([
      Product.find().select("_id name").exec(),
    ]);

    return res.status(200).json({ message: "Fetched all Scheme options", data: {  products } });
  }catch (error) { await logError(error, { function: "get_options_for_invoice", payload: req.body }); return; }
}

type MetaWithMedia = MetaProps & {
  media_id?: { path?: string };
};

export async function export_excel(req: NextApiRequest, res: NextApiResponse) {
  try{
    const { type, dateFrom, dateTo, selectedProduct, selectedSku, selectedUser, module, id } = req.body;
    const fromDate = dateFrom ? new Date(dateFrom) : null;
    const toDate = dateTo ? new Date(dateTo) : null;

    let data: any[] = [];
    let columns: { header: string; key: string }[] = [];

    const products: string[] = selectedProduct ? JSON.parse(selectedProduct) : [];
    const skus: string[] = selectedSku ? JSON.parse(selectedSku) : [];
    const users: string[] = selectedUser ? JSON.parse(selectedUser) : [];

    if (type === "Meta") {
      const metaQuery: any = {};
      if (fromDate || toDate) {
        metaQuery.createdAt = {};
        if (fromDate) metaQuery.createdAt.$gte = fromDate;
        if (toDate) metaQuery.createdAt.$lte = toDate;
      }

      const metas: any[] = await Meta.find(metaQuery).populate([{ path: "media_id" }]).lean();

      data = metas.map( (i, key) => ({
        _id: key+1,
        url: i.url,
        title: i.title,
        description: i.description,
        media: i.media_id?.path,
        date: i.createdAt? new Date(i.createdAt).toISOString().split("T")[0]: "",
      }));

      columns = [
        { header: "ID", key: "_id" },
        { header: "Url", key: "url" },
        { header: "Title", key: "title" },
        { header: "Description", key: "description" },
        { header: "Media", key: "media" },
        { header: "Date", key: "date" },
      ];          
    }
    
    if (!columns.length || !data.length) { return res.status(400).json({ message: "No data to export" }); }

    await exportToExcel( res, columns, data );
    return;
  }catch (error) { await logError(error, { function: "get_options_for_invoice", payload: req.body }); return; }
}

// Excel Upload
  export async function upload_via_excel(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { type } = req.body;
      if (!type || !isValidExcelType(type)) { return res.status(400).json({ message: "Invalid type" }); }

      const config = getExcelConfig(type);
      const serverConfig = getExcelServerConfig(type);
      if (!config || !serverConfig) { return res.status(400).json({ message: `Invalid type layout configuration: ${type}`, data: null }); }

      const file = Array.isArray((req as any).files?.file) ? (req as any).files.file[0] : (req as any).files?.file;
      if (!file) { return res.status(400).json({ message: "No file uploaded", data: null }); }

      const allowed = [ "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/vnd.ms-excel", "text/csv" ];
      if (!allowed.includes(file.mimetype)) { return res.status(400).json({ message: "Invalid file type", data: null }); }

      const workbook = XLSX.readFile(file.filepath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
      if (!worksheet.length) { return res.status(400).json({ message: "Excel file has no data", data: null }); }

      const saved = await uploadFileLocal(file, "excel");
      if (!saved) { return res.status(500).json({ message: "File save failed", data: null }); }

      const entry = await serverConfig.excelModel.create({
        module: type,
        batch_no: crypto.randomUUID(),
        status: "Pending",
        total_rows: worksheet.length,
        success_count: 0,
        failed_count: 0,
        pending_count: worksheet.length,
        file_path: saved.filename,
      });

      await initAction(serverConfig.action.upload, entry._id);

      return res.status(200).json({ message: "Upload received", data: entry._id });
    } catch (error) {
      await logError(error, { function: "upload_via_excel", payload: req.body });
      return res.status(500).json({ message: "Internal Error" });
    }
  }

  export async function get_filtered_temp_excel(req: NextApiRequest, res: NextApiResponse) {
    try {
      const results = await Promise.all(
        Object.entries(EXCEL_MANAGER).map(async ([key, config]) => {
          const serverConfig = getExcelServerConfig(key);
          const rows = await serverConfig.excelModel.find({ module: { $in: [key, config.backendType] } }).sort({ createdAt: -1 }).lean();
          return rows.map((r: any) => ({ ...r, model: key }));
        })
      );
      return res.status(200).json({ message: "Fetched all", data: results.flat() });
    } catch (error) { /* ... */ }
  }

  export async function delete_temp(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { id, type } = req.body;
      if (!id || !type) { return res.status(400).json({ message: "❌ Type & ID required", data: null }); }
      if (!Types.ObjectId.isValid(id)) { return res.status(400).json({ message: "Invalid ID" , data: null}); }
      if (!isValidExcelType(type)) { return res.status(400).json({ message: "Invalid type", data: null }); }

      // Fetch server schema configurations
      const serverConfig = getExcelServerConfig(type);
      if (!serverConfig) { return res.status(400).json({ message: `Invalid type configuration: ${type}`, data: null }); }

      // Run cascade drops using the dynamic context configurations
      await serverConfig.tempModel.deleteMany({ [serverConfig.foreignKey]: id });
      await serverConfig.excelModel.findByIdAndDelete(id);

      await deleteActionByModuleId(id);

      return res.status(200).json({ message: "Deleted successfully", data: id });
    } catch (error) {
      await logError(error, { function: "delete_temp", payload: req.body });
      return res.status(500).json({ message: "Internal Error" });
    }
  }

  export async function recheck_upload(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { id, type } = req.body;
      if (!id || !type) { return res.status(400).json({ message: "❌ Type & ID required", data: null }); }
      if (!Types.ObjectId.isValid(id)) { return res.status(400).json({ message: "Invalid ID", data: null }); }
      if (!isValidExcelType(type)) { return res.status(400).json({ message: "Invalid type", data: null }); }
      
      const config = getExcelConfig(type);
      const serverConfig = getExcelServerConfig(type);
      
      const entry = await serverConfig.getExcel(id);
      if (!entry) { return res.status(404).json({ message: "Entry not found 111111", data: null }); }

      const combinedConfig = { ...config, ...serverConfig };
      void handleExcelLifecycle({ id, config: combinedConfig, entry }).catch(async (error) => { 
        await logError(error, { function: "handleExcelLifecycle", payload: { id, type } }); 
      });

      return res.status(200).json({ message: "Recheck queued successfully.", data: id });
    } catch (error) {
      await logError(error, { function: "recheck_upload", payload: req.body });
      return res.status(500).json({ message: "Internal Error" });
    }
  }

  export async function reinit_upload(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { id, type } = req.body;
      if (!id || !type) { return res.status(400).json({ message: "❌ Type & ID required", data: null }); }
      if (!Types.ObjectId.isValid(id)) { return res.status(400).json({ message: "Invalid ID", data: null }); }
      if (!isValidExcelType(type)) { return res.status(400).json({ message: "Invalid type", data: null }); }

      const config = getExcelConfig(type);
      const serverConfig = getExcelServerConfig(type);
      const entry = await serverConfig.getExcel(id);
      if (!entry) { return res.status(404).json({ message: "Entry not found 222222", data: null }); }

      const combinedConfig = { ...config, ...serverConfig };
      void handleExcelReinitLifecycle({ id, config: combinedConfig, entry }).catch(async (error) => {
          await logError(error, { function: "handleExcelReinitLifecycle", payload: { id } });
      });

      return res.status(200).json({ message: "Re-initialized Successfully", data: id });
    } catch (error) {
      await logError(error, { function: "reinit_upload", payload: req.body });
      return res.status(500).json({ message: "Internal Server Error during re-initialization" });
    }
  }

  export async function migrate_temp(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { id, type } = req.body;
      if (!id || !type) { return res.status(400).json({ message: "❌ Type & ID required", data: null }); }
      if (!isValidExcelType(type)) { return res.status(400).json({ message: "Invalid type", data: null }); }
      if (!Types.ObjectId.isValid(id)) { return res.status(400).json({ message: "Invalid ID", data: null }); }

      const config = getExcelConfig(type);
      const serverConfig = getExcelServerConfig(type);
      if (!config || !serverConfig) { return res.status(400).json({ message: `Invalid type layout configuration: ${type}`, data: null }); }
      
      (async () => {
        try {
          const action = await getSingleAction(serverConfig.action.completed);
          await serverConfig.migrator(id, action?._id);
        } catch (error) { await logError(error, { function: "migrate_temp_background", payload: { id, type } }); }
      })();

      return res.status(200).json({ message: "Migration started", data: { id, started: true } });
    } catch (error) {
      await logError(error, { function: "migrate_temp", payload: req.body });
      return res.status(500).json({ message: "Internal Error" });
    }
  }

  export async function export_temp(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { id, type, filters } = req.body;

      if (!id || !type) { return res.status(400).json({ message: "❌ Type & ID required", data: null }); }
      if (!isValidExcelType(type)) { return res.status(400).json({ message: "Invalid type", data: null }); }
      if (!Types.ObjectId.isValid(id)) { return res.status(400).json({ message: "Invalid ID", data: null }); }      

      const parsedFilters = typeof filters === "string" ? JSON.parse(filters) : filters;
      const config = getExcelServerConfig(type);
      const result = await config.exporter(id, parsedFilters);
      if (!result.columns.length || !result.data.length) { return res.status(400).json({ message: "No data to export" }); }

      await exportToExcel(res, result.columns, result.data);
      return;

    } catch (error) {
      await logError(error, { function: "export_temp", payload: req.body });
      return res.status(500).json({ message: "Internal Error" });
    }
  }

  async function handleExcelReinitLifecycle({ id, config, entry }: { id: string; config: any; entry: any; }) {
    try {
      const objectId = new Types.ObjectId(id);      
      await deleteBatch({
        childModel: config.tempModel,
        parentId: objectId,
        foreignKey: config.foreignKey,
      });

      if (entry.status !== "Pending") {
        entry.status = "Pending";
        if (typeof entry.save === "function") {
          await entry.save();
        } else {
          await config.excelModel.updateOne({ _id: id }, { $set: { status: "Pending" } });
        }
      }

      const action = await getSingleAction(config.action.upload);
      await config.loader(id, action?._id);

    } catch (error) {
      await logError(error, { function: "handleExcelReinitLifecycle", payload: { id, status: entry?.status } });
      throw error; 
    }
  }

  export async function active_temp(id: string): Promise<boolean> {
    try {
      if (!Types.ObjectId.isValid(id)) return false;

      return !!(await Action.exists({ module_id: id }));

    } catch (error) { await logError(error, { function: "active_temp", payload: { id } }); return false; }
  }

  async function runProcessing({id, action_id, config}: {id: string; action_id: string; config: ExcelConfig;}) {
    return processRows({
      excel_id: id,
      action_id,
      model: config.tempModel,
      parentModel: config.excelModel,
      foreignKey: config.foreignKey,
      processRow: config.processor,
      actionName: config.action.completed,
      statusFilter: "Init",
    });
  }

  async function handleExcelLifecycle({id, config, entry}: {id: string; config: ExcelConfig; entry: any;}) {
    try {
       if (config.recheckCleanup) { await config.recheckCleanup(id); }

      if (entry.status === "Pending") {
        const action = await getSingleAction(config.action.upload);
        await config.loader(id, action?._id);
        return;
      }
      
      if (entry.status === "Pre-Processing") {
        const action = await getSingleAction(config.action.processing);

        await runProcessing({id, action_id: action?._id, config });
        return;
      }

      if (entry.status === "Completed") {
        await cleanBatch({
          parentModel: config.excelModel,
          childModel: config.tempModel,
          parentId: id,
          foreignKey: config.foreignKey,
        });

        const newActionId = await initAction(config.action.processing, id);

        await runProcessing({id, action_id: newActionId, config});
        return;
      }
    } catch (error) {
      await logError(error, { function: "handleExcelLifecycle", payload: { id, status: entry?.status } });
    }
  }
// Excel Upload

// Single Excel Entry 
  export async function get_single_meta_excel(req: NextApiRequest, res: NextApiResponse) {
    try{
      const id = req.body?.id;
      if (!Types.ObjectId.isValid(id)) { return res.status(400).json({ message: "Invalid or missing ID" }); }
      
      const entry = await ExcelUpload.findById(id).lean();
      if (!entry) { return res.status(404).json({ message: `ExcelUpload with ID ${id} not found` }); }
      
      const { filters = {}, page = 0, limit = 10 } = req.body || {};
      const { matchQuery, skip, limit: safeLimit } = buildFilterQuery(filters, { page, limit, defaultLimit: 10, maxLimit: 100, searchableFields: [ "sku_name", "item_code" ] });
      matchQuery.excelUpload_id = id;
      const total = await MetaTemp.countDocuments(matchQuery);

      const active = await active_temp(id);

      const temps = await MetaTemp.find(matchQuery).skip(skip).limit(safeLimit).sort({ createdAt: -1 }).lean();
      return res.status(200).json({ message: 'Single Entry Fetched', data: { ...entry, active, temps, pagination: { total, page, limit: safeLimit, totalPages: Math.ceil(total / safeLimit) } } });
    }catch (error) { await logError(error, { function: "get_single_meta_excel", payload: req.body }); return res.status(500).json({ message: "Internal Server Error", data: null }); }
  }

  export async function exportMetaTemps(excel_id: string, filters?: any): Promise<ExcelExportResult> {
    const query: any = { excelUpload_id: excel_id };
    if (filters?.excelFilter_status) {
      query.status = filters.excelFilter_status;
    }
    
    const temps = await MetaTemp.find(query).lean();

    return {
        filename: "product-status-temp",
        columns: [
            { header: "Item Code", key: "item_code" },
            { header: "SKU Name", key: "sku_name" },
            { header: "SKU Status", key: "sku_status" },
            { header: "Status", key: "status" },
            { header: "Message", key: "message" },
        ],
        data: temps,
    };
  }
// Single Excel Entry 

// Functions
  export interface ExcelColumn {
    header: string;
    key: string;
  }

  export async function exportToExcel( res: NextApiResponse, columns: ExcelColumn[], data: any[] ) {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Sheet1");

      worksheet.columns = columns.map(col => ({ header: col.header, key: col.key }));
      data.forEach(item => worksheet.addRow(item));
      const fileName = `export_${nanoid()}.xlsx`;
      res.setHeader( "Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" );
      res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);

      await workbook.xlsx.write(res);
      res.end();
    } catch (error) { await logError(error, { function: 'exportToExcel', payload: {} }); res.status(500).json({ message: "Failed to export Excel" }); }
  }
// Functions

export const functions: APIHandlers = {
  export_excel : { middlewares: [ "checkUserId", "checkPostMethod" ] },
  get_options_for_excel_export : { middlewares: [ "checkUserId" ] },

  upload_via_excel : { middlewares: [ "checkUserId", "checkPostMethod" ] },
  get_filtered_temp_excel : { middlewares: [ "checkUserId", "checkPostMethod" ] },
  migrate_temp : { middlewares: [ "checkUserId", "checkPostMethod" ] },
  delete_temp : { middlewares: [ "checkUserId", "checkPostMethod" ] },
  recheck_upload : { middlewares: [ "checkUserId", "checkPostMethod" ] },
  reinit_upload : { middlewares: [ "checkUserId", "checkPostMethod" ] },
  export_temp : { middlewares: [ "checkUserId", "checkPostMethod" ] },

  get_single_meta_excel : { middlewares: [ "checkUserId" ] },
}

export const excelHandlers = {
  export_excel,
  get_options_for_excel_export,

  upload_via_excel,
  get_filtered_temp_excel,
  migrate_temp,
  delete_temp,
  recheck_upload,
  reinit_upload,
  export_temp,

  get_single_meta_excel,
};

export const config = { api: { bodyParser: false } };
export default createApiHandler(functions, excelHandlers);