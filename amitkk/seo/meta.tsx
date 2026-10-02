"use client"

import { AdminTableLayout } from "@amitkk/basic/utils/layouts/AdminTableLayout";
import { AdminDataTable } from "@amitkk/seo/admin/admin-meta-table";
import DataModal from "@amitkk/seo/admin/seo-modal";
import { useAdminPage } from "hooks/useAdminPage";
import { SingleMetaProps } from "./types";
import { Button } from "@amitkk/components/button/button";
import { useState } from "react";
import ExportModal from "@amitkk/basic/admin/excel/export-modal";
import ExcelModal from "@amitkk/basic/admin/excel/upload-excel-modal";
import { useAdminModal } from "hooks/useAdminModal";

export  function AdminMeta(){
    const admin = useAdminPage<SingleMetaProps>({ listEndpoint: "basic/meta", listFunction: "get_filtered_meta", singleFunction: "get_single_meta" });
    const excelModal = useAdminModal();

    const FILTER_CONFIG = [
        { name: "SearchFilter", grid: "col-span-8", },
    ] as const;

    const head: { id: string; label: string }[] = [
                    { id: "url", label: "URL" },
                    { id: "title", label: "Title" },
                    { id: "description", label: "Description" },
                    { id: "date", label: "Date" },
                    { id: "", label: "" },
                ];

    const [openExport, setOpenExport] = useState(false);
    const handleExportClose = () => { setOpenExport(false); }
    const exportProps = { open: openExport, handleClose: handleExportClose, type: "Meta", change_type: false };
    
    return(
        <AdminTableLayout admin={admin} title="Metas" addButtonLabel="New Meta" filters={FILTER_CONFIG} head={head} 
            rows={admin.data.map((i: SingleMetaProps) => ( <AdminDataTable key={String(i._id)} row={i} onEdit={(row) => admin.handleEdit(row?._id?.toString())}/> ))}
            actionsAboveFilters={
                <>
                    <Button color="primary w-fit" onClick={() => setOpenExport(true)}>Export</Button>
                    <button className="btn" onClick={() => excelModal.handleOpen() }>Upload Via Excel</button>
                </>
            }>
            <DataModal {...admin.modal}/>
            <ExportModal {...exportProps}/>
            <ExcelModal open={excelModal.open} handleClose={ excelModal.handleClose } onUpdate={async () => { excelModal.handleClose(); await admin.fetchData(); }}/>
        </AdminTableLayout>
    )
}

export default AdminMeta;