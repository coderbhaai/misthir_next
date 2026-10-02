"use client"

import { AdminTableLayout } from "@amitkk/basic/utils/layouts/AdminTableLayout";
import { useAdminPage } from "hooks/useAdminPage";
import DataModal from "@amitkk/product/admin/document-modal";
import { AdminDataTable, DataProps } from "@amitkk/product/admin/admin-document-table";

export  function AdminDocument(){
    const admin =   useAdminPage<DataProps>({ listEndpoint: "payment/document", listFunction: "get_filtered_documents", singleFunction: "get_single_document" });

    const FILTER_CONFIG = [
        { name: "SearchFilter", grid: "col-span-9", },
        { name: "StatusFilter", grid: "col-span-3", },
    ] as const;

    const head: { id: string; label: string }[] = [
                    { id: "type", label: "Type" },
                    { id: "name", label: "Name" },
                    { id: "url", label: "URL" },
                    { id: "meta", label: "Meta" },
                    { id: "", label: "" },
                ];
    
    return(
        <AdminTableLayout admin={admin} title="Documents" addButtonLabel="New Document" filters={FILTER_CONFIG} head={head} 
            rows={admin.data.map((i: DataProps) => ( <AdminDataTable key={String(i._id)} row={i} onEdit={(row) => admin.handleEdit(row?._id?.toString())}/> ))}>
            <DataModal {...admin.modal}/>
        </AdminTableLayout>
    )
}

export default AdminDocument;