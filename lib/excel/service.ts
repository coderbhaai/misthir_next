// lib/excel/service.ts

// import { runProcessor } from "./runner";
import { getSingleAction, initAction } from "pages/api/basic/action";
import { isValidExcelType } from "./excel-manager";
import { EXCEL_STATUS, getExcelServerConfig } from "./excel-server-manager";
import { processRows } from "pages/api/jobs/job-utils";

export async function runProcessor({ id, type, action_id }: { id: string; type: string; action_id: string; }) {
  if (!type || !isValidExcelType(type)) { return null; }
  
  const serverConfig = getExcelServerConfig(type);

  return processRows({
    excel_id: id,
    action_id,
    model: serverConfig.tempModel,
    parentModel: serverConfig.excelModel,
    foreignKey: serverConfig.foreignKey,
    processRow: serverConfig.processor,
    actionName: serverConfig.action.completed,
  });
}

export async function handleRecheck(id: string, type: string) {
  if (!type || !isValidExcelType(type)) { return null; }
  
   const serverConfig = getExcelServerConfig(type);

  const entry = await serverConfig.getExcel(id);
  if (!entry) throw new Error("Not found");

  const action = await getSingleAction(serverConfig.action.upload);

  if (entry.status === EXCEL_STATUS.PENDING) {
    await serverConfig.loader(id, action?._id);
  }

  if (entry.status === EXCEL_STATUS.PRE_PROCESSING) {
    await runProcessor({ id, type, action_id: action?._id });
  }

  if (entry.status === EXCEL_STATUS.COMPLETED) {
    const new_action_id = await initAction(serverConfig.action.upload, id);

    await runProcessor({ id, type, action_id: new_action_id });
  }
}