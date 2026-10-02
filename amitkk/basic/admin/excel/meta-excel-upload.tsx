"use client"

import { useEffect } from "react";
import { AdminTableLayout } from "@amitkk/basic/utils/layouts/AdminTableLayout";
import { AdminDataTable } from "@amitkk/basic/admin/excel/admin-meta-temp-table";
import StatusPills from "@amitkk/basic/admin/excel/StatusPills";
import { TempExcelType } from "@amitkk/basic/admin/excel/tempExcelConfig";
import useTempExcelActions from "hooks/useTempExcelActions";
import { MetaTempProps } from "@amitkk/basic/types/excel";

interface DataFormProps {
    dataId?: string;
}

export default function SingleMetaExcel({dataId = ""}: DataFormProps) {
    const type: TempExcelType = "meta";
    const tempExcel = useTempExcelActions<MetaTempProps>({dataId, type});

    useEffect(() => { tempExcel.fetchData(); }, [ tempExcel.fetchData ]);

    const FILTER_CONFIG = [
        { name: "ExcelFilter", grid: "col-span-4", },
        { name: "SearchFilter", grid: "col-span-8", },
    ] as const;

    const head: { id: string; label: string }[] = [
                    { id: "URL", label: "URL" },
                    { id: "Title", label: "Title" },
                    { id: "Description", label: "Description" },
                    { id: "Focus Keyword", label: "Focus Keyword" },
                    { id: "Status", label: "Status" },
                    { id: "Message", label: "Message" },
                    { id: "date", label: "Date" },
                ];

    return (
        <>
            <StatusPills data={tempExcel.excelData}/>
            <AdminTableLayout<MetaTempProps> admin={tempExcel.admin} title="Temporary Meta" filters={FILTER_CONFIG} head={head}
                rows={tempExcel.admin.data.map( (i) => (<AdminDataTable key={i._id?.toString()} row={i}/>))}
                actionsAboveFilters={tempExcel.actions}/>
        </>
    );
}