"use client"

import { AdminTableLayout } from "@amitkk/basic/utils/layouts/AdminTableLayout";
import { useAdminPage } from "hooks/useAdminPage";
import DataModal from "@amitkk/user/admin/user-address-modal";
import { AdminDataTable, DataProps } from "@amitkk/user/admin/user-address-table";

export  function UserAddress(){
    const admin =   useAdminPage<DataProps>({ listEndpoint: "address/address", listFunction: "get_my_addresses", singleFunction: "get_single_address" });

    const FILTER_CONFIG = [
        { name: "SearchFilter", grid: "col-span-9", },
        { name: "StatusFilter", grid: "col-span-3", },
    ] as const;

    const head: { id: string; label: string }[] = [
                    { id: "type", label: "Type" },
                    { id: "name", label: "Name" },
                    { id: "url", label: "URL" },
                    { id: "meta", label: "Meta" },
                    { id: "", label: "" },
                ];
    
    return(
        <AdminTableLayout admin={admin} title="Address" addButtonLabel="New Address" filters={FILTER_CONFIG} head={head} 
            rows={admin.data.map((i: DataProps) => ( <AdminDataTable key={String(i._id)} row={i} onEdit={(row) => admin.handleEdit(row?._id?.toString())}/> ))}>
            <DataModal {...admin.modal}/>
        </AdminTableLayout>
    )
}

export default UserAddress;