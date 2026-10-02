"use client"

import React from "react";
import { AdminTableLayout } from "@amitkk/basic/utils/layouts/AdminTableLayout";
import { CityProps } from "@amitkk/address/types";
import DataModal from "@amitkk/address/admin/city-modal";
import { AdminDataTable } from "@amitkk/address/admin/admin-city-table";
import { useAdminPage } from "hooks/useAdminPage";

export  function AdminCity(){
    const admin = useAdminPage<CityProps>({ listEndpoint: "address/address", listFunction: "get_filtered_city", singleFunction: "get_single_city" });

    const FILTER_CONFIG = [
        { name: "SearchFilter", grid: "col-span-9", },
        { name: "StatusFilter", grid: "col-span-3", },
    ] as const;

    const head: { id: string; label: string }[] = [
                { id: "country", label: "Country" },
                { id: "state", label: "State" },
                { id: "name", label: "Name" },
                { id: "", label: "" },
            ];
    
    return(
        <AdminTableLayout admin={admin} title="Cities" addButtonLabel="New City" filters={FILTER_CONFIG} head={head} 
            rows={admin.data.map((i: CityProps) => ( <AdminDataTable key={String(i._id)} row={i} onEdit={(row) => admin.handleEdit(row?._id?.toString())}/> ))}>
            <DataModal {...admin.modal}/>
        </AdminTableLayout>
    )
}

export default AdminCity;