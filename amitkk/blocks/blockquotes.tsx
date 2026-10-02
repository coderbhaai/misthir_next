"use client"

import { AdminTableLayout } from "@amitkk/basic/utils/layouts/AdminTableLayout";
import DataModal from "@amitkk/blocks/admin/blockquote-modal";
import { AdminDataTable, DataProps } from "@amitkk/blocks/admin/admin-blockquote-table";
import { useAdminPage } from "hooks/useAdminPage";

export function AdminBlockquote(){
    const admin = useAdminPage<DataProps>({ listEndpoint: "block/blockquote", listFunction: "get_filtered_blockquotes", singleFunction: "get_single_blockquote" });

    const FILTER_CONFIG = [
        { name: "SearchFilter", grid: "col-span-9", },
        { name: "StatusFilter", grid: "col-span-3", },
    ] as const;

    const head: { id: string; label: string }[] = [
                    { id: "name", label: "Name" },
                    { id: "media", label: "Media" },
                    { id: "", label: "" },
                ];
    
    return(
        <AdminTableLayout admin={admin} title="Blockquotes" addButtonLabel="New Blockquote" filters={FILTER_CONFIG} head={head} 
            rows={admin.data.map((i) => ( <AdminDataTable key={String(i._id)} row={i} onEdit={(row) => admin.handleEdit(row?._id?.toString())}/> ))}>
            <DataModal {...admin.modal}/>
        </AdminTableLayout>
    )
}

export default AdminBlockquote;