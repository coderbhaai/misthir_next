"use client"

import { AdminTableLayout } from "@amitkk/basic/utils/layouts/AdminTableLayout";
import DataModal from "@amitkk/address/admin/state-modal";
import { AdminDataTable } from "@amitkk/address/admin/admin-state-table";
import { StateProps } from "@amitkk/address/types";
import React from "react";
import { useAdminPage } from "hooks/useAdminPage";

export  function AdminState(){
    const admin = useAdminPage<StateProps>({ listEndpoint: "address/address", listFunction: "get_filtered_state", singleFunction: "get_single_state" });

    const FILTER_CONFIG = [
        { name: "SearchFilter", grid: "col-span-9", },
        { name: "StatusFilter", grid: "col-span-3", },
    ] as const;

    const head: { id: string; label: string }[] = [
                { id: "country", label: "Country" },
                { id: "name", label: "Name" },
                { id: "", label: "" },
            ];
    
    return(
        <AdminTableLayout admin={admin} title="States" addButtonLabel="New State" filters={FILTER_CONFIG} head={head} 
            rows={admin.data.map((i: StateProps) => ( <AdminDataTable key={String(i._id)} row={i} onEdit={(row) => admin.handleEdit(row?._id?.toString())}/> ))}>
            <DataModal {...admin.modal}/>
        </AdminTableLayout>
    )
}

export default AdminState;