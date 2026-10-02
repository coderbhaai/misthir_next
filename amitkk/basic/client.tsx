"use client"

import { AdminTableLayout } from "@amitkk/basic/utils/layouts/AdminTableLayout";
import DataModal from "@amitkk/basic/admin/client/client-modal";
import { AdminDataTable, DataProps } from "@amitkk/basic/admin/client/admin-client-table";
import { useAdminPage } from "hooks/useAdminPage";

export function AdminClient(){
    const admin = useAdminPage<DataProps>({ listEndpoint: "basic/basic", listFunction: "get_filtered_clients", singleFunction: "get_single_client" });

    const FILTER_CONFIG = [
        { name: "SearchFilter", grid: "col-span-9", },
        { name: "StatusFilter", grid: "col-span-3", },
    ] as const;

    const head: { id: string; label: string }[] = [
                    { id: "name", label: "Name" },
                    { id: "Brand", label: "Brand" },
                    { id: "media", label: "Media" },
                    { id: "", label: "" },
                ];
    
    return(
        <AdminTableLayout admin={admin} title="Clients" addButtonLabel="New Client" filters={FILTER_CONFIG} head={head} 
            rows={admin.data.map((i) => ( <AdminDataTable key={String(i._id)} row={i} onEdit={(row) => admin.handleEdit(row?._id?.toString())}/> ))}>
            <DataModal {...admin.modal}/>
        </AdminTableLayout>
    )
}

export default AdminClient;