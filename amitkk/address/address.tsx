"use client"

import { AdminTableLayout } from "@amitkk/basic/utils/layouts/AdminTableLayout";
import { AdminDataTable } from "@amitkk/address/admin/admin-address-table";
import { useAdminPage } from "hooks/useAdminPage";
import { AddressProps } from "@amitkk/address/types";

export  function AdminAddress(){
    const admin = useAdminPage<AddressProps>({ listEndpoint: "address/address", listFunction: "get_filtered_addresses", singleFunction: "get_single_author" });

    const FILTER_CONFIG = [
        { name: "SearchFilter", grid: "col-span-9", },
        { name: "StatusFilter", grid: "col-span-3", },
    ] as const;

    const head: { id: string; label: string }[] = [
                { id: "user", label: "User" },
                { id: "address", label: "Address" },
                { id: "", label: "" },
            ];
    
    return(
        <AdminTableLayout admin={admin} title="Address" addButtonLabel="New Address" viewMode="table" showViewModeSwitch={true} filters={FILTER_CONFIG} head={head} 
            rows={admin.data.map((i: AddressProps) => ( <AdminDataTable key={String(i._id)} row={i} onEdit={(row) => admin.handleEdit(row?._id?.toString())}/> ))}>
            {/* <DataModal {...admin.modal}/> */}
        </AdminTableLayout>
    )
}

export default AdminAddress;