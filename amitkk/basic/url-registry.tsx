"use client"

import { AdminTableLayout } from "@amitkk/basic/utils/layouts/AdminTableLayout";
import { AdminDataTable, DataProps } from "@amitkk/basic/admin/audit-log/admin-url-registry-table";
import DataModal from "@amitkk/basic/admin/audit-log/url-registry-modal";
import { useAdminPage } from "hooks/useAdminPage";

export function AdminUrlregistry(){
    const admin = useAdminPage<DataProps>({ listEndpoint: "basic/routing", listFunction: "get_filtered_url_registry", singleFunction: "get_single_url_registry" });

    const FILTER_CONFIG = [
        { name: "SearchFilter", grid: "col-span-4", },
        { name: "ModuleFilter", grid: "col-span-4", },
        { name: "ModuleIdFilter", grid: "col-span-4", },
    ] as const;

    const head: { id: string; label: string }[] = [
                        { id: "Module", label: "Module" },
                        { id: "SEO", label: "SEO" },
                        { id: "Schema", label: "Schema" },
                        { id: "", label: "" },
                    ];

    return(
        <>            
            <AdminTableLayout admin={admin} title="URL Registry" filters={FILTER_CONFIG} head={head} 
                rows={admin.data.map((i: DataProps) => ( <AdminDataTable key={String(i._id)} row={i} onEdit={(row) => admin.handleEdit(row?._id?.toString())}/> ))}>
                <DataModal {...admin.modal}/>
            </AdminTableLayout>
        </>
    )
}

export default AdminUrlregistry;