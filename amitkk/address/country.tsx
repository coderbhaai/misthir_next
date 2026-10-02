"use client"

import { AdminTableLayout } from "@amitkk/basic/utils/layouts/AdminTableLayout";
import DataModal from "@amitkk/address/admin/country-modal";
import { AdminDataTable } from "@amitkk/address/admin/admin-country-table";
import { CountryProps } from "@amitkk/address/types";
import { useAdminPage } from "hooks/useAdminPage";

export  function AdminCountry(){
    const admin = useAdminPage<CountryProps>({ listEndpoint: "address/address", listFunction: "get_filtered_country", singleFunction: "get_single_country" });

    const FILTER_CONFIG = [
        { name: "SearchFilter", grid: "col-span-9", },
        { name: "StatusFilter", grid: "col-span-3", },
    ] as const;

    const head: { id: string; label: string }[] = [
                { id: "name", label: "Name" },
                { id: "capital", label: "Capital" },
                { id: "code", label: "Code" },
                { id: "flag", label: "Flag" },
                { id: "site", label: "Site" },
                { id: "", label: "" },
            ];
    
    return(
        <AdminTableLayout admin={admin} title="Countries" addButtonLabel="New Country" filters={FILTER_CONFIG} head={head} 
            rows={admin.data.map((i: CountryProps) => ( <AdminDataTable key={String(i._id)} row={i} onEdit={(row) => admin.handleEdit(row?._id?.toString())}/> ))}>
            <DataModal {...admin.modal}/>
        </AdminTableLayout>
    )
}

export default AdminCountry;