"use client"

import { AdminTableLayout } from "@amitkk/basic/utils/layouts/AdminTableLayout";
import { AdminDataTable, DataProps } from "@amitkk/basic/admin/audit-log/admin-audit-log-table";
import { useAdminPage } from "hooks/useAdminPage";

export function AdminAuditLog(){
    const admin = useAdminPage<DataProps>({ listEndpoint: "basic/routing", listFunction: "get_filtered_audit_logs" });

    const FILTER_CONFIG = [
      { name: "SearchFilter", grid: "col-span-6", },
      { name: "ModuleFilter", grid: "col-span-3", },
      { name: "ModuleIdFilter", grid: "col-span-3", },
  ] as const;

    const head: { id: string; label: string }[] = [
                    { id: "module", label: "Module" },
                    { id: "module_id", label: "Module Id" },
                    { id: "user", label: "User" },
                    { id: "changes", label: "Changes" },
                    { id: "date", label: "Date" },
                    { id: "", label: "" },
                ];
    
    return(
        <AdminTableLayout admin={admin} title="Audit Logs" filters={FILTER_CONFIG} head={head} 
            rows={admin.data.map((i) => ( <AdminDataTable key={String(i._id)} row={i}/> ))}>
        </AdminTableLayout>
    )
}

export default AdminAuditLog;