import * as XLSX from "xlsx";
import { deleteAction, initAction } from "pages/api/basic/action";
import { logError } from "pages/api/utils";
import Meta from "lib/models/basic/Meta";
import MetaTemp, { MetaTempProps } from "lib/models/excel/MetaTemp";
import ExcelUpload from "lib/models/excel/ExcelUpload";
import path from "path";

interface ProcessMetaSummary {
  total: number;
  success: number;
  failed: number;
  failedRows: { rowId: string; message: string }[];
}

let isMetaProcessing = false;

export async function loadMetaIntoTemp(excel_id: string) {
  if (isMetaProcessing) return;
  isMetaProcessing = true;

  try {
    const excelEntry = await ExcelUpload.findById(excel_id);
    if (!excelEntry) throw new Error("ExcelUpload entry not found");

    const filePath = path.join(process.cwd(), "private", "excel", excelEntry.file_path!);
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    let rows: any[] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: null });
    if (!rows.length) throw new Error("Excel has no rows");

    const tempRows = rows.map(row => ({
      excelUpload_id: excel_id,
      url: row.Url ? String(row.Url).trim() : null,
      title: row.Title ? String(row.Title).trim() : null,
      description: row.Description ? String(row.Description).trim() : null,
      focus_keyword: row.Focus_Keyword || row.focus_keyword ? String(row.Focus_Keyword || row.focus_keyword).trim() : null,
      status: "Init",
      message: null,
    }));

    await MetaTemp.insertMany(tempRows);

    await ExcelUpload.findByIdAndUpdate(excel_id, {
      status: "Pre-Processing",
      total_rows: rows.length,
    });

  } catch (error) { await logError(error, { function: "loadMetaIntoTemp", payload: { excel_id } }); } finally { isMetaProcessing = false; }
}

let isProcessingMetaTemp = false;

export async function processMetaTempRows(excel_id: string): Promise<ProcessMetaSummary> {
  if (isProcessingMetaTemp) return { total: 0, success: 0, failed: 0, failedRows: [] };
  isProcessingMetaTemp = true;

  const summary: ProcessMetaSummary = { total: 0, success: 0, failed: 0, failedRows: [] };
  const batchSize = 100;

  try {
    while (true) {
      const rows = await MetaTemp.find({ excelUpload_id: excel_id, status: "Init" }).sort({ createdAt: 1 }).limit(batchSize);
      if (!rows.length) break;

      summary.total += rows.length;

      for (const row of rows) {
        const { success, message } = await processSingleMetaRow(row);
        if (success) summary.success++;
        else {
          summary.failed++;
          summary.failedRows.push({ rowId: row._id.toString(), message });
        }
      }

      await updateUploadCounts(excel_id);
    }
  } catch (error) {
    await logError(error, { function: "processMetaTempRows", payload: { excel_id } });
  } finally {
    isProcessingMetaTemp = false;
  }

  return summary;
}

async function updateUploadCounts(excel_id: string) {
  const success = await MetaTemp.countDocuments({ excelUpload_id: excel_id, status: "Success" });
  const failed = await MetaTemp.countDocuments({ excelUpload_id: excel_id, status: "Failed" });

  await ExcelUpload.findByIdAndUpdate(excel_id, { success_count: success, failed_count: failed });
}

interface ProcessMetaRowResult { success: boolean; message: string; }

export async function processSingleMetaRow(row: any): Promise<ProcessMetaRowResult> {
  const messages: string[] = [];
  let errorCount = 0;

  if (!row.url) { errorCount++; messages.push("URL missing"); }
  if (!row.title) { errorCount++; messages.push("Title missing"); }
  if (!row.description) { errorCount++; messages.push("Description missing"); }

  row.status = errorCount === 0 ? "Success" : "Failed";
  row.message = messages.join("; ") || "Row validated successfully";

  await row.save();
  return { success: errorCount === 0, message: row.message };
}

let isMetaMigrating = false;

export async function migrateMetaTempRows(excel_id: string) {
  if (isMetaMigrating) return;
  isMetaMigrating = true;

  try {
    const temps = await MetaTemp.find({ excelUpload_id: excel_id, status: "Success" }).lean<MetaTempProps[]>();
    if (!temps.length) return;

    const bulkOperations = temps.map((t) => {
      const updateData: Record<string, any> = {
        url: t.url!,
        title: t.title!,
        description: t.description!,
      };

      if (t.focus_keyword) {
        updateData.focus_keyword = t.focus_keyword;
      }

      return {
        updateOne: {
          filter: { url: t.url! },
          update: {
            $set: updateData,
          },
          upsert: true,
        },
      };
    });

    await Meta.bulkWrite(bulkOperations);
    await MetaTemp.deleteMany({ excelUpload_id: excel_id });
    await ExcelUpload.findByIdAndDelete(excel_id);

  } catch (error) {
    await logError(error, { function: "migrateMetaTempRows", payload: { excel_id } });
  } finally {
    isMetaMigrating = false;
  }
}