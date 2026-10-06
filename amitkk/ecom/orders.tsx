"use client";

import { AdminTableLayout } from "@amitkk/basic/utils/layouts/AdminTableLayout";
import { AdminDataTable } from "@amitkk/ecom/admin/admin-order-table";
import { useAdminPage } from "hooks/useAdminPage";
import { OrderProps } from "@amitkk/ecom/types";
import { useState } from "react";

export function AdminOrders() {
    const admin =   useAdminPage<OrderProps>({ listEndpoint: "ecom/wishlist", listFunction: "get_filtered_wishlist" });

    const FILTER_CONFIG = [
        { name: "SearchFilter", grid: "col-span-9", },
        { name: "StatusFilter", grid: "col-span-3", },
    ] as const;

    const head: { id: string; label: string }[] = [
                    { id: "user", label: "User" },
                    { id: "Product", label: "Product" },
                    { id: "Remarks", label: "Remarks" },
                    { id: "date", label: "Date" },
                    { id: "Status", label: "Status" },
                ];

    const [openExport, setOpenExport] = useState(false);
    const handleExportClose = () => { setOpenExport(false); }
    const exportProps = { open: openExport, handleClose: handleExportClose, type: "Admin Wishlist", change_type: false };

    return (
        <AdminTableLayout admin={admin} title="Orders" viewMode="grid" showViewModeSwitch={true} filters={FILTER_CONFIG} head={head} 
            rows={admin.data.map((i: OrderProps) => ( <AdminDataTable key={String(i._id)} row={i}/> ))}>
        </AdminTableLayout>
    );
}

export default AdminOrders;