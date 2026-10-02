"use client"

import { useCallback } from "react";
import { AdminTableLayout } from "@amitkk/basic/utils/layouts/AdminTableLayout";
import { apiRequest, clo, hitToastr } from "@amitkk/basic/utils/my-utils/admin-utils";
import { AdminDataTable } from "@amitkk/basic/admin/audit-log/admin-error-log-table";
import { ErrorLogProps } from "./types";
import { useAdminPage } from "hooks/useAdminPage";

export function AdminAuditLog(){
    const admin = useAdminPage<ErrorLogProps>({ listEndpoint: "basic/routing", listFunction: "get_filtered_error_logs" });

    const FILTER_CONFIG = [
      { name: "SearchFilter", grid: "col-span-12", },
    ] as const;

    const head: { id: string; label: string }[] = [
                    { id: "Input", label: "Input" },
                    { id: "Payload", label: "Payload" },
                    { id: "Message", label: "Message" },
                    { id: "date", label: "Date" },
                    { id: "", label: "" },
                ];

    const clearSingle = useCallback(async (id: string) => {
        try {
            const res = await apiRequest("POST", "basic/routing", {
                    function: "clear_single_error_log",
                    _id: id,
                });

            if (res?.data) {
                await admin.fetchData();
            }

            hitToastr( "success", res?.message );
        } catch (error) { clo(error); }
    }, [admin]);

    const clearLog = useCallback(async () => {
        try {
            const res = await apiRequest("POST", "basic/routing", { function: "clear_error_log" });

            if (res?.data) {
                await admin.fetchData();
            }

            hitToastr( "success", res?.message );

        } catch (error) { clo(error); }
    }, [admin]);
    
    return(
        <AdminTableLayout admin={admin} title="Logs" filters={FILTER_CONFIG} head={head} 
            rows={admin?.data?.map((i) => ( <AdminDataTable key={String(i._id)} row={i} onDelete={clearSingle}/> ))} 
            actionsAboveFilters={ <button onClick={clearLog}>Clear Log</button> }>
        </AdminTableLayout>
    )
}

export default AdminAuditLog;