"use client"

import { AdminDataTable, DataProps } from "@amitkk/blocks/admin/admin-block-detail-table";
import { AdminTableLayout } from "@amitkk/basic/utils/layouts/AdminTableLayout";
import { useAdminPage } from "hooks/useAdminPage";

export function AdminBlockDetail(){
    const admin = useAdminPage<DataProps>({ listEndpoint: "block/genericBlock", listFunction: "get_filtered_block_detail", singleFunction: "get_single_block_detail" });

    const FILTER_CONFIG = [
        { name: "SearchFilter", grid: "col-span-4", },
        { name: "ModuleFilter", grid: "col-span-2", },
        { name: "ModuleIdFilter", grid: "col-span-2", },
        { name: "BlockFilter", grid: "col-span-2", },
        { name: "StatusFilter", grid: "col-span-2", },
    ] as const;

    const head: { id: string; label: string }[] = [
                    { id: "module", label: "Module" },
                    { id: "name", label: "Name" },
                    { id: "block_id", label: "Block" },
                    { id: "heading", label: "Heading" },
                    { id: "media", label: "Media" },
                    { id: "status", label: "Status" },
                    { id: "date", label: "Date" },
                    { id: "", label: "" },
                ];
    
    return(
        <AdminTableLayout admin={admin} title="Generic Block" filters={FILTER_CONFIG} head={head} 
            rows={admin.data.map((i) => ( <AdminDataTable key={String(i._id)} row={i} onEdit={(row) => admin.handleEdit(row?._id?.toString())}/> ))}>
        </AdminTableLayout>
    )
}

export default AdminBlockDetail;