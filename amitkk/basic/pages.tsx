"use client"

import { AdminTableLayout } from "@amitkk/basic/utils/layouts/AdminTableLayout";
import { AdminDataTable, DataProps } from "@amitkk/basic/admin/page/admin-page-table";
import { useAdminPage } from "hooks/useAdminPage";

export function AdminPages(){
    const admin = useAdminPage<DataProps>({ listEndpoint: "basic/page", listFunction: "get_filtered_pages", addRoute: "/admin/add-update-page" });

    const FILTER_CONFIG = [
        { name: "SearchFilter", grid: "col-span-6", },
        { name: "ModuleFilter", grid: "col-span-3", },
        { name: "StatusFilter", grid: "col-span-3", },
    ] as const;

    const head: { id: string; label: string }[] = [
                    { id: "module", label: "Module" },
                    { id: "name", label: "Name" },
                    { id: "media", label: "Media" },
                    { id: "status", label: "SSS" },
                    { id: "meta", label: "Meta" },
                    { id: "date", label: "Date" },
                    { id: "", label: "" },
                ];

    return(
        <AdminTableLayout admin={admin} title="Pages" addButtonLabel="New Page" filters={FILTER_CONFIG} head={head} 
            rows={admin.data.map((i) => ( <AdminDataTable key={String(i._id)} row={i}/> ))}>
        </AdminTableLayout>
    )
}
export default AdminPages;