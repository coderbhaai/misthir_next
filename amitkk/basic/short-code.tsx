"use client"

import { AdminTableLayout } from "@amitkk/basic/utils/layouts/AdminTableLayout";
import DataModal from "@amitkk/basic/admin/short-code/short-code-modal";
import { AdminDataTable, DataProps } from "@amitkk/basic/admin/short-code/admin-short-code-table";
import { useAdminPage } from "hooks/useAdminPage";

export  function AdminBlogMeta(){
    const admin = useAdminPage<DataProps>({ listEndpoint: "basic/shortCode/shortcode", listFunction: "get_filtered_short_codes", singleFunction: "get_single_short_code" });

    const FILTER_CONFIG = [
        { name: "SearchFilter", grid: "col-span-9", },
        { name: "StatusFilter", grid: "col-span-3", },
    ] as const;

    const head: { id: string; label: string }[] = [
                    { id: "Call Id", label: "Call Id" },
                    { id: "Module", label: "Module" },
                    { id: "Modules", label: "Modules" },
                    { id: "", label: "" },
                ];
    
    return(
        <AdminTableLayout admin={admin} title="Short Codes" addButtonLabel="New Short Code" filters={FILTER_CONFIG} head={head} 
            rows={admin.data.map((i) => ( <AdminDataTable key={String(i._id)} row={i} onEdit={(row) => admin.handleEdit(row?._id?.toString())}/> ))}>
            <DataModal {...admin.modal}/>
        </AdminTableLayout>
    )
}

export default AdminBlogMeta;