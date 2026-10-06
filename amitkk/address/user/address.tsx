"use client"

import { AdminTableLayout } from "@amitkk/basic/utils/layouts/AdminTableLayout";
import { useAdminPage } from "hooks/useAdminPage";
import DataModal from "@amitkk/address/user/admin/user-address-modal";
import { AdminDataTable } from "@amitkk/address/user/admin/user-address-table";
import { AddressProps } from '@amitkk/address/types';

export function UserAddress(){
    const admin = useAdminPage<AddressProps>({ listEndpoint: "address/address", listFunction: "get_my_addresses", singleFunction: "get_single_address" });

    const FILTER_CONFIG = [
        { name: "SearchFilter", grid: "col-span-9" },
        { name: "StatusFilter", grid: "col-span-3" },
    ] as const;

    const head: { id: string; label: string }[] = [
        { id: "Address", label: "Address" },
        { id: "", label: "" },
    ];
    
    return(
        <AdminTableLayout admin={admin} title="Address" addButtonLabel="New Address" viewMode="grid" showViewModeSwitch={true} filters={FILTER_CONFIG} head={head} 
        rows={(viewMode) => admin.data.map((i: AddressProps) => ( <AdminDataTable key={String(i._id)} row={i} viewMode={viewMode} onEdit={(row) => admin.handleEdit(row?._id?.toString())}/> ))}>
            <DataModal {...admin.modal}/>
        </AdminTableLayout>
    )
}

export default UserAddress;