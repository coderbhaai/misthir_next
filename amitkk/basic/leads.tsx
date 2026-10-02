"use client"

import { AdminTableLayout } from "@amitkk/basic/utils/layouts/AdminTableLayout";
import DataModal from "@amitkk/basic/admin/lead/admin-lead-update-modal";
import { AdminDataTable } from "@amitkk/basic/admin/lead/admin-lead-table";
import { useAdminPage } from "hooks/useAdminPage";
import { LeadProps } from "./types";
import { AdminTableActions } from "./static/AdminTableActions";

export function AdminLeads(){
    const admin = useAdminPage<LeadProps>({ listEndpoint: "basic/basic", listFunction: "get_filtered_lead_requests", singleFunction: "get_single_lead_request" });

    const FILTER_CONFIG = [
        { name: "SearchFilter", grid: "col-span-5", },
        { name: "ModuleFilter", grid: "col-span-2", },
        { name: "ModuleIdFilter", grid: "col-span-3", },
        { name: "StatusFilter", grid: "col-span-2", },
    ] as const;

    const head: { id: string; label: string }[] = [
                    { id: "name", label: "User" },
                    { id: "type", label: "Service" },
                    { id: "status", label: "Status" },
                    { id: "remarks", label: "Remarks" },
                    { id: "date", label: "Date" },
                    { id: "", label: "" },
                ];
    
    return(
        <AdminTableLayout admin={admin} title="Leads" filters={FILTER_CONFIG} head={head} 
            rows={admin.data.map((i) => ( <AdminDataTable key={String(i._id)} row={i} onEdit={(row) => admin.handleEdit(row?._id?.toString())}/> ))}
            actionsAboveFilters={
                <AdminTableActions admin={admin} module="Lead"/>
            }>
            <DataModal {...admin.modal}/>
        </AdminTableLayout>
    )
}

export default AdminLeads;