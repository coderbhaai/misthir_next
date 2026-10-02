"use client"

import { AdminTableLayout } from "@amitkk/basic/utils/layouts/AdminTableLayout";
import { AdminDataTable } from "@amitkk/blocks/admin/admin-tab-block-table";
import { TabBlockGroup } from "./types";
import { useAdminPage } from "hooks/useAdminPage";

export function AdminTabBlock(){
    const admin = useAdminPage<TabBlockGroup>({ listEndpoint: "block/genericBlock", listFunction: "get_filtered_tab_blocks", addRoute: "/admin/add-update-tab-block" });

    const FILTER_CONFIG = [
        { name: "SearchFilter", grid: "col-span-9", },
        { name: "StatusFilter", grid: "col-span-3", },
    ] as const;

    const head: { id: string; label: string }[] = [
                    { id: "model", label: "Module" },
                    { id: "model_id", label: "Model" },
                    { id: "menus", label: "Menus" },
                    { id: "", label: "" },
                ];
    
    return(
        <AdminTableLayout admin={admin} title="Tab Blocks" addButtonLabel="New Tab Block" filters={FILTER_CONFIG} head={head} 
            rows={admin.data.map((i) => ( <AdminDataTable key={String(i._id)} row={i}/> ))}>
        </AdminTableLayout>
    )
}

export default AdminTabBlock;