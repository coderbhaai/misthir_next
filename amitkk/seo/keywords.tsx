"use client"

import { AdminTableLayout } from "@amitkk/basic/utils/layouts/AdminTableLayout";
import { AdminDataTable, DataProps } from "@amitkk/seo/admin/keyword/admin-keyword-table";
import { useAdminPage } from "hooks/useAdminPage";

export function AdminKeyword(){
    const admin = useAdminPage<DataProps>({ listEndpoint: "basic/keyword", listFunction: "get_filtered_keywords", singleFunction: "get_single_keyword" });

    const FILTER_CONFIG = [
        { name: "SearchFilter", grid: "col-span-9", },
        { name: "StatusFilter", grid: "col-span-3", },
    ] as const;

    const head: { id: string; label: string }[] = [
                    { id: "model", label: "Module" },
                    { id: "model_id", label: "Model" },
                    { id: "Keywords", label: "Keywords" },
                    { id: "date", label: "Date" },
                    { id: "", label: "" },
                ];
    
    return(
        <AdminTableLayout admin={admin} title="Blogs" addButtonLabel="New Blog" filters={FILTER_CONFIG} head={head} 
            rows={admin.data.map((i) => ( <AdminDataTable key={String(i._id)} row={i} onEdit={(row) => admin.handleEdit(row?._id?.toString())}/> ))}>
        </AdminTableLayout>
    )
}

export default AdminKeyword;