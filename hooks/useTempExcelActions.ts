// hooks/useTempExcelActions.ts

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { TEMP_EXCEL_CONFIG, TempExcelType, getTempExcelActions } from "@amitkk/basic/admin/excel/tempExcelConfig";
import { apiRequest, hitToastr, clo, downloadExcel } from '@amitkk/basic/utils/my-utils/admin-utils';
import { useFilterContext } from "contexts/FilterContext";
import { ExcelProps } from "@amitkk/basic/types/excel";

interface Props {
  dataId: string;
  type: TempExcelType;
}

export default function useTempExcelActions<T>({dataId, type}: Props) {
  const router = useRouter();
  const config = TEMP_EXCEL_CONFIG[type];
  const [ excelData, setExcelData ] = useState<ExcelProps>();
  const [ data, setData ] = useState<T[]>([]);
  const [ pagination, setPagination ] = useState({ total: 0, page: 0, limit: 25 });
  const { filters, page, rowsPerPage } = useFilterContext();

  const fetchData = useCallback(async () => {
    if (!dataId) return;

    try {
      const res = await apiRequest( "POST", "basic/excel", { 
        function: config.fetchFunction,
        id: dataId,
        filters,
        page,
        limit: rowsPerPage,
      });
      if (!res?.data) { router.replace("/admin/temp-excel"); return; }

      setExcelData(res.data);
      setData(res?.data?.temps || []);

      setPagination( res?.data?.pagination || { total: 0, page: 0, limit: rowsPerPage} );
    } catch (error) { clo(error); }
  }, [ dataId, config.fetchFunction, router, filters, page, rowsPerPage ]);
  
  useEffect(() => { fetchData(); }, [fetchData]);
  
  const migrate = useCallback(async () => {
    try {
      await apiRequest("POST", basic/excel", {function: "migrate_temp", id: dataId, type});
      hitToastr( res?.data?.migrated ? "success" : "warning", res?.message);

      if (res?.data?.migrated) {
        router.replace(config.redirectOnSuccess);
      } else { fetchData(); }
    } catch (error) { clo(error); }
  }, [ dataId, type, router, config.redirectOnSuccess, fetchData ]);
  
  const deleteUpload = useCallback(async () => {
    try {
      await apiRequest("POST", basic/excel", {function: "delete_temp", id: dataId, type });
      if (res?.data) {
        hitToastr("success", res.message);
        router.replace(config.redirectOnSuccess);
      }
    } catch (error) { clo(error); }
  }, [ dataId, type, router ]);
  
  const recheckUpload = useCallback(async () => {
    try {
      await apiRequest("POST", basic/excel", { function: "recheck_upload", id: dataId, type });
      if (res?.data) {
        hitToastr("success", res.message);
        setTimeout(fetchData, 2000);
      }
    } catch (error) { clo(error); }
  }, [ dataId, type, fetchData ]);

  const reInitUpload = useCallback(async () => {
    try {
      await apiRequest("POST", basic/excel", { function: "reinit_upload", id: dataId, type });
      if (res?.data) {
        hitToastr("success", res.message);
        fetchData();
      }
    } catch (error) { clo(error); }
  }, [ dataId, type, fetchData ]);

  const exportTemp = useCallback(async () => {
    try {
      const payload = new FormData();

      payload.append("function", "export_temp");
      payload.append("type", type);
      payload.append("id", dataId);

      await downloadExcel({
        url: "/api/basic/excel",
        payload,
        filename: `${type}.xlsx`
      });

    } catch (error) { clo(error); }
  }, [dataId, type]);
  
  const actions = useMemo(() => {
      return getTempExcelActions({ status: excelData?.status, migrate, recheckUpload, deleteUpload, reInitUpload, exportTemp });
    }, [ excelData?.status, migrate, recheckUpload, deleteUpload, reInitUpload, exportTemp ]);

  const admin = useMemo(() => ({ data, setData, pagination, setPagination, fetchData }), [ data, pagination, fetchData ]);

  return { admin, excelData, actions, fetchData, migrate, deleteUpload, recheckUpload, reInitUpload };
}