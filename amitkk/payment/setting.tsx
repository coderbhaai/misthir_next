"use client"

import { AdminTableLayout } from "@amitkk/basic/utils/layouts/AdminTableLayout";
import { useAdminPage } from "hooks/useAdminPage";
import DataModal from "@amitkk/payment/admin/setting-modal";
import { AdminDataTable } from "@amitkk/payment/admin/admin-setting-table";
import { SiteSettingProps } from "@amitkk/payment/types";

export  function AdminSetting(){
    const admin =   useAdminPage<SiteSettingProps>({ listEndpoint: "payment/payment", listFunction: "get_all_settings", singleFunction: "get_single_setting" });

    const FILTER_CONFIG = [
        { name: "SearchFilter", grid: "col-span-9", },
        { name: "StatusFilter", grid: "col-span-3", },
    ] as const;

    const head: { id: string; label: string }[] = [
                    { id: "name", label: "Name" },
                    { id: "module", label: "Module" },
                    { id: "module_value", label: "Value" },
                    { id: "status", label: "Status" },
                    { id: "date", label: "Date" },
                    { id: "", label: "" },
                ];
    
    return(
        <AdminTableLayout admin={admin} title="Settings" addButtonLabel="New Setting" filters={FILTER_CONFIG} head={head} 
            rows={admin.data.map((i: SiteSettingProps) => ( <AdminDataTable key={String(i._id)} row={i} onEdit={(row) => admin.handleEdit(row?._id?.toString())}/> ))}>
            <DataModal {...admin.modal}/>
        </AdminTableLayout>
    )
}

export default AdminSetting;