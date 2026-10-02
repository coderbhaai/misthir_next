"use client"

import { AdminTableLayout } from "@amitkk/basic/utils/layouts/AdminTableLayout";
import DataModal from "@amitkk/basic/admin/media/media-modal";
import { AdminDataTable } from "@amitkk/basic/admin/media/admin-media-table";
import { useAdminPage } from "hooks/useAdminPage";
import { SingleMediaProps } from "./types/media";

export function AdminMedia(){
    const admin = useAdminPage<SingleMediaProps>({ listEndpoint: "basic/media", listFunction: "get_filtered_media", singleFunction: "get_single_media" });

    const FILTER_CONFIG = [
        { name: "SearchFilter", grid: "col-span-12", },
    ] as const;

    const head: { id: string; label: string }[] = [
                    { id: "media", label: "Media" },
                    { id: "alt", label: "Alt" },
                    { id: "path", label: "Path" },
                    { id: "date", label: "Date" },
                    { id: "", label: "" },
                ];
    
    return(
        <AdminTableLayout admin={admin} title="Media" addButtonLabel="New Media" filters={FILTER_CONFIG} head={head} 
            rows={admin.data.map((i) => ( <AdminDataTable key={String(i._id)} row={i} onEdit={(row) => admin.handleEdit(row?._id?.toString())}/> ))}>
            <DataModal {...admin.modal}/>
        </AdminTableLayout>
    )
}

export default AdminMedia;