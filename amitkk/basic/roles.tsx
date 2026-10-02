"use client"

import { AdminTableLayout } from "@amitkk/basic/utils/layouts/AdminTableLayout";
import DataModal from "@amitkk/basic/admin/spatie/role-modal";
import { AdminDataTable } from "@amitkk/basic/admin/spatie/admin-role-table";
import { useAdminPage } from "hooks/useAdminPage";
import { SingleRoleProps } from "./types/spatie";

export  function AdminRole(){
    const admin = useAdminPage<SingleRoleProps>({ listEndpoint: "basic/spatie", listFunction: "get_filtered_roles", singleFunction: "get_single_role" });

    const FILTER_CONFIG = [
        { name: "SearchFilter", grid: "col-span-9", },
        { name: "StatusFilter", grid: "col-span-3", },
    ] as const;

    const head: { id: string; label: string }[] = [
                    { id: "name", label: "Name" },
                    { id: "permission", label: "Permissions" },
                    { id: "", label: "" },
                ];

    return(
        <AdminTableLayout admin={admin} title="Roles" addButtonLabel="New Role" filters={FILTER_CONFIG} head={head} 
            rows={admin.data.map((i) => ( <AdminDataTable key={String(i._id)} row={i} onEdit={(row) => admin.handleEdit(row?._id?.toString())}/> ))}>
            <DataModal {...admin.modal}/>
        </AdminTableLayout>
    )
}

export default AdminRole;