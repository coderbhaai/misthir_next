"use client"

import { AdminTableLayout } from "@amitkk/basic/utils/layouts/AdminTableLayout";
import { AdminDataTable, DataProps, } from "@amitkk/basic/admin/spatie/admin-menu-table";
import DataModal from "@amitkk/basic/admin/spatie/menu-modal";
import { useAdminPage } from "hooks/useAdminPage";

export function AdminMenu() {
    const admin = useAdminPage<DataProps>({
        listEndpoint: "basic/menu",
        listFunction: "get_filtered_menus",
    });
    
    function flattenMenus(menus: DataProps[]): DataProps[] {
        let rows: DataProps[] = [];
        menus.forEach((menu) => {
            rows.push(menu);
            if (menu.children?.length) {
                rows = rows.concat(flattenMenus(menu.children));
            }
        });
        return rows;
    }

    const FILTER_CONFIG = [
        { name: "SearchFilter", grid: "col-span-9", },
        { name: "StatusFilter", grid: "col-span-3", },
    ] as const;

    const head = [
        { id: "name", label: "Name" },
        { id: "URL", label: "URL" },
        { id: "media", label: "Media" },
        { id: "Permission", label: "Permission" },
        { id: "", label: "" },
    ];

    const flatRows = flattenMenus(admin.data);

    return (
        <AdminTableLayout admin={admin} title="Menus" addButtonLabel="New Menu" filters={FILTER_CONFIG} head={head} 
            rows={flatRows.map((i) => (
                <AdminDataTable key={String(i._id)} row={i} onEdit={(row) => admin.handleEdit(row?._id?.toString())}/>
            ))}>
            <DataModal {...admin.modal}/>
        </AdminTableLayout>
    );
}

export default AdminMenu;