"use client"

import { AdminTableLayout } from "@amitkk/basic/utils/layouts/AdminTableLayout";
import { useAdminPage } from "hooks/useAdminPage";
import DataModal from "@amitkk/ecom/seller/admin/seller-media-modal";
import { AdminDataTable } from "@amitkk/ecom/seller/admin/seller-media-table";
import { SingleMediaProps } from "@amitkk/basic/types/media";

export  function SellerMedia(){
    const admin =   useAdminPage<SingleMediaProps>({ listEndpoint: "basic/media", listFunction: "get_all_media", singleFunction: "get_single_media" });

    const FILTER_CONFIG = [
        { name: "SearchFilter", grid: "col-span-9", },
        { name: "StatusFilter", grid: "col-span-3", },
    ] as const;

    const head: { id: string; label: string }[] = [
                    { id: "media", label: "Media" },
                    { id: "path", label: "Path" },
                    { id: "date", label: "Date" },
                    { id: "", label: "" },
                ];
    
    return(
        <AdminTableLayout admin={admin} title="Media" addButtonLabel="New Media" filters={FILTER_CONFIG} head={head} 
            rows={admin.data.map((i: SingleMediaProps) => ( <AdminDataTable key={String(i._id)} row={i} onEdit={(row) => admin.handleEdit(row?._id?.toString())}/> ))}>
            <DataModal {...admin.modal}/>
        </AdminTableLayout>
    )
}

export default SellerMedia;