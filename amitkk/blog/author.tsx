"use client"

import { AdminTableLayout } from "@amitkk/basic/utils/layouts/AdminTableLayout";
import DataModal from "@amitkk/blog/admin/author-modal";
import { AdminDataTable } from "@amitkk/blog/admin/admin-author-table";
import { useAdminPage } from "hooks/useAdminPage";
import type { SingleAuthorProps } from "./types";

export function AdminAuthor(){
    const admin = useAdminPage<SingleAuthorProps>({ listEndpoint: "blog/author", listFunction: "get_filtered_author", singleFunction: "get_single_author" });

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
        <AdminTableLayout admin={admin} title="Authors" addButtonLabel="New Author" filters={FILTER_CONFIG} head={head} 
            rows={admin.data.map((i) => ( <AdminDataTable key={String(i._id)} row={i} onEdit={(row) => admin.handleEdit(row?._id?.toString())}/> ))}>
            <DataModal {...admin.modal}/>
        </AdminTableLayout>
    )
}

export default AdminAuthor;