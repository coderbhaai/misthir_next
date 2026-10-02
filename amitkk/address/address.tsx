// amitkk > address > address.tsx

"use client"

import { AdminTableLayout } from "@amitkk/basic/utils/layouts/AdminTableLayout";
import { AdminDataTable, DataProps } from "@amitkk/address/admin/admin-address-table";
import { useAdminPage } from "hooks/useAdminPage";

export  function AdminAddress(){
    const admin = useAdminPage<DataProps>({ listEndpoint: "address/address", listFunction: "get_filtered_addresses", singleFunction: "get_single_author" });

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
        <AdminTableLayout admin={admin} title="Countries" addButtonLabel="New Country" filters={FILTER_CONFIG} head={head} 
            rows={admin.data.map((i) => ( <AdminDataTable key={String(i._id)} row={i} onEdit={(row) => admin.handleEdit(row?._id?.toString())}/> ))}>
            {/* <DataModal {...admin.modal}/> */}
        </AdminTableLayout>    )
}

export default AdminAddress;