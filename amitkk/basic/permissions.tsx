"use client"

import DataModal from "@amitkk/basic/admin/spatie/permission-modal";
import { AdminTableLayout } from "@amitkk/basic/utils/layouts/AdminTableLayout";
import { AdminDataTable } from "@amitkk/basic/admin/spatie/admin-permission-table";
import { useAdminPage } from "hooks/useAdminPage";
import { SinglePermissionProps } from "./types/spatie";

export  function AdminPermission(){
    const admin = useAdminPage<SinglePermissionProps>({ listEndpoint: "basic/spatie", listFunction: "get_filtered_permissions", singleFunction: "get_single_permission" });

    const FILTER_CONFIG = [
        { name: "SearchFilter", grid: "col-span-6", },
        { name: "RoleFilter", grid: "col-span-3", },
        { name: "StatusFilter", grid: "col-span-3", },
    ] as const;

    const head: { id: string; label: string }[] = [
                    { id: "name", label: "Name" },
                    { id: "Roles", label: "Roles" },
                    { id: "", label: "" },
                ];

    return(
        <AdminTableLayout admin={admin} title="Permissions" addButtonLabel="New Permission" filters={FILTER_CONFIG} head={head} 
            rows={admin.data.map((i) => ( <AdminDataTable key={String(i._id)} row={i} onEdit={(row) => admin.handleEdit(row?._id?.toString())}/> ))}>
            <DataModal {...admin.modal}/>
        </AdminTableLayout>
    )
}

export default AdminPermission;