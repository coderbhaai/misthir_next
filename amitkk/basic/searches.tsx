"use client"

import { AdminTableLayout } from "@amitkk/basic/utils/layouts/AdminTableLayout";
import { AdminDataTable, DataProps } from "@amitkk/basic/admin/search/admin-search-table";
import { useAdminPage } from "hooks/useAdminPage";

export function AdminSearches(){
    const admin = useAdminPage<DataProps>({ listEndpoint: "basic/page", listFunction: "get_filtered_searches" });

    const FILTER_CONFIG = [
        { name: "SearchFilter", grid: "col-span-12", },
    ] as const;

    const head: { id: string; label: string }[] = [
                    { id: "term", label: "Term" },
                    { id: "frequency", label: "Frequency" },
                    { id: "user", label: "User" },
                    { id: "date", label: "Date" },
                    { id: "", label: "" },
                ];

    return(
        <AdminTableLayout admin={admin} title="Searches" filters={FILTER_CONFIG} head={head} 
            rows={admin.data.map((i) => ( <AdminDataTable key={String(i._id)} row={i}/> ) )}>
        </AdminTableLayout>
    )
}
export default AdminSearches;